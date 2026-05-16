/**
 * Utilities for handling YAML frontmatter in wiki pages at publish time.
 *
 * GitHub-hosted Wiki pages render top-of-file YAML frontmatter as a visible
 * metadata table, which is unwanted noise. These utilities allow stripping,
 * preserving, or transforming frontmatter at publish time while keeping it in
 * local wiki files for tooling.
 */

import { containsSecretLikeContent } from './secret-patterns.js';

export type FrontmatterPolicy = 'strip' | 'html-comment' | 'preserve' | 'provenance';

export const FRONTMATTER_POLICIES: readonly FrontmatterPolicy[] = ['strip', 'html-comment', 'preserve', 'provenance'];

const FRONTMATTER_POLICY_NAMES: ReadonlySet<string> = new Set(FRONTMATTER_POLICIES);

export function isFrontmatterPolicy(value: string): value is FrontmatterPolicy {
  return FRONTMATTER_POLICY_NAMES.has(value);
}

/**
 * Validates a raw string as a FrontmatterPolicy, returning the default `'strip'`
 * if the value is undefined or not a recognised policy name.
 */
export function parseFrontmatterPolicy(value: string | undefined): FrontmatterPolicy {
  if (value !== undefined && isFrontmatterPolicy(value)) {
    return value;
  }
  return 'strip';
}

/**
 * Strips a valid leading YAML frontmatter block from markdown content.
 *
 * A valid frontmatter block:
 *   - Starts with `---` (optionally after a UTF-8 BOM, and optionally trailing whitespace) on the very first line
 *   - Contains zero or more lines of YAML
 *   - Ends with `---` or `...` on a subsequent line
 *
 * If the block is unclosed (no closing delimiter) or there is no opening
 * `---` on line 1, the content is returned unchanged.
 *
 * `---` blocks that appear elsewhere in the document are never touched.
 */
export type FrontmatterBlock = {
  yaml: string;
  body: string;
};

export function extractFrontmatterBlock(content: string): FrontmatterBlock | null {
  const source = content.startsWith('\uFEFF') ? content.slice(1) : content;
  if (!source.startsWith('---')) {
    return null;
  }

  // The opening `---` must be the entire first line (allow trailing whitespace)
  const firstNewline = source.indexOf('\n');
  if (firstNewline === -1) {
    // Single-line document starting with `---` – treat as thematic break
    return null;
  }

  const firstLine = source.slice(0, firstNewline);
  if (firstLine.trimEnd() !== '---') {
    return null;
  }

  // Search for the closing `---` or `...` on a line by itself
  const rest = source.slice(firstNewline + 1);
  const lines = rest.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimEnd();
    if (trimmed === '---' || trimmed === '...') {
      const body = lines.slice(i + 1).join('\n').replace(/^(?:\r\n|\n)/, '');
      return {
        yaml: lines.slice(0, i).join('\n'),
        body
      };
    }
  }

  // No closing delimiter – malformed / unclosed frontmatter.
  return null;
}

export function stripFrontmatter(content: string): string {
  return extractFrontmatterBlock(content)?.body ?? content;
}

/**
 * Apply a frontmatter policy to page content.
 *
 * Policies:
 *   - `strip`        – Remove the frontmatter block entirely.
 *   - `html-comment` – Same as `strip` for now; reserved for future wrapping in HTML comments.
 *   - `preserve`     – Return the content unchanged.
 *   - `provenance`   – Replace leading frontmatter with a visible provenance block.
 */
export function applyFrontmatterPolicy(content: string, policy: FrontmatterPolicy): string {
  switch (policy) {
    case 'strip':
    case 'html-comment':
      return stripFrontmatter(content);
    case 'preserve':
      return content;
    case 'provenance':
      return renderFrontmatterAsProvenance(content);
    default: {
      // Exhaustiveness guard – TypeScript will flag unhandled additions to FrontmatterPolicy
      const _exhaustive: never = policy;
      throw new Error(`Unknown frontmatter policy: ${_exhaustive}`);
    }
  }
}

