import { promises as fs } from 'node:fs';
import path from 'node:path';
import { cleanDocumentedPathTarget, hasParentDirectorySegment, isGeneratedOutputReference, normalizeRoutePath } from './docs-validation.js';

const DOC_EXTENSIONS = ['.md', '.mdx', '.markdown'];

// Npm lifecycle commands that map directly to package.json scripts
const NPM_LIFECYCLE_SCRIPTS = new Set(['test', 'start', 'stop', 'restart']);
const SHELL_RESERVED_WORDS = new Set(['if', 'then', 'else', 'elif', 'fi', 'for', 'select', 'while', 'until', 'do', 'done', 'case', 'esac', '{', '}']);
const COMMON_ENV_VAR_NAMES = new Set(['CI', 'HOME', 'PATH', 'PORT', 'SHELL', 'TERM', 'USER']);

export type CommandStatus = 'validated' | 'missing' | 'unvalidated';
export type CommandSource = 'package_scripts' | 'ci_workflow' | 'unknown';

export type CommandClassification = {
  command: string;
  status: CommandStatus;
  source: CommandSource;
  script_name?: string;
};

export type DocumentedFilePath = {
  path: string;
  line: number;
  source: 'link' | 'inline_code';
};

/**
 * Extract npm/shell commands from CI workflow YAML content.
 * Parses `run:` lines and `command:` matrix fields.
 */
export function extractCiCommands(content: string): string[] {
  const commands: string[] = [];
  const lines = content.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    // Match both `- run: <cmd>` (list item) and `  run: <cmd>` (property)
    const runMatch = /^(\s+)(?:-\s+)?run:\s+(.+)$/.exec(line);
    if (runMatch) {
      const { parts, lastLineIndex } = extractWorkflowCommandValue(runMatch[2], lines, index, runMatch[1].length);
      commands.push(...parts);
      index = lastLineIndex;
      continue;
    }
    // Match `command: <cmd>` matrix fields
    const cmdMatch = /^(\s+)command:\s+(.+)$/.exec(line);
    if (cmdMatch) {
      const { parts, lastLineIndex } = extractWorkflowCommandValue(cmdMatch[2], lines, index, cmdMatch[1].length);
      commands.push(...parts);
      index = lastLineIndex;
    }
  }
  return [...new Set(commands)];
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
  ciCommands: string[]
): CommandClassification[] {
  return commands.flatMap((command) => splitShellCommand(command).map((part) => classifyCommand(part, packageScripts, ciCommands)));
}

function classifyCommand(
  command: string,
  packageScripts: Record<string, string>,
  ciCommands: string[]
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
    status: stale ? 'stale' : validation.contradictions.length ? 'contradicted' : validation.validated.length ? 'partially_validated' : 'unvalidated'
  };
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
  const routeClaims = extractRouteClaims(claims);

  for (const block of extractCodeBlocks(content)) {
    if (/^(bash|sh|shell|zsh|console)?$/i.test(block.language || '')) {
      for (const line of block.content.split('\n')) {
        const trimmed = line.trim().replace(/^[$>]\s*/, '');
        if (/^(npm|pnpm|yarn|node|npx|make|docker|git)\b/.test(trimmed)) {
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

export function extractRouteClaims(claims: Array<{ line: number; text: string }>) {
  const routes = [];
  for (const claim of claims || []) {
    if (!/\b(route|api|endpoint)\b/i.test(claim.text)) continue;
    const pathMatch = /(?:^|[\s"'`(])((?:\/[A-Za-z0-9._~:@!$&'()*+,;=%-]+)+\/?)/.exec(claim.text);
    const methodMatch = /\b(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b/i.exec(claim.text);
    routes.push({
      line: claim.line,
      text: claim.text,
      path: pathMatch ? normalizeRoutePath(pathMatch[1]) : null,
      method: methodMatch ? methodMatch[1].toUpperCase() : null
    });
  }
  return routes.slice(0, 50);
}

function isEnvironmentVariableMention(value: string) {
  if (!/^[A-Z][A-Z0-9_]{1,}$/.test(value)) return false;
  if (COMMON_ENV_VAR_NAMES.has(value)) return true;
  if (!value.includes('_')) return false;
  if (/^(README|TODO|HTTP|HTTPS|JSON|YAML|CLI|API)$/.test(value)) return false;
  return true;
}

function extractWorkflowCommandValue(value: string, lines: string[], lineIndex: number, baseIndent: number): { parts: string[]; lastLineIndex: number } {
  if (/^[|>](?:[+-]?\d*|\d*[+-]?)$/.test(value.trim())) {
    const blockLines: string[] = [];
    let lastLineIndex = lineIndex;
    for (let index = lineIndex + 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (line.trim() && leadingSpaces(line) <= baseIndent) break;
      lastLineIndex = index;
      if (line.trim()) blockLines.push(line.trim());
    }
    return { parts: blockLines.flatMap((line) => extractWorkflowCommandParts(line)), lastLineIndex };
  }

  return { parts: extractWorkflowCommandParts(value), lastLineIndex: lineIndex };
}

function extractWorkflowCommandParts(command: string): string[] {
  const unquoted = command.trim().replace(/^["']|["']$/g, '');
  if (!unquoted || unquoted.includes('${{')) return [];
  return splitShellCommand(unquoted, false).filter((part) => !isShellReservedCommand(part));
}

function isShellReservedCommand(command: string): boolean {
  const firstToken = tokenizeShellWords(command)[0];
  return Boolean(firstToken && SHELL_RESERVED_WORDS.has(firstToken));
}

function leadingSpaces(line: string): number {
  return /^ */.exec(line)?.[0].length || 0;
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

  return parts.filter((part) => part && (!recognizedOnly || /^(npm|pnpm|yarn|node|npx|make|docker|git)\b/.test(part)));
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
