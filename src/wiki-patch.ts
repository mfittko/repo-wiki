/**
 * Structured wiki patch parsing and lint-gated acceptance.
 *
 * LLM output is treated as untrusted and must be parsed, validated, and
 * accepted only after lint gates pass. Free-form markdown cannot bypass
 * patch validation; invalid patches produce actionable errors and do not
 * overwrite existing wiki pages.
 *
 * Typical usage:
 *
 *   // Parse and validate (throws WikiPatchError on error-level failures):
 *   const patch = parseWikiPatch(llmOutput, 'Module-Auth');
 *
 *   // Inspect issues without throwing:
 *   const issues = validateWikiPatch(llmOutput, 'Module-Auth');
 *
 *   // Full synthesis pipeline with retry:
 *   const patch = await synthesizeWikiPage(provider, request, { maxRetries: 2 });
 */

import { containsSecretLikeContent } from './secret-patterns.js';
import type { LLMProvider, LLMRequest } from './llm-provider.js';

// ── Issue types ────────────────────────────────────────────────────────────

/** A single lint issue found during patch validation. */
export interface WikiPatchIssue {
  /** Severity of the issue. Error-level issues block acceptance; warnings are informational. */
  level: 'error' | 'warning';
  /** Machine-readable issue code. */
  code: string;
  /** Human-readable description of the problem. */
  message: string;
}

// ── Patch schema ───────────────────────────────────────────────────────────

/** Required and optional frontmatter fields recognized in wiki patches. */
export interface WikiPatchFrontmatter {
  /** Git commit SHA that was current when this page was compiled. */
  source_commit: string;
  /** Page archetype identifier (e.g. "module", "home", "architecture"). */
  kind: string;
  /** Repository source paths cited by this page. */
  source_paths: string[];
  /** ISO-8601 timestamp of compilation. */
  compiled_at: string;
  /** Page ownership state emitted by the compiler. */
  page_state?: string;
  /** Remote URL or shorthand of the source repository. */
  source_repo?: string;
  /** Additional frontmatter fields passed through from the LLM. */
  [key: string]: unknown;
}

/**
 * Structured representation of a validated LLM-generated wiki page.
 *
 * A `WikiPatch` is produced only when all error-level lint gates pass. It
 * carries the parsed frontmatter, the markdown body, and the full normalized
 * content so that callers can apply human-notes preservation and write the
 * final page without re-parsing.
 */
export interface WikiPatch {
  /** Wiki page slug/filename without `.md` (e.g. `"Module-Auth"`). */
  pageName: string;
  /** Full, normalized markdown content (frontmatter + body). */
  content: string;
  /** Parsed frontmatter fields extracted from the content. */
  frontmatter: WikiPatchFrontmatter;
  /** Markdown body — everything after the closing `---` of the frontmatter. */
  body: string;
}

// ── Structured error ───────────────────────────────────────────────────────

/**
 * Thrown by `parseWikiPatch` when one or more error-level lint gates fail.
 *
 * The `issues` array contains all problems found (both errors and warnings),
 * giving callers enough information to log actionable diagnostics or feed
 * failure details back to the LLM on retry.
 *
 * Example:
 *   try {
 *     const patch = parseWikiPatch(llmOutput, 'Module-Auth');
 *   } catch (err) {
 *     if (err instanceof WikiPatchError) {
 *       for (const issue of err.issues) console.error(issue.message);
 *     }
 *   }
 */
export class WikiPatchError extends Error {
  /** Wiki page slug this error pertains to. */
  readonly pageName: string;
  /** Full list of validation issues (errors and warnings). */
  readonly issues: WikiPatchIssue[];

  constructor(message: string, pageName: string, issues: WikiPatchIssue[]) {
    super(message);
    this.name = 'WikiPatchError';
    this.pageName = pageName;
    this.issues = issues;
  }
}

// ── Options ────────────────────────────────────────────────────────────────

/** Options for the synthesis pipeline (`synthesizeWikiPage`). */
export interface SynthesizeOptions {
  /**
   * Maximum number of additional synthesis attempts when the first response
   * fails validation. Defaults to 0 (no retries).
   */
  maxRetries?: number;
}

// ── Frontmatter parsing ────────────────────────────────────────────────────

