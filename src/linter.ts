import { promises as fs } from 'node:fs';
import path from 'node:path';
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

const SECRET_PATTERNS = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----/,
  /ghp_[A-Za-z0-9_]{30,}/,
  /xox[baprs]-[A-Za-z0-9-]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /authorization:\s*bearer\s+[^\s"']{8,}/i,
  /(?:token|password|api[_-]?key|secret)=[^\s&]{8,}/i
];

export async function lintWiki({ wikiDir, scanDir }: { wikiDir: string; scanDir: string }) {
  const manifest = await readJson(path.join(scanDir, 'manifest.json'));
  const issues = [];
  const files = await listMarkdown(wikiDir);
  const existing = new Set(files.map((file) => path.basename(file)));

  for (const required of REQUIRED_PAGES) {
    if (!existing.has(required)) {
      issues.push(error('missing-required-page', `${required} is missing.`));
    }
  }

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const basename = path.basename(file);

    if (!content.includes('source_commit') && basename !== '_Sidebar.md') {
      issues.push(warning('missing-source-commit', `${basename} does not include source_commit frontmatter.`));
    }

    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(content)) {
        issues.push(error('secret-like-content', `${basename} contains secret-like content.`));
      }
    }

    for (const link of extractWikiLinks(content)) {
      const target = `${link}.md`;
      if (!existing.has(target) && !existing.has(link)) {
        issues.push(warning('broken-wiki-link', `${basename} links to missing page ${link}.`));
      }
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

async function listMarkdown(wikiDir: string) {
  const entries = await fs.readdir(wikiDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(wikiDir, entry.name))
    .sort();
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

function error(code: string, message: string) {
  return { level: 'error', code, message };
}

function warning(code: string, message: string) {
  return { level: 'warning', code, message };
}
