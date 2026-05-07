#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const CATEGORY_ORDER = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];
const CHANGELOG_PATH = path.resolve(process.cwd(), 'CHANGELOG.md');
const DEFAULT_DATE = new Date().toISOString().slice(0, 10);

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));

  if (command === 'ensure') {
    const changelog = await ensureChangelog();
    await writeChangelog(changelog);
    return;
  }

  if (command === 'update') {
    const { body, source } = await resolvePullRequestBody(options);
    const parsed = parsePrBodyEntries(body);

    if (!parsed.hasEntries && !parsed.noChangelogReason) {
      throw new Error(`No changelog entries found in ${source}. Add a ## Changelog section or record a no-changelog rationale.`);
    }

    const changelog = await ensureChangelog();
    const updated = updateUnreleased(changelog, parsed.entries);
    await writeChangelog(updated);
    return;
  }

  if (command === 'release') {
    const version = options.version;
    const date = options.date || DEFAULT_DATE;
    if (!version) {
      throw new Error('release requires --version <x.y.z>');
    }

    const changelog = await ensureChangelog();
    const released = releaseUnreleased(changelog, version, date);
    await writeChangelog(released);
    return;
  }

  throw new Error(`unknown command: ${command}`);
}

function parseArgs(args) {
  const [command = 'ensure', ...rest] = args;
  const options = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith('--')) {
      throw new Error(`unexpected argument: ${token}`);
    }

    const key = token.slice(2);
    const value = rest[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`missing value for --${key}`);
    }

    options[key] = value;
    index += 1;
  }

  return { command, options };
}

async function resolvePullRequestBody(options) {
  if (options['pr-body-file']) {
    const prBodyFile = path.resolve(process.cwd(), options['pr-body-file']);
    return {
      body: await fs.readFile(prBodyFile, 'utf8'),
      source: `PR body file ${prBodyFile}`
    };
  }

  if (options.pr) {
    const metadata = await fetchPullRequestMetadata(options.pr, options.repo);
    return {
      body: metadata.body || '',
      source: `pull request #${options.pr}`
    };
  }

  throw new Error('update requires either --pr-body-file <path> or --pr <number> [--repo owner/name]');
}

async function fetchPullRequestMetadata(prNumber, repo) {
  const args = ['pr', 'view', String(prNumber), '--json', 'body,number,reviewDecision,title,url'];
  if (repo) {
    args.push('--repo', repo);
  }

  const { stdout } = await execFileAsync('gh', args, {
    cwd: process.cwd(),
    env: process.env,
    maxBuffer: 10 * 1024 * 1024
  });

  return JSON.parse(stdout);
}

async function ensureChangelog() {
  try {
    const existing = await fs.readFile(CHANGELOG_PATH, 'utf8');
    return normalizeChangelog(existing);
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      throw error;
    }

    return normalizeChangelog('');
  }
}

async function writeChangelog(content) {
  await fs.writeFile(CHANGELOG_PATH, content, 'utf8');
}

function normalizeChangelog(content) {
  const trimmed = content.trim();
  if (!trimmed) {
    return [
      '# Changelog',
      '',
      'All notable changes to this project will be documented in this file.',
      '',
      'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),',
      'and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).',
      '',
      '## [Unreleased]',
      ''
    ].join('\n');
  }

  if (!trimmed.includes('## [Unreleased]')) {
    const lines = trimmed.split('\n');
    const insertAt = Math.min(lines.length, 6);
    lines.splice(insertAt, 0, '', '## [Unreleased]', '');
    return `${lines.join('\n').replace(/\s+$/u, '')}\n`;
  }

  return `${trimmed}\n`;
}

function parsePrBodyEntries(body) {
  const section = extractSection(body, '## Changelog');
  const entries = new Map(CATEGORY_ORDER.map((category) => [category, []]));
  const noChangelogReason = extractNoChangelogReason(section);

  if (!section) {
    return { entries, noChangelogReason: '', hasEntries: false };
  }

  for (const category of CATEGORY_ORDER) {
    entries.set(category, extractCategoryItems(section, category));
  }

  const hasEntries = CATEGORY_ORDER.some((category) => (entries.get(category) || []).length > 0);
  return { entries, noChangelogReason, hasEntries };
}

function extractNoChangelogReason(section) {
  if (!section) {
    return '';
  }

  const match = section.match(/^-\s*No changelog update required:\s*(.+)$/im);
  return match ? match[1].trim() : '';
}

function extractSection(markdown, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = markdown.match(new RegExp(`(?:^|\\n)${escaped}\\n([\\s\\S]*?)(?=\\n##\\s|\\n#\\s|$)`));
  return match ? match[1].trim() : '';
}

function updateUnreleased(changelog, entries) {
  const { header, unreleasedBody, rest } = splitChangelog(changelog);
  const current = parseCategoryBlocks(unreleasedBody);

  for (const category of CATEGORY_ORDER) {
    const existing = current.get(category) || [];
    const incoming = entries.get(category) || [];
    for (const item of incoming) {
      if (!existing.includes(item)) {
        existing.push(item);
      }
    }
    if (existing.length) {
      current.set(category, existing);
    }
  }

  return [
    header.trimEnd(),
    '## [Unreleased]',
    '',
    renderCategoryBlocks(current),
    rest.trim()
  ]
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n') + '\n';
}

function releaseUnreleased(changelog, version, date) {
  const { header, unreleasedBody, rest } = splitChangelog(changelog);
  const body = unreleasedBody.trim();
  const releaseSection = body ? `## [${version}] - ${date}\n\n${body}` : `## [${version}] - ${date}`;

  return [header.trimEnd(), '## [Unreleased]', '', releaseSection, rest.trim()]
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n') + '\n';
}

function splitChangelog(changelog) {
  const normalized = normalizeChangelog(changelog);
  const marker = '## [Unreleased]';
  const start = normalized.indexOf(marker);
  const before = normalized.slice(0, start).trimEnd();
  const afterStart = normalized.slice(start + marker.length);
  const nextSectionMatch = afterStart.match(/\n##\s/);
  const bodyEnd = nextSectionMatch ? nextSectionMatch.index : afterStart.length;
  const unreleasedBody = afterStart.slice(0, bodyEnd).trim();
  const rest = afterStart.slice(bodyEnd).trim();
  return { header: before, unreleasedBody, rest };
}

function parseCategoryBlocks(body) {
  const blocks = new Map();
  for (const category of CATEGORY_ORDER) {
    const items = extractCategoryItems(body, category);
    if (items.length) {
      blocks.set(category, items);
    }
  }
  return blocks;
}

function extractCategoryItems(markdown, category) {
  const lines = markdown.split('\n');
  const heading = `### ${category}`;
  const items = [];
  let active = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line === heading) {
      active = true;
      continue;
    }

    if (active && /^###\s+/.test(line)) {
      break;
    }

    if (active && /^-\s+/.test(line)) {
      items.push(line.replace(/^-\s+/, '').trim());
    }
  }

  return items.filter(Boolean);
}

function renderCategoryBlocks(blocks) {
  return CATEGORY_ORDER
    .filter((category) => (blocks.get(category) || []).length > 0)
    .map((category) => [`### ${category}`, ...(blocks.get(category) || []).map((item) => `- ${item}`)].join('\n'))
    .join('\n\n');
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
