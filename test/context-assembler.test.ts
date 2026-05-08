import test from 'node:test';
import assert from 'node:assert/strict';
import { assemblePageContext } from '../src/context-assembler.js';

function createFixture() {
  const manifest = {
    files: [
      {
        path: 'src/b.ts',
        category: 'source',
        language: 'TypeScript',
        imports: ['./a.ts'],
        exported_symbols: [{ name: 'run', kind: 'function' }],
        environment_variables: ['API_KEY'],
        route_surfaces: [{ framework: 'express' }],
        runtime_hints: ['http-route', 'environment-variable'],
        reasons: ['api-surface', 'configuration']
      },
      {
        path: 'src/a.ts',
        category: 'source',
        language: 'TypeScript',
        imports: [],
        exported_symbols: [{ name: 'helper', kind: 'function' }],
        environment_variables: [],
        route_surfaces: [],
        runtime_hints: [],
        reasons: ['source']
      },
      {
        path: 'test/a.test.ts',
        category: 'test',
        language: 'TypeScript',
        imports: ['../src/a.ts'],
        exported_symbols: [],
        environment_variables: [],
        route_surfaces: [],
        runtime_hints: [],
        reasons: ['test']
      }
    ],
    documentation: {
      files: [
        {
          path: 'docs/guide.md',
          status: 'stale',
          authority: 'secondary',
          stale: true,
          headings: [{ text: 'Guide' }],
          claims: [{ text: 'Run npm test' }],
          validation: { commands: ['npm test'] }
        },
        {
          path: 'README.md',
          status: 'partially_validated',
          authority: 'secondary',
          stale: false,
          headings: [{ text: 'Readme' }],
          claims: [{ text: 'Use the CLI' }],
          validation: { commands: ['repo-wiki run'] }
        }
      ]
    },
    analysis: {
      dependency_graph: {
        edges: [
          { from: 'src/b.ts', to: 'src/a.ts', specifier: './a.ts' },
          { from: 'test/a.test.ts', to: 'src/a.ts', specifier: '../src/a.ts' }
        ],
        summary: { edges: 2, importers: 2, imported_files: 1 }
      },
      test_to_source: {
        mappings: [{ test: 'test/a.test.ts', sources: ['src/a.ts'], heuristics: ['imports'] }],
        summary: { mapped_tests: 1, source_files: 1 }
      },
      package_scripts: [{ path: 'package.json', scripts: { test: 'node --test' } }]
    }
  };

  const plan = {
    pages: [
      { path: 'Repository-Overview.md', phase: 'foundation' },
      { path: 'Testing-Strategy.md', phase: 'cross-cutting' },
      { path: 'Module-Core.md', phase: 'modules', moduleName: 'Core' }
    ],
    modules: [
      {
        slug: 'Module-Core',
        name: 'Core',
        files: ['src/a.ts', 'src/b.ts']
      }
    ]
  };

  return { manifest, plan };
}

test('assemblePageContext is deterministic across manifest card orderings', () => {
  const { manifest, plan } = createFixture();
  const page = { path: 'Dependency-Map.md', phase: 'cross-cutting' };
  const forward = assemblePageContext({ manifest, plan, page });
  const reversed = assemblePageContext({
    manifest: {
      ...manifest,
      files: [...manifest.files].reverse(),
      documentation: { files: [...manifest.documentation.files].reverse() }
    },
    plan,
    page
  });

  assert.deepEqual(forward, reversed);
});

test('assemblePageContext enforces truncation and tracks omitted inputs', () => {
  const { manifest, plan } = createFixture();
  const context = assemblePageContext({
    manifest,
    plan,
    page: { path: 'Module-Core.md', phase: 'modules', moduleName: 'Core' },
    budget: {
      maxChars: 220,
      maxSourceCards: 1,
      maxDocumentationCards: 1,
      maxExcerptChars: 70
    }
  });

  assert.equal(context.page.type, 'module');
  assert.equal(context.source_inputs.length, 1);
  assert.ok(context.source_inputs[0].excerpt.endsWith('…'));
  assert.deepEqual(context.omitted.source_cards, ['src/b.ts']);
  assert.ok(context.omitted.excerpts.includes('source:src/a.ts'));
});

test('assemblePageContext uses page-type selection for module and cross-cutting pages', () => {
  const { manifest, plan } = createFixture();

  const moduleContext = assemblePageContext({
    manifest,
    plan,
    page: { path: 'Module-Core.md', phase: 'modules', moduleName: 'Core' }
  });
  assert.deepEqual(moduleContext.source_paths, ['src/a.ts', 'src/b.ts']);

  const testingContext = assemblePageContext({
    manifest,
    plan,
    page: { path: 'Testing-Strategy.md', phase: 'cross-cutting' }
  });
  assert.deepEqual(testingContext.source_paths, ['src/a.ts', 'test/a.test.ts']);
  assert.deepEqual(testingContext.metadata, {
    test_to_source: { mapped_tests: 1, source_files: 1 }
  });

  const foundationContext = assemblePageContext({
    manifest,
    plan,
    page: { path: 'Open-Questions.md', phase: 'foundation' }
  });
  assert.deepEqual(foundationContext.documentation_inputs.map((entry: any) => entry.path), ['docs/guide.md', 'README.md']);
});
