import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const execFileAsync = promisify(execFile);
const cliPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../bin/repo-wiki.js');

async function captureCli(argv: string[], cwd: string) {
  const result = await execFileAsync(process.execPath, [cliPath, ...argv], { cwd });
  return { stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}

test('CLI help describes GitHub Wiki and GitHub Pages publish targets', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));

  try {
    const { stdout } = await captureCli(['--help'], tempDir);
    assert.match(stdout, /publish\s+Push local wiki pages to GitHub Wiki or GitHub Pages\./);
    assert.match(stdout, /run\s+Run scan -> plan -> lint-docs -> compile -> lint, optionally followed by publish\./);
    assert.match(stdout, /--target <github-wiki\|github-pages>/);
    assert.doesNotMatch(stdout, /local-artifact/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI publish wires github-pages target, pages path, and target-specific defaults', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');

    const { stdout } = await captureCli([
      'publish',
      '--wiki', wikiDir,
      '--target', 'github-pages',
      '--pages-path', 'docs',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.status, 'dry-run');
    assert.equal(summary.target, 'github-pages');
    assert.equal(summary.branch, 'gh-pages');
    assert.equal(summary.path, 'docs');
    assert.equal(summary.frontmatterPolicy, 'preserve');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI publish reads target-specific defaults from config', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const configDir = path.join(tempDir, '.llmwiki');

  try {
    await mkdir(wikiDir, { recursive: true });
    await mkdir(configDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await writeFile(path.join(configDir, 'config.json'), JSON.stringify({
      publish: {
        target: 'github-pages',
        pages: {
          branch: 'site',
          path: 'docs',
          frontmatter: 'preserve'
        },
        wiki: {
          branch: 'master',
          frontmatter: 'strip'
        }
      }
    }), 'utf8');

    const { stdout } = await captureCli(['publish', '--wiki', wikiDir, '--dry-run'], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.target, 'github-pages');
    assert.equal(summary.branch, 'site');
    assert.equal(summary.path, 'docs');
    assert.equal(summary.frontmatterPolicy, 'preserve');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI warns and falls back for unknown target and frontmatter policy', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');

    const { stdout, stderr } = await captureCli([
      'publish',
      '--wiki', wikiDir,
      '--target', 'unknown-target',
      '--frontmatter-policy', 'unknown-policy',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.target, 'github-wiki');
    assert.equal(summary.branch, 'master');
    assert.equal(summary.frontmatterPolicy, 'strip');
    assert.match(stderr, /unknown --target/);
    assert.match(stderr, /unknown --frontmatter-policy/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI publish falls back to target default for unknown frontmatter policy', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');

    const { stdout, stderr } = await captureCli([
      'publish',
      '--wiki', wikiDir,
      '--target', 'github-pages',
      '--frontmatter-policy', 'unknown-policy',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.target, 'github-pages');
    assert.equal(summary.frontmatterPolicy, 'preserve');
    assert.match(stderr, /falling back to "preserve"/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI publish accepts html-comment frontmatter policy with warning', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');

    const { stdout, stderr } = await captureCli([
      'publish',
      '--wiki', wikiDir,
      '--frontmatter-policy', 'html-comment',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.frontmatterPolicy, 'html-comment');
    assert.match(stderr, /reserved for future metadata comments/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI run executes scan-plan-lint-compile and dry-run publish with pages target', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const repoDir = path.join(tempDir, 'repo');
  const scanDir = path.join(tempDir, 'scan');
  const planFile = path.join(tempDir, 'plan.json');
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(path.join(repoDir, 'src'), { recursive: true });
    await mkdir(path.join(repoDir, '.llmwiki'), { recursive: true });
    await writeFile(path.join(repoDir, 'package.json'), JSON.stringify({ name: 'fixture', scripts: { test: 'node --test' } }), 'utf8');
    await writeFile(path.join(repoDir, 'src', 'index.ts'), 'export const value = 1;\n', 'utf8');
    await writeFile(path.join(repoDir, '.llmwiki', 'config.json'), JSON.stringify({
      publish: {
        target: 'github-pages',
        pages: { branch: 'site', path: 'docs', frontmatter: 'preserve' }
      }
    }), 'utf8');

    const { stdout } = await captureCli([
      'run',
      '--repo', repoDir,
      '--scan', scanDir,
      '--plan', planFile,
      '--wiki', wikiDir,
      '--publish',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.mode, 'bootstrap');
    assert.equal(summary.repoPath, repoDir);
    assert.equal(summary.scan.files > 0, true);
    assert.equal(summary.plan.pages > 0, true);
    assert.equal(summary.compile.pages > 0, true);
    assert.equal(summary.publish.status, 'dry-run');
    assert.equal(summary.publish.target, 'github-pages');
    assert.equal(summary.publish.branch, 'site');
    assert.equal(summary.publish.path, 'docs');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