/**
 * Split a markdown document into its frontmatter block and body.
 *
 * Returns `{ frontmatterRaw: null, body: content }` when the document does
 * not begin with a valid `---`-delimited YAML block.
 */
function stripSurroundingMarkdownFence(content: string): string {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const trimmed = normalized.trim();
  const fence = /^```[A-Za-z0-9_-]*[ \t]*\n([\s\S]*?)\n?```[ \t]*$/.exec(trimmed);
  if (!fence) {
    return normalized;
  }

  const inner = fence[1].replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  return inner.startsWith('---\n') ? inner : normalized;
}

function normalizeLLMOutput(content: string): string {
  return stripSurroundingMarkdownFence(content).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
}

function splitFrontmatterAndBody(content: string): { frontmatterRaw: string | null; body: string } {
  const normalized = normalizeLLMOutput(content);
  const opening = normalized.match(/^---[ \t]*\n/);

  if (!opening) {
    return { frontmatterRaw: null, body: normalized };
  }

  const closingPattern = /^---[ \t]*$/gm;
  closingPattern.lastIndex = opening[0].length;
  const closing = closingPattern.exec(normalized);
  if (!closing) {
    return { frontmatterRaw: null, body: normalized };
  }

  const frontmatterRaw = normalized.slice(opening[0].length, closing.index);
  // Strip the single newline that separates frontmatter from the body.
  const body = normalized.slice(closing.index + closing[0].length).replace(/^\n/, '');

  return { frontmatterRaw, body };
}

/**
 * Parse a raw YAML frontmatter string into a key→value record.
 *
 * Handles the frontmatter subset repo-wiki emits and asks LLMs to return:
 * top-level `key: value` pairs, JSON-quoted or bare scalar values, JSON-style
 * inline arrays, and indented block sequences. It intentionally does not try
 * to be a general YAML parser.
 */
function parseFrontmatterFields(raw: string): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  const lines = raw.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) {
      i++;
      continue;
    }

    const key = line.slice(0, colonIdx).trim();
    if (!key || key.startsWith('#')) {
      i++;
      continue;
    }

    const rawValue = line.slice(colonIdx + 1).trim();

    if (rawValue === '[]') {
      // Inline empty array
      fields[key] = [];
      i++;
      continue;
    }

    if (rawValue === '') {
      // Possible block sequence: collect lines that start with "  -"
      const items: unknown[] = [];
      i++;
      while (i < lines.length && /^\s+-/.test(lines[i])) {
        const item = lines[i].replace(/^\s*-\s*/, '').trim();
        items.push(parseScalar(item));
        i++;
      }
      fields[key] = items;
      continue;
    }

    // Inline array: `key: ["a", "b"]`
    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      try {
        const parsed = JSON.parse(rawValue);
        if (Array.isArray(parsed)) {
          fields[key] = parsed;
          i++;
          continue;
        }
      } catch {
        // Fall through to scalar parsing
      }
    }

    fields[key] = parseScalar(rawValue);
    i++;
  }

  return fields;
}

/**
 * Parse a scalar YAML or JSON value into its native type.
 *
 * Handles JSON-quoted strings, booleans, null, numbers, and bare YAML strings.
 */
function parseScalar(value: string): unknown {
  if (!value) return '';

  // Try JSON.parse for quoted strings, numbers, booleans, null
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'string' || typeof parsed === 'number' || typeof parsed === 'boolean' || parsed === null) return parsed;
  } catch {
    // Fall through
  }

  return value;
}

// ── Validation ─────────────────────────────────────────────────────────────

/**
 * Validate raw LLM-generated content as a structured wiki patch.
 *
 * Returns the full list of issues found (errors and warnings). This is the
 * non-throwing variant; call `parseWikiPatch` to get a validated `WikiPatch`
 * or a thrown `WikiPatchError`.
 *
 * Lint gates applied (error-level):
 *   1. `empty-content`       – LLM returned empty or whitespace-only content.
 *   2. `missing-frontmatter` – Content does not begin with a `---` YAML block.
 *   3. `missing-source-commit` – Frontmatter lacks a `source_commit` field.
 *   4. `missing-kind`        – Frontmatter lacks a `kind` field.
 *   5. `missing-compiled-at` – Frontmatter lacks a `compiled_at` field.
 *   6. `empty-body`          – No markdown content after the frontmatter block.
 *   7. `secret-like-content` – Content matches a known credential pattern.
 *   8. `invalid-source-paths` – `source_paths` contains non-string or blank entries.
 *
 * Lint gates applied (warning-level):
 *   9. `missing-source-paths` – Frontmatter lacks a `source_paths` array.
 */
