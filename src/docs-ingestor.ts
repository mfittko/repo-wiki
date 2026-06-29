import { promises as fs } from 'node:fs';
import path from 'node:path';
import { cleanDocumentedPathTarget, hasParentDirectorySegment, isGeneratedOutputReference, normalizeRoutePath } from './docs-validation.js';

const DOC_EXTENSIONS = ['.md', '.mdx', '.markdown'];
const ROUTE_PATH_PART_PATTERN = "[A-Za-z0-9._~:@!$&'()*+,;=%\\-[\\]{}]+";
const ROUTE_PATH_PATTERN = `(?:\\/(?:${ROUTE_PATH_PART_PATTERN}(?:\\/+${ROUTE_PATH_PART_PATTERN})*)?\\/?)`;
const ROUTE_CLAIM_PATTERN = new RegExp(`\\b(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD|ALL)\\b\\s+(${ROUTE_PATH_PATTERN})`, 'gi');
const ROUTE_TABLE_PATH_PATTERN = new RegExp(`(?:^|[\\s|\`(])(${ROUTE_PATH_PATTERN})(?=$|[\\s|\`),.;:!?])`, 'g');

// Npm lifecycle commands that map directly to package.json scripts
const NPM_LIFECYCLE_SCRIPTS = new Set(['test', 'start', 'stop', 'restart']);
const SHELL_RESERVED_WORDS = new Set(['if', 'then', 'else', 'elif', 'fi', 'for', 'select', 'while', 'until', 'do', 'done', 'case', 'esac', '{', '}']);
const COMMON_ENV_VAR_NAMES = new Set(['CI', 'HOME', 'PATH', 'PORT', 'SHELL', 'TERM', 'USER']);
const RECOGNIZED_DOC_COMMAND_PREFIX = /^(npm|pnpm|yarn|node|npx|make|just|task|docker|git)\b/;

export type CommandStatus = 'validated' | 'missing' | 'unvalidated';
export type CommandSource = 'package_scripts' | 'ci_workflow' | 'unknown';

export type CommandClassification = {
  command: string;
  status: CommandStatus;
  source: CommandSource;
  script_name?: string;
  target_name?: string;
};

export type DocumentedFilePath = {
  path: string;
  line: number;
  source: 'link' | 'inline_code';
};

export type SourceRange = {
  line?: number;
  end_line?: number;
};

export type CiWorkflowCommandSource = {
  command: string;
  line?: number;
  end_line?: number;
};




type AdrMetadata = {
  detected: boolean;
  detection_source: 'path' | 'marker' | 'path+marker' | 'none';
  status: string | null;
  superseded_by: string | null;
  replaces: string | null;
  has_status_metadata: boolean;
  superseded: boolean;
};

type CommandClassificationOptions = {}; // ponytail: task-runner validation removed

type NormalizedCommandClassificationOptions = {};

/**
 * Extract npm/shell commands from CI workflow YAML content.
 * Parses `run:` lines and `command:` matrix fields.
 */
export function extractCiCommands(content: string): string[] {
  return [...new Set(extractCiCommandSources(content).map((entry) => entry.command))];
}

export function extractCiCommandSources(content: string): CiWorkflowCommandSource[] {
  const commands: CiWorkflowCommandSource[] = [];
  const seen = new Set<string>();
  const lines = content.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    // Match both `- run: <cmd>` (list item) and `  run: <cmd>` (property)
    const runMatch = /^(\s+)(?:-\s+)?run:\s+(.+)$/.exec(line);
    if (runMatch) {
      const { parts, lastLineIndex } = extractWorkflowCommandValue(runMatch[2], lines, index, runMatch[1].length);
      for (const part of parts) {
        pushCiWorkflowCommandSource(commands, seen, part);
      }
      index = lastLineIndex;
      continue;
    }
    // Match `command: <cmd>` matrix fields
    const cmdMatch = /^(\s+)command:\s+(.+)$/.exec(line);
    if (cmdMatch) {
      const { parts, lastLineIndex } = extractWorkflowCommandValue(cmdMatch[2], lines, index, cmdMatch[1].length);
      for (const part of parts) {
        pushCiWorkflowCommandSource(commands, seen, part);
      }
      index = lastLineIndex;
    }
  }
  return commands;
}

