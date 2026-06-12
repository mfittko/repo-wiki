import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { buildWikiQueryAnswer, buildWikiExplanation, findWikiGraphPath } from '../src/wiki-query.js';

async function seedRuntimeFixture(rootDir: string) {
  const wikiDir = path.join(rootDir, 'wiki');
  const graphPath = path.join(rootDir, 'graph.json');
  await mkdir(wikiDir, { recursive: true });
  await writeFile(path.join(wikiDir, 'Architecture.md'), `---
kind: "foundation"
page_state: "generated"
source_paths:
  - "src/compiler.ts"
---
# Architecture

Architecture explains compile, graph, and query flow.
`, 'utf8');
  await writeFile(path.join(wikiDir, 'Module-compiler-ts.md'), `---
kind: "module"
page_state: "generated"
source_paths:
  - "src/compiler.ts"
  - "test/compiler.test.ts"
---
# Module compiler ts

Compiler turns source cards and plans into wiki pages with citations.
`, 'utf8');
  await writeFile(graphPath, JSON.stringify({
    schema_version: 1,
    nodes: [
      { id: 'page:Architecture.md', kind: 'page', path: 'Architecture.md', page_state: 'generated' },
      { id: 'page:Module-compiler-ts.md', kind: 'page', path: 'Module-compiler-ts.md', page_state: 'generated' },
      { id: 'source:src/compiler.ts', kind: 'source', path: 'src/compiler.ts' },
      { id: 'source:test/compiler.test.ts', kind: 'source', path: 'test/compiler.test.ts' }
    ],
    edges: [
      { type: 'wiki_link', from: 'page:Architecture.md', to: 'page:Module-compiler-ts.md' },
      { type: 'provenance', from: 'page:Architecture.md', to: 'source:src/compiler.ts' },
      { type: 'provenance', from: 'page:Module-compiler-ts.md', to: 'source:src/compiler.ts' },
      { type: 'provenance', from: 'page:Module-compiler-ts.md', to: 'source:test/compiler.test.ts' }
    ]
  }, null, 2), 'utf8');
  return { wikiDir, graphPath };
}

test('buildWikiQueryAnswer returns cited deterministic wiki-first answer', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-query-test-'));
  try {
    const { wikiDir, graphPath } = await seedRuntimeFixture(tempDir);
    const answer = await buildWikiQueryAnswer({ question: 'How does compiler create wiki pages?', wikiDir, graphPath, limit: 2 });

    assert.equal(answer.question, 'How does compiler create wiki pages?');
    assert.equal(answer.results[0].pagePath, 'Module-compiler-ts.md');
    assert.equal(answer.evidence.some((item) => item.ref === 'src/compiler.ts' && item.strength === 'source'), true);
    assert.match(answer.answer, /Evidence:/);
    assert.equal(answer.totalResults >= 1, true);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('findWikiGraphPath returns deterministic shortest traversal', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-query-test-'));
  try {
    const { graphPath } = await seedRuntimeFixture(tempDir);
    const result = await findWikiGraphPath({ graphPath, from: 'Architecture.md', to: 'src/compiler.ts' });

    assert.equal(result.found, true);
    assert.deepEqual(result.path.map((step) => step.nodeId), ['page:Architecture.md', 'source:src/compiler.ts']);
    assert.equal('idLabel' in result.path[0], false);
    assert.deepEqual(result.edges.map((edge) => edge.type), ['provenance']);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('buildWikiExplanation ties page summary to provenance evidence', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-query-test-'));
  try {
    const { wikiDir, graphPath } = await seedRuntimeFixture(tempDir);
    const explanation = await buildWikiExplanation({ target: 'Module-compiler-ts.md', wikiDir, graphPath });

    assert.equal(explanation.target, 'Module-compiler-ts.md');
    assert.equal(explanation.page?.pagePath, 'Module-compiler-ts.md');
    assert.deepEqual(explanation.evidence.map((item) => item.ref), ['src/compiler.ts', 'test/compiler.test.ts']);
    assert.match(explanation.explanation, /Compiler turns source cards/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('query/explain/path no-result cases are explicit and machine-readable', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-query-test-'));
  try {
    const { wikiDir, graphPath } = await seedRuntimeFixture(tempDir);
    const answer = await buildWikiQueryAnswer({ question: 'unmatched term', wikiDir, graphPath });
    const explanation = await buildWikiExplanation({ target: 'Missing.md', wikiDir, graphPath });
    const traversal = await findWikiGraphPath({ graphPath, from: 'Architecture.md', to: 'Missing.md' });

    assert.equal(answer.totalResults, 0);
    assert.deepEqual(answer.evidence, []);
    assert.equal(explanation.found, false);
    assert.equal(traversal.found, false);
    assert.equal(traversal.reason, 'unknown-target');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('wiki query helpers cover missing graph, documentation evidence, formatting, and graph misses', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-query-test-'));
  try {
    const wikiDir = path.join(tempDir, 'wiki');
    const graphPath = path.join(tempDir, 'graph.json');
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Docs.md'), `---
kind: "guide"
page_state: "generated"
source_paths:
  - "docs/guide.md"
---
# Docs

Guide page covers documentation-only behavior.
`, 'utf8');
    await writeFile(path.join(wikiDir, 'Isolated.md'), `---
kind: "guide"
page_state: "generated"
source_paths:
  - "src/isolated.ts"
---
# Isolated

Standalone page.
`, 'utf8');
    await writeFile(graphPath, JSON.stringify({
      schema_version: 1,
      nodes: [
        { id: 'page:Docs.md', kind: 'page', path: 'Docs.md', page_state: 'generated' },
        { id: 'page:Isolated.md', kind: 'page', path: 'Isolated.md', page_state: 'generated' },
        { id: 'documentation:docs/guide.md', kind: 'documentation', path: 'docs/guide.md' }
      ],
      edges: [
        { type: 'provenance', from: 'page:Docs.md', to: 'documentation:docs/guide.md' }
      ]
    }), 'utf8');

    const missingGraphAnswer = await buildWikiQueryAnswer({ question: 'documentation behavior', wikiDir, graphPath: path.join(tempDir, 'missing-graph.json') });
    assert.equal(missingGraphAnswer.evidence[0].strength, 'documentation');

    const explanation = await buildWikiExplanation({ target: 'page:Docs.md', wikiDir, graphPath });
    assert.equal(explanation.found, true);
    assert.equal(explanation.evidence[0].kind, 'documentation');

    const formattedPath = await findWikiGraphPath({ graphPath, from: 'page:Docs.md', to: 'documentation:docs/guide.md' });
    assert.match((await import('../src/wiki-query.js')).formatWikiGraphPath(formattedPath), /--provenance-->/);

    const noPath = await findWikiGraphPath({ graphPath, from: 'Docs.md', to: 'Isolated.md' });
    assert.equal(noPath.reason, 'no-path');
    assert.match((await import('../src/wiki-query.js')).formatWikiGraphPath(noPath), /No path/);

    const unknownSource = await findWikiGraphPath({ graphPath, from: 'Missing.md', to: 'Docs.md' });
    assert.equal(unknownSource.reason, 'unknown-source');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
