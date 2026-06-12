import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  WikiGraphError,
  buildWikiGraphIndex,
  getAdjacentNodes,
  getEdgesByType,
  getIncomingEdges,
  getManagedPagePaths,
  getNodeById,
  getNodesByKind,
  getNodesByPath,
  getOutgoingEdges,
  selectLinkedPagePaths,
  selectPageProvenancePaths,
  isManagedPageState,
  isSupportedWikiGraphSchema,
  loadWikiGraph,
  selectAffectedPagePaths
} from '../src/wiki-graph.js';

test('loadWikiGraph provides deterministic indexing and traversal helpers', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-graph-helper-'));
  const graphPath = path.join(dir, 'graph.json');

  try {
    await writeFile(graphPath, JSON.stringify({
      schema_version: 1,
      nodes: [
        { id: 'source:src/server.ts', kind: 'source', path: './src/server.ts' },
        { id: 'page:Security-and-Secrets.md', kind: 'page', path: 'Security-and-Secrets.md', page_state: 'human-owned' },
        { id: 'page:Documentation-Debt-Report.md', kind: 'page', path: 'Documentation-Debt-Report.md', page_state: 'mixed' },
        { id: 'page:Service-api.md', kind: 'page', path: 'Service-api.md', page_state: 'generated' },
        { id: 'documentation:docs/guide.md', kind: 'documentation', path: 'docs\\guide.md' }
      ],
      edges: [
        { type: 'wiki_link', from: 'page:Service-api.md', to: 'page:Documentation-Debt-Report.md' },
        { type: 'provenance', from: 'page:Documentation-Debt-Report.md', to: 'documentation:docs/guide.md' },
        { type: 'affects', from: 'source:src/server.ts', to: 'page:Security-and-Secrets.md' },
        { type: 'affects', from: 'documentation:docs/guide.md', to: 'page:Documentation-Debt-Report.md' },
        { type: 'affects', from: 'source:src/server.ts', to: 'page:Service-api.md' },
        { type: 'provenance', from: 'page:Service-api.md', to: 'source:src/server.ts' }
      ]
    }, null, 2), 'utf8');

    const graph = await loadWikiGraph(graphPath);

    assert.equal(isSupportedWikiGraphSchema(graph), true);
    assert.deepEqual(getNodesByKind(graph, 'page').map((node) => node.path), [
      'Documentation-Debt-Report.md',
      'Security-and-Secrets.md',
      'Service-api.md'
    ]);
    assert.deepEqual(getNodesByPath(graph, './src/server.ts').map((node) => node.id), ['source:src/server.ts']);
    assert.deepEqual(getManagedPagePaths(graph), new Set(['Documentation-Debt-Report.md', 'Service-api.md']));

    assert.deepEqual(getEdgesByType(graph, 'affects').map((edge) => `${edge.from}->${edge.to}`), [
      'documentation:docs/guide.md->page:Documentation-Debt-Report.md',
      'source:src/server.ts->page:Security-and-Secrets.md',
      'source:src/server.ts->page:Service-api.md'
    ]);
    assert.deepEqual(getOutgoingEdges(graph, 'page:Service-api.md', { type: 'wiki_link' }).map((edge) => edge.to), ['page:Documentation-Debt-Report.md']);
    assert.deepEqual(getIncomingEdges(graph, 'page:Documentation-Debt-Report.md', { type: 'wiki_link' }).map((edge) => edge.from), ['page:Service-api.md']);
    assert.deepEqual(getAdjacentNodes(graph, 'page:Service-api.md', { type: 'wiki_link' }).map((node) => node.path), ['Documentation-Debt-Report.md']);
    assert.deepEqual(selectLinkedPagePaths(graph, 'Service-api.md'), [
      { nodeId: 'page:Documentation-Debt-Report.md', path: 'Documentation-Debt-Report.md', kind: 'page' }
    ]);
    assert.deepEqual(selectPageProvenancePaths(graph, 'Service-api.md'), [
      { nodeId: 'source:src/server.ts', path: 'src/server.ts', kind: 'source' }
    ]);
    assert.deepEqual(selectPageProvenancePaths(graph, 'Documentation-Debt-Report.md'), [
      { nodeId: 'documentation:docs/guide.md', path: 'docs/guide.md', kind: 'documentation' }
    ]);
    assert.equal(getNodeById(graph, 'documentation:docs/guide.md')?.path, 'docs/guide.md');

    assert.deepEqual(selectAffectedPagePaths(graph, ['src/server.ts', './docs/guide.md', 'src/unknown.ts']), [
      {
        pageId: 'page:Documentation-Debt-Report.md',
        pagePath: 'Documentation-Debt-Report.md',
        pageState: 'mixed',
        changedPaths: ['docs/guide.md']
      },
      {
        pageId: 'page:Service-api.md',
        pagePath: 'Service-api.md',
        pageState: 'generated',
        changedPaths: ['src/server.ts']
      }
    ]);

    assert.deepEqual(selectAffectedPagePaths(graph, ['src/server.ts'], { managedOnly: false }), [
      {
        pageId: 'page:Security-and-Secrets.md',
        pagePath: 'Security-and-Secrets.md',
        pageState: 'human-owned',
        changedPaths: ['src/server.ts']
      },
      {
        pageId: 'page:Service-api.md',
        pagePath: 'Service-api.md',
        pageState: 'generated',
        changedPaths: ['src/server.ts']
      }
    ]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('buildWikiGraphIndex rejects malformed graph structures explicitly', () => {
  assert.throws(
    () => buildWikiGraphIndex({ schema_version: 1, nodes: {}, edges: [] }),
    (error: any) => error instanceof WikiGraphError && /nodes must be an array/.test(error.message)
  );

  assert.throws(
    () => buildWikiGraphIndex({
      schema_version: 1,
      nodes: [
        { id: 'page:Home.md', kind: 'page', path: 'Home.md' },
        { id: 'page:Home.md', kind: 'page', path: 'Home.md' }
      ],
      edges: []
    }),
    (error: any) => error instanceof WikiGraphError && /duplicate page:Home\.md/.test(error.message)
  );

  assert.throws(
    () => buildWikiGraphIndex({
      schema_version: 1,
      nodes: [{ id: 'page:Home.md', kind: 'page', path: 'Home.md' }],
      edges: [{ from: 'page:Home.md', to: 'page:Index.md' }]
    }),
    (error: any) => error instanceof WikiGraphError && /must include a non-empty string type/.test(error.message)
  );

  assert.throws(
    () => buildWikiGraphIndex({
      schema_version: 1,
      nodes: [{ id: 'documentation:docs/other.md', kind: 'documentation', path: 'docs/guide.md' }],
      edges: []
    }),
    (error: any) => error instanceof WikiGraphError && /must match its kind\/path/.test(error.message)
  );

  assert.throws(
    () => buildWikiGraphIndex({
      schema_version: 1,
      nodes: [{ id: 'page:Home.md', kind: 'page', path: 'Home.md' }],
      edges: [{ type: 'wiki_link', from: 'page:Home.md', to: 'page:Missing.md' }]
    }),
    (error: any) => error instanceof WikiGraphError && /missing to-node/.test(error.message)
  );

  assert.throws(
    () => buildWikiGraphIndex({
      schema_version: 1,
      nodes: [
        { id: 'page:Home.md', kind: 'page', path: 'Home.md' },
        { id: 'source:src/server.ts', kind: 'source', path: 'src/server.ts' }
      ],
      edges: [{ type: 'wiki_link', from: 'page:Home.md', to: 'source:src/server.ts' }]
    }),
    (error: any) => error instanceof WikiGraphError && /invalid endpoint kinds/.test(error.message)
  );
});

test('graph helper managed-page classification matches planner and lint expectations', () => {
  assert.equal(isManagedPageState('generated'), true);
  assert.equal(isManagedPageState('mixed'), true);
  assert.equal(isManagedPageState('human-owned'), false);
  assert.equal(isManagedPageState(undefined), true);
  assert.equal(isSupportedWikiGraphSchema(buildWikiGraphIndex({ schema_version: 2, nodes: [], edges: [] })), false);
});

test('buildWikiGraphIndex validates node id formats and edge endpoint kinds', () => {
  assert.throws(
    () => buildWikiGraphIndex({
      schema_version: 1,
      nodes: [{ id: 'source:src/other.ts', kind: 'source', path: 'src/server.ts' }],
      edges: []
    }),
    (error: any) => error instanceof WikiGraphError && /expected source:src\/server\.ts/.test(error.message)
  );

  assert.throws(
    () => buildWikiGraphIndex({
      schema_version: 1,
      nodes: [{ id: 'module:bad:id', kind: 'module', path: 'Module.md' }],
      edges: []
    }),
    (error: any) => error instanceof WikiGraphError && /module:<id> format/.test(error.message)
  );

  const graph = buildWikiGraphIndex({
    schema_version: 1,
    nodes: [
      { id: 'module:service', kind: 'module', path: 'Service.md' },
      { id: 'page:Service.md', kind: 'page', path: 'Service.md' },
      { id: 'source:src/service.ts', kind: 'source', path: 'src/service.ts' },
      { id: 'source:docs/reference.md', kind: 'documentation', path: 'docs/reference.md' }
    ],
    edges: [
      { type: 'owns', from: 'module:service', to: 'page:Service.md' },
      { type: 'owns', from: 'module:service', to: 'source:src/service.ts' },
      { type: 'owns', from: 'module:service', to: 'source:docs/reference.md' },
      { type: 'affects', from: 'module:service', to: 'page:Service.md' },
      { type: 'provenance', from: 'page:Service.md', to: 'source:docs/reference.md' }
    ]
  });

  assert.deepEqual(getOutgoingEdges(graph, 'module:service').map((edge) => edge.type), [
    'affects',
    'owns',
    'owns',
    'owns'
  ]);
});
