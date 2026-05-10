import { promises as fs } from 'node:fs';
import path from 'node:path';
import { containsSecretLikeContent } from './secret-patterns.js';
import { readJson } from './utils/fs.js';

const REQUIRED_PAGES = [
  'Home.md',
  '_Sidebar.md',
  'Index.md',
  'Log.md',
  'Agent-Context-Pack.md',
  'Repository-Overview.md',
  'Architecture.md',
  'Build-Test-and-Run.md',
  'Open-Questions.md'
];

const PROVENANCE_EXEMPT_PAGES = new Set([
  'Home.md',
  '_Sidebar.md',
  'Index.md',
  'Log.md'
]);
const MATERIAL_CLAIM_MIN_LENGTH = 24;
const FRONTMATTER_METADATA_FIELDS = [
  'source_repo',
  'source_commit',
  'compiled_at',
  'page_state',
  'kind',
  'module',
  'confidence',
  'claim_status',
  'source_paths'
];
const FRONTMATTER_METADATA_PATTERN = new RegExp(`^(${FRONTMATTER_METADATA_FIELDS.join('|')}):`);
const MARKDOWN_LIST_LINK_PATTERN = /^[-*]\s+\[[^\]]+\]\([^)]+\)/;
const STRUCTURAL_PUNCTUATION_ONLY_PATTERN = /^[`()[\]{}|:;.,\-–—_]+$/;

export async function lintWiki({ wikiDir, scanDir }: { wikiDir: string; scanDir: string }) {
  const manifest = await readJson(path.join(scanDir, 'manifest.json'));
  const issues = [];
  const files = await listMarkdown(wikiDir);
  const topLevelPages = await listTopLevelMarkdown(wikiDir);
  const topLevelExisting = new Set(topLevelPages.map((file) => path.basename(file)));

  for (const required of REQUIRED_PAGES) {
    if (!topLevelExisting.has(required)) {
      issues.push(error('missing-required-page', `${required} is missing.`));
    }
  }

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const relativePath = path.relative(wikiDir, file).replaceAll(path.sep, '/');

    if (!hasSourceCommitFrontmatter(content)) {
      issues.push(warning('missing-source-commit', `${relativePath} does not include source_commit frontmatter.`));
    }

    if (containsSecretLikeContent(content)) {
      issues.push(error('secret-like-content', `${relativePath} contains secret-like content.`));
    }

    for (const link of extractWikiLinks(content)) {
      const target = `${link}.md`;
      if (!topLevelExisting.has(target) && !topLevelExisting.has(link)) {
        issues.push(warning('broken-wiki-link', `${relativePath} links to missing page ${link}.`));
      }
    }

    const frontmatter = parseFrontmatter(content);
    if (shouldCheckGeneratedProvenance(relativePath, frontmatter, content)) {
      if (!hasProvenanceSignal(content, frontmatter)) {
        issues.push(warning('missing-source-provenance', `${relativePath} includes material claims without source provenance (source_paths, source links/paths, or explicit secondary-documentation labeling).`));
      }
    }

    if (isGeneratedOrMixed(frontmatter) && frontmatter.kind === 'module' && !hasNonEmptySourcePaths(frontmatter)) {
      issues.push(warning('missing-source-paths', `${relativePath} is a generated module page without non-empty source_paths metadata.`));
    }
  }

  const errors = issues.filter((issue) => issue.level === 'error').length;
  const warnings = issues.filter((issue) => issue.level === 'warning').length;

  return {
    manifest,
    issues,
    summary: {
      wikiDir,
      pages: files.length,
      errors,
      warnings,
      issues
    }
  };
}

async function listTopLevelMarkdown(wikiDir: string) {
  const entries = await fs.readdir(wikiDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(wikiDir, entry.name))
    .sort();
}

async function listMarkdown(wikiDir: string): Promise<string[]> {
  const entries = await fs.readdir(wikiDir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(wikiDir, entry.name);
    if (entry.isDirectory()) {
      return listMarkdown(entryPath);
    }
    return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : [];
  }));
  return files.flat().sort();
}

function hasSourceCommitFrontmatter(content: string): boolean {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return false;
  }

  const end = normalized.indexOf('\n---', 4);
  if (end === -1) {
    return false;
  }

  return /^source_commit:/m.test(normalized.slice(4, end));
}

function extractWikiLinks(content: string): string[] {
  const links = new Set<string>();
  const pattern = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const match of content.matchAll(pattern)) {
    const target = String(match[1]);
    if (/^https?:/.test(target) || target.startsWith('#') || target.includes('/')) {
      continue;
    }
    links.add(target.replace(/\.md$/, ''));
  }

  return [...links];
}

function parseFrontmatter(content: string) {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return {};
  }
  const end = normalized.indexOf('\n---', 4);
  if (end === -1) {
    return {};
  }

  const result: Record<string, any> = {};
  for (const line of normalized.slice(4, end).split('\n')) {
    const separator = line.indexOf(':');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    const raw = line.slice(separator + 1).trim();
    if (!key) continue;
    try {
      result[key] = JSON.parse(raw);
    } catch {
      result[key] = raw.replace(/^['"]|['"]$/g, '');
    }
  }
  return result;
}

function isGeneratedOrMixed(frontmatter: Record<string, any>) {
  return frontmatter.page_state === 'generated' || frontmatter.page_state === 'mixed';
}

function hasNonEmptySourcePaths(frontmatter: Record<string, any>) {
  return Array.isArray(frontmatter.source_paths) && frontmatter.source_paths.some((entry) => typeof entry === 'string' && entry.trim().length > 0);
}

function shouldCheckGeneratedProvenance(relativePath: string, frontmatter: Record<string, any>, content: string) {
  if (!isGeneratedOrMixed(frontmatter)) {
    return false;
  }

  if (PROVENANCE_EXEMPT_PAGES.has(path.basename(relativePath))) {
    return false;
  }

  return hasMaterialClaimLikeText(content);
}

function hasMaterialClaimLikeText(content: string) {
  const lines = stripFrontmatter(content)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let inFence = false;
  for (const line of lines) {
    if (line.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (
      line.startsWith('#')
      || MARKDOWN_LIST_LINK_PATTERN.test(line)
      || /^\|[-:\s|]+\|?$/.test(line)
      || /^<!--/.test(line)
      || FRONTMATTER_METADATA_PATTERN.test(line)
    ) {
      continue;
    }
    if (line.length >= MATERIAL_CLAIM_MIN_LENGTH && /[A-Za-z]/.test(line) && !STRUCTURAL_PUNCTUATION_ONLY_PATTERN.test(line)) {
      return true;
    }
  }
  return false;
}

function hasProvenanceSignal(content: string, frontmatter: Record<string, any>) {
  if (hasNonEmptySourcePaths(frontmatter)) {
    return true;
  }

  const body = stripFrontmatter(content);
  if (/https:\/\/github\.com\/[^)\s]+\/blob\/[^)\s]+/i.test(body)) {
    return true;
  }
  if (/`[^`\n]*\/[^`\n]*\.[A-Za-z0-9]+`/.test(body)) {
    return true;
  }
  if (/`[^`\n]+\.(?:ya?ml|json|toml|md)`/.test(body)) {
    return true;
  }
  if (/(secondary evidence|secondary documentation|unvalidated documentation|documentation debt)/i.test(body) && /`[^`\n]+\.md`/.test(body)) {
    return true;
  }

  return false;
}

function stripFrontmatter(content: string) {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return normalized;
  }
  const end = normalized.indexOf('\n---', 4);
  if (end === -1) {
    return normalized;
  }
  return normalized.slice(end + 4).replace(/^\n/, '');
}

function error(code: string, message: string) {
  return { level: 'error', code, message };
}

function warning(code: string, message: string) {
  return { level: 'warning', code, message };
}
