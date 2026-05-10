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
    const pagePath = path.join(wikiDir, name);
    await mkdir(path.dirname(pagePath), { recursive: true });
    await writeFile(pagePath, content, 'utf8');
  }

  return { dir, wikiDir, scanDir };
}

function generatedPage(title: string, body = '', extraFrontmatter: string[] = []) {
  return ['---', 'source_commit: "abc123"', 'page_state: "generated"', ...extraFrontmatter, '---', '', `# ${title}`, '', body].join('\n');
}

const requiredPages = {
  'Home.md': generatedPage('Home', '[Index](Index)'),
  '_Sidebar.md': generatedPage('Navigation', '- [Home](Home)'),
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

test('lintWiki validates nested markdown without letting nested pages satisfy required top-level pages', async () => {
  const { dir, wikiDir, scanDir } = await writeWikiFixture({
    'nested/Home.md': generatedPage('Nested Home', 'token=super-secret-value')
  });

  try {
    const result = await lintWiki({ wikiDir, scanDir });
    const missingHome = result.issues.find((issue) => issue.code === 'missing-required-page' && issue.message.includes('Home.md'));
    const nestedSecret = result.issues.find((issue) => issue.code === 'secret-like-content' && issue.message.includes('nested/Home.md'));

    assert.ok(missingHome);
    assert.ok(nestedSecret);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintWiki requires source_commit in frontmatter, not just page body text', async () => {
  const { dir, wikiDir, scanDir } = await writeWikiFixture({
    ...requiredPages,
    'Home.md': '# Home\n\nThe source_commit is abc123.\n'
  });

  try {
    const result = await lintWiki({ wikiDir, scanDir });
    const sourceCommitIssue = result.issues.find((issue) => issue.code === 'missing-source-commit' && issue.message.includes('Home.md'));

    assert.ok(sourceCommitIssue);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintWiki does not let nested pages satisfy top-level wiki links', async () => {
  const { dir, wikiDir, scanDir } = await writeWikiFixture({
    ...requiredPages,
    'Home.md': generatedPage('Home', '[Nested duplicate only](Duplicate)'),
    'nested/Duplicate.md': generatedPage('Nested Duplicate')
  });

  try {
    const result = await lintWiki({ wikiDir, scanDir });
    const brokenLink = result.issues.find((issue) => issue.code === 'broken-wiki-link' && issue.message.includes('Duplicate'));

    assert.ok(brokenLink);
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

test('lintWiki accepts generated module pages with source_paths provenance metadata', async () => {
  const { dir, wikiDir, scanDir } = await writeWikiFixture({
    ...requiredPages,
    'Module-Core.md': generatedPage(
      'Core',
      'This module documents runtime behavior using scanner-derived source files.',
      ['kind: "module"', 'source_paths: ["src/core.ts"]', 'confidence: "high"']
    )
  });

  try {
    const result = await lintWiki({ wikiDir, scanDir });
    const missingProvenance = result.issues.find((issue) => issue.code === 'missing-source-provenance');
    const missingSourcePaths = result.issues.find((issue) => issue.code === 'missing-source-paths');

    assert.equal(missingProvenance, undefined);
    assert.equal(missingSourcePaths, undefined);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintWiki accepts schema-valid YAML block-list source_paths provenance metadata', async () => {
  const { dir, wikiDir, scanDir } = await writeWikiFixture({
    ...requiredPages,
    'Module-Core.md': generatedPage(
      'Core',
      'This module documents runtime behavior using scanner-derived source files.',
      ['kind: "module"', 'source_paths:', '  - "src/core.ts"', '  - "test/core.test.ts"', 'confidence: "high"']
    )
  });

  try {
    const result = await lintWiki({ wikiDir, scanDir });
    assert.equal(result.issues.find((issue) => issue.code === 'missing-source-provenance'), undefined);
    assert.equal(result.issues.find((issue) => issue.code === 'missing-source-paths'), undefined);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintWiki applies provenance checks to generated mixed pages', async () => {
  const { dir, wikiDir, scanDir } = await writeWikiFixture({
    ...requiredPages,
    'Module-Mixed.md': ['---', 'source_commit: "abc123"', 'page_state: "mixed"', 'kind: "module"', '---', '', '# Mixed', '', 'This mixed page claims runtime behavior without any source provenance.'].join('\n')
  });

  try {
    const result = await lintWiki({ wikiDir, scanDir });
    const missingProvenance = result.issues.find((issue) => issue.code === 'missing-source-provenance' && issue.message.includes('Module-Mixed.md'));
    assert.ok(missingProvenance);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintWiki does not treat documentation paths as authoritative provenance unless labeled secondary', async () => {
  const { dir, wikiDir, scanDir } = await writeWikiFixture({
    ...requiredPages,
    'Module-Docs.md': generatedPage(
      'Docs',
      'This page claims current runtime behavior based only on documentation paths.',
      ['kind: "module"', 'source_paths: ["docs/usage.md", "README.md"]']
    ),
    'Documentation-Debt-Report.md': generatedPage(
      'Documentation Debt Report',
      'Markdown documentation is ingested as secondary evidence. Review `docs/usage.md` before promoting documentation-derived claims.',
      ['kind: "documentation_debt_report"', 'source_paths: ["docs/usage.md"]', 'claim_status: "review-needed"']
    )
  });

  try {
    const result = await lintWiki({ wikiDir, scanDir });
    const docsOnlyWarning = result.issues.find((issue) => issue.code === 'missing-source-provenance' && issue.message.includes('Module-Docs.md'));
    const labeledDocsWarning = result.issues.find((issue) => issue.code === 'missing-source-provenance' && issue.message.includes('Documentation-Debt-Report.md'));

    assert.ok(docsOnlyWarning);
    assert.equal(labeledDocsWarning, undefined);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintWiki warns for generated module pages with material claims but missing provenance metadata', async () => {
  const { dir, wikiDir, scanDir } = await writeWikiFixture({
    ...requiredPages,
    'Module-Core.md': generatedPage(
      'Core',
      'This module provides authentication and request lifecycle behavior for production traffic.',
      ['kind: "module"', 'confidence: "high"']
    )
  });

  try {
    const result = await lintWiki({ wikiDir, scanDir });
    const missingProvenance = result.issues.find((issue) => issue.code === 'missing-source-provenance' && issue.message.includes('Module-Core.md'));
    const missingSourcePaths = result.issues.find((issue) => issue.code === 'missing-source-paths' && issue.message.includes('Module-Core.md'));

    assert.ok(missingProvenance);
    assert.ok(missingSourcePaths);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintWiki exempts hub pages from provenance warnings', async () => {
  const { dir, wikiDir, scanDir } = await writeWikiFixture({
    ...requiredPages,
    'Home.md': generatedPage('Home', 'This generated home page summarizes repository behavior without source citations yet.', ['kind: "home"']),
    'Index.md': generatedPage('Index', 'This index page references generated content only.', ['kind: "index"']),
    'Log.md': generatedPage('Log', 'This log records compilation history.', ['kind: "log"'])
  });

  try {
    const result = await lintWiki({ wikiDir, scanDir });
    const provenanceWarnings = result.issues.filter((issue) => issue.code === 'missing-source-provenance');

    assert.equal(provenanceWarnings.length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