/**
 * Merge package scripts from all package.json entries in a manifest's analysis.
 * Later entries overwrite earlier ones on key collision, following the manifest's
 * sorted package_scripts array order.
 */
export function mergePackageScripts(manifest: { analysis?: { package_scripts?: Array<{ scripts?: Record<string, string> }> } }): Record<string, string> {
  const result: Record<string, string> = {};
  for (const pkg of manifest.analysis?.package_scripts || []) {
    Object.assign(result, pkg.scripts || {});
  }
  return result;
}

/**
 * Classify documented commands against known package scripts and CI commands.
 * Returns each command with a validation status: validated, missing, or unvalidated.
 */
export function classifyDocumentedCommands(
  commands: string[],
  packageScripts: Record<string, string>,
  ciCommands: string[],
  options: CommandClassificationOptions = {}
): CommandClassification[] {
  const normalizedOptions = normalizeCommandClassificationOptions(options);
  return commands.flatMap((command) => splitShellCommand(command).map((part) => classifyCommand(part, packageScripts, ciCommands, normalizedOptions)));
}

function classifyCommand(
  command: string,
  packageScripts: Record<string, string>,
  ciCommands: string[],
  options: NormalizedCommandClassificationOptions
): CommandClassification {
  // A verbatim CI workflow match is authoritative for any supported command form,
  // including npm workspace invocations this best-effort parser cannot map safely.
  const normalized = command.trim();
  if (ciCommands.some((ci) => ci.trim() === normalized)) {
    return { command, status: 'validated', source: 'ci_workflow' };
  }

  // npm workspace selectors require package-to-workspace resolution. Keep those
  // conservative unless CI validated the exact documented command above.
  if (hasNpmWorkspaceSelector(command)) {
    return { command, status: 'unvalidated', source: 'unknown' };
  }

  // npm run <scriptName>
  const npmRunScript = parseNpmRunScript(command);
  if (npmRunScript) {
    const scriptName = npmRunScript;
    return {
      command,
      status: scriptName in packageScripts ? 'validated' : 'missing',
      source: 'package_scripts',
      script_name: scriptName
    };
  }

  // npm test / npm start / npm stop / npm restart (lifecycle commands)
  const lifecycleScript = parseNpmLifecycleScript(command);
  if (lifecycleScript) {
    const scriptName = lifecycleScript;
    return {
      command,
      status: scriptName in packageScripts ? 'validated' : 'unvalidated',
      source: 'package_scripts',
      script_name: scriptName
    };
  }



  return { command, status: 'unvalidated', source: 'unknown' };
}

export function isDocumentationFile(filePath, config) {
  const lower = filePath.toLowerCase();
  if (!DOC_EXTENSIONS.some((ext) => lower.endsWith(ext))) return false;
  const docs = config.documentation || {};
  if (docs.ingest === false) return false;
  if ((docs.exclude || []).some((pattern) => globLikeMatch(filePath, pattern))) return false;
  return (docs.include || []).some((pattern) => globLikeMatch(filePath, pattern));
}

export async function createDocumentationCard({ file, content, config, repoPath }) {
  const stats = await fs.stat(path.join(repoPath, file.relative));
  const headings = extractHeadings(content);
  const links = extractMarkdownLinks(content);
  const codeBlocks = extractCodeBlocks(content);
  const filePaths = extractDocumentedFilePaths(content);
  const claims = extractDocumentationClaims(content);
  const validation = validateDocClaims({ claims, content, filePath: file.relative });
  const adr = detectAdrMetadata(file.relative, content);
  const ageDays = Math.floor((Date.now() - stats.mtimeMs) / 86_400_000);
  const staleAfterDays = config.documentation?.stale_after_days ?? 180;
  const stale = ageDays > staleAfterDays || /\b(deprecated|obsolete|archived|outdated|legacy only)\b/i.test(content);

  return {
    kind: 'documentation_card',
    path: file.relative,
    authority: config.documentation?.authority || 'secondary',
    modified_at: stats.mtime.toISOString(),
    age_days: ageDays,
    stale_after_days: staleAfterDays,
    stale,
    headings,
    links,
    code_blocks: codeBlocks,
    file_paths: filePaths,
    claims,
    validation,
    adr,
    status: stale ? 'stale' : validation.contradictions.length ? 'contradicted' : validation.validated.length ? 'partially_validated' : 'unvalidated'
  };
}

