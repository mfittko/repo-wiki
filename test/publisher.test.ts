import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { publishWiki, rewriteInternalWikiLinks } from '../src/publisher.js';

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

function legacyGeneratedPagesLayout() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{% if page.title %}{{ page.title | escape }}{% else %}{{ page.name | replace: '.md', '' | escape }}{% endif %}</title>
</head>
<body>
  <main>
    {{ content }}
  </main>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    const blocks = document.querySelectorAll('pre > code.language-mermaid');
    await mermaid.run({ nodes: document.querySelectorAll('.mermaid') });
  </script>
</body>
</html>
`;
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
    assert.equal(result.summary.frontmatterPolicy, 'provenance');
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

test('publishWiki renders a provenance block for github-wiki by default', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), [
      '---',
      'source_repo: "https://github.com/mfittko/repo-wiki.git"',
      'source_commit: "abc1234def5678"',
      'compiled_at: "2026-05-10T00:00:00.000Z"',
      'kind: "home"',
      'page_state: "generated"',
      'confidence: "medium"',
      'claim_status: "source-grounded"',
      'source_paths:',
      '  - "src/publisher.ts"',
      '---',
      '# Home',
      ''
    ].join('\n'), 'utf8');
    await git(['init', '--bare', remoteDir]);

    const result = await publishWiki({
      wikiDir,
      remote: remoteDir,
      branch: 'master',
      message: 'Publish provenance wiki'
    });

    assert.equal(result.summary.status, 'published');
    assert.equal(result.summary.frontmatterPolicy, 'provenance');

    await git(['clone', '--branch', 'master', remoteDir, checkoutDir]);
    const published = await fs.readFile(path.join(checkoutDir, 'Home.md'), 'utf8');
    assert.match(published, /\*\*Generated from:\*\* `https:\/\/github\.com\/mfittko\/repo-wiki\.git`/);
    assert.match(published, /\*\*Source commit:\*\* \[`abc1234`\]\(https:\/\/github\.com\/mfittko\/repo-wiki\/tree\/abc1234def5678\)/);
    assert.match(published, /\*\*Compiled at:\*\* `2026-05-10T00:00:00\.000Z`/);
    assert.match(published, /\*\*Page kind:\*\* `home`/);
    assert.match(published, /\*\*Page state:\*\* `generated`/);
    assert.match(published, /\*\*Confidence:\*\* `medium`/);
    assert.match(published, /\*\*Claim status:\*\* `source-grounded`/);
    assert.match(published, /\*\*Primary sources:\*\* \[src\/publisher\.ts\]\(https:\/\/github\.com\/mfittko\/repo-wiki\/blob\/abc1234def5678\/src\/publisher\.ts\)/);
    assert.equal((await fs.readFile(path.join(wikiDir, 'Home.md'), 'utf8')).startsWith('---\n'), true);
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
    assert.equal(wikiResult.summary.frontmatterPolicy, 'provenance');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki skipped-no-remote guidance mentions supported wiki remote environment variables', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const previousPublishRemote = process.env.LLMWIKI_PUBLISH_REMOTE;
  const previousWikiRemote = process.env.GITHUB_WIKI_REMOTE;

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    delete process.env.LLMWIKI_PUBLISH_REMOTE;
    delete process.env.GITHUB_WIKI_REMOTE;

    const result = await publishWiki({
      wikiDir,
      target: 'github-wiki'
    });

    assert.equal(result.summary.status, 'skipped-no-remote');
    assert.match(result.summary.next_step, /LLMWIKI_PUBLISH_REMOTE/);
    assert.match(result.summary.next_step, /GITHUB_WIKI_REMOTE/);
    assert.match(result.summary.next_step, /--remote/);
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
    await fs.writeFile(path.join(wikiDir, '_Sidebar.md'), [
      '---',
      'kind: sidebar',
      '---',
      '# Navigation',
      '',
      '- [Home](Home)',
      '- [Architecture](Architecture)',
      '- [Index with extension](Index.md)',
      '- [External](https://example.com/docs)',
      '- [Anchor](#top)',
      ''
    ].join('\n'), 'utf8');
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
    assert.equal(await fs.readFile(path.join(checkoutDir, 'docs', 'Navigation.md'), 'utf8'), [
      '---',
      'kind: sidebar',
      '---',
      '# Navigation',
      '',
      '- [Home](Home.html)',
      '- [Architecture](Architecture.html)',
      '- [Index with extension](Index.html)',
      '- [External](https://example.com/docs)',
      '- [Anchor](#top)',
      ''
    ].join('\n'));
    const pagesConfig = await fs.readFile(path.join(checkoutDir, '_config.yml'), 'utf8');
    assert.match(pagesConfig, /layout: "repo-wiki"/);
    const pagesLayout = await fs.readFile(path.join(checkoutDir, '_layouts', 'repo-wiki.html'), 'utf8');
    assert.match(pagesLayout, /mermaid@11/);
    assert.match(pagesLayout, /code\.language-mermaid/);
    assert.equal(await fileExists(path.join(checkoutDir, 'Home.md')), false);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki preserves frontmatter for github-wiki when explicitly requested', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '---\nkind: home\nsource_commit: abc123\n---\n# Home\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    const result = await publishWiki({
      wikiDir,
      remote: remoteDir,
      branch: 'master',
      message: 'Publish preserved wiki',
      frontmatterPolicy: 'preserve'
    });

    assert.equal(result.summary.status, 'published');
    assert.equal(result.summary.frontmatterPolicy, 'preserve');

    await git(['clone', '--branch', 'master', remoteDir, checkoutDir]);
    assert.equal(await fs.readFile(path.join(checkoutDir, 'Home.md'), 'utf8'), '---\nkind: home\nsource_commit: abc123\n---\n# Home\n');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki can render provenance blocks for github-pages when explicitly requested', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), [
      '---',
      'source_repo: "https://github.com/mfittko/repo-wiki.git"',
      'source_commit: "abc1234def5678"',
      'source_paths: ["src/publisher.ts"]',
      '---',
      '# Home',
      ''
    ].join('\n'), 'utf8');
    await git(['init', '--bare', remoteDir]);

    const publishResult = await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      pagesPath: 'docs',
      message: 'Publish pages provenance wiki',
      frontmatterPolicy: 'provenance'
    });

    assert.equal(publishResult.summary.status, 'published');
    assert.equal(publishResult.summary.frontmatterPolicy, 'provenance');

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    const published = await fs.readFile(path.join(checkoutDir, 'docs', 'Home.md'), 'utf8');
    assert.match(published, /\*\*Generated from:\*\* `https:\/\/github\.com\/mfittko\/repo-wiki\.git`/);
    assert.match(published, /\*\*Primary sources:\*\* \[src\/publisher\.ts\]\(https:\/\/github\.com\/mfittko\/repo-wiki\/blob\/abc1234def5678\/src\/publisher\.ts\)/);
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
        remote: ' https://super-secret-token@github.com/OWNER/REPO.git',
        dryRun: true
      }),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.equal(error.message.includes('super-secret-token'), false);
        assert.match(error.message, /Publish remote must not start with whitespace or "-"\./);
        return true;
      }
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
      () => publishWiki({ wikiDir, target: 'github-pages', pagesPath: 'docs\ninjected', dryRun: true }),
      /contains unsupported control characters/
    );

    await assert.rejects(
      () => publishWiki({ wikiDir, target: 'github-pages', pagesPath: 'docs\rInjected', dryRun: true }),
      /contains unsupported control characters/
    );

    await assert.rejects(
      () => publishWiki({ wikiDir, target: 'github-pages', pagesPath: 'docs\0injected', dryRun: true }),
      /contains unsupported control characters/
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

test('publishWiki preserves non-markdown files under github-pages publish path', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const seedDir = path.join(tempDir, 'seed');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# New home\n', 'utf8');
    await git(['init', '--bare', remoteDir]);
    await git(['clone', remoteDir, seedDir]);
    await git(['config', 'user.name', 'repo-wiki-test'], seedDir);
    await git(['config', 'user.email', 'repo-wiki-test@example.com'], seedDir);
    await fs.mkdir(path.join(seedDir, 'docs', 'assets'), { recursive: true });
    await fs.mkdir(path.join(seedDir, '_layouts'), { recursive: true });
    await fs.writeFile(path.join(seedDir, 'docs', 'Old.md'), '# Old generated page\n', 'utf8');
    await fs.writeFile(path.join(seedDir, 'docs', 'index.md'), '# Existing index\n', 'utf8');
    await fs.writeFile(path.join(seedDir, 'docs', 'Navigation.md'), '# Existing navigation\n', 'utf8');
    await fs.writeFile(path.join(seedDir, 'docs', 'assets', 'logo.txt'), 'keep asset\n', 'utf8');
    await fs.writeFile(path.join(seedDir, '_config.yml'), 'title: Existing site\n', 'utf8');
    await fs.writeFile(path.join(seedDir, '_layouts', 'repo-wiki.html'), '<main>{{ content }}</main>\n', 'utf8');
    await fs.writeFile(path.join(seedDir, 'docs', 'CNAME'), 'example.com\n', 'utf8');
    await git(['add', '.'], seedDir);
    await git(['commit', '-m', 'Seed existing pages site'], seedDir);
    await git(['push', 'origin', 'HEAD:gh-pages'], seedDir);

    const result = await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      pagesPath: 'docs',
      message: 'Publish pages without deleting site assets'
    });

    assert.equal(result.summary.status, 'published');

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    assert.equal(await fs.readFile(path.join(checkoutDir, 'docs', 'Home.md'), 'utf8'), '# New home\n');
    assert.equal(await fileExists(path.join(checkoutDir, 'docs', 'Old.md')), false);
    assert.equal(await fs.readFile(path.join(checkoutDir, 'docs', 'index.md'), 'utf8'), '# Existing index\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, 'docs', 'Navigation.md'), 'utf8'), '# Existing navigation\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, 'docs', 'assets', 'logo.txt'), 'utf8'), 'keep asset\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, '_config.yml'), 'utf8'), 'title: Existing site\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, '_layouts', 'repo-wiki.html'), 'utf8'), '<main>{{ content }}</main>\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, 'docs', 'CNAME'), 'utf8'), 'example.com\n');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki accepts contained github-pages paths whose names begin with dot-dot', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    const result = await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      pagesPath: '..docs',
      message: 'Publish pages wiki into dot-dot-prefixed path'
    });

    assert.equal(result.summary.status, 'published');
    assert.equal(result.summary.path, '..docs');

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    assert.equal(await fs.readFile(path.join(checkoutDir, '..docs', 'Home.md'), 'utf8'), '# Home\n');
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

test('publishWiki generates _includes/wiki_nav.html from _Sidebar.md for github-pages', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, '_Sidebar.md'), [
      '## Contents',
      '- [Home](Home)',
      '- [Index](Index)',
      '- [External](HTTPS://example.com/docs)',
      '- [Mail](MAILTO:test@example.com)',
      '## Foundation',
      '- [Architecture](Architecture)',
      '- [Build, Test & Run](Build-Test-and-Run)',
    ].join('\n') + '\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    const result = await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      pagesPath: 'docs',
      message: 'Publish with sidebar'
    });

    assert.equal(result.summary.status, 'published');

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    const navHtml = await fs.readFile(path.join(checkoutDir, '_includes', 'wiki_nav.html'), 'utf8');
    // The generated marker must be present
    assert.match(navHtml, /repo-wiki-generated/);
    // Section headings
    assert.match(navHtml, /<h4 class="nav-section">Contents<\/h4>/);
    assert.match(navHtml, /<h4 class="nav-section">Foundation<\/h4>/);
    // Internal links use {{ _base }} prefix for depth-relative navigation
    assert.ok(navHtml.includes('href="{{ _base }}Home.html"'), 'Home link should use {{ _base }} prefix');
    assert.ok(navHtml.includes('href="{{ _base }}Index.html"'), 'Index link should use {{ _base }} prefix');
    assert.ok(navHtml.includes('href="{{ _base }}Architecture.html"'), 'Architecture link should use {{ _base }} prefix');
    assert.ok(navHtml.includes('href="{{ _base }}Build-Test-and-Run.html"'), 'Build link should use {{ _base }} prefix');
    assert.ok(navHtml.includes('href="HTTPS://example.com/docs"'), 'uppercase HTTPS link should not use {{ _base }} prefix');
    assert.ok(navHtml.includes('href="MAILTO:test@example.com"'), 'uppercase MAILTO link should not use {{ _base }} prefix');
    // Link text is HTML-escaped
    assert.match(navHtml, />Build, Test &amp; Run<\/a>/);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki generates _includes/wiki_nav.html from Navigation.md when _Sidebar.md is absent', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, 'Navigation.md'), '## Nav\n- [Home](Home)\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      message: 'Publish with nav'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    const navHtml = await fs.readFile(path.join(checkoutDir, '_includes', 'wiki_nav.html'), 'utf8');
    assert.ok(navHtml.includes('href="{{ _base }}Home.html"'), 'Navigation.md fallback should also use {{ _base }} prefix');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki writes empty _includes/wiki_nav.html when no sidebar content exists', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      message: 'Publish without sidebar'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    const navHtml = await fs.readFile(path.join(checkoutDir, '_includes', 'wiki_nav.html'), 'utf8');
    assert.ok(await fileExists(path.join(checkoutDir, '_includes', 'wiki_nav.html')), 'wiki_nav.html should always be written');
    assert.match(navHtml, /repo-wiki-generated/, 'generated marker should be present even in empty nav');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki preserves existing _includes/wiki_nav.html without overwriting', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const seedDir = path.join(tempDir, 'seed');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, '_Sidebar.md'), '## Nav\n- [Home](Home)\n', 'utf8');
    await git(['init', '--bare', remoteDir]);
    await git(['clone', remoteDir, seedDir]);
    await git(['config', 'user.name', 'repo-wiki-test'], seedDir);
    await git(['config', 'user.email', 'repo-wiki-test@example.com'], seedDir);
    await fs.mkdir(path.join(seedDir, '_includes'), { recursive: true });
    await fs.writeFile(path.join(seedDir, '_includes', 'wiki_nav.html'), '<nav>custom nav</nav>\n', 'utf8');
    await git(['add', '.'], seedDir);
    await git(['commit', '-m', 'Seed custom nav include'], seedDir);
    await git(['push', 'origin', 'HEAD:gh-pages'], seedDir);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      message: 'Publish without overwriting custom nav'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    assert.equal(
      await fs.readFile(path.join(checkoutDir, '_includes', 'wiki_nav.html'), 'utf8'),
      '<nav>custom nav</nav>\n'
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki preserves markerless generated-like custom nav include', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const seedDir = path.join(tempDir, 'seed');
  const checkoutDir = path.join(tempDir, 'checkout');
  const customNav = [
    '<h4 class="nav-section">Custom</h4>',
    '<ul>',
    '<li><a href="Custom.md">Custom</a></li>',
    '<li><a href="https://example.com">External</a></li>',
    '</ul>',
    ''
  ].join('\n');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, '_Sidebar.md'), '## Nav\n- [Home](Home)\n- [Architecture](Architecture)\n', 'utf8');
    await git(['init', '--bare', remoteDir]);
    await git(['clone', remoteDir, seedDir]);
    await git(['config', 'user.name', 'repo-wiki-test'], seedDir);
    await git(['config', 'user.email', 'repo-wiki-test@example.com'], seedDir);
    await fs.mkdir(path.join(seedDir, '_includes'), { recursive: true });
    await fs.writeFile(path.join(seedDir, '_includes', 'wiki_nav.html'), customNav, 'utf8');
    await git(['add', '.'], seedDir);
    await git(['commit', '-m', 'Seed generated-like custom nav include'], seedDir);
    await git(['push', 'origin', 'HEAD:gh-pages'], seedDir);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      message: 'Publish without overwriting generated-like custom nav'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    assert.equal(await fs.readFile(path.join(checkoutDir, '_includes', 'wiki_nav.html'), 'utf8'), customNav);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki layout contains navigation sidebar, breadcrumbs, and page metadata elements', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      message: 'Publish for layout check'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    const layout = await fs.readFile(path.join(checkoutDir, '_layouts', 'repo-wiki.html'), 'utf8');

    // Generated marker must be present
    assert.match(layout, /repo-wiki-generated/);

    assert.match(layout, /class="sidebar"/);
    assert.match(layout, /class="site-nav"/);
    assert.match(layout, /class="breadcrumb"/);
    assert.match(layout, /class="page-metadata"/);
    assert.match(layout, /Page metadata/);
    assert.match(layout, /page\.page_state/);
    assert.match(layout, /page\.kind/);
    assert.match(layout, /page\.confidence/);
    assert.match(layout, /page\.claim_status/);
    assert.match(layout, /page\.source_repo/);
    assert.match(layout, /page\.source_commit/);
    assert.match(layout, /page\.compiled_at/);
    assert.match(layout, /page\.source_paths/);
    assert.match(layout, /source_path in page\.source_paths/);
    assert.match(layout, /class="back-link"/);
    assert.match(layout, /\{% include wiki_nav\.html %\}/);
    assert.match(layout, /Home\.html/);
    assert.match(layout, /Index\.html/);
    assert.match(layout, /Architecture\.html/);
    assert.match(layout, /Agent-Context-Pack\.html/);
    assert.match(layout, /Build-Test-and-Run\.html/);
    assert.match(layout, /Documentation-Debt-Report\.html/);
    assert.match(layout, /_kind == 'module'/);
    assert.match(layout, /_kind != 'home'/);
    assert.match(layout, /Back to Index/);
    assert.match(layout, /mermaid@11/);
    assert.match(layout, /code\.language-mermaid/);
    // Breadcrumb labels must use | escape to prevent HTML injection
    assert.match(layout, /replace: '\.md', '' \| escape/);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki writes wiki_pages_dir to _config.yml when pagesPath is not root', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      pagesPath: 'smoke/pr-test',
      message: 'Publish under nested path'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    const config = await fs.readFile(path.join(checkoutDir, '_config.yml'), 'utf8');
    assert.match(config, /repo-wiki-generated/, 'config should contain the generated marker');
    assert.match(config, /layout: "repo-wiki"/);
    assert.match(config, /wiki_pages_dir: "smoke\/pr-test"/);
    assert.equal(await fileExists(path.join(checkoutDir, 'smoke', 'pr-test', 'Home.md')), true);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki does not add wiki_pages_dir to _config.yml when pagesPath is root', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      pagesPath: '.',
      message: 'Publish at root'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    const config = await fs.readFile(path.join(checkoutDir, '_config.yml'), 'utf8');
    assert.match(config, /repo-wiki-generated/, 'config should contain the generated marker');
    assert.match(config, /layout: "repo-wiki"/);
    assert.equal(config.includes('wiki_pages_dir'), false);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki rewrites internal wiki links to use .html extension for github-pages output', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), [
      '# Home',
      '',
      'See [Architecture](Architecture) for the design.',
      'Also see [Build steps](./Build-Test-and-Run.md).',
      'And [Index](Index.md#overview) for section links.',
      'External: [GitHub](https://github.com)',
      'Anchor only: [Top](#top)',
      'Image: ![Logo](assets/logo.png)',
      'Asset: [Download](guide.pdf)',
      ''
    ].join('\n'), 'utf8');
    await git(['init', '--bare', remoteDir]);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      message: 'Publish with link rewriting'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    const published = await fs.readFile(path.join(checkoutDir, 'Home.md'), 'utf8');

    assert.match(published, /\[Architecture\]\(Architecture\.html\)/);
    assert.match(published, /\[Build steps\]\(Build-Test-and-Run\.html\)/);
    assert.match(published, /\[Index\]\(Index\.html#overview\)/);
    assert.match(published, /\[GitHub\]\(https:\/\/github\.com\)/);
    assert.match(published, /\[Top\]\(#top\)/);
    assert.match(published, /!\[Logo\]\(assets\/logo\.png\)/);
    assert.match(published, /\[Download\]\(guide\.pdf\)/);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki does not rewrite internal links for github-wiki target', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n\nSee [Architecture](Architecture).\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      branch: 'master',
      frontmatterPolicy: 'preserve',
      message: 'Publish wiki without link rewriting'
    });

    await git(['clone', '--branch', 'master', remoteDir, checkoutDir]);
    const published = await fs.readFile(path.join(checkoutDir, 'Home.md'), 'utf8');
    assert.match(published, /\[Architecture\]\(Architecture\)/);
    assert.equal(published.includes('Architecture.md'), false);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('rewriteInternalWikiLinks normalizes bare page names, strips leading ./, and preserves special links', () => {
  assert.equal(rewriteInternalWikiLinks('[Home](Home)'), '[Home](Home.html)');
  assert.equal(rewriteInternalWikiLinks('[Arch](Architecture)'), '[Arch](Architecture.html)');
  assert.equal(rewriteInternalWikiLinks('[Page](./Page.md)'), '[Page](Page.html)');
  assert.equal(rewriteInternalWikiLinks('[Page](./Page)'), '[Page](Page.html)');
  assert.equal(rewriteInternalWikiLinks('[Index](Index.md#section)'), '[Index](Index.html#section)');
  assert.equal(rewriteInternalWikiLinks('[Index](Index#section)'), '[Index](Index.html#section)');
  assert.equal(rewriteInternalWikiLinks('[GitHub](https://github.com)'), '[GitHub](https://github.com)');
  assert.equal(rewriteInternalWikiLinks('[GitHub](HTTPS://github.com)'), '[GitHub](HTTPS://github.com)');
  assert.equal(rewriteInternalWikiLinks('[Mail](mailto:test@example.com)'), '[Mail](mailto:test@example.com)');
  assert.equal(rewriteInternalWikiLinks('[Mail](MAILTO:test@example.com)'), '[Mail](MAILTO:test@example.com)');
  assert.equal(rewriteInternalWikiLinks('[FTP](ftp://example.com)'), '[FTP](ftp://example.com)');
  assert.equal(rewriteInternalWikiLinks('[FTP](FTP://example.com)'), '[FTP](FTP://example.com)');
  assert.equal(rewriteInternalWikiLinks('[Proto](//example.com)'), '[Proto](//example.com)');
  assert.equal(rewriteInternalWikiLinks('[Top](#top)'), '[Top](#top)');
  assert.equal(rewriteInternalWikiLinks('![Logo](logo.png)'), '![Logo](logo.png)');
  assert.equal(rewriteInternalWikiLinks('![Img](photo.jpg)'), '![Img](photo.jpg)');
  assert.equal(rewriteInternalWikiLinks('![Diagram](diagram.svg)'), '![Diagram](diagram.svg)');
  assert.equal(rewriteInternalWikiLinks('![Diagram](Architecture)'), '![Diagram](Architecture)');
  assert.equal(rewriteInternalWikiLinks('[PDF](guide.pdf)'), '[PDF](guide.pdf)');
  assert.equal(rewriteInternalWikiLinks('[JSON](data.json)'), '[JSON](data.json)');
  assert.equal(rewriteInternalWikiLinks('[YAML](config.yml)'), '[YAML](config.yml)');
  const result = rewriteInternalWikiLinks('[Home](Home) and [Arch](Architecture) and [GitHub](https://github.com)');
  assert.equal(result, '[Home](Home.html) and [Arch](Architecture.html) and [GitHub](https://github.com)');
});

test('rewriteInternalWikiLinks rejects unsafe URI schemes and preserves query strings', () => {
  // Unsafe scheme rejection — URLs without inner parens so the regex captures them cleanly
  assert.equal(rewriteInternalWikiLinks('[XSS-lower](javascript:void)'), '[XSS-lower](#)');
  assert.equal(rewriteInternalWikiLinks('[XSS-upper](JAVASCRIPT:void)'), '[XSS-upper](#)');
  assert.equal(rewriteInternalWikiLinks('[Data](data:text/html,evil)'), '[Data](#)');
  assert.equal(rewriteInternalWikiLinks('[VBS](vbscript:msgbox)'), '[VBS](#)');
  assert.equal(rewriteInternalWikiLinks('[Blob](blob:https://example.com/id)'), '[Blob](#)');
  assert.equal(rewriteInternalWikiLinks('[About](about:blank)'), '[About](#)');
  assert.equal(rewriteInternalWikiLinks('[XSS-space]( javascript:evil)'), '[XSS-space](#)');
  assert.equal(rewriteInternalWikiLinks('[XSS-tab](\tJAVASCRIPT:evil)'), '[XSS-tab](#)');
  assert.equal(rewriteInternalWikiLinks('[XSS-trailing]( JAVASCRIPT:evil )'), '[XSS-trailing](#)');

  // Query strings preserved
  assert.equal(rewriteInternalWikiLinks('[Raw](logo.png?raw=1)'), '[Raw](logo.png?raw=1)');
  assert.equal(rewriteInternalWikiLinks('[Page](Page?x=1)'), '[Page](Page.html?x=1)');
  assert.equal(rewriteInternalWikiLinks('[Page](Page?x=1#section)'), '[Page](Page.html?x=1#section)');
});

test('publishWiki regenerates repo-wiki-generated support files on subsequent publish', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, '_Sidebar.md'), '## Nav\n- [Home](Home)\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    // First publish
    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      message: 'First publish'
    });

    // Update sidebar
    await fs.writeFile(path.join(wikiDir, '_Sidebar.md'), '## Nav\n- [Home](Home)\n- [Architecture](Architecture)\n', 'utf8');

    // Second publish — generated nav should reflect the updated sidebar
    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      message: 'Second publish with updated sidebar'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    const navHtml = await fs.readFile(path.join(checkoutDir, '_includes', 'wiki_nav.html'), 'utf8');
    assert.match(navHtml, /repo-wiki-generated/, 'generated marker present after second publish');
    assert.ok(navHtml.includes('href="{{ _base }}Architecture.html"'), 'updated Architecture link present after second publish');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki upgrades markerless legacy generated pages layout and config', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const seedDir = path.join(tempDir, 'seed');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, '_Sidebar.md'), '## Nav\n- [Home](Home)\n', 'utf8');
    await git(['init', '--bare', remoteDir]);
    await git(['clone', remoteDir, seedDir]);
    await git(['config', 'user.name', 'repo-wiki-test'], seedDir);
    await git(['config', 'user.email', 'repo-wiki-test@example.com'], seedDir);
    await fs.mkdir(path.join(seedDir, '_layouts'), { recursive: true });
    await fs.writeFile(path.join(seedDir, '_config.yml'), 'defaults:\n  - scope:\n      path: ""\n    values:\n      layout: "repo-wiki"\n', 'utf8');
    await fs.writeFile(path.join(seedDir, '_layouts', 'repo-wiki.html'), legacyGeneratedPagesLayout(), 'utf8');
    await git(['add', '.'], seedDir);
    await git(['commit', '-m', 'Seed legacy generated support files'], seedDir);
    await git(['push', 'origin', 'HEAD:gh-pages'], seedDir);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      message: 'Upgrade legacy support files'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    const config = await fs.readFile(path.join(checkoutDir, '_config.yml'), 'utf8');
    const layout = await fs.readFile(path.join(checkoutDir, '_layouts', 'repo-wiki.html'), 'utf8');
    assert.match(config, /repo-wiki-generated/);
    assert.match(layout, /repo-wiki-generated/);
    assert.match(layout, /class="page-metadata"/);
    assert.match(layout, /\{% include wiki_nav\.html %\}/);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki preserves markerless custom pages layout and config', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const seedDir = path.join(tempDir, 'seed');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, '_Sidebar.md'), '## Nav\n- [Home](Home)\n', 'utf8');
    await git(['init', '--bare', remoteDir]);
    await git(['clone', remoteDir, seedDir]);
    await git(['config', 'user.name', 'repo-wiki-test'], seedDir);
    await git(['config', 'user.email', 'repo-wiki-test@example.com'], seedDir);
    // Seed custom support files without the generated marker
    await fs.mkdir(path.join(seedDir, '_includes'), { recursive: true });
    await fs.mkdir(path.join(seedDir, '_layouts'), { recursive: true });
    await fs.writeFile(path.join(seedDir, '_includes', 'wiki_nav.html'), '<nav>custom nav</nav>\n', 'utf8');
    await fs.writeFile(path.join(seedDir, '_layouts', 'repo-wiki.html'), '<main>{{ content }}</main>\n', 'utf8');
    await fs.writeFile(path.join(seedDir, '_config.yml'), 'title: Custom site\nlayout: custom\n', 'utf8');
    await git(['add', '.'], seedDir);
    await git(['commit', '-m', 'Seed custom support files'], seedDir);
    await git(['push', 'origin', 'HEAD:gh-pages'], seedDir);

    // Publish — custom files should be preserved
    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      message: 'Publish should not overwrite custom files'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    assert.equal(await fs.readFile(path.join(checkoutDir, '_includes', 'wiki_nav.html'), 'utf8'), '<nav>custom nav</nav>\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, '_layouts', 'repo-wiki.html'), 'utf8'), '<main>{{ content }}</main>\n');
    assert.equal(await fs.readFile(path.join(checkoutDir, '_config.yml'), 'utf8'), 'title: Custom site\nlayout: custom\n');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki refreshes marked generated pages layout and config', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const seedDir = path.join(tempDir, 'seed');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await git(['init', '--bare', remoteDir]);
    await git(['clone', remoteDir, seedDir]);
    await git(['config', 'user.name', 'repo-wiki-test'], seedDir);
    await git(['config', 'user.email', 'repo-wiki-test@example.com'], seedDir);
    await fs.mkdir(path.join(seedDir, '_layouts'), { recursive: true });
    await fs.writeFile(path.join(seedDir, '_config.yml'), '# repo-wiki-generated: regenerated on each publish\ndefaults: []\n', 'utf8');
    await fs.writeFile(path.join(seedDir, '_layouts', 'repo-wiki.html'), '<!-- repo-wiki-generated: regenerated on each publish -->\n<main>old</main>\n', 'utf8');
    await git(['add', '.'], seedDir);
    await git(['commit', '-m', 'Seed marked support files'], seedDir);
    await git(['push', 'origin', 'HEAD:gh-pages'], seedDir);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      message: 'Refresh marked support files'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    const config = await fs.readFile(path.join(checkoutDir, '_config.yml'), 'utf8');
    const layout = await fs.readFile(path.join(checkoutDir, '_layouts', 'repo-wiki.html'), 'utf8');
    assert.match(config, /layout: "repo-wiki"/);
    assert.doesNotMatch(config, /defaults: \[\]/);
    assert.match(layout, /class="page-metadata"/);
    assert.doesNotMatch(layout, /<main>old<\/main>/);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki updates wiki_pages_dir when upgrading legacy generated config', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const seedDir = path.join(tempDir, 'seed');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await git(['init', '--bare', remoteDir]);
    await git(['clone', remoteDir, seedDir]);
    await git(['config', 'user.name', 'repo-wiki-test'], seedDir);
    await git(['config', 'user.email', 'repo-wiki-test@example.com'], seedDir);
    await fs.writeFile(path.join(seedDir, '_config.yml'), 'defaults:\n  - scope:\n      path: ""\n    values:\n      layout: "repo-wiki"\n', 'utf8');
    await git(['add', '.'], seedDir);
    await git(['commit', '-m', 'Seed legacy generated config'], seedDir);
    await git(['push', 'origin', 'HEAD:gh-pages'], seedDir);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      pagesPath: 'nested/pages',
      message: 'Upgrade legacy config with nested path'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    const config = await fs.readFile(path.join(checkoutDir, '_config.yml'), 'utf8');
    assert.match(config, /repo-wiki-generated/);
    assert.match(config, /wiki_pages_dir: "nested\/pages"/);
    assert.equal(await fileExists(path.join(checkoutDir, 'nested', 'pages', 'Home.md')), true);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki does not mutate source wiki files when publishing to github-pages', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    const sourceContent = [
      '---',
      'kind: module',
      '---',
      '# Module',
      '',
      'See [Architecture](Architecture) for context.',
      ''
    ].join('\n');
    await fs.writeFile(path.join(wikiDir, 'Module.md'), sourceContent, 'utf8');
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      message: 'Publish should not touch source files'
    });

    // Source files must be byte-for-byte unchanged
    assert.equal(await fs.readFile(path.join(wikiDir, 'Module.md'), 'utf8'), sourceContent);
    assert.equal(await fs.readFile(path.join(wikiDir, 'Home.md'), 'utf8'), '# Home\n');
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('publishWiki unsafe sidebar href is sanitized to # in wiki_nav.html', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publisher-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const remoteDir = path.join(tempDir, 'remote.git');
  const checkoutDir = path.join(tempDir, 'checkout');

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await fs.writeFile(path.join(wikiDir, '_Sidebar.md'), [
      '## Nav',
      '- [Safe](Home)',
      '- [XSS](javascript:alert(1))',
      '- [Spaced XSS]( javascript:evil)',
      '- [Tabbed XSS](\tJAVASCRIPT:evil)',
      '- [Data](data:text/html,evil)',
    ].join('\n') + '\n', 'utf8');
    await git(['init', '--bare', remoteDir]);

    await publishWiki({
      wikiDir,
      remote: remoteDir,
      target: 'github-pages',
      branch: 'gh-pages',
      message: 'Publish with unsafe sidebar links'
    });

    await git(['clone', '--branch', 'gh-pages', remoteDir, checkoutDir]);
    const navHtml = await fs.readFile(path.join(checkoutDir, '_includes', 'wiki_nav.html'), 'utf8');
    // Safe link should be present with {{ _base }} prefix
    assert.ok(navHtml.includes('href="{{ _base }}Home.html"'), 'safe link present');
    // Unsafe schemes must be replaced with #
    assert.ok(!navHtml.includes('javascript:'), 'javascript: scheme must not appear in output');
    assert.ok(!navHtml.includes('JAVASCRIPT:'), 'uppercase javascript: scheme must not appear in output');
    assert.ok(!navHtml.includes('data:'), 'data: scheme must not appear in output');
    assert.match(navHtml, /<a href="#">Spaced XSS<\/a>/);
    assert.match(navHtml, /<a href="#">Tabbed XSS<\/a>/);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
