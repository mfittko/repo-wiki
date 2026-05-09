import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { lintWiki } from '../src/linter.js';

async function writeWikiFixture(pages: Record<string, string>) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-linter-test-'));
  const wikiDir = path.join(dir, 'wiki');
  const scanDir = path.join(dir, 'scan');
  await mkdir(wikiDir, { recursive: true });
  await mkdir(scanDir, { recursive: true });
  await writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify({ commit: 'abc123', files: [] }), 'utf8');

  for (const [name, content] of Object.entries(pages)) {
    await writeFile(path.join(wikiDir, name), content, 'utf8');
  }

  return { dir, wikiDir, scanDir };
}

function generatedPage(title: string, body = '') {
  return ['---', 'source_commit: "abc123"', 'page_state: "generated"', '---', '', `# ${title}`, '', body].join('\n');
}

const requiredPages = {
  'Home.md': generatedPage('Home', '[Index](Index)'),
  '_Sidebar.md': '# Navigation\n\n- [Home](Home)\n',
  'Index.md': generatedPage('Index'),
  'Log.md': generatedPage('Log'),
  'Agent-Context-Pack.md': generatedPage('Agent Context Pack'),
  'Repository-Overview.md': generatedPage('Repository Overview'),
  'Architecture.md': generatedPage('Architecture'),
  'Build-Test-and-Run.md': generatedPage('Build Test and Run'),
  'Open-Questions.md': generatedPage('Open Questions')
};

test('lintWiki accepts required generated pages with valid internal links', async () => {
  const { dir, wikiDir, scanDir } = await writeWikiFixture(requiredPages);

  try {
    const result = await lintWiki({ wikiDir, scanDir });

    assert.equal(result.summary.pages, 9);
    assert.equal(result.summary.errors, 0);
    assert.equal(result.summary.warnings, 0);
    assert.deepEqual(result.issues, []);
    assert.equal(result.manifest.commit, 'abc123');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintWiki reports missing required pages, source commit, broken links, and secrets', async () => {
  const { dir, wikiDir, scanDir } = await writeWikiFixture({
    'Home.md': '# Home\n\n[Missing](Missing)\n\ntoken=super-secret-value\n'
  });

  try {
    const result = await lintWiki({ wikiDir, scanDir });
    const codes = result.issues.map((issue) => issue.code);

    assert.ok(codes.includes('missing-required-page'));
    assert.ok(codes.includes('missing-source-commit'));
    assert.ok(codes.includes('broken-wiki-link'));
    assert.ok(codes.includes('secret-like-content'));
    assert.ok(result.summary.errors > 0);
    assert.ok(result.summary.warnings > 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintWiki ignores external, anchor, and path-like markdown links', async () => {
  const { dir, wikiDir, scanDir } = await writeWikiFixture({
    ...requiredPages,
    'Home.md': generatedPage('Home', [
      '[External](https://example.com)',
      '[Anchor](#section)',
      '[Path](docs/page.md)',
      '[Index with extension](Index.md)'
    ].join('\n'))
  });

  try {
    const result = await lintWiki({ wikiDir, scanDir });

    assert.equal(result.summary.errors, 0);
    assert.equal(result.summary.warnings, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
