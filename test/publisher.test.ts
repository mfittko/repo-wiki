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

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
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
    assert.equal(result.summary.target, 'github-wiki');
    assert.equal(result.summary.path, '.');
    assert.equal(result.summary.frontmatterPolicy, 'strip');
    assert.equal(result.summary.remote, 'https://***:***@github.com/OWNER/REPO.wiki.git');

    const tokenOnlyResult = await publishWiki({
      wikiDir,
      remote: 'https://super-secret-token@github.com/OWNER/REPO.wiki.git',
      dryRun: true
    });

    assert.equal(tokenOnlyResult.summary.remote, 'https://***@github.com/OWNER/REPO.wiki.git');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki rethrows non-fallback clone errors with credential-bearing remotes redacted', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');

    await assert.rejects(
      () => publishWiki({
        wikiDir,
        remote: 'https://super-secret-token@127.0.0.1:1/OWNER/REPO.wiki.git',
        branch: 'master'
      }),
      (error: unknown) => {
        const serialized = JSON.stringify(error, Object.getOwnPropertyNames(error));
        assert.equal(serialized.includes('super-secret-token'), false);
        assert.equal(serialized.includes('https://***@127.0.0.1:1/OWNER/REPO.wiki.git'), true);
        return true;
      }
    );
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
    await fs.symlink('asset.txt', path.join(wikiDir, 'asset-link.txt'));
    await git(['init', '--bare', remoteDir]);

    const result = await publishWiki({
      wikiDir,
      remote: remoteDir,
      branch: 'master',
      message: 'Publish test wiki',
      frontmatterPolicy: 'strip'
    });

    assert.equal(result.summary.status, 'published');
    assert.equal(result.summary.target, 'github-wiki');
    assert.equal(result.summary.frontmatterPolicy, 'strip');
    assert.equal(result.summary.pages, 3);

    await git(['clone', '--branch', 'master', remoteDir, checkoutDir]);

    assert.equal(await fs.readFile(path.join(checkoutDir, 'Home.md'), 'utf8'), '# Home\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, 'Page.md'), 'utf8'), '# Top-level page\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, 'nested', 'Page.md'), 'utf8'), '# Nested\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, 'asset.txt'), 'utf8'), '---\nnot markdown\n---\n');
    assert.equal(await fs.readlink(path.join(checkoutDir, 'asset-link.txt')), 'asset.txt');

    assert.equal(await fs.readFile(path.join(wikiDir, 'Home.md'), 'utf8'), '---\nkind: home\n---\n# Home\n');
    assert.equal(await fs.readFile(path.join(nestedDir, 'Page.md'), 'utf8'), '---\nkind: nested\n---\n# Nested\n');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki removes checkout files deleted from the local wiki', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, 'Removed.md'), '# Remove me\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    const firstPublish = await publishWiki({
      wikiDir,
      remote: remoteDir,
      branch: 'master',
      message: 'Publish initial test wiki'
    });

    assert.equal(firstPublish.summary.status, 'published');

    await fs.rm(path.join(wikiDir, 'Removed.md'));

    const secondPublish = await publishWiki({
      wikiDir,
      remote: remoteDir,
      branch: 'master',
      message: 'Publish deleted test wiki page'
    });

    assert.equal(secondPublish.summary.status, 'published');

    await git(['clone', '--branch', 'master', remoteDir, checkoutDir]);
    assert.equal(await fs.readFile(path.join(checkoutDir, 'Home.md'), 'utf8'), '# Home\n');
    assert.equal(await fileExists(path.join(checkoutDir, 'Removed.md')), false);
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
    assert.equal(secondPublish.summary.target, 'github-wiki');
    assert.equal(secondPublish.summary.frontmatterPolicy, 'strip');
    assert.equal(secondPublish.summary.pages, 1);

    await git(['clone', '--branch', 'master', remoteDir, checkoutDir]);
    assert.equal(await fs.readFile(path.join(checkoutDir, 'Home.md'), 'utf8'), '# Home\n');
    assert.equal(await fs.readFile(path.join(wikiDir, 'Home.md'), 'utf8'), '---\nkind: home\nsource_commit: def456\n---\n# Home\n');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki uses target-specific defaults in dry-run summaries', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '---\nkind: home\n---\n# Home\n', 'utf8');

    const pagesResult = await publishWiki({
      wikiDir,
      target: 'github-pages',
      dryRun: true
    });

    assert.equal(pagesResult.summary.status, 'dry-run');
    assert.equal(pagesResult.summary.target, 'github-pages');
    assert.equal(pagesResult.summary.branch, 'gh-pages');
    assert.equal(pagesResult.summary.path, '.');
    assert.equal(pagesResult.summary.frontmatterPolicy, 'preserve');

    const wikiResult = await publishWiki({
      wikiDir,
      target: 'github-wiki',
      dryRun: true
    });

    assert.equal(wikiResult.summary.status, 'dry-run');
    assert.equal(wikiResult.summary.target, 'github-wiki');
    assert.equal(wikiResult.summary.branch, 'master');
    assert.equal(wikiResult.summary.path, '.');
    assert.equal(wikiResult.summary.frontmatterPolicy, 'strip');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki resolves target-specific remote environment variables', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const previousPublishRemote = process.env.LLMWIKI_PUBLISH_REMOTE;
  const previousWikiRemote = process.env.GITHUB_WIKI_REMOTE;

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    delete process.env.LLMWIKI_PUBLISH_REMOTE;
    process.env.GITHUB_WIKI_REMOTE = 'https://github.com/OWNER/REPO.wiki.git';

    const pagesWithoutPublishRemote = await publishWiki({
      wikiDir,
      target: 'github-pages',
      dryRun: true
    });

    assert.equal(pagesWithoutPublishRemote.summary.remote, null);

    const wikiResult = await publishWiki({
      wikiDir,
      target: 'github-wiki',
      dryRun: true
    });

    assert.equal(wikiResult.summary.remote, 'https://github.com/OWNER/REPO.wiki.git');

    process.env.LLMWIKI_PUBLISH_REMOTE = 'https://github.com/OWNER/REPO.git';
    const pagesWithPublishRemote = await publishWiki({
      wikiDir,
      target: 'github-pages',
      dryRun: true
    });

    assert.equal(pagesWithPublishRemote.summary.remote, 'https://github.com/OWNER/REPO.git');
  } finally {
    if (previousPublishRemote === undefined) {
      delete process.env.LLMWIKI_PUBLISH_REMOTE;
    } else {
      process.env.LLMWIKI_PUBLISH_REMOTE = previousPublishRemote;
    }
    if (previousWikiRemote === undefined) {
      delete process.env.GITHUB_WIKI_REMOTE;
    } else {
      process.env.GITHUB_WIKI_REMOTE = previousWikiRemote;
    }
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki publishes github-pages output into configured path and preserves frontmatter by default', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '---\nkind: home\n---\n# Home\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, '_Sidebar.md'), '---\nkind: sidebar\n---\n# Navigation\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    const publishResult = await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      pagesPath: 'docs',
      message: 'Publish pages wiki'
    });

    assert.equal(publishResult.summary.status, 'published');
    assert.equal(publishResult.summary.target, 'github-pages');
    assert.equal(publishResult.summary.path, 'docs');
    assert.equal(publishResult.summary.frontmatterPolicy, 'preserve');

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    assert.equal(await fs.readFile(path.join(checkoutDir, 'docs', 'Home.md'), 'utf8'), '---\nkind: home\n---\n# Home\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, 'docs', 'index.md'), 'utf8'), '---\nkind: home\n---\n# Home\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, 'docs', 'Navigation.md'), 'utf8'), '---\nkind: sidebar\n---\n# Navigation\n');
    assert.equal(await fileExists(path.join(checkoutDir, 'Home.md')), false);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki rejects unsafe git branch and remote arguments', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');

    await assert.rejects(
      () => publishWiki({
        wikiDir,
        branch: '--upload-pack=echo pwned',
        dryRun: true
      }),
      /must not start with whitespace or "-"/
    );

    await assert.rejects(
      () => publishWiki({
        wikiDir,
        remote: '--upload-pack=echo pwned',
        dryRun: true
      }),
      /must not start with whitespace or "-"/
    );

    await assert.rejects(
      () => publishWiki({
        wikiDir,
        branch: 'main\ninjected',
        dryRun: true
      }),
      /contains unsupported control characters/
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki rejects unsafe github-pages publish paths', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');

    await assert.rejects(
      () => publishWiki({ wikiDir, target: 'github-pages', pagesPath: '/absolute', dryRun: true }),
      /Publish path must be relative/
    );

    await assert.rejects(
      () => publishWiki({ wikiDir, target: 'github-pages', pagesPath: '\\foo', dryRun: true }),
      /Publish path must be relative/
    );

    await assert.rejects(
      () => publishWiki({ wikiDir, target: 'github-pages', pagesPath: '\\\\server\\share', dryRun: true }),
      /Publish path must be relative/
    );

    await assert.rejects(
      () => publishWiki({ wikiDir, target: 'github-pages', pagesPath: '../sibling', dryRun: true }),
      /must not contain "\.\." path segments/
    );

    await assert.rejects(
      () => publishWiki({ wikiDir, target: 'github-pages', pagesPath: 'docs/../secret', dryRun: true }),
      /must not contain "\.\." path segments/
    );

    await assert.rejects(
      () => publishWiki({ wikiDir, target: 'github-pages', pagesPath: 'docs/..', dryRun: true }),
      /must not contain "\.\." path segments/
    );

    await assert.rejects(
      () => publishWiki({ wikiDir, target: 'github-pages', pagesPath: '.git', dryRun: true }),
      /reserved \.git paths/
    );

    await assert.rejects(
      () => publishWiki({ wikiDir, target: 'github-pages', pagesPath: 'docs/.git', dryRun: true }),
      /reserved \.git paths/
    );

    await assert.rejects(
      () => publishWiki({ wikiDir, target: 'github-pages', pagesPath: '.GIT', dryRun: true }),
      /reserved \.git paths/
    );

    await assert.rejects(
      () => publishWiki({ wikiDir, target: 'github-pages', pagesPath: 'docs/.Git', dryRun: true }),
      /reserved \.git paths/
    );

    const safeDotSegment = await publishWiki({ wikiDir, target: 'github-pages', pagesPath: 'docs/./site', dryRun: true });
    assert.equal(safeDotSegment.summary.path, 'docs/site');

    const safeSimilarSegment = await publishWiki({ wikiDir, target: 'github-pages', pagesPath: '.github/pages', dryRun: true });
    assert.equal(safeSimilarSegment.summary.path, '.github/pages');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki keeps existing pages entry and navigation files when already present', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '---\nkind: home\n---\n# Home\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, '_Sidebar.md'), '---\nkind: sidebar\n---\n# Navigation\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, 'index.md'), '# Existing index\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, 'Navigation.md'), '# Existing navigation\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      pagesPath: 'docs',
      message: 'Publish pages wiki with existing navigation'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    assert.equal(await fs.readFile(path.join(checkoutDir, 'docs', 'index.md'), 'utf8'), '# Existing index\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, 'docs', 'Navigation.md'), 'utf8'), '# Existing navigation\n');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