export function validateWikiPatch(rawContent: string, pageName: string): WikiPatchIssue[] {
  const issues: WikiPatchIssue[] = [];

  // 1. Non-empty content
  if (!rawContent || !rawContent.trim()) {
    issues.push({
      level: 'error',
      code: 'empty-content',
      message: `${pageName}: LLM returned empty content.`,
    });
    return issues; // Further checks are meaningless without content
  }

  // 2. Valid frontmatter block
  const normalizedContent = normalizeLLMOutput(rawContent);
  const { frontmatterRaw, body } = splitFrontmatterAndBody(normalizedContent);

  if (frontmatterRaw === null) {
    issues.push({
      level: 'error',
      code: 'missing-frontmatter',
      message: `${pageName}: content does not start with a valid YAML frontmatter block (---).`,
    });
  } else {
    const fields = parseFrontmatterFields(frontmatterRaw);

    // 3. Required field: source_commit
    const sourceCommit = fields['source_commit'];
    if (!sourceCommit || typeof sourceCommit !== 'string' || !sourceCommit.trim()) {
      issues.push({
        level: 'error',
        code: 'missing-source-commit',
        message: `${pageName}: frontmatter is missing required field "source_commit".`,
      });
    }

    // 4. Required field: kind
    const kind = fields['kind'];
    if (!kind || typeof kind !== 'string' || !kind.trim()) {
      issues.push({
        level: 'error',
        code: 'missing-kind',
        message: `${pageName}: frontmatter is missing required field "kind".`,
      });
    }

    // 5. Required field: compiled_at
    const compiledAt = fields['compiled_at'];
    if (!compiledAt || typeof compiledAt !== 'string' || !compiledAt.trim()) {
      issues.push({
        level: 'error',
        code: 'missing-compiled-at',
        message: `${pageName}: frontmatter is missing required field "compiled_at".`,
      });
    }

    // 6. Body must not be empty
    if (!body || !body.trim()) {
      issues.push({
        level: 'error',
        code: 'empty-body',
        message: `${pageName}: patch contains a frontmatter block but no markdown body.`,
      });
    }

    // 8/9. source_paths must be an array when present; a missing array is a warning.
    const sourcePaths = fields['source_paths'];
    if (sourcePaths === undefined) {
      issues.push({
        level: 'warning',
        code: 'missing-source-paths',
        message: `${pageName}: frontmatter is missing a "source_paths" array.`,
      });
    } else if (!Array.isArray(sourcePaths)) {
      issues.push({
        level: 'error',
        code: 'invalid-source-paths',
        message: `${pageName}: frontmatter field "source_paths" must be an array when present.`,
      });
    } else if (!sourcePaths.every(isNonEmptyString)) {
      issues.push({
        level: 'error',
        code: 'invalid-source-paths',
        message: `${pageName}: frontmatter field "source_paths" must contain only non-empty strings.`,
      });
    }
  }

  // 7. Secret-like content check (run over the full content)
  if (containsSecretLikeContent(normalizedContent)) {
    issues.push({
      level: 'error',
      code: 'secret-like-content',
      message: `${pageName}: content contains secret-like content that cannot be accepted.`,
    });
  }

  return issues;
}

/**
 * Parse and validate LLM-generated content as a structured wiki patch.
 *
 * Throws `WikiPatchError` if any error-level lint gate fails. Callers should
 * catch this error to log actionable diagnostics, optionally feed failure
 * details back into the next LLM request, or skip the page.
 *
 * Warnings are attached to the thrown error's `issues` array (when it throws)
 * or are silently surfaced (when the patch is valid). If callers need to
 * inspect warnings on a successful parse, use `validateWikiPatch` instead.
 *
 * @param rawContent - Raw LLM output string to validate.
 * @param pageName   - Wiki page slug (e.g. `"Module-Auth"`) used in messages.
 * @returns A validated `WikiPatch` ready for human-notes injection and writing.
 * @throws {WikiPatchError} When one or more error-level issues are found.
 */
