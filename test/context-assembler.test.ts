import test from 'node:test';
import assert from 'node:assert/strict';
import { assemblePageContext } from '../src/context-assembler.js';

function createFixture() {
  const githubToken = `ghp_${'1234567890'.repeat(4)}`;
  const githubFineGrainedToken = `github_pat_${'A'.repeat(24)}`;
  const gitlabToken = `glpat-${'A'.repeat(20)}`;
  const npmToken = `npm_${'B'.repeat(20)}`;
  const bearerToken = `Bearer ${'abcDEF1234567890._'.repeat(2)}`;
  const apiTokenAssignment = `API_${'TOKEN'}=${'super'}-${'secret'}-${'value'}`;
  const highEntropyEnvAssignment = `SESSION_ID=${'AbC123xyZ987'.repeat(3)}`;

  const manifest = {
    files: [
      {
        path: 'src/b.ts',
        category: 'source',
        language: 'TypeScript',
        imports: ['./a.ts'],
        exported_symbols: [{ name: 'run', kind: 'function' }],
        environment_variables: ['API_KEY'],
        route_surfaces: [{ kind: 'http-route', framework: 'express', methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'], path: '/api/items', handler: 'run' }],
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
        symbols: [{ name: 'fallbackTestSymbol', kind: 'function' }],
        environment_variables: [],
        route_surfaces: [],
        runtime_hints: [],
        reasons: ['test']
      },
      {
        path: 'db/migrations/001-create-user.ts',
        category: 'data',
        language: 'TypeScript',
        imports: [],
        exported_symbols: [],
        symbols: [{ name: 'User', kind: 'class' }],
        environment_variables: [],
        route_surfaces: [],
        migration_surfaces: [{ kind: 'migration-file', id: '001', name: 'create-user' }],
        model_surfaces: [{ name: 'User', kind: 'model', framework: 'prisma' }],
        runtime_hints: [],
        reasons: ['data-model', 'database-migration', 'orm-model']
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
          claims: [{ text: `Use tokens ${githubToken} ${githubFineGrainedToken} ${gitlabToken} ${npmToken} ${bearerToken}` }],
          validation: { commands: [`${apiTokenAssignment} ${highEntropyEnvAssignment} repo-wiki run`] }
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
      maxChars: 1000,
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

test('assemblePageContext redacts secret-like documentation excerpt values', () => {
  const { manifest, plan } = createFixture();
  const context = assemblePageContext({
    manifest,
    plan,
    page: { path: 'Open-Questions.md', phase: 'foundation' }
  });

  const readme = context.documentation_inputs.find((doc: any) => doc.path === 'README.md');
  assert.ok(readme, 'expected README documentation input');
  assert.match(readme.excerpt, /\[REDACTED\]/);
  assert.doesNotMatch(readme.excerpt, /\d+\[REDACTED\]/);
  assert.doesNotMatch(readme.excerpt, /ghp_[A-Za-z0-9_]+/);
  assert.doesNotMatch(readme.excerpt, /github_pat_[A-Za-z0-9_]+/);
  assert.doesNotMatch(readme.excerpt, /glpat-[A-Za-z0-9_-]+/);
  assert.doesNotMatch(readme.excerpt, /npm_[A-Za-z0-9]+/);
  assert.doesNotMatch(readme.excerpt, /Bearer [A-Za-z0-9._]+/);
  assert.doesNotMatch(readme.excerpt, /super-secret-value/);
  assert.doesNotMatch(readme.excerpt, /AbC123xyZ987/);
});

test('assemblePageContext honors explicit zero budget caps', () => {
  const { manifest, plan } = createFixture();
  const context = assemblePageContext({
    manifest,
    plan,
    page: { path: 'Module-Core.md', phase: 'modules', moduleName: 'Core' },
    budget: {
      maxSourceCards: 0,
      maxDocumentationCards: 0,
      maxExcerptChars: 0
    }
  });

  assert.equal(context.budget.maxSourceCards, 0);
  assert.equal(context.budget.maxDocumentationCards, 0);
  assert.equal(context.budget.maxExcerptChars, 0);
  assert.deepEqual(context.source_inputs, []);
  assert.deepEqual(context.documentation_inputs, []);
  assert.deepEqual(context.omitted.source_cards, ['src/a.ts', 'src/b.ts']);
});

test('assemblePageContext tracks documentation omissions from character budget and one-character excerpts', () => {
  const { manifest, plan } = createFixture();
  const context = assemblePageContext({
    manifest: {
      ...manifest,
      files: [],
    },
    plan,
    page: { path: 'Open-Questions.md', phase: 'foundation' },
    budget: {
      maxChars: 110,
      maxDocumentationCards: 10,
      maxExcerptChars: 1
    }
  });

  assert.equal(context.documentation_inputs.length, 1);
  assert.equal(context.documentation_inputs[0].excerpt, '…');
  assert.equal(context.budget.usedChars, JSON.stringify(context.documentation_inputs[0]).length);
  assert.ok(context.budget.usedChars <= context.budget.maxChars);
  assert.deepEqual(context.omitted.documentation_cards, ['docs/guide.md']);
  assert.ok(context.omitted.excerpts.includes('docs:README.md'));
  assert.ok(context.omitted.reasons.includes('max_chars_exceeded'));
});

test('assemblePageContext serializes exported symbol objects as symbol names', () => {
  const { manifest, plan } = createFixture();
  const context = assemblePageContext({
    manifest,
    plan,
    page: { path: 'Module-Core.md', phase: 'modules', moduleName: 'Core' }
  });

  const sourceInputsText = JSON.stringify(context.source_inputs);
  assert.doesNotMatch(sourceInputsText, /\[object Object\]/);
  assert.deepEqual(context.source_inputs.find((input: any) => input.path === 'src/a.ts')?.symbols, ['helper']);
  assert.deepEqual(context.source_inputs.find((input: any) => input.path === 'src/b.ts')?.symbols, ['run']);
});

test('assemblePageContext deduplicates duplicate source paths deterministically', () => {
  const { manifest, plan } = createFixture();
  const context = assemblePageContext({
    manifest: {
      ...manifest,
      files: [...manifest.files, { ...manifest.files[0] }]
    },
    plan,
    page: { path: 'Module-Core.md', phase: 'modules', moduleName: 'Core' }
  });

  assert.deepEqual(context.source_paths, ['src/a.ts', 'src/b.ts']);
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
  assert.deepEqual(foundationContext.documentation_inputs.map((doc: any) => doc.path), ['README.md', 'docs/guide.md']);
});

test('assemblePageContext falls back to symbols when exported symbols is empty', () => {
  const { manifest, plan } = createFixture();
  const context = assemblePageContext({
    manifest,
    plan,
    page: { path: 'Testing-Strategy.md', phase: 'cross-cutting' }
  });

  const testInput = context.source_inputs.find((input: any) => input.path === 'test/a.test.ts');
  assert.ok(testInput, 'expected test source input');
  assert.match(testInput.excerpt, /symbols=fallbackTestSymbol/);
});

test('assemblePageContext includes bounded structured route, migration, model, and environment summaries', () => {
  const { manifest, plan } = createFixture();

  const apiContext = assemblePageContext({
    manifest,
    plan,
    page: { path: 'API-HTTP-Routes.md', phase: 'cross-cutting' }
  });
  assert.deepEqual(apiContext.source_inputs[0].environment_variables, ['API_KEY']);
  assert.deepEqual(apiContext.source_inputs[0].routes, [{
    kind: 'http-route',
    framework: 'express',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    path: '/api/items',
    handler: 'run'
  }]);

  const dataContext = assemblePageContext({
    manifest,
    plan,
    page: { path: 'Data-Model-and-Migrations.md', phase: 'cross-cutting' }
  });
  assert.deepEqual(dataContext.source_paths, ['db/migrations/001-create-user.ts']);
  assert.deepEqual(dataContext.source_inputs[0].migrations, [{ kind: 'migration-file', id: '001', name: 'create-user' }]);
  assert.deepEqual(dataContext.source_inputs[0].models, [{ name: 'User', kind: 'model', framework: 'prisma' }]);
});

test('assemblePageContext applies table-driven cross-cutting selectors and metadata', () => {
  const { manifest, plan } = createFixture();
  const cases = [
    {
      page: { path: 'Dependency-Map.md', phase: 'cross-cutting' },
      sourcePaths: ['src/a.ts', 'src/b.ts', 'test/a.test.ts'],
      metadata: {
        dependency_graph: { edges: 2, importers: 2, imported_files: 1 },
        test_to_source: { mapped_tests: 1, source_files: 1 },
        package_scripts: [{ path: 'package.json', script_count: 1 }]
      }
    },
    {
      page: { path: 'Configuration-and-Environment.md', phase: 'cross-cutting' },
      sourcePaths: ['src/b.ts'],
      metadata: {
        dependency_graph: { edges: 2, importers: 2, imported_files: 1 },
        test_to_source: { mapped_tests: 1, source_files: 1 }
      }
    },
    {
      page: { path: 'Data-Model-and-Migrations.md', phase: 'cross-cutting' },
      sourcePaths: ['db/migrations/001-create-user.ts'],
      metadata: {
        dependency_graph: { edges: 2, importers: 2, imported_files: 1 },
        test_to_source: { mapped_tests: 1, source_files: 1 }
      }
    }
  ];

  for (const entry of cases) {
    const context = assemblePageContext({ manifest, plan, page: entry.page });
    assert.deepEqual(context.source_paths, entry.sourcePaths, entry.page.path);
    assert.deepEqual(context.metadata, entry.metadata, entry.page.path);
  }
});

test('assemblePageContext reports source and documentation budget omission reasons', () => {
  const { manifest, plan } = createFixture();
  const context = assemblePageContext({
    manifest,
    plan,
    page: { path: 'Open-Questions.md', phase: 'foundation' },
    budget: {
      maxSourceCards: 1,
      maxDocumentationCards: 1,
      maxExcerptChars: 20
    }
  });

  assert.equal(context.source_inputs.length, 1);
  assert.equal(context.documentation_inputs.length, 1);
  assert.ok(context.omitted.source_cards.length > 0);
  assert.ok(context.omitted.documentation_cards.length > 0);
  assert.ok(context.omitted.reasons.includes('max_source_cards_exceeded'));
  assert.ok(context.omitted.reasons.includes('max_documentation_cards_exceeded'));
});

test('assemblePageContext preserves source ranges for Build-Test-and-Run metadata', () => {
  const { manifest, plan } = createFixture();
  const context = assemblePageContext({
    manifest: {
      ...manifest,
      analysis: {
        ...manifest.analysis,
        package_scripts: [{
          path: 'package.json',
          scripts: { test: 'node --test' },
          script_sources: [{ name: 'test', line: 8 }]
        }],
        ci_workflow_command_sources: [
          { path: '.github/workflows/ci.yml', command: 'npm ci', line: 12, end_line: 14 }
        ]
      }
    },
    plan,
    page: { path: 'Build-Test-and-Run.md', phase: 'foundation' }
  });

  assert.deepEqual(context.metadata, {
    package_scripts: [{
      path: 'package.json',
      script_count: 1,
      script_sources: [{ name: 'test', line: 8 }]
    }],
    ci_workflow_command_sources: [
      { path: '.github/workflows/ci.yml', command: 'npm ci', line: 12, end_line: 14 }
    ]
  });
});
