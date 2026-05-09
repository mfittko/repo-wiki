import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { runCli } from '../src/cli.js';

async function captureCli(argv: string[], cwd: string) {
  const originalCwd = process.cwd();
  const originalLog = console.log;
  const lines: string[] = [];
  process.chdir(cwd);
  console.log = (value?: unknown) => {
    lines.push(String(value));
  };

  try {
    await runCli(argv);
  } finally {
    console.log = originalLog;
    process.chdir(originalCwd);
  }

  return lines.join('\n');
}

test('CLI help describes GitHub Wiki and GitHub Pages publish targets', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));

  try {
    const output = await captureCli(['--help'], tempDir);
    assert.match(output, /publish\s+Push local wiki pages to GitHub Wiki or GitHub Pages\./);
    assert.match(output, /--target <github-wiki\|github-pages>/);
    assert.doesNotMatch(output, /local-artifact/);
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

    const output = await captureCli([
      'publish',
      '--wiki', wikiDir,
      '--target', 'github-pages',
      '--pages-path', 'docs',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(output);

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

    const output = await captureCli(['publish', '--wiki', wikiDir, '--dry-run'], tempDir);
    const summary = JSON.parse(output);

    assert.equal(summary.target, 'github-pages');
    assert.equal(summary.branch, 'site');
    assert.equal(summary.path, 'docs');
    assert.equal(summary.frontmatterPolicy, 'preserve');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