function detectAdrMetadata(filePath: string, content: string): AdrMetadata {
  const normalizedPath = String(filePath || '').replaceAll('\\', '/');
  const lowerPath = normalizedPath.toLowerCase();
  const frontmatter = parseMarkdownFrontmatter(content);
  const frontmatterKeys = new Set(Object.keys(frontmatter));
  const frontmatterStatus = readFrontmatterValue(frontmatter, ['status']);
  const frontmatterSupersededBy = readFrontmatterValue(frontmatter, ['superseded_by', 'superseded-by']);
  const frontmatterReplaces = readFrontmatterValue(frontmatter, ['replaces']);
  const statusLine = readLabeledLine(content, 'Status');
  const supersededByLine = readLabeledLine(content, 'Superseded by');
  const replacesLine = readLabeledLine(content, 'Replaces');
  const adrHeading = /^\s*#{1,6}\s*(?:ADR\s*:|ADR-\d+)\b/im.test(content) || /^\s*ADR-\d+\b/im.test(content);
  const statusMarker = Boolean(statusLine || frontmatterKeys.has('status'));
  const strongMarkers = Boolean(
    adrHeading
    || supersededByLine
    || replacesLine
    || frontmatterKeys.has('superseded_by')
    || frontmatterKeys.has('superseded-by')
    || frontmatterKeys.has('replaces')
  );
  const pathHint = lowerPath.startsWith('adr/') || lowerPath.startsWith('docs/adr/') || lowerPath.startsWith('docs/adrs/');
  const architectureHint = lowerPath.startsWith('docs/architecture/');
  const detectedByMarker = strongMarkers || (statusMarker && adrHeading);
  const detected = pathHint || detectedByMarker;
  const detection_source = pathHint && detectedByMarker ? 'path+marker' : pathHint ? 'path' : detectedByMarker ? 'marker' : 'none';
  const status = firstDefined(frontmatterStatus, statusLine);
  const supersededBy = firstDefined(frontmatterSupersededBy, supersededByLine);
  const replaces = firstDefined(frontmatterReplaces, replacesLine);
  const normalizedStatus = status ? status.toLowerCase() : '';
  const superseded = Boolean(supersededBy || /\bsupersed(?:ed|ing)\b/.test(normalizedStatus) || /\breplaced\b/.test(normalizedStatus));
  const hasStatusMetadata = Boolean(status || supersededBy || replaces);
  return {
    detected,
    detection_source,
    status: status || null,
    superseded_by: supersededBy || null,
    replaces: replaces || null,
    has_status_metadata: hasStatusMetadata,
    superseded
  };
}

function parseMarkdownFrontmatter(content: string): Record<string, string> {
  const text = String(content || '');
  if (!text.startsWith('---\n')) return {};
  const closingOffset = text.indexOf('\n---', 4);
  if (closingOffset < 0) return {};
  const block = text.slice(4, closingOffset);
  const values: Record<string, string> = {};
  for (const line of block.split('\n')) {
    const match = /^\s*([A-Za-z0-9_-]+)\s*:\s*(.+?)\s*$/.exec(line);
    if (!match) continue;
    const key = match[1].toLowerCase();
    const value = match[2].replace(/^['"]|['"]$/g, '').trim();
    if (!value) continue;
    values[key] = value;
  }
  return values;
}

function readFrontmatterValue(frontmatter: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = frontmatter[key];
    if (value) return value;
  }
  return '';
}

function readLabeledLine(content: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const match = new RegExp(`^\\s*${escapedLabel}\\s*:\\s*(.+?)\\s*$`, 'im').exec(content);
  if (!match) return '';
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

function firstDefined(...values: string[]) {
  for (const value of values) {
    if (value) return value;
  }
  return '';
}

export function extractDocumentationClaims(content) {
  const claims = [];
  const lines = content.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line || line.startsWith('#') || line.startsWith('```')) continue;
    if (/^(the |this |we |our |users |developers |run |use |requires |supports |deploy|build|test|configure)/i.test(line)) {
      claims.push({ line: index + 1, text: line.slice(0, 280), status: 'unvalidated' });
    }
  }
  return claims.slice(0, 100);
}