type SupportedFrontmatter = {
  source_repo?: string;
  source_commit?: string;
  compiled_at?: string;
  kind?: string;
  page_state?: string;
  confidence?: string;
  claim_status?: string;
  source_paths?: string[];
};

const MAX_VISIBLE_SOURCE_PATHS = 10;
const DOCUMENTATION_EVIDENCE_NOTE = [
  'This page is derived from markdown documentation, which is secondary evidence.',
  'Validate operational/current-behavior claims against source, tests, CI, config, or schemas.'
].join(' ');
const REVIEW_REQUIRED_EVIDENCE_NOTE = [
  'This page has a review-oriented claim status and may contain unvalidated or secondary-evidence claims.',
  'Validate operational/current-behavior claims against source, tests, CI, config, or schemas.'
].join(' ');
const REVIEW_ORIENTED_CLAIM_STATUS = /\b(?:review[-_ ]?needed|documentation[-_ ]?derived|docs[-_ ]?derived|documentation[-_ ]?review|docs[-_ ]?review)\b/i;

function renderFrontmatterAsProvenance(content: string): string {
  const block = extractFrontmatterBlock(content);
  if (!block) {
    return content;
  }

  const metadata = parseSupportedFrontmatter(block.yaml);
  if (!metadata) {
    // Intentional defensive fallback: unrecognised or malformed frontmatter is left
    // untouched rather than partially rendered.
    return content;
  }

  const provenanceBlock = buildProvenanceBlock(metadata);
  if (!provenanceBlock) {
    return block.body;
  }
  if (!block.body) {
    return `${provenanceBlock}\n`;
  }
  return `${provenanceBlock}\n\n${block.body}`;
}

function buildProvenanceBlock(metadata: SupportedFrontmatter): string {
  const sanitizedRepo = sanitizeVisibleValue(metadata.source_repo, { redactRemote: true });
  const sourceCommit = sanitizeVisibleValue(metadata.source_commit);
  const compiledAt = sanitizeVisibleValue(metadata.compiled_at);
  const kind = sanitizeVisibleValue(metadata.kind);
  const pageState = sanitizeVisibleValue(metadata.page_state);
  const confidence = sanitizeVisibleValue(metadata.confidence);
  const claimStatus = sanitizeVisibleValue(metadata.claim_status);
  const sourcePaths = (metadata.source_paths || []).map((entry) => sanitizeVisibleValue(entry)).filter((entry): entry is string => Boolean(entry));
  const githubRepoBase = sanitizedRepo ? resolveGitHubRepoBase(sanitizedRepo) : null;

  const lines: string[] = [];
  if (sanitizedRepo) {
    lines.push(`> **Generated from:** ${asCodeSpan(sanitizedRepo)}`);
  }
  if (sourceCommit) {
    lines.push(`> **Source commit:** ${formatCommit(sourceCommit, githubRepoBase)}`);
  }
  if (compiledAt) {
    lines.push(`> **Compiled at:** ${asCodeSpan(compiledAt)}`);
  }
  if (kind) {
    lines.push(`> **Page kind:** ${asCodeSpan(kind)}`);
  }
  if (pageState) {
    lines.push(`> **Page state:** ${asCodeSpan(pageState)}`);
  }
  if (confidence) {
    lines.push(`> **Confidence:** ${asCodeSpan(confidence)}`);
  }
  if (claimStatus) {
    lines.push(`> **Claim status:** ${asCodeSpan(claimStatus)}`);
  }
  if (sourcePaths.length > 0) {
    lines.push(`> **Primary sources:** ${formatSourcePaths(sourcePaths, githubRepoBase, sourceCommit)}`);
  }
  const evidenceNote = getEvidenceNote(sourcePaths, claimStatus);
  if (evidenceNote) {
    lines.push(`> **Evidence note:** ${evidenceNote}`);
  }

  return lines.join('  \n');
}

