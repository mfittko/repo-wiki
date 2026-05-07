#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const CATEGORY_ORDER = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];
const CHANGELOG_PATH = path.resolve(process.cwd(), 'CHANGELOG.md');
const DEFAULT_DATE = new Date().toISOString().slice(0, 10);
const NO_CHANGELOG_PATTERNS = [/^docs\//u, /^test\//u, /^README\.md$/u, /^CHANGELOG\.md$/u];

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  const dryRun = options['dry-run'] === true;

  if (command === 'ensure') {
    const changelog = await ensureChangelog();
    await emitOrWriteChangelog(changelog, dryRun);
    return;
  }

  if (command === 'update') {
    const { metadata, source } = await resolvePullRequestMetadata(options);
    const derived = deriveChangelogEntries(metadata);

    if (!derived.hasEntries && !derived.noChangelogReason) {
      throw new Error(`Could not derive changelog entries from ${source}. Update the PR title or description so the change is describable, or extend the derivation rules.`);
    }

    if (!derived.hasEntries) {
      const changelog = await ensureChangelog();
      await emitOrWriteChangelog(changelog, dryRun);
      return;
    }

    const changelog = await ensureChangelog();
    const updated = updateUnreleased(changelog, derived.entries);
    await emitOrWriteChangelog(updated, dryRun);
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
    await emitOrWriteChangelog(released, dryRun);
    return;
  }

  throw new Error(`unknown command: ${command}`);
}

function parseArgs(args) {
  const [command = 'ensure', ...rest] = args;
  const options = {};
  const booleanOptions = new Set(['dry-run']);

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith('--')) {
      throw new Error(`unexpected argument: ${token}`);
    }

    const key = token.slice(2);
    if (booleanOptions.has(key)) {
      options[key] = true;
      continue;
    }

    const value = rest[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`missing value for --${key}`);
    }

    options[key] = value;
    index += 1;
  }

  return { command, options };
}

async function resolvePullRequestMetadata(options) {
  if (options['pr-metadata-file']) {
    const metadataPath = path.resolve(process.cwd(), options['pr-metadata-file']);
    const raw = await fs.readFile(metadataPath, 'utf8');
    return {
      metadata: normalizePullRequestMetadata(JSON.parse(raw)),
      source: `PR metadata file ${metadataPath}`
    };
  }

  if (options.pr) {
    return {
      metadata: await fetchPullRequestMetadata(options.pr, options.repo),
      source: `pull request #${options.pr}`
    };
  }

  throw new Error('update requires either --pr-metadata-file <path> or --pr <number> [--repo owner/name]');
}

function normalizePullRequestMetadata(metadata) {
  const files = Array.isArray(metadata.files) ? metadata.files : [];
  return {
    title: String(metadata.title || ''),
    body: String(metadata.body || ''),
    url: String(metadata.url || ''),
    files: files
      .map((file) => (typeof file === 'string' ? file : file?.path || file?.file || ''))
      .filter(Boolean)
  };
}

async function fetchPullRequestMetadata(prNumber, repo) {
  const args = ['pr', 'view', String(prNumber), '--json', 'title,body,files,number,url'];
  if (repo) {
    args.push('--repo', repo);
  }

  const { stdout } = await execFileAsync('gh', args, {
    cwd: process.cwd(),
    env: process.env,
    maxBuffer: 10 * 1024 * 1024
  });

  return normalizePullRequestMetadata(JSON.parse(stdout));
}

function deriveChangelogEntries(metadata) {
  const entries = new Map(CATEGORY_ORDER.map((category) => [category, []]));
  const title = normalizeSentence(stripConventionalPrefix(metadata.title));
  const filePaths = metadata.files || [];
  const areas = detectChangedAreas(filePaths);
  const lowerText = String(metadata.title || '').toLowerCase();
  const noChangelogReason = deriveNoChangelogReason(filePaths);

  if (noChangelogReason) {
    return { entries, noChangelogReason, hasEntries: false };
  }

  if (title) {
    appendEntry(entries, classifyPrimaryCategory(lowerText), title);
  }

  if (areas.has('source') && !mentionsAny(lowerText, ['scanner', 'compiler', 'analysis', 'repository', 'cli'])) {
    appendEntry(entries, 'Changed', 'Update the main repository implementation to match the pull request scope.');
  }

  if (areas.has('automation')) {
    appendEntry(entries, 'Changed', 'Update build, CI, and release automation to support the change.');
  }

  if (areas.has('guidance')) {
    appendEntry(entries, 'Changed', 'Clarify repository guidance and review workflow expectations.');
  }

  if (areas.has('tests')) {
    appendEntry(entries, 'Changed', 'Expand automated test coverage for the updated behavior.');
  }

  const hasEntries = CATEGORY_ORDER.some((category) => (entries.get(category) || []).length > 0);
  return { entries, noChangelogReason: '', hasEntries };
}

function deriveNoChangelogReason(filePaths) {
  if (filePaths.length === 0) {
    return 'No changed files were available to derive changelog entries.';
  }

  if (filePaths.every((filePath) => NO_CHANGELOG_PATTERNS.some((pattern) => pattern.test(filePath)))) {
    return 'Documentation-only or test-only changes do not need a changelog entry.';
  }

  return '';
}

function detectChangedAreas(filePaths) {
  const areas = new Set();

  for (const filePath of filePaths) {
    if (/^(src|bin)\//u.test(filePath)) {
      areas.add('source');
      continue;
    }

    if (/^test\//u.test(filePath)) {
      areas.add('tests');
      continue;
    }

    if (/^(\.github\/workflows\/|scripts\/|package(-lock)?\.json$|tsconfig\.json$)/u.test(filePath)) {
      areas.add('automation');
      continue;
    }

    if (/^(\.github\/agents\/|\.github\/skills\/|\.github\/pull_request_template\.md$|AGENTS\.md$)/u.test(filePath)) {
      areas.add('guidance');
      continue;
    }
  }

  return areas;
}

function classifyPrimaryCategory(text) {
  if (mentionsAny(text, ['security', 'secret', 'token', 'credential', 'auth', 'permission', 'policy'])) {
    return 'Security';
  }

  if (mentionsAny(text, ['fix', 'bug', 'regression', 'error', 'failure', 'broken', 'correct', 'resolve'])) {
    return 'Fixed';
  }

  if (mentionsAny(text, ['add', 'introduce', 'enable', 'create', 'support', 'initial', 'foundation', 'foundational', 'implement'])) {
    return 'Added';
  }

  return 'Changed';
}

function stripConventionalPrefix(title) {
  return String(title || '').replace(/^([a-z]+)(\([^)]+\))?!?:\s*/iu, '').trim();
}
function normalizeSentence(value) {
  const trimmed = String(value || '').replace(/\s+/gu, ' ').trim();
  if (!trimmed) {
    return '';
  }

  return /[.!?]$/u.test(trimmed) ? trimmed : `${trimmed}.`;
}

function mentionsAny(text, candidates) {
  return candidates.some((candidate) => text.includes(candidate));
}

function appendEntry(entries, category, item) {
  const list = entries.get(category) || [];
  if (!list.includes(item)) {
    list.push(item);
  }
  entries.set(category, list);
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

async function emitOrWriteChangelog(content, dryRun) {
  if (dryRun) {
    process.stdout.write(content);
    return;
  }

  await writeChangelog(content);
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

    if (active && /^###\s+/u.test(line)) {
      break;
    }

    if (active && /^-\s+/u.test(line)) {
      items.push(line.replace(/^-\s+/u, '').trim());
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