export function validateDocClaims({ claims, content, filePath }) {
  const validated = [];
  const contradictions = [];
  const commands = [];
  const envVars = [];
  const routeClaims = extractRouteClaims(content);

  for (const block of extractCodeBlocks(content)) {
    if (/^(bash|sh|shell|zsh|console)?$/i.test(block.language || '')) {
      for (const line of block.content.split('\n')) {
        const trimmed = line.trim().replace(/^[$>]\s*/, '');
        if (RECOGNIZED_DOC_COMMAND_PREFIX.test(trimmed)) {
          commands.push(...splitShellCommand(trimmed));
        }
      }
    }
  }

  for (const match of content.matchAll(/\b[A-Z][A-Z0-9_]{2,}\b/g)) {
    if (isEnvironmentVariableMention(match[0])) envVars.push(match[0]);
  }

  for (const claim of claims) {
    if (/deprecated|obsolete|no longer|removed/i.test(claim.text)) {
      contradictions.push({ ...claim, status: 'needs-review', reason: 'documentation contains deprecation or removal language' });
    } else if (/run|command|npm|pnpm|yarn|make|docker|env|config|route|api|test/i.test(claim.text)) {
      validated.push({ ...claim, status: 'needs-code-validation', reason: 'claim is operational and should be checked against code/config' });
    }
  }

  return {
    validated,
    contradictions,
    route_claims: routeClaims,
    commands: [...new Set(commands)].slice(0, 50),
    env_vars: [...new Set(envVars)].slice(0, 50),
    summary: {
      claims: claims.length,
      needs_code_validation: validated.length,
      contradictions: contradictions.length,
      route_claims: routeClaims.length,
      commands: commands.length,
      env_vars: envVars.length,
      file: filePath
    }
  };
}

export function extractRouteClaims(content: string) {
  const routes = [];
  const seen = new Set<string>();
  const lines = String(content || '').split('\n');

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const snippet = line.trim();
    if (!snippet || /^[-|\s:]+$/.test(snippet)) continue;
    pushRouteMatches(routes, seen, line, index + 1);
  }

  return routes.slice(0, 100);
}

function pushRouteMatches(routes: any[], seen: Set<string>, line: string, lineNumber: number) {
  const snippet = line.trim().slice(0, 280);
  if (!snippet) return;

  ROUTE_CLAIM_PATTERN.lastIndex = 0;
  for (const match of line.matchAll(ROUTE_CLAIM_PATTERN)) {
    pushRoute(routes, seen, {
      line: lineNumber,
      text: snippet,
      snippet,
      path: normalizeRouteClaimPath(match[2]),
      method: match[1].toUpperCase()
    });
  }

  if (line.includes('|')) {
    const methods = [...line.matchAll(/\b(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD|ALL)\b/gi)].map((match) => match[1].toUpperCase());
    ROUTE_TABLE_PATH_PATTERN.lastIndex = 0;
    const paths = [...line.matchAll(ROUTE_TABLE_PATH_PATTERN)].map((match) => normalizeRouteClaimPath(match[1]));
    const pairCount = Math.min(methods.length, paths.length);
    for (let index = 0; index < pairCount; index += 1) {
      pushRoute(routes, seen, {
        line: lineNumber,
        text: snippet,
        snippet,
        path: paths[index],
        method: methods[index]
      });
    }
  }
}