export function parseWikiPatch(rawContent: string, pageName: string): WikiPatch {
  const issues = validateWikiPatch(rawContent, pageName);
  const errorCount = issues.filter((i) => i.level === 'error').length;

  if (errorCount > 0) {
    throw new WikiPatchError(
      `Wiki patch for "${pageName}" failed validation with ${errorCount} error(s).`,
      pageName,
      issues,
    );
  }

  const normalized = normalizeLLMOutput(rawContent);
  const { frontmatterRaw, body } = splitFrontmatterAndBody(normalized);

  // frontmatterRaw is guaranteed non-null here (missing-frontmatter would have been an error)
  const fields = parseFrontmatterFields(frontmatterRaw!);

  const frontmatter: WikiPatchFrontmatter = {
    source_commit: String(fields['source_commit'] ?? ''),
    kind: String(fields['kind'] ?? ''),
    source_paths: Array.isArray(fields['source_paths'])
      ? fields['source_paths'].filter(isNonEmptyString)
      : [],
    compiled_at: String(fields['compiled_at'] ?? ''),
    ...Object.fromEntries(
      Object.entries(fields).filter(([k]) => !['source_commit', 'kind', 'source_paths', 'compiled_at'].includes(k)),
    ),
  };

  return { pageName, content: normalized, frontmatter, body };
}

// ── Synthesis pipeline ─────────────────────────────────────────────────────

/**
 * Call an LLM provider and return the response as a validated `WikiPatch`.
 *
 * Validation runs after every provider response. If a response fails
 * validation and `maxRetries > 0`, the provider is called again. The last
 * thrown `WikiPatchError` is re-thrown when all attempts are exhausted.
 *
 * This makes it impossible for free-form LLM output to bypass patch
 * validation and overwrite wiki pages.
 *
 * @param provider - LLM provider (mock or hosted).
 * @param request  - Pre-built `LLMRequest` (use `buildRequest` to assemble).
 * @param options  - Optional `{ maxRetries }` (default 0).
 * @returns A validated `WikiPatch`.
 * @throws {WikiPatchError} When all synthesis attempts produce invalid patches.
 * @throws {LLMProviderError} On unrecoverable provider failures.
 * @throws {RangeError} When `maxRetries` is not a non-negative finite number.
 */
export async function synthesizeWikiPage(
  provider: LLMProvider,
  request: LLMRequest,
  options: SynthesizeOptions = {},
): Promise<WikiPatch> {
  const maxRetries = normalizeMaxRetries(options.maxRetries);
  let lastError: WikiPatchError | undefined;
  let nextRequest = request;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await provider.complete(nextRequest);

    try {
      validateWikiPatchForRequest(response.content, request);
      return parseWikiPatch(response.content, request.pageName);
    } catch (err) {
      if (!(err instanceof WikiPatchError)) throw err;
      lastError = err;
      if (attempt < maxRetries) {
        nextRequest = withValidationFeedback(request, err);
      }
    }
  }

  // All attempts exhausted — re-throw the last validation error
  throw lastError!;
}

function validateWikiPatchForRequest(rawContent: string, request: LLMRequest): void {
  const issues = validateWikiPatch(rawContent, request.pageName);

  if (request.archetype === 'architecture') {
    issues.push(...validateArchitecturePatch(rawContent, request));
  }

  const errorCount = issues.filter((i) => i.level === 'error').length;
  if (errorCount > 0) {
    throw new WikiPatchError(
      `Wiki patch for "${request.pageName}" failed validation with ${errorCount} error(s).`,
      request.pageName,
      issues,
    );
  }
}

const ARCHITECTURE_REQUIRED_HEADINGS = [
  '## Executive Architecture Summary',
  '## System and Repository Context',
  '## Major Modules and Responsibilities',
  '## Runtime, Data, and Control-Flow Relationships',
  '## Build, Test, Deployment, and Operational Surfaces',
  '## Cross-Cutting Concerns',
  '## Caveats and Open Questions',
];

