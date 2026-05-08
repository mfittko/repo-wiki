import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { compileWiki } from '../src/compiler.js';

function createPlan() {
  return {
    pages: [
      { path: 'Home.md', phase: 'foundation', purpose: 'Entry point.' },
      { path: '_Sidebar.md', phase: 'foundation', purpose: 'Sidebar.' },
      { path: 'Index.md', phase: 'foundation', purpose: 'Index.' },
      { path: 'Log.md', phase: 'foundation', purpose: 'Log.' },
      { path: 'Agent-Context-Pack.md', phase: 'foundation', purpose: 'Agent entry.' },
      { path: 'Repository-Overview.md', phase: 'foundation', purpose: 'Overview.' },
      { path: 'Architecture.md', phase: 'foundation', purpose: 'Architecture.' },
      { path: 'Build-Test-and-Run.md', phase: 'foundation', purpose: 'Commands.' },
      { path: 'Open-Questions.md', phase: 'foundation', purpose: 'Gaps.' },
      { path: 'Documentation-Debt-Report.md', phase: 'foundation', purpose: 'Docs debt.' },
      { path: 'Dependency-Map.md', phase: 'cross-cutting', purpose: 'Dependencies.' },
      { path: 'Testing-Strategy.md', phase: 'cross-cutting', purpose: 'Tests.' },
      { path: 'Configuration-and-Environment.md', phase: 'cross-cutting', purpose: 'Config.' },
      { path: 'Security-and-Secrets.md', phase: 'cross-cutting', purpose: 'Security.' },
      { path: 'Operational-Runbook.md', phase: 'cross-cutting', purpose: 'Operations.' },
      { path: 'API-HTTP-Routes.md', phase: 'cross-cutting', purpose: 'Routes.' }
    ],
    modules: []
  };
}

async function writeFixture({ manifest, plan }) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-compiler-'));
  const scanDir = path.join(dir, 'scan');
  const wikiDir = path.join(dir, 'wiki');
  const planFile = path.join(dir, 'plan.json');
  await fs.mkdir(scanDir, { recursive: true });
  await fs.writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await fs.writeFile(planFile, JSON.stringify(plan, null, 2));
  return { dir, scanDir, wikiDir, planFile };
}

