import { promises as fs } from 'node:fs';
import path from 'node:path';

const DOC_EXTENSIONS = ['.md', '.mdx', '.markdown'];

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

  for (const block of extractCodeBlocks(content)) {
    if (/^(bash|sh|shell|zsh|console)?$/i.test(block.language || '')) {
      for (const line of block.content.split('\n')) {
        const trimmed = line.trim().replace(/^[$>]\s*/, '');
        if (/^(npm|pnpm|yarn|node|npx|make|docker|git)\b/.test(trimmed)) {
          commands.push(trimmed);
        }
      }
    }
  }

  for (const match of content.matchAll(/\b[A-Z][A-Z0-9_]{2,}\b/g)) {
    if (/(_KEY|_TOKEN|_SECRET|_URL|_HOST|_PORT|_ID)$/i.test(match[0])) envVars.push(match[0]);
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
    commands: [...new Set(commands)].slice(0, 50),
    env_vars: [...new Set(envVars)].slice(0, 50),
    summary: {
      claims: claims.length,
      needs_code_validation: validated.length,
      contradictions: contradictions.length,
      commands: commands.length,
      env_vars: envVars.length,
      file: filePath
    }
  };
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
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    links.push(match[1]);
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