function validateArchitecturePatch(rawContent: string, request: LLMRequest): WikiPatchIssue[] {
  const issues: WikiPatchIssue[] = [];
  const normalizedContent = normalizeLLMOutput(rawContent);
  const { frontmatterRaw, body } = splitFrontmatterAndBody(normalizedContent);
  if (frontmatterRaw === null) {
    return issues;
  }

  const fields = parseFrontmatterFields(frontmatterRaw);
  if (fields['kind'] !== 'architecture') {
    issues.push({
      level: 'error',
      code: 'invalid-architecture-kind',
      message: `${request.pageName}: Architecture page frontmatter must set kind: "architecture".`,
    });
  }

  for (const field of ['confidence', 'claim_status']) {
    const value = fields[field];
    if (!value || typeof value !== 'string' || !value.trim()) {
      issues.push({
        level: 'error',
        code: `missing-${field.replace('_', '-')}`,
        message: `${request.pageName}: Architecture page frontmatter is missing required field "${field}".`,
      });
    }
  }

  const sourcePaths = fields['source_paths'];
  if (sourcePaths === undefined) {
    issues.push({
      level: 'error',
      code: 'missing-source-paths',
      message: `${request.pageName}: Architecture page frontmatter is missing required field "source_paths".`,
    });
  } else if (Array.isArray(sourcePaths)) {
    if (sourcePaths.length === 0) {
      issues.push({
        level: 'error',
        code: 'empty-source-paths',
        message: `${request.pageName}: Architecture page source_paths must not be empty.`,
      });
    }

    const allowedSourcePaths = new Set((request.sourcePaths || []).filter(isNonEmptyString));
    const outOfContextPaths = sourcePaths.filter((entry) => isNonEmptyString(entry) && !allowedSourcePaths.has(entry));
    if (outOfContextPaths.length > 0) {
      issues.push({
        level: 'error',
        code: 'out-of-context-source-paths',
        message: `${request.pageName}: Architecture page source_paths must be drawn from the prompt source cards: ${outOfContextPaths.join(', ')}.`,
      });
    }
  }

  for (const heading of ARCHITECTURE_REQUIRED_HEADINGS) {
    if (!body.includes(heading)) {
      issues.push({
        level: 'error',
        code: 'missing-architecture-heading',
        message: `${request.pageName}: Architecture page is missing required heading "${heading}".`,
      });
    }
  }

  const humanNotesBlock = /<!-- HUMAN_NOTES_START -->([\s\S]*?)<!-- HUMAN_NOTES_END -->/.exec(body);
  if (!humanNotesBlock) {
    issues.push({
      level: 'error',
      code: 'missing-human-notes-block',
      message: `${request.pageName}: Architecture page must include a HUMAN_NOTES block.`,
    });
  } else if (humanNotesBlock[1].trim().length > 0) {
    issues.push({
      level: 'error',
      code: 'non-empty-human-notes-block',
      message: `${request.pageName}: Architecture page HUMAN_NOTES block must remain empty in synthesized output.`,
    });
  }

  return issues;
}

function withValidationFeedback(request: LLMRequest, error: WikiPatchError): LLMRequest {
  return {
    ...request,
    userPrompt: `${request.userPrompt}\n\n${formatValidationFeedback(error)}`,
  };
}

function formatValidationFeedback(error: WikiPatchError): string {
  const issueLines = error.issues
    .map((issue) => `- ${issue.level} ${issue.code}: ${issue.message}`)
    .join('\n');

  return [
    'Previous response was rejected by repo-wiki structured patch validation.',
    'Validation issues:',
    issueLines || '- error unknown: Validation failed.',
    '',
    'Retry output contract:',
    '- Output only raw markdown for the page.',
    '- The first line must be exactly `---`.',
    '- Do not include any preamble, commentary, or fenced code block wrapper.',
    '- Include required YAML frontmatter: source_repo, source_commit, compiled_at, kind, page_state, and source_paths.',
    '- source_paths must be a non-empty array of repository source paths grounded in the prompt context.',
  ].join('\n');
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeMaxRetries(maxRetries: number | undefined): number {
  if (maxRetries === undefined) return 0;
  if (!Number.isFinite(maxRetries) || maxRetries < 0) {
    throw new RangeError('maxRetries must be a non-negative finite number.');
  }
  return Math.floor(maxRetries);
}