function parseSupportedFrontmatter(yaml: string): SupportedFrontmatter | null {
  const parsed = parseSimpleYamlObject(yaml);
  if (!parsed) {
    return null;
  }

  const sourcePaths = toStringArray(parsed.source_paths);
  if (parsed.source_paths !== undefined && sourcePaths === null) {
    return null;
  }

  return {
    source_repo: toOptionalString(parsed.source_repo),
    source_commit: toOptionalString(parsed.source_commit),
    compiled_at: toOptionalString(parsed.compiled_at),
    kind: toOptionalString(parsed.kind),
    page_state: toOptionalString(parsed.page_state),
    confidence: toOptionalString(parsed.confidence),
    claim_status: toOptionalString(parsed.claim_status),
    ...(sourcePaths ? { source_paths: sourcePaths } : {})
  };
}

export function parseSimpleYamlObject(yaml: string): Record<string, unknown> | null {
  const result: Record<string, unknown> = {};
  const lines = yaml.replace(/\r\n/g, '\n').split('\n');

  for (let index = 0; index < lines.length;) {
    const rawLine = lines[index];
    if (!rawLine.trim() || /^\s*#/.test(rawLine)) {
      index++;
      continue;
    }

    const fieldMatch = /^([A-Za-z_][A-Za-z0-9_-]*):(?:\s*(.*))?$/.exec(rawLine);
    if (!fieldMatch) {
      return null;
    }

    const [, key, rawValue = ''] = fieldMatch;
    if (rawValue === '') {
      const items: unknown[] = [];
      let nextIndex = index + 1;
      while (nextIndex < lines.length) {
        const itemLine = lines[nextIndex];
        if (!itemLine.trim()) {
          nextIndex++;
          continue;
        }

        const listMatch = /^\s*-\s+(.*)$/.exec(itemLine);
        if (!listMatch) {
          break;
        }

        const item = parseSimpleYamlValue(listMatch[1]);
        if (item === INVALID_YAML_VALUE) {
          return null;
        }
        items.push(item);
        nextIndex++;
      }

      if (items.length > 0) {
        result[key] = items;
        index = nextIndex;
        continue;
      }
      result[key] = null;
      index++;
      continue;
    }

    const parsedValue = parseSimpleYamlValue(rawValue);
    if (parsedValue === INVALID_YAML_VALUE) {
      return null;
    }
    result[key] = parsedValue;
    index++;
  }

  return result;
}

const INVALID_YAML_VALUE = Symbol('invalid-yaml-value');

function parseSimpleYamlValue(rawValue: string): unknown {
  const value = rawValue.trim();
  if (value === '') {
    return '';
  }
  if (/^[>|]/.test(value)) {
    return INVALID_YAML_VALUE;
  }
  if (value.startsWith('"') || value.startsWith('[') || value.startsWith('{')) {
    try {
      return JSON.parse(value);
    } catch {
      return INVALID_YAML_VALUE;
    }
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'") || value.length === 1) {
      return INVALID_YAML_VALUE;
    }
    return value.slice(1, -1).replace(/''/g, '\'');
  }
  if (/^(?:true|false)$/i.test(value)) {
    return value.toLowerCase() === 'true';
  }
  if (/^null$/i.test(value)) {
    return null;
  }
  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    return Number(value);
  }
  return value;
}

function toOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return undefined;
}

function toStringArray(value: unknown): string[] | null | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    return null;
  }
  const result: string[] = [];
  for (const item of value) {
    const normalized = toOptionalString(item);
    if (normalized === undefined) {
      return null;
    }
    result.push(normalized);
  }
  return result;
}

function sanitizeVisibleValue(value: string | undefined, options: { redactRemote?: boolean } = {}): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = options.redactRemote ? redactCredentialBearingUrl(value) : value;
  if (!normalized || containsSecretLikeContent(normalized)) {
    return undefined;
  }
  return normalized;
}

