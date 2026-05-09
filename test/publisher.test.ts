import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { publishWiki } from '../src/publisher.js';

const execFileAsync = promisify(execFile);

async function git(args: string[], cwd?: string) {
  return execFileAsync('git', args, cwd ? { cwd } : undefined);
}

test('publishWiki redacts credential-bearing remotes in dry-run summaries', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');

    const result = await publishWiki({
      wikiDir,
      remote: 'https://x-access-token:super-secret@github.com/OWNER/REPO.wiki.git',
      dryRun: true
    });

    assert.equal(result.summary.status, 'dry-run');
    assert.equal(result.summary.remote, 'https://***:***@github.com/OWNER/REPO.wiki.git');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki strips frontmatter from top-level and nested markdown without changing local wiki files', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const nestedDir = path.join(wikiDir, 'nested');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(nestedDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '---\nkind: home\n---\n# Home\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, 'Page.md'), '---\nkind: page\n---\n# Top-level page\n', 'utf8');
    await fs.writeFile(path.join(nestedDir, 'Page.md'), '---\nkind: nested\n---\n# Nested\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, 'asset.txt'), '---\nnot markdown\n---\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    const result = await publishWiki({
      wikiDir,
      remote: remoteDir,
      branch: 'master',
      message: 'Publish test wiki',
      frontmatterPolicy: 'strip'
    });

    assert.equal(result.summary.status, 'published');
    assert.equal(result.summary.frontmatterPolicy, 'strip');
    assert.equal(result.summary.pages, 3);

    await git(['clone', '--branch', 'master', remoteDir, checkoutDir]);

    assert.equal(await fs.readFile(path.join(checkoutDir, 'Home.md'), 'utf8'), '# Home\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, 'Page.md'), 'utf8'), '# Top-level page\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, 'nested', 'Page.md'), 'utf8'), '# Nested\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, 'asset.txt'), 'utf8'), '---\nnot markdown\n---\n');

    assert.equal(await fs.readFile(path.join(wikiDir, 'Home.md'), 'utf8'), '---\nkind: home\n---\n# Home\n');
    assert.equal(await fs.readFile(path.join(nestedDir, 'Page.md'), 'utf8'), '---\nkind: nested\n---\n# Nested\n');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki reports no changes when only stripped frontmatter changes', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '---\nkind: home\nsource_commit: abc123\n---\n# Home\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    const firstPublish = await publishWiki({
      wikiDir,
      remote: remoteDir,
      branch: 'master',
      message: 'Publish test wiki',
      frontmatterPolicy: 'strip'
    });

    assert.equal(firstPublish.summary.status, 'published');

    await fs.writeFile(path.join(wikiDir, 'Home.md'), '---\nkind: home\nsource_commit: def456\n---\n# Home\n', 'utf8');

    const secondPublish = await publishWiki({
      wikiDir,
      remote: remoteDir,
      branch: 'master',
      message: 'Publish changed frontmatter only',
      frontmatterPolicy: 'strip'
    });

    assert.equal(secondPublish.summary.status, 'no-changes');
    assert.equal(secondPublish.summary.frontmatterPolicy, 'strip');
    assert.equal(secondPublish.summary.pages, 1);

    await git(['clone', '--branch', 'master', remoteDir, checkoutDir]);
    assert.equal(await fs.readFile(path.join(checkoutDir, 'Home.md'), 'utf8'), '# Home\n');
    assert.equal(await fs.readFile(path.join(wikiDir, 'Home.md'), 'utf8'), '---\nkind: home\nsource_commit: def456\n---\n# Home\n');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
