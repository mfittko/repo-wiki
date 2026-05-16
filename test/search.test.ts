import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { buildSearchIndex, defaultSearchDirForWiki, searchIndex } from '../src/search.js';

async function seedWikiFixture(rootDir: string) {
  const wikiDir = path.join(rootDir, 'wiki');
  await mkdir(wikiDir, { recursive: true });

  await writeFile(path.join(wikiDir, 'Architecture.md'), `---
kind: "foundation"
page_state: "generated"
source_commit: "abc1234"
source_paths:
  - "src/compiler.ts"
  - "src/planner.ts"
---
# Architecture

Architecture explains how compile, graph generation, and search routing fit together.

See [Module scanner ts](Module-scanner-ts) for repository scanning and [Build Test and Run](Build-Test-and-Run) for validation commands.
`, 'utf8');

  await writeFile(path.join(wikiDir, 'Module-scanner-ts.md'), `---
kind: "module"
page_state: "generated"
source_commit: "abc1234"
source_paths:
  - "src/scanner.ts"
---
# Module scanner ts

Scanner loads repository files, extracts metadata, and builds the manifest for later compile and search steps.
`, 'utf8');

  await writeFile(path.join(wikiDir, 'Build-Test-and-Run.md'), `---
kind: "foundation"
page_state: "generated"
source_commit: "abc1234"
source_paths:
  - "package.json"
---
# Build Test and Run

Run build, test, and coverage checks for the repository wiki pipeline.
`, 'utf8');

  await writeFile(path.join(wikiDir, 'Alpha.md'), '# Alpha\n\nShared tie token.\n', 'utf8');
  await writeFile(path.join(wikiDir, 'Beta.md'), '# Beta\n\nShared tie token.\n', 'utf8');

  return wikiDir;
}

test('buildSearchIndex writes a deterministic offline index and captures link context', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-search-test-'));

  try {
    const wikiDir = await seedWikiFixture(tempDir);
    const outDir = defaultSearchDirForWiki(wikiDir);

    const first = await buildSearchIndex({ wikiDir, outDir });
    const firstContent = await readFile(path.join(outDir, 'index.json'), 'utf8');
    const second = await buildSearchIndex({ wikiDir, outDir });
    const secondContent = await readFile(path.join(outDir, 'index.json'), 'utf8');

    assert.equal(first.summary.pages, 5);
    assert.deepEqual(first.index.sourceCommits, ['abc1234']);
    assert.equal(first.index.wikiDir, '../wiki');
    assert.equal(path.isAbsolute(first.summary.outDir), false);
    assert.equal(path.isAbsolute(first.summary.outFile), false);
    assert.equal(firstContent, secondContent);
    assert.deepEqual(first.index.entries.find((entry) => entry.pagePath === 'Architecture.md')?.outboundLinks, ['Build-Test-and-Run.md', 'Module-scanner-ts.md']);
    assert.deepEqual(second.index.entries.find((entry) => entry.pagePath === 'Module-scanner-ts.md')?.inboundLinks, ['Architecture.md']);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('searchIndex ranks page-title and source-path matches ahead of broader mentions', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-search-test-'));

  try {
    const wikiDir = await seedWikiFixture(tempDir);
    const { index } = await buildSearchIndex({ wikiDir });

    const scannerResults = searchIndex(index, 'scanner');
    assert.ok(scannerResults.length >= 2);
    assert.equal(scannerResults[0].pagePath, 'Module-scanner-ts.md');
    assert.match(scannerResults[0].snippet, /scanner/i);

    const tieResults = searchIndex(index, 'shared tie', 2);
    assert.deepEqual(tieResults.map((entry) => entry.pagePath), ['Alpha.md', 'Beta.md']);

    const emptyResults = searchIndex(index, 'nonexistent-query');
    assert.deepEqual(emptyResults, []);

    const zeroLimitResults = searchIndex(index, 'scanner', 0);
    assert.deepEqual(zeroLimitResults, []);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