function redactCredentialBearingUrl(value: string): string {
  return value
    .replace(/([a-z][a-z\d+.-]*:\/\/)([^/?#@]+):([^/?#@]+)@/gi, '$1***:***@')
    .replace(/([a-z][a-z\d+.-]*:\/\/)([^/?#@:]+)@/gi, '$1***@');
}

function resolveGitHubRepoBase(sourceRepo: string): string | null {
  const trimmed = sourceRepo.trim();
  const httpsMatch = /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i.exec(trimmed);
  if (httpsMatch) {
    return `https://github.com/${httpsMatch[1]}/${stripWikiSuffix(httpsMatch[2])}`;
  }

  const sshMatch = /^git@github\.com:([^/\s]+)\/([^/\s]+?)(?:\.git)?$/i.exec(trimmed);
  if (sshMatch) {
    return `https://github.com/${sshMatch[1]}/${stripWikiSuffix(sshMatch[2])}`;
  }

  const slugMatch = /^([^/\s]+)\/([^/\s]+)$/.exec(trimmed);
  if (slugMatch) {
    return `https://github.com/${slugMatch[1]}/${stripWikiSuffix(slugMatch[2].replace(/\.git$/i, ''))}`;
  }

  return null;
}

function stripWikiSuffix(repoName: string): string {
  return repoName.replace(/\.wiki$/i, '');
}

function formatCommit(commit: string, githubRepoBase: string | null): string {
  if (!githubRepoBase) {
    return asCodeSpan(commit);
  }
  const shortCommit = commit.length > 7 ? commit.slice(0, 7) : commit;
  return `[${asCodeSpan(shortCommit)}](${githubRepoBase}/tree/${encodeURIComponent(commit)})`;
}

function formatSourcePaths(sourcePaths: string[], githubRepoBase: string | null, sourceCommit: string | undefined): string {
  const visiblePaths = sourcePaths.slice(0, MAX_VISIBLE_SOURCE_PATHS);
  const rendered = visiblePaths.map((sourcePath) => formatSourcePath(sourcePath, githubRepoBase, sourceCommit));
  if (sourcePaths.length <= MAX_VISIBLE_SOURCE_PATHS) {
    return rendered.join(', ');
  }
  return `${rendered.join(', ')}, ... and ${sourcePaths.length - MAX_VISIBLE_SOURCE_PATHS} more`;
}

function formatSourcePath(sourcePath: string, githubRepoBase: string | null, sourceCommit: string | undefined): string {
  if (!githubRepoBase || !sourceCommit) {
    return asCodeSpan(sourcePath);
  }
  const encodedPath = sourcePath.split('/').map((segment) => encodeGitHubPathSegment(segment)).join('/');
  return `[${escapeMarkdownLinkLabel(sourcePath)}](${githubRepoBase}/blob/${encodeURIComponent(sourceCommit)}/${encodedPath})`;
}

function getEvidenceNote(sourcePaths: string[], claimStatus: string | undefined): string | null {
  if (sourcePaths.length > 0 && sourcePaths.every((entry) => isDocumentationPath(entry))) {
    return DOCUMENTATION_EVIDENCE_NOTE;
  }
  if (claimStatus && REVIEW_ORIENTED_CLAIM_STATUS.test(claimStatus)) {
    return REVIEW_REQUIRED_EVIDENCE_NOTE;
  }
  return null;
}

function isDocumentationPath(filePath: string): boolean {
  return /(?:^|\/)(?:docs?|adr|architecture|runbooks?)\//i.test(filePath) || /\.(?:md|mdx|rst|adoc|txt)$/i.test(filePath);
}

function asCodeSpan(value: string): string {
  const backtickRuns: string[] = value.match(/`+/g) || [];
  const longestRun = backtickRuns.reduce((max, run) => Math.max(max, run.length), 0);
  const fence = '`'.repeat(Math.max(1, longestRun + 1));
  const needsPadding = value.startsWith('`') || value.endsWith('`') || /^\s|\s$/.test(value);
  const body = needsPadding ? ` ${value} ` : value;
  return `${fence}${body}${fence}`;
}

function escapeMarkdownLinkLabel(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/([\[\]()*_`])/g, '\\$1');
}

/**
 * GitHub blob URLs tolerate the characters escaped by encodeURIComponent but
 * markdown link destinations are more robust when we additionally percent-encode
 * RFC 3986 reserved punctuation such as parentheses and apostrophes.
 */
function encodeGitHubPathSegment(segment: string): string {
  return encodeURIComponent(segment).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}