function normalizeRouteClaimPath(routePath: string) {
  const normalized = normalizeRoutePath(routePath);
  if (!normalized) return '';
  if (normalized !== '/') return normalized;

  const cleaned = String(routePath || '')
    .trim()
    .replace(/^[`'"\[({<]+/, '')
    .replace(/[`'"\]\)}>.,;:!?]+$/, '')
    .trim()
    .replace(/[?#].*$/, '');
  return /^\/{2,}$/.test(cleaned) ? '' : normalized;
}

function pushRoute(routes: any[], seen: Set<string>, route: any) {
  if (!route.path || !route.method) return;
  const key = `${route.line}\u0000${route.method}\u0000${route.path}`;
  if (!seen.has(key)) {
    seen.add(key);
    routes.push(route);
  }
}

function isEnvironmentVariableMention(value: string) {
  if (!/^[A-Z][A-Z0-9_]{1,}$/.test(value)) return false;
  if (COMMON_ENV_VAR_NAMES.has(value)) return true;
  if (!value.includes('_')) return false;
  if (/^(README|TODO|HTTP|HTTPS|JSON|YAML|CLI|API)$/.test(value)) return false;
  // Exclude known template markers, GitHub review states, and other non-env-var constants
  if (/^(HUMAN_NOTES|CHANGES_REQUESTED|APPROVED|DISMISSED|COMMENT_ONLY)$/.test(value)) return false;
  return true;
}

function extractWorkflowCommandValue(value: string, lines: string[], lineIndex: number, baseIndent: number): { parts: CiWorkflowCommandSource[]; lastLineIndex: number } {
  if (/^[|>](?:[+-]?\d*|\d*[+-]?)$/.test(value.trim())) {
    const blockLines: Array<{ line: string; lineNumber: number }> = [];
    let lastLineIndex = lineIndex;
    for (let index = lineIndex + 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (line.trim() && leadingSpaces(line) <= baseIndent) break;
      lastLineIndex = index;
      if (!line.trim()) continue;
      blockLines.push({ line: line.trim(), lineNumber: index + 1 });
    }
    const parts = coalesceMultilineWorkflowCommands(blockLines).flatMap((entry) => extractWorkflowCommandParts(entry.command, entry.start_line, entry.end_line));
    return { parts, lastLineIndex };
  }

  return { parts: extractWorkflowCommandParts(value, lineIndex + 1), lastLineIndex: lineIndex };
}

function extractWorkflowCommandParts(command: string, line: number, endLine?: number): CiWorkflowCommandSource[] {
  const unquoted = command.trim().replace(/^["']|["']$/g, '');
  if (!unquoted || unquoted.includes('${{')) return [];
  return splitShellCommand(unquoted, false)
    .filter((part) => !isShellReservedCommand(part))
    .map((part) => ({
      command: part,
      line,
      ...(typeof endLine === 'number' && endLine > line ? { end_line: endLine } : {})
    }));
}

function isShellReservedCommand(command: string): boolean {
  const firstToken = tokenizeShellWords(command)[0];
  return Boolean(firstToken && SHELL_RESERVED_WORDS.has(firstToken));
}

function leadingSpaces(line: string): number {
  return /^ */.exec(line)?.[0].length || 0;
}

function pushCiWorkflowCommandSource(target: CiWorkflowCommandSource[], seen: Set<string>, value: CiWorkflowCommandSource) {
  const key = `${value.command}␟${value.line ?? ''}␟${value.end_line ?? ''}`;
  if (seen.has(key)) {
    return;
  }
  seen.add(key);
  target.push(value);
}

function coalesceMultilineWorkflowCommands(lines: Array<{ line: string; lineNumber: number }>) {
  const commands: Array<{ command: string; start_line: number; end_line: number }> = [];
  let pending = '';
  let startLine = 0;
  let lastLineNumber = 0;

  for (const entry of lines) {
    lastLineNumber = entry.lineNumber;
    const line = entry.line;
    const continues = hasLineContinuation(line);
    const normalized = (continues ? stripContinuationBackslash(line) : line).trim();
    if (!normalized) {
      if (!continues) {
        pending = '';
        startLine = 0;
      }
      continue;
    }

    if (!pending) {
      pending = normalized;
      startLine = entry.lineNumber;
    } else {
      pending = `${pending} ${normalized}`;
    }

    if (!continues) {
      commands.push({ command: pending, start_line: startLine, end_line: entry.lineNumber });
      pending = '';
      startLine = 0;
    }
  }

  if (pending && startLine > 0) {
    commands.push({ command: pending, start_line: startLine, end_line: lastLineNumber || startLine });
  }

  return commands;
}

function hasLineContinuation(line: string) {
  return ((/(\\+)\s*$/.exec(line)?.[1].length ?? 0) % 2) === 1;
}

function stripContinuationBackslash(line: string) {
  return line.replace(/(\\+)(\s*)$/, (_, slashes: string, ws: string) => `${slashes.slice(0, -1)}${ws}`);
}

function normalizeCommandClassificationOptions(_options: CommandClassificationOptions): NormalizedCommandClassificationOptions {
  return {};
}

function parseNpmRunScript(command: string): string | undefined {
  const tokens = tokenizeShellWords(command);
  if (tokens[0] !== 'npm') return undefined;
  const runIndex = tokens.findIndex((token, index) => index > 0 && token === 'run');
  if (runIndex === -1) return undefined;
  return tokens.slice(runIndex + 1).find((token) => token && !token.startsWith('-'));
}

function parseNpmLifecycleScript(command: string): string | undefined {
  const tokens = tokenizeShellWords(command);
  if (tokens[0] !== 'npm') return undefined;
  return NPM_LIFECYCLE_SCRIPTS.has(tokens[1]) ? tokens[1] : undefined;
}

function hasNpmWorkspaceSelector(command: string): boolean {
  const tokens = tokenizeShellWords(command);
  if (tokens[0] !== 'npm') return false;
  return tokens.some((token) => token === '-w' || token === '--workspace' || token === '--workspaces' || token.startsWith('--workspace='));
}

function tokenizeShellWords(command: string): string[] {
  return (command.match(/"[^"]*"|'[^']*'|\S+/g) || []).map((token) => token.replace(/^["']|["']$/g, ''));
}

function splitShellCommand(command: string, recognizedOnly = true): string[] {
  const parts: string[] = [];
  let current = '';
  let quote: '"' | "'" | '' = '';

  for (let index = 0; index < command.length; index += 1) {
    const char = command[index];
    const next = command[index + 1];
    if ((char === '"' || char === "'") && !quote) {
      quote = char;
      current += char;
      continue;
    }
    if (char === quote) {
      quote = '';
      current += char;
      continue;
    }
    if (!quote && ((char === '&' && next === '&') || (char === '|' && next === '|'))) {
      parts.push(current.trim());
      current = '';
      index += 1;
      continue;
    }
    if (!quote && char === ';') {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  parts.push(current.trim());

  return parts.filter((part) => part && (!recognizedOnly || RECOGNIZED_DOC_COMMAND_PREFIX.test(part)));
}

export function extractDocumentedFilePaths(content: string): DocumentedFilePath[] {
  const results: DocumentedFilePath[] = [];
  const seen = new Set<string>();
  const lines = content.split('\n');
  let fenceMarker: '`' | '~' | '' = '';

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fenceMatch = /^\s*(```+|~~~+)/.exec(line);
    if (fenceMatch && (!fenceMarker || fenceMatch[1][0] === fenceMarker)) {
      fenceMarker = fenceMarker ? '' : fenceMatch[1][0] as '`' | '~';
      continue;
    }
    if (fenceMarker) continue;

    for (const linkTarget of extractMarkdownLinkTargets(line)) {
      const target = cleanDocumentedPathTarget(linkTarget);
      if (isDocumentedPathCandidate(target, true)) {
        pushDocumentedPath(results, seen, { path: target, line: index + 1, source: 'link' });
      }
    }

    for (const match of line.matchAll(/`([^`]+)`/g)) {
      const target = cleanDocumentedPathTarget(match[1]);
      if (isDocumentedPathCandidate(target, false)) {
        pushDocumentedPath(results, seen, { path: target, line: index + 1, source: 'inline_code' });
      }
    }
  }

  return results.slice(0, 200);
}

function extractMarkdownLinkTargets(line: string) {
  const targets: string[] = [];
  for (let index = 0; index < line.length; index += 1) {
    const openBracket = line.indexOf('[', index);
    if (openBracket === -1) break;
    const closeBracket = line.indexOf(']', openBracket + 1);
    if (closeBracket === -1 || line[closeBracket + 1] !== '(') {
      index = openBracket;
      continue;
    }

    let cursor = closeBracket + 2;
    let target = '';
    if (line[cursor] === '<') {
      cursor += 1;
      const closeAngle = line.indexOf('>', cursor);
      if (closeAngle === -1) {
        index = cursor;
        continue;
      }
      target = line.slice(cursor, closeAngle);
      cursor = closeAngle + 1;
      while (line[cursor] && /\s/.test(line[cursor])) cursor += 1;
      if (line[cursor] !== ')') {
        index = cursor;
        continue;
      }
      targets.push(target);
      index = cursor;
      continue;
    }

    let depth = 0;
    let quote: '"' | "'" | '' = '';
    for (; cursor < line.length; cursor += 1) {
      const char = line[cursor];
      if ((char === '"' || char === "'") && !quote) {
        quote = char;
      } else if (char === quote) {
        quote = '';
      } else if (!quote && char === '(') {
        depth += 1;
      } else if (!quote && char === ')') {
        if (depth === 0) break;
        depth -= 1;
      }
      target += char;
    }

    if (cursor < line.length && line[cursor] === ')') {
      targets.push(target);
      index = cursor;
    } else {
      index = closeBracket;
    }
  }
  return targets;
}

function pushDocumentedPath(results: DocumentedFilePath[], seen: Set<string>, value: DocumentedFilePath) {
  const key = `${value.path}\0${value.line}\0${value.source}`;
  if (!seen.has(key)) {
    seen.add(key);
    results.push(value);
  }
}

function isDocumentedPathCandidate(value: string, fromLink: boolean) {
  if (!value || value.startsWith('#') || /^(https?:|mailto:|tel:)/i.test(value)) return false;
  if (/[{}*]/.test(value)) return false;
  if (/\s/.test(value)) return false;
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(value)) return false;
  if (value.startsWith('/')) return false;
  if (value.endsWith('.git')) return false; // git remote URL, not a file path
  if (isGeneratedOutputReference(value)) return false;
  if (hasParentDirectorySegment(value)) return true;
  if (value.startsWith('./') || value.startsWith('../')) return true;
  if (value.includes('/')) return true;
  if (fromLink) return true;
  return /^(?:[A-Z]+\.)?[^/]+\.(?:md|mdx|markdown|ts|tsx|js|jsx|mjs|cjs|json|ya?ml|toml|rs|go|py|rb|java|kt|cs|php|prisma|sql|sh|bash|env|txt)$/i.test(value);
}

function extractHeadings(content) {
  return content.split('\n')
    .map((line, index) => ({ line: index + 1, match: /^(#{1,6})\s+(.+)$/.exec(line) }))
    .filter((item) => item.match)
    .map((item) => ({ line: item.line, level: item.match[1].length, text: item.match[2].trim() }))
    .slice(0, 100);
}

function extractMarkdownLinks(content) {
  const links = [];
  for (const line of content.split('\n')) {
    for (const target of extractMarkdownLinkTargets(line)) {
      links.push(cleanDocumentedPathTarget(target));
    }
  }
  return [...new Set(links)].slice(0, 200);
}

function extractCodeBlocks(content) {
  const blocks = [];
  const pattern = /```([^\n`]*)\n([\s\S]*?)```/g;
  for (const match of content.matchAll(pattern)) {
    blocks.push({ language: match[1].trim(), content: match[2].trim().slice(0, 4000) });
  }
  return blocks.slice(0, 40);
}

function globLikeMatch(filePath, pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, '(?:.*/)?')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*');
  return new RegExp(`^${escaped}$`).test(filePath);
}
