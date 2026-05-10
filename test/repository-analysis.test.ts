import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRepositoryAnalysis, extractPackageMetadata } from '../src/repository-analysis.js';

test('extractPackageMetadata handles non-package files, valid package files, and invalid JSON', () => {
  assert.equal(extractPackageMetadata('src/index.ts', '{}'), null);
  assert.deepEqual(extractPackageMetadata('package.json', JSON.stringify({
    name: 'repo-wiki',
    scripts: {
      zeta: 'echo z',
      alpha: 'echo a',
      invalid: 123
    }
  })), {
    package_name: 'repo-wiki',
    package_scripts: {
      alpha: 'echo a',
      zeta: 'echo z'
    },
    package_script_sources: [
      { name: 'alpha', line: 1 },
      { name: 'zeta', line: 1 }
    ]
  });
  assert.deepEqual(extractPackageMetadata('package.json', '{ invalid json'), {
    package_name: null,
    package_scripts: {},
    package_script_sources: []
  });
});

test('buildRepositoryAnalysis resolves imports, deduplicates edges, and maps filename-affinity tests', () => {
  const cards = [
    {
      path: 'package.json',
      category: 'package',
      imports: [],
      package_name: 'repo-wiki',
      package_scripts: { test: 'node --test', build: 'tsc' }
    },
    {
      path: 'src/index.ts',
      category: 'source',
      imports: ['./utils', './utils', '../lib/feature', 'express', 'node:fs', 'fs', 'fs/promises', 'path', 'path/posix']
    },
    {
      path: 'src/utils.ts',
      category: 'source',
      imports: []
    },
    {
      path: 'lib/feature/index.ts',
      category: 'source',
      imports: []
    },
    {
      path: 'src/math.ts',
      category: 'source',
      imports: []
    },
    {
      path: 'src/math.test.ts',
      category: 'test',
      imports: []
    },
    {
      path: 'tests/helpers.spec.ts',
      category: 'test',
      imports: []
    },
    {
      path: 'src/helpers.ts',
      category: 'source',
      imports: []
    },
    {
      path: 'src/__tests__/feature.test.ts',
      category: 'test',
      imports: []
    },
    {
      path: 'src/feature.ts',
      category: 'source',
      imports: []
    },
    {
      path: 'test/index.test.ts',
      category: 'test',
      imports: ['../src/index']
    },
    {
      path: 'test/helper.test.ts',
      category: 'test',
      imports: ['../src/helpers.ts', '../test/index.test.ts']
    }
  ];

  const analysis = buildRepositoryAnalysis(cards as any);
  assert.deepEqual(analysis.package_scripts, [
    {
      path: 'package.json',
      name: 'repo-wiki',
      scripts: { build: 'tsc', test: 'node --test' },
      script_sources: []
    }
  ]);

  assert.deepEqual(analysis.dependency_graph.edges, [
    { from: 'src/index.ts', to: 'lib/feature/index.ts', specifier: '../lib/feature' },
    { from: 'src/index.ts', to: 'package:express', specifier: 'express' },
    { from: 'src/index.ts', to: 'src/utils.ts', specifier: './utils' },
    { from: 'test/helper.test.ts', to: 'src/helpers.ts', specifier: '../src/helpers.ts' },
    { from: 'test/helper.test.ts', to: 'test/index.test.ts', specifier: '../test/index.test.ts' },
    { from: 'test/index.test.ts', to: 'src/index.ts', specifier: '../src/index' }
  ]);

  assert.deepEqual(analysis.dependency_graph.nodes, [
    { id: 'file:lib/feature/index.ts', path: 'lib/feature/index.ts', type: 'file' },
    { id: 'file:src/helpers.ts', path: 'src/helpers.ts', type: 'file' },
    { id: 'file:src/index.ts', path: 'src/index.ts', type: 'file' },
    { id: 'file:src/utils.ts', path: 'src/utils.ts', type: 'file' },
    { id: 'file:test/helper.test.ts', path: 'test/helper.test.ts', type: 'file' },
    { id: 'file:test/index.test.ts', path: 'test/index.test.ts', type: 'file' },
    { id: 'package:express', package: 'express', type: 'package' }
  ]);

  assert.deepEqual(analysis.test_to_source.mappings, [
    { heuristics: ['filename_affinity'], sources: ['src/feature.ts'], test: 'src/__tests__/feature.test.ts' },
    { heuristics: ['filename_affinity'], sources: ['src/math.ts'], test: 'src/math.test.ts' },
    { heuristics: ['imports'], sources: ['src/helpers.ts'], test: 'test/helper.test.ts' },
    { heuristics: ['filename_affinity', 'imports'], sources: ['src/index.ts'], test: 'test/index.test.ts' },
    { heuristics: ['filename_affinity'], sources: ['src/helpers.ts'], test: 'tests/helpers.spec.ts' }
  ]);

  assert.deepEqual(analysis.dependency_graph.summary, {
    edges: 6,
    importers: 3,
    imported_files: 5,
    imported_packages: 1
  });
  assert.deepEqual(analysis.test_to_source.summary, {
    mapped_tests: 5,
    source_files: 4
  });
});

test('buildRepositoryAnalysis resolves package subpaths and remains deterministic across card orderings', () => {
  const cards = [
    { path: 'src/main.ts', category: 'source', imports: ['./feature', '@scope/toolkit/runtime', 'lodash/fp'] },
    { path: 'src/feature/index.ts', category: 'source', imports: [] }
  ];

  const forward = buildRepositoryAnalysis(cards as any);
  const reversed = buildRepositoryAnalysis([...cards].reverse() as any);

  assert.deepEqual(forward.dependency_graph.edges, [
    { from: 'src/main.ts', to: 'package:@scope/toolkit', specifier: '@scope/toolkit/runtime' },
    { from: 'src/main.ts', to: 'package:lodash', specifier: 'lodash/fp' },
    { from: 'src/main.ts', to: 'src/feature/index.ts', specifier: './feature' }
  ]);
  assert.deepEqual(forward.dependency_graph.summary, {
    edges: 3,
    importers: 1,
    imported_files: 1,
    imported_packages: 2
  });
  assert.deepEqual(forward.dependency_graph, reversed.dependency_graph);
});