test('compileWiki renders richer scanner analysis into wiki pages', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'abc123456789',
    mode: 'bootstrap',
    totals: {
      languages: { JavaScript: 3, JSON: 1 },
      categories: { source: 2, test: 1, config: 1 },
      runtime_hints: { 'http-route': 1 }
    },
    files: [
      {
        path: 'package.json',
        category: 'config',
        language: 'JSON',
        imports: [],
        runtime_hints: [],
        reasons: ['config']
      },
      {
        path: 'src/index.js',
        category: 'source',
        language: 'JavaScript',
        imports: ['./utils.js'],
        environment_variables: ['APP_MODE', 'PORT'],
        route_surfaces: [
          {
            framework: 'express',
            target: 'app',
            methods: ['GET'],
            path: '/health',
            handler: 'healthCheck'
          }
        ],
        runtime_hints: ['environment-variable', 'http-route'],
        reasons: ['api-surface', 'configuration']
      },
      {
        path: 'src/utils.js',
        category: 'source',
        language: 'JavaScript',
        imports: [],
        environment_variables: [],
        route_surfaces: [],
        runtime_hints: [],
        reasons: ['source']
      },
      {
        path: 'test/index.test.js',
        category: 'test',
        language: 'JavaScript',
        imports: ['../src/index.js'],
        environment_variables: [],
        route_surfaces: [],
        runtime_hints: [],
        reasons: ['test']
      }
    ],
    analysis: {
      package_scripts: [
        {
          path: 'package.json',
          name: 'fixture-repo',
          scripts: {
            build: 'node build.js',
            test: 'node --test'
          }
        }
      ],
      dependency_graph: {
        edges: [
          { from: 'src/index.js', to: 'src/utils.js', specifier: './utils.js' },
          { from: 'test/index.test.js', to: 'src/index.js', specifier: '../src/index.js' }
        ],
        summary: {
          edges: 2,
          importers: 2,
          imported_files: 2
        }
      },
      test_to_source: {
        mappings: [
          {
            test: 'test/index.test.js',
            sources: ['src/index.js'],
            heuristics: ['imports']
          }
        ],
        summary: {
          mapped_tests: 1,
          source_files: 1
        }
      }
    }
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan: createPlan() });

  try {
    await compileWiki({ scanDir, planFile, wikiDir });

    const buildPage = await fs.readFile(path.join(wikiDir, 'Build-Test-and-Run.md'), 'utf8');
    const dependencyPage = await fs.readFile(path.join(wikiDir, 'Dependency-Map.md'), 'utf8');
    const configPage = await fs.readFile(path.join(wikiDir, 'Configuration-and-Environment.md'), 'utf8');
    const routesPage = await fs.readFile(path.join(wikiDir, 'API-HTTP-Routes.md'), 'utf8');
    const testingPage = await fs.readFile(path.join(wikiDir, 'Testing-Strategy.md'), 'utf8');

    assert.match(buildPage, /Package scripts/);
    assert.match(buildPage, /node --test/);
    assert.match(dependencyPage, /Resolved internal dependency edges/);
    assert.match(dependencyPage, /src\/utils\.js/);
    assert.match(configPage, /APP_MODE/);
    assert.match(configPage, /PORT/);
    assert.match(routesPage, /\/health/);
    assert.match(routesPage, /healthCheck/);
    assert.match(testingPage, /Test-to-source mappings/);
    assert.match(testingPage, /test\/index\.test\.js/);
    assert.match(testingPage, /src\/index\.js/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki falls back cleanly when richer analysis is absent', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'def987654321',
    mode: 'bootstrap',
    totals: {
      languages: { JavaScript: 1 },
      categories: { source: 1 },
      runtime_hints: {}
    },
    files: [
      {
        path: 'src/index.js',
        category: 'source',
        language: 'JavaScript',
        imports: ['./utils.js'],
        runtime_hints: [],
        reasons: ['source']
      }
    ]
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan: createPlan() });

  try {
    await compileWiki({ scanDir, planFile, wikiDir });

    const buildPage = await fs.readFile(path.join(wikiDir, 'Build-Test-and-Run.md'), 'utf8');
    const dependencyPage = await fs.readFile(path.join(wikiDir, 'Dependency-Map.md'), 'utf8');
    const configPage = await fs.readFile(path.join(wikiDir, 'Configuration-and-Environment.md'), 'utf8');
    const testingPage = await fs.readFile(path.join(wikiDir, 'Testing-Strategy.md'), 'utf8');

    assert.match(buildPage, /No package scripts were extracted/);
    assert.match(dependencyPage, /Source file \| Imports/);
    assert.match(configPage, /No explicit environment variable names were extracted/);
    assert.match(testingPage, /The compiler will add direct test-to-source mappings/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki renders related tests in module pages', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'abc123456789',
    mode: 'bootstrap',
    totals: {
      languages: { JavaScript: 2 },
      categories: { source: 1, test: 1 },
      runtime_hints: {}
    },
    files: [
      {
        path: 'src/utils.js',
        category: 'source',
        language: 'JavaScript',
        imports: [],
        runtime_hints: [],
        reasons: ['source']
      },
      {
        path: 'test/utils.test.js',
        category: 'test',
        language: 'JavaScript',
        imports: ['../src/utils.js'],
        runtime_hints: [],
        reasons: ['test']
      }
    ],
    analysis: {
      package_scripts: [],
      dependency_graph: {
        edges: [{ from: 'test/utils.test.js', to: 'src/utils.js', specifier: '../src/utils.js' }],
        summary: { edges: 1, importers: 1, imported_files: 1, imported_packages: 0 }
      },
      test_to_source: {
        mappings: [
          { test: 'test/utils.test.js', sources: ['src/utils.js'], heuristics: ['imports'] }
        ],
        summary: { mapped_tests: 1, source_files: 1 }
      }
    }
  };

  const plan = {
    pages: createPlan().pages,
    modules: [
      {
        slug: 'Module-Utils',
        name: 'Utils',
        files: ['src/utils.js'],
        categories: { source: 1 },
        languages: { JavaScript: 1 },
        runtime_hints: {},
        important_reasons: ['source']
      }
    ]
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan });

  try {
    await compileWiki({ scanDir, planFile, wikiDir });
    const modulePage = await fs.readFile(path.join(wikiDir, 'Module-Utils.md'), 'utf8');
    assert.match(modulePage, /Related tests/);
    assert.match(modulePage, /test\/utils\.test\.js/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki omits Related tests section when no test mappings exist for the module', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'abc123456789',
    mode: 'bootstrap',
    totals: {
      languages: { JavaScript: 1 },
      categories: { source: 1 },
      runtime_hints: {}
    },
    files: [
      {
        path: 'src/utils.js',
        category: 'source',
        language: 'JavaScript',
        imports: [],
        runtime_hints: [],
        reasons: ['source']
      }
    ]
  };

  const plan = {
    pages: createPlan().pages,
    modules: [
      {
        slug: 'Module-Utils',
        name: 'Utils',
        files: ['src/utils.js'],
        categories: { source: 1 },
        languages: { JavaScript: 1 },
        runtime_hints: {},
        important_reasons: ['source']
      }
    ]
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan });

  try {
    await compileWiki({ scanDir, planFile, wikiDir });
    const modulePage = await fs.readFile(path.join(wikiDir, 'Module-Utils.md'), 'utf8');
    assert.doesNotMatch(modulePage, /Related tests/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki renders data-model page for ORM-only manifests', async () => {
  const manifest = {
    mode: 'bootstrap',
    totals: {
      languages: { TypeScript: 1 },
      categories: { source: 1 },
      runtime_hints: { 'data-model': 1, 'orm-model': 1 }
    },
    files: [
      {
        path: 'src/models/user.entity.ts',
        category: 'source',
        language: 'TypeScript',
        imports: [],
        runtime_hints: ['data-model', 'orm-model'],
        reasons: ['data-model', 'orm-model'],
        model_surfaces: [{ name: 'UserEntity', kind: 'entity', framework: 'typeorm' }]
      }
    ]
  };

  const plan = createPlan();
  plan.pages.push({ path: 'Data-Model-and-Migrations.md', phase: 'cross-cutting', purpose: 'Data models and migrations.' });
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan });

  try {
    await compileWiki({ scanDir, planFile, wikiDir });
    const dataPage = await fs.readFile(path.join(wikiDir, 'Data-Model-and-Migrations.md'), 'utf8');
    assert.match(dataPage, /Data Model and Migrations/);
    assert.match(dataPage, /src\/models\/user\.entity\.ts/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Frontmatter: page_state metadata
// ---------------------------------------------------------------------------

test('compileWiki adds page_state: "generated" frontmatter to new pages', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'abc123',
    mode: 'bootstrap',
    totals: { languages: {}, categories: {}, runtime_hints: {} },
    files: []
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan: createPlan() });

  try {
    await compileWiki({ scanDir, planFile, wikiDir });
    const homePage = await fs.readFile(path.join(wikiDir, 'Home.md'), 'utf8');
    assert.match(homePage, /page_state: "generated"/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Human-notes preservation
// ---------------------------------------------------------------------------

test('compileWiki preserves HUMAN_NOTES content byte-for-byte on recompilation', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'abc123',
    mode: 'bootstrap',
    totals: { languages: { JavaScript: 1 }, categories: { source: 1 }, runtime_hints: {} },
    files: [{ path: 'src/utils.js', category: 'source', language: 'JavaScript', imports: [], runtime_hints: [], reasons: ['source'] }],
    analysis: { package_scripts: [], dependency_graph: { edges: [], summary: {} }, test_to_source: { mappings: [], summary: {} } }
  };

  const plan = {
    pages: createPlan().pages,
    modules: [
      {
        slug: 'Module-Utils',
        name: 'Utils',
        files: ['src/utils.js'],
        categories: { source: 1 },
        languages: { JavaScript: 1 },
        runtime_hints: {},
        important_reasons: ['source']
      }
    ]
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan });

  try {
    // First compilation – produces a clean generated page.
    await compileWiki({ scanDir, planFile, wikiDir });

    const firstPage = await fs.readFile(path.join(wikiDir, 'Module-Utils.md'), 'utf8');
    assert.match(firstPage, /page_state: "generated"/);

    // Simulate a human adding notes between the markers.
    const humanNotes = '\n## My custom section\n\nThis was written by a human.\n';
    const pageWithNotes = firstPage.replace(
      '<!-- HUMAN_NOTES_START -->\n<!-- HUMAN_NOTES_END -->',
      `<!-- HUMAN_NOTES_START -->${humanNotes}<!-- HUMAN_NOTES_END -->`
    );
    await fs.writeFile(path.join(wikiDir, 'Module-Utils.md'), pageWithNotes, 'utf8');

    // Second compilation – must preserve the human notes.
    await compileWiki({ scanDir, planFile, wikiDir });

    const secondPage = await fs.readFile(path.join(wikiDir, 'Module-Utils.md'), 'utf8');
    assert.match(secondPage, /This was written by a human\./);
    assert.match(secondPage, /page_state: "mixed"/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki does not overwrite a human-owned page', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'abc123',
    mode: 'bootstrap',
    totals: { languages: {}, categories: {}, runtime_hints: {} },
    files: []
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan: createPlan() });

  try {
    // First compilation.
    await compileWiki({ scanDir, planFile, wikiDir });

    // A human claims ownership of the Home page.
    const originalHome = await fs.readFile(path.join(wikiDir, 'Home.md'), 'utf8');
    const ownedHome = originalHome.replace('page_state: "generated"', 'page_state: "human-owned"');
    await fs.writeFile(path.join(wikiDir, 'Home.md'), ownedHome, 'utf8');

    // Second compilation – must not touch the human-owned page.
    await compileWiki({ scanDir, planFile, wikiDir });

    const afterRecompile = await fs.readFile(path.join(wikiDir, 'Home.md'), 'utf8');
    assert.equal(afterRecompile, ownedHome);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki preserves human notes in unmanaged page (no source_commit)', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'abc123',
    mode: 'bootstrap',
    totals: { languages: { JavaScript: 1 }, categories: { source: 1 }, runtime_hints: {} },
    files: [{ path: 'src/index.js', category: 'source', language: 'JavaScript', imports: [], runtime_hints: [], reasons: ['source'] }],
    analysis: { package_scripts: [], dependency_graph: { edges: [], summary: {} }, test_to_source: { mappings: [], summary: {} } }
  };

  const plan = {
    pages: createPlan().pages,
    modules: [
      {
        slug: 'Module-Index',
        name: 'Index',
        files: ['src/index.js'],
        categories: { source: 1 },
        languages: { JavaScript: 1 },
        runtime_hints: {},
        important_reasons: ['source']
      }
    ]
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan });

  try {
    await fs.mkdir(wikiDir, { recursive: true });

    // Pre-existing unmanaged page with HUMAN_NOTES markers but no source_commit.
    const unmanagedContent = [
      '# Module Index',
      '',
      'Some description.',
      '',
      '<!-- HUMAN_NOTES_START -->',
      'Notes left by a human.',
      '<!-- HUMAN_NOTES_END -->',
      ''
    ].join('\n');
    await fs.writeFile(path.join(wikiDir, 'Module-Index.md'), unmanagedContent, 'utf8');

    // Compilation should adopt the notes from the unmanaged page.
    await compileWiki({ scanDir, planFile, wikiDir });

    const result = await fs.readFile(path.join(wikiDir, 'Module-Index.md'), 'utf8');
    assert.match(result, /Notes left by a human\./);
    assert.match(result, /page_state: "mixed"/);
    // The page should now have proper generated frontmatter.
    assert.match(result, /source_commit:/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

