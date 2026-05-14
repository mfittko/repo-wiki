import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { compileWiki, computeArchDecision } from '../src/compiler.js';
import { lintWiki } from '../src/linter.js';
import { extractHumanNotes } from '../src/page-ownership.js';
import { MockLLMProvider } from '../src/llm-provider.js';
import type { LLMProvider, LLMRequest, LLMResponse } from '../src/llm-provider.js';

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

    assert.match(buildPage, /source_paths: \["package\.json"\]/);
    assert.match(buildPage, /Package scripts/);
    assert.match(buildPage, /node --test/);
    assert.match(dependencyPage, /source_paths: \["src\/index\.js","src\/utils\.js","test\/index\.test\.js"\]/);
    assert.match(dependencyPage, /Resolved internal dependency edges/);
    assert.match(dependencyPage, /src\/utils\.js/);
    assert.match(configPage, /source_paths: \["src\/index\.js"\]/);
    assert.match(configPage, /APP_MODE/);
    assert.match(configPage, /PORT/);
    assert.match(routesPage, /source_paths: \["src\/index\.js"\]/);
    assert.match(routesPage, /\/health/);
    assert.match(routesPage, /healthCheck/);
    assert.match(testingPage, /source_paths: \["src\/index\.js","test\/index\.test\.js"\]/);
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

test('compileWiki redacts sensitive CI command arguments in Build-Test-and-Run output', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'aa11bb22cc33',
    mode: 'bootstrap',
    totals: {
      languages: { YAML: 1, JSON: 1 },
      categories: { ci: 1, config: 1 },
      runtime_hints: {}
    },
    files: [
      {
        path: '.github/workflows/ci.yml',
        category: 'ci',
        language: 'YAML',
        imports: [],
        runtime_hints: [],
        reasons: ['ci']
      },
      {
        path: 'package.json',
        category: 'config',
        language: 'JSON',
        imports: [],
        runtime_hints: [],
        reasons: ['config']
      }
    ],
    analysis: {
      package_scripts: [],
      ci_workflow_command_sources: [
        {
          path: '.github/workflows/ci.yml',
          command: 'curl -H "authorization: bearer super-secret-token" https://example.test',
          line: 12
        },
        {
          path: '.github/workflows/ci.yml',
          command: 'npm run deploy --token abc123',
          line: 18
        }
      ]
    }
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan: createPlan() });

  try {
    await compileWiki({ scanDir, planFile, wikiDir });

    const buildPage = await fs.readFile(path.join(wikiDir, 'Build-Test-and-Run.md'), 'utf8');
    assert.match(buildPage, /authorization: bearer \[REDACTED\]/i);
    assert.doesNotMatch(buildPage, /super-secret-token/);
    assert.match(buildPage, /--token \[REDACTED\]/);
    assert.doesNotMatch(buildPage, /--token abc123/);
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

test('compileWiki renders source file paths as commit-pinned GitHub links when remote is GitHub', async () => {
  const manifest = {
    remote: 'git@github.com:owner/example.git',
    commit: 'abc123456789',
    mode: 'bootstrap',
    totals: {
      languages: { TypeScript: 2, JSON: 1 },
      categories: { source: 1, test: 1, config: 1 },
      runtime_hints: {}
    },
    files: [
      { path: 'package.json', category: 'config', language: 'JSON', imports: [], runtime_hints: [], reasons: ['config'] },
      { path: 'src/file [with] spaces.ts', category: 'source', language: 'TypeScript', imports: [], runtime_hints: [], reasons: ['source'] },
      { path: 'test/file with spaces.test.ts', category: 'test', language: 'TypeScript', imports: ['../src/file [with] spaces.ts'], runtime_hints: [], reasons: ['test'] }
    ],
    analysis: {
      package_scripts: [{
        path: 'package.json',
        name: 'example',
        scripts: { test: 'node --test' },
        script_sources: [{ name: 'test', line: 7 }]
      }],
      ci_workflow_command_sources: [
        { path: '.github/workflows/ci.yml', command: 'npm ci', line: 12, end_line: 13 }
      ],
      dependency_graph: {
        edges: [{ from: 'test/file with spaces.test.ts', to: 'src/file [with] spaces.ts', specifier: '../src/file [with] spaces.ts' }],
        summary: { edges: 1, importers: 1, imported_files: 1 }
      },
      test_to_source: {
        mappings: [{ test: 'test/file with spaces.test.ts', sources: ['src/file [with] spaces.ts'], heuristics: ['imports'] }],
        summary: { mapped_tests: 1, source_files: 1 }
      }
    }
  };

  const plan = {
    pages: createPlan().pages,
    modules: [
      {
        slug: 'Module-Source',
        name: 'Source',
        files: ['src/file [with] spaces.ts'],
        categories: { source: 1 },
        languages: { TypeScript: 1 },
        runtime_hints: {},
        important_reasons: ['source']
      }
    ]
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan });

  try {
    await compileWiki({ scanDir, planFile, wikiDir });

    const modulePage = await fs.readFile(path.join(wikiDir, 'Module-Source.md'), 'utf8');
    const buildPage = await fs.readFile(path.join(wikiDir, 'Build-Test-and-Run.md'), 'utf8');
    const testingPage = await fs.readFile(path.join(wikiDir, 'Testing-Strategy.md'), 'utf8');
    const dependencyPage = await fs.readFile(path.join(wikiDir, 'Dependency-Map.md'), 'utf8');

    assert.ok(modulePage.includes('[src/file \\[with\\] spaces.ts](https://github.com/owner/example/blob/abc123456789/src/file%20%5Bwith%5D%20spaces.ts)'));
    assert.match(buildPage, /\[package\.json\]\(https:\/\/github\.com\/owner\/example\/blob\/abc123456789\/package\.json#L7\)/);
    assert.match(buildPage, /\[\.github\/workflows\/ci\.yml\]\(https:\/\/github\.com\/owner\/example\/blob\/abc123456789\/\.github\/workflows\/ci\.yml#L12-L13\)/);
    assert.match(testingPage, /\[test\/file with spaces\.test\.ts\]\(https:\/\/github\.com\/owner\/example\/blob\/abc123456789\/test\/file%20with%20spaces\.test\.ts\)/);
    assert.ok(dependencyPage.includes('[src/file \\[with\\] spaces.ts](https://github.com/owner/example/blob/abc123456789/src/file%20%5Bwith%5D%20spaces.ts)'));
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
    const sidebarPage = await fs.readFile(path.join(wikiDir, '_Sidebar.md'), 'utf8');
    assert.match(homePage, /page_state: "generated"/);
    assert.match(homePage, /confidence: "medium"/);
    assert.doesNotMatch(homePage, /Last compiled:/);
    assert.doesNotMatch(homePage, /Generated from `origin` at commit `abc123`/);
    assert.match(sidebarPage, /source_commit: "abc123"/);
    assert.match(sidebarPage, /page_state: "generated"/);
    assert.match(sidebarPage, /confidence: "medium"/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki sets high-confidence grounded metadata for generated module pages', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'abc123',
    mode: 'bootstrap',
    totals: { languages: { JavaScript: 1 }, categories: { source: 1 }, runtime_hints: {} },
    files: [{ path: 'src/core.js', category: 'source', language: 'JavaScript', imports: [], runtime_hints: [], reasons: ['source'] }],
    analysis: { package_scripts: [], dependency_graph: { edges: [], summary: {} }, test_to_source: { mappings: [], summary: {} } }
  };

  const plan = {
    pages: createPlan().pages,
    modules: [
      {
        slug: 'Module-Core',
        name: 'Core',
        files: ['src/core.js'],
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
    const modulePage = await fs.readFile(path.join(wikiDir, 'Module-Core.md'), 'utf8');
    assert.match(modulePage, /kind: "module"/);
    assert.match(modulePage, /confidence: "high"/);
    assert.match(modulePage, /claim_status: "grounded"/);
    assert.match(modulePage, /source_paths: \["src\/core\.js"\]/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki routes stale, contradicted, and unvalidated documentation cards to Open Questions', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'abc123',
    mode: 'bootstrap',
    totals: { languages: { Markdown: 3 }, categories: { docs: 3 }, runtime_hints: {} },
    files: [],
    documentation: {
      enabled: true,
      authority: 'secondary',
      summary: { files: 3, claims: 3, stale: 1, commands: 0, env_vars: 0, file_paths: 0 },
      files: [
        { path: 'docs/stale.md', status: 'validated', stale: true, age_days: 400, claims: [{ text: 'old claim' }], validation: { contradictions: [] } },
        { path: 'docs/contradicted.md', status: 'validated', stale: false, age_days: 2, claims: [{ text: 'conflict claim' }], validation: { contradictions: ['conflict'] } },
        { path: 'docs/unvalidated.md', status: 'unvalidated', stale: false, age_days: 1, claims: [{ text: 'unknown claim' }], validation: { contradictions: [] } }
      ]
    },
    analysis: { package_scripts: [], dependency_graph: { edges: [], summary: {} }, test_to_source: { mappings: [], summary: {} } }
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan: createPlan() });

  try {
    await compileWiki({ scanDir, planFile, wikiDir });
    const openQuestions = await fs.readFile(path.join(wikiDir, 'Open-Questions.md'), 'utf8');
    const debtReport = await fs.readFile(path.join(wikiDir, 'Documentation-Debt-Report.md'), 'utf8');

    assert.match(openQuestions, /claim_status: "review-needed"/);
    assert.match(openQuestions, /confidence: "low"/);
    assert.match(openQuestions, /source_paths:/);
    assert.match(openQuestions, /docs\/stale\.md/);
    assert.match(openQuestions, /docs\/contradicted\.md/);
    assert.match(openQuestions, /docs\/unvalidated\.md/);
    assert.match(openQuestions, /`docs\/stale\.md` - .*stale/);
    assert.match(openQuestions, /`docs\/contradicted\.md` - .*contradicted/);
    assert.match(openQuestions, /`docs\/unvalidated\.md` - .*unvalidated/);
    assert.match(openQuestions, /Do not promote these items as authoritative wiki claims until validated/);

    assert.match(debtReport, /source_paths:/);
    assert.match(debtReport, /docs\/stale\.md/);
    assert.match(debtReport, /docs\/contradicted\.md/);
    assert.match(debtReport, /docs\/unvalidated\.md/);
    assert.match(debtReport, /## Findings by category/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki Documentation Debt Report surfaces ADR-specific findings', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'abc123',
    mode: 'bootstrap',
    totals: { languages: { Markdown: 4 }, categories: { docs: 4 }, runtime_hints: {} },
    files: [],
    documentation: {
      enabled: true,
      authority: 'secondary',
      summary: { files: 4, claims: 0, stale: 1, commands: 0, env_vars: 0, file_paths: 0 },
      files: [
        {
          path: 'ADR/0001-current.md',
          status: 'unvalidated',
          authority: 'secondary',
          stale: false,
          age_days: 1,
          claims: [],
          validation: { contradictions: [] },
          adr: { detected: true, status: 'Accepted', superseded: false, superseded_by: null, replaces: null, has_status_metadata: true }
        },
        {
          path: 'docs/adrs/0002-superseded.md',
          status: 'stale',
          authority: 'secondary',
          stale: true,
          age_days: 300,
          claims: [],
          validation: { contradictions: [] },
          adr: { detected: true, status: 'Superseded', superseded: true, superseded_by: 'ADR-0003', replaces: null, has_status_metadata: true }
        },
        {
          path: 'docs/adrs/0000-legacy.md',
          status: 'stale',
          authority: 'secondary',
          stale: true,
          age_days: 400,
          claims: [],
          validation: { contradictions: [] },
          adr: { detected: true, status: null, superseded: false, superseded_by: null, replaces: null, has_status_metadata: false }
        },
        {
          path: 'docs/guide.md',
          status: 'unvalidated',
          authority: 'secondary',
          stale: false,
          age_days: 1,
          claims: [],
          validation: { contradictions: [] },
          adr: { detected: false, status: null, superseded: false, superseded_by: null, replaces: null, has_status_metadata: false }
        }
      ]
    },
    analysis: { package_scripts: [], dependency_graph: { edges: [], summary: {} }, test_to_source: { mappings: [], summary: {} } }
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan: createPlan() });

  try {
    await compileWiki({ scanDir, planFile, wikiDir });
    const debtReport = await fs.readFile(path.join(wikiDir, 'Documentation-Debt-Report.md'), 'utf8');
    assert.match(debtReport, /## ADR validation/);
    assert.match(debtReport, /ADR files detected: 3/);
    assert.match(debtReport, /Superseded ADRs: 1/);
    assert.match(debtReport, /Old ADRs missing status metadata: 1/);
    assert.match(debtReport, /\| `docs\/adrs\/0002-superseded\.md` \| `Superseded` \| `ADR-0003` \| 300 \| ⚠ superseded \|/);
    assert.match(debtReport, /\| `docs\/adrs\/0000-legacy\.md` \| `unknown` \| `-` \| 400 \| ⚠ old without status metadata \|/);
    assert.match(debtReport, /### ADR-specific/);
    assert.match(debtReport, /`docs\/adrs\/0002-superseded\.md` - superseded ADR \(superseded by ADR-0003\)\./);
    assert.match(debtReport, /`docs\/adrs\/0000-legacy\.md` - stale ADR missing explicit status metadata\./);
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
    assert.equal(extractHumanNotes(secondPage), humanNotes);
    assert.match(secondPage, /page_state: "mixed"/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki preserves whitespace-only HUMAN_NOTES without marking the page mixed', async () => {
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
    await compileWiki({ scanDir, planFile, wikiDir });

    const firstPage = await fs.readFile(path.join(wikiDir, 'Module-Utils.md'), 'utf8');
    const whitespaceNotes = '\n  \t  \n';
    const pageWithWhitespaceNotes = firstPage.replace(
      '<!-- HUMAN_NOTES_START -->\n<!-- HUMAN_NOTES_END -->',
      `<!-- HUMAN_NOTES_START -->${whitespaceNotes}<!-- HUMAN_NOTES_END -->`
    );
    await fs.writeFile(path.join(wikiDir, 'Module-Utils.md'), pageWithWhitespaceNotes, 'utf8');

    await compileWiki({ scanDir, planFile, wikiDir });

    const secondPage = await fs.readFile(path.join(wikiDir, 'Module-Utils.md'), 'utf8');
    assert.equal(extractHumanNotes(secondPage), whitespaceNotes);
    assert.match(secondPage, /page_state: "generated"/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki does not overwrite a human-owned page and summarizes owned_by skips', async () => {
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

    // A human claims ownership of the Home page using owned_by.
    const originalHome = await fs.readFile(path.join(wikiDir, 'Home.md'), 'utf8');
    const ownedHome = originalHome.replace('page_state: "generated"', 'page_state: "generated"\nowned_by: "human"');
    await fs.writeFile(path.join(wikiDir, 'Home.md'), ownedHome, 'utf8');

    // Second compilation – must not touch the human-owned page.
    const result = await compileWiki({ scanDir, planFile, wikiDir });

    const afterRecompile = await fs.readFile(path.join(wikiDir, 'Home.md'), 'utf8');
    assert.equal(afterRecompile, ownedHome);
    assert.equal(result.summary.skipped, 1);
    assert.equal(result.summary.skipped_by_state['human-owned'], 1);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki does not overwrite unmanaged pages by default', async () => {
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

    // Compilation must not implicitly adopt or overwrite the unmanaged page.
    const compileResult = await compileWiki({ scanDir, planFile, wikiDir });

    const result = await fs.readFile(path.join(wikiDir, 'Module-Index.md'), 'utf8');
    assert.equal(result, unmanagedContent);
    assert.equal(compileResult.summary.skipped, 1);
    assert.equal(compileResult.summary.skipped_by_state.unmanaged, 1);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// LLM compiler mode
// ---------------------------------------------------------------------------

function createLLMPlan() {
  return {
    pages: createPlan().pages,
    modules: [
      {
        slug: 'Module-Auth',
        name: 'Auth',
        files: ['src/auth.ts'],
        categories: { source: 1 },
        languages: { TypeScript: 1 },
        runtime_hints: {},
        important_reasons: ['source']
      }
    ]
  };
}

function validLLMTestContent(req: LLMRequest): string {
  const sourcePaths = req.sourcePaths?.length ? req.sourcePaths : ['src/auth.ts'];
  const frontmatter = [
    '---',
    `kind: ${JSON.stringify(req.archetype)}`,
    'compiled_at: "mock"',
    'source_repo: "mock"',
    'source_commit: "mock"',
    'page_state: "generated"',
    ...(req.archetype === 'architecture' ? ['confidence: "medium"', 'claim_status: "grounded"'] : []),
    `source_paths: ${JSON.stringify(sourcePaths)}`,
    '---',
    '',
    `# ${req.pageTitle}`,
    '',
    `> Archetype: ${req.archetype}`,
    '',
  ];

  if (req.archetype === 'architecture') {
    frontmatter.push(
      '## Executive Architecture Summary',
      '',
      'Test architecture summary.',
      '',
      '## System and Repository Context',
      '',
      'Test repository context.',
      '',
      '## Major Modules and Responsibilities',
      '',
      'Test module responsibilities.',
      '',
      '## Runtime, Data, and Control-Flow Relationships',
      '',
      'Test runtime relationships.',
      '',
      '## Build, Test, Deployment, and Operational Surfaces',
      '',
      'Test build surfaces.',
      '',
      '## Cross-Cutting Concerns',
      '',
      'Test cross-cutting concerns.',
      '',
      '## Caveats and Open Questions',
      '',
      'Test caveats.',
      '',
    );
  }

  frontmatter.push('<!-- HUMAN_NOTES_START -->', '<!-- HUMAN_NOTES_END -->', '');
  return frontmatter.join('\n');
}

const defaultLLMManifest = {
  remote: 'origin',
  commit: 'llm-test-commit',
  mode: 'bootstrap',
  totals: { languages: { TypeScript: 1 }, categories: { source: 1 }, runtime_hints: {} },
  files: [
    {
      path: 'src/auth.ts',
      category: 'source',
      language: 'TypeScript',
      imports: [],
      runtime_hints: [],
      reasons: ['source']
    }
  ],
  analysis: {
    package_scripts: [],
    dependency_graph: { edges: [], summary: {} },
    test_to_source: { mappings: [], summary: {} }
  }
};

test('compileWiki in LLM mode synthesizes module pages through the mock provider', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  const config = { compiler: { mode: 'llm' } };

  try {
    const result = await compileWiki({ scanDir, planFile, wikiDir, config, _provider: new MockLLMProvider() });

    const modulePage = await fs.readFile(path.join(wikiDir, 'Module-Auth.md'), 'utf8');

    // Mock provider output: valid frontmatter with kind, source_commit, compiled_at, source_paths
    assert.match(modulePage, /kind: "module"/);
    assert.match(modulePage, /source_commit: "llm-test-commit"/);
    assert.match(modulePage, /page_state: "generated"/);
    assert.match(modulePage, /source_paths: \["src\/auth\.ts"\]/);
    assert.match(modulePage, /# Auth/);
    assert.match(modulePage, /Generated by the mock LLM provider/);

    // Module page counted
    assert.ok(result.summary.pages > 0);
    // Summary must report compiler mode and per-renderer page counts.
    assert.equal(result.summary.compiler_mode, 'llm');
    // Architecture.md is also synthesized through LLM in LLM mode.
    assert.equal(result.summary.llm_pages, 2);
    assert.ok(result.summary.deterministic_pages >= 1);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki normalizes LLM block-list source_paths without leaving sequence entries', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  const config = { compiler: { mode: 'llm' } };
  const blockListProvider: LLMProvider = {
    name: 'block-list-mock',
    async complete(req: LLMRequest): Promise<LLMResponse> {
      if (req.archetype === 'architecture') {
        return { provider: 'block-list-mock', content: validLLMTestContent(req) };
      }
      return {
        provider: 'block-list-mock',
        content: [
          '---',
          'kind: "module"',
          'compiled_at: "2026-05-10T00:00:00.000Z"',
          'source_repo: "provider-origin"',
          'source_commit: "provider-commit"',
          'source_paths:',
          '  - "src/provider-a.ts"',
          '  - "src/provider-b.ts"',
          'page_state: "generated"',
          'custom_field: "keep-me"',
          '---',
          '',
          '# Auth',
          '',
          'Provider generated body.',
          ''
        ].join('\n')
      };
    }
  };

  try {
    await compileWiki({ scanDir, planFile, wikiDir, config, _provider: blockListProvider });

    const modulePage = await fs.readFile(path.join(wikiDir, 'Module-Auth.md'), 'utf8');
    const frontmatterBlock = modulePage.slice(0, modulePage.indexOf('\n---', 4));

    assert.match(modulePage, /source_repo: "origin"/);
    assert.match(modulePage, /source_commit: "llm-test-commit"/);
    assert.match(modulePage, /page_state: "generated"/);
    assert.match(modulePage, /source_paths: \["src\/auth\.ts"\]/);
    assert.match(modulePage, /custom_field: "keep-me"/);
    assert.doesNotMatch(frontmatterBlock, /^\s+- "src\/provider-[ab]\.ts"/m);
    assert.match(modulePage, /Provider generated body/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in LLM mode normalizes docs-only module evidence conservatively', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'docs-only-commit',
    mode: 'bootstrap',
    totals: { languages: { Markdown: 2, JSON: 1 }, categories: { docs: 2, package: 1 }, runtime_hints: {} },
    files: [
      { path: 'package.json', category: 'package', language: 'JSON', imports: [], runtime_hints: [], reasons: ['package'] },
      { path: 'README.md', category: 'docs', language: 'Markdown', imports: [], runtime_hints: [], reasons: ['docs', 'readme'] },
      { path: 'docs/operations.md', category: 'docs', language: 'Markdown', imports: [], runtime_hints: [], reasons: ['docs'] }
    ],
    documentation: {
      enabled: true,
      authority: 'secondary',
      summary: { files: 2, claims: 1, stale: 0, commands: 0, env_vars: 0, file_paths: 0 },
      files: [
        { path: 'README.md', status: 'unvalidated', authority: 'secondary', stale: false, claims: [{ text: 'The docs describe usage.' }] },
        { path: 'docs/operations.md', status: 'unvalidated', authority: 'secondary', stale: false, claims: [{ text: 'The docs describe operations.' }] }
      ]
    },
    analysis: { package_scripts: [], dependency_graph: { edges: [], summary: {} }, test_to_source: { mappings: [], summary: {} } }
  };
  const plan = {
    pages: createPlan().pages,
    modules: [
      {
        slug: 'Documentation',
        name: 'Documentation',
        files: ['README.md', 'docs/operations.md'],
        categories: { docs: 2 },
        languages: { Markdown: 2 },
        runtime_hints: {},
        important_reasons: ['docs', 'readme']
      }
    ]
  };
  const provider: LLMProvider = {
    name: 'docs-only-mock',
    async complete(req: LLMRequest): Promise<LLMResponse> {
      if (req.archetype === 'architecture') {
        return { provider: 'docs-only-mock', content: validLLMTestContent(req) };
      }
      return {
        provider: 'docs-only-mock',
        content: [
          '---',
          'kind: "module"',
          'compiled_at: "2026-05-10T00:00:00.000Z"',
          'source_repo: "provider-origin"',
          'source_commit: "provider-commit"',
          'source_paths: ["README.md", "docs/operations.md"]',
          'page_state: "generated"',
          'confidence: "high"',
          'claim_status: "source-grounded"',
          '---',
          '',
          '# Documentation',
          '',
          'This page summarizes operational behavior from the documentation set.',
          '',
          '<!-- HUMAN_NOTES_START -->',
          '<!-- HUMAN_NOTES_END -->',
          ''
        ].join('\n')
      };
    }
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan });
  const config = { compiler: { mode: 'llm' } };

  try {
    await compileWiki({ scanDir, planFile, wikiDir, config, _provider: provider });

    const modulePage = await fs.readFile(path.join(wikiDir, 'Documentation.md'), 'utf8');
    assert.match(modulePage, /source_paths: \["README\.md","docs\/operations\.md"\]/);
    assert.match(modulePage, /claim_status: "review-needed"/);
    assert.match(modulePage, /confidence: "low"/);
    assert.doesNotMatch(modulePage, /claim_status: "source-grounded"/);
    assert.doesNotMatch(modulePage, /confidence: "high"/);
    assert.match(modulePage, /markdown documentation is secondary evidence/i);
    assert.match(modulePage, /validated against source code, tests, CI workflows, runtime configuration, or schemas/i);

    const lint = await lintWiki({ wikiDir, scanDir });
    const moduleProvenanceWarning = lint.issues.find((issue) => issue.code === 'missing-source-provenance' && issue.message.includes('Documentation.md'));
    const moduleSourcePathsWarning = lint.issues.find((issue) => issue.code === 'missing-source-paths' && issue.message.includes('Documentation.md'));
    assert.equal(moduleProvenanceWarning, undefined);
    assert.equal(moduleSourcePathsWarning, undefined);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in LLM mode does not overwrite existing page when provider output is invalid', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  const config = { compiler: { mode: 'llm' } };

  // Create a pre-existing "generated" module page that should be preserved on failure.
  await fs.mkdir(wikiDir, { recursive: true });
  const existingContent = [
    '---',
    'source_commit: "old-commit"',
    'kind: "module"',
    'compiled_at: "2024-01-01T00:00:00Z"',
    'source_paths: []',
    'page_state: "generated"',
    '---',
    '',
    '# Auth',
    '',
    'Old deterministic content.',
    ''
  ].join('\n');
  await fs.writeFile(path.join(wikiDir, 'Module-Auth.md'), existingContent, 'utf8');

  // Provider that returns content that fails wiki patch validation (no frontmatter).
  const badProvider: LLMProvider = {
    name: 'bad-mock',
    async complete(_request: LLMRequest): Promise<LLMResponse> {
      return { content: 'just prose, no frontmatter block', provider: 'bad-mock' };
    }
  };

  try {
    await assert.rejects(
      () => compileWiki({ scanDir, planFile, wikiDir, config, _provider: badProvider }),
      /LLM compilation failed.*Module-Auth\.md/s
    );

    // Existing page must be preserved byte-for-byte, and fail-fast semantics
    // must prevent partial writes of deterministic pages from the same run.
    const afterCompile = await fs.readFile(path.join(wikiDir, 'Module-Auth.md'), 'utf8');
    assert.equal(afterCompile, existingContent);
    await assert.rejects(
      () => fs.readFile(path.join(wikiDir, 'Home.md'), 'utf8'),
      (error: any) => error?.code === 'ENOENT'
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki uses validation retries independently from provider transport retries', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  let calls = 0;
  const provider: LLMProvider = {
    name: 'validation-retry-mock',
    async complete(req: LLMRequest): Promise<LLMResponse> {
      calls += 1;
      if (calls === 1) {
        return { content: '# Invalid - no frontmatter', provider: 'validation-retry-mock' };
      }
      if (req.archetype === 'architecture') {
        return { provider: 'validation-retry-mock', content: validLLMTestContent(req) };
      }
      return {
        provider: 'validation-retry-mock',
        content: [
          '---',
          'kind: "module"',
          'compiled_at: "2026-05-10T00:00:00.000Z"',
          'source_repo: "provider-origin"',
          'source_commit: "provider-commit"',
          'source_paths: ["src/auth.ts"]',
          'page_state: "generated"',
          '---',
          '',
          '# Auth',
          '',
          'Valid retry output.',
          ''
        ].join('\n')
      };
    }
  };

  try {
    await compileWiki({
      scanDir,
      planFile,
      wikiDir,
      config: { compiler: { mode: 'llm', llm: { provider: 'mock', retries: 0, validation_retries: 1 } } },
      _provider: provider
    });

    const modulePage = await fs.readFile(path.join(wikiDir, 'Module-Auth.md'), 'utf8');
    // calls: 1 invalid (module) + 1 valid (module retry) + 1 valid (architecture) = 3
    assert.equal(calls, 3);
    assert.match(modulePage, /Valid retry output/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki does not use provider transport retries for validation correction', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  let calls = 0;
  const provider: LLMProvider = {
    name: 'invalid-once-mock',
    async complete(_request: LLMRequest): Promise<LLMResponse> {
      calls += 1;
      return { content: '# Invalid - no frontmatter', provider: 'invalid-once-mock' };
    }
  };

  try {
    await assert.rejects(
      () => compileWiki({
        scanDir,
        planFile,
        wikiDir,
        config: { compiler: { mode: 'llm', llm: { provider: 'mock', retries: 5, validation_retries: 0 } } },
        _provider: provider
      }),
      /LLM compilation failed.*Module-Auth\.md/s
    );
    // calls: 1 module attempt (fails, no retries) + 1 architecture attempt (fails, no retries) = 2
    assert.equal(calls, 2);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in LLM mode preserves human notes on successful synthesis', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  const config = { compiler: { mode: 'llm' } };

  try {
    // First compile in deterministic mode to get a baseline page with HUMAN_NOTES markers.
    await compileWiki({ scanDir, planFile, wikiDir });

    const firstPage = await fs.readFile(path.join(wikiDir, 'Module-Auth.md'), 'utf8');
    assert.match(firstPage, /HUMAN_NOTES_START/);

    // Simulate a human adding notes.
    const humanNotes = '\n## Custom auth notes\n\nThis was written by a human.\n';
    const pageWithNotes = firstPage.replace(
      '<!-- HUMAN_NOTES_START -->\n<!-- HUMAN_NOTES_END -->',
      `<!-- HUMAN_NOTES_START -->${humanNotes}<!-- HUMAN_NOTES_END -->`
    );
    await fs.writeFile(path.join(wikiDir, 'Module-Auth.md'), pageWithNotes, 'utf8');

    // Recompile in LLM mode using the mock provider.
    await compileWiki({ scanDir, planFile, wikiDir, config, _provider: new MockLLMProvider() });

    const afterLLM = await fs.readFile(path.join(wikiDir, 'Module-Auth.md'), 'utf8');

    // Human notes must be preserved.
    assert.equal(extractHumanNotes(afterLLM), humanNotes);
    // Page state must be "mixed" because human notes are non-empty.
    assert.match(afterLLM, /page_state: "mixed"/);
    // LLM content (mock output) must be present.
    assert.match(afterLLM, /Generated by the mock LLM provider/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in LLM mode does not overwrite human-owned module pages', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  const config = { compiler: { mode: 'llm' } };

  // Create a human-owned module page.
  await fs.mkdir(wikiDir, { recursive: true });
  const humanOwnedContent = [
    '---',
    'source_commit: "hand-written"',
    'kind: "module"',
    'compiled_at: "2024-01-01T00:00:00Z"',
    'source_paths: []',
    'page_state: "human-owned"',
    '---',
    '',
    '# Auth',
    '',
    'Human-maintained content.',
    ''
  ].join('\n');
  await fs.writeFile(path.join(wikiDir, 'Module-Auth.md'), humanOwnedContent, 'utf8');

  try {
    const result = await compileWiki({ scanDir, planFile, wikiDir, config, _provider: new MockLLMProvider() });

    const afterCompile = await fs.readFile(path.join(wikiDir, 'Module-Auth.md'), 'utf8');
    assert.equal(afterCompile, humanOwnedContent);
    assert.equal(result.summary.skipped, 1);
    assert.equal(result.summary.skipped_by_state['human-owned'], 1);
    // No errors – human-owned skip is expected behavior, not an LLM failure.
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki honors LLMWIKI_COMPILER_MODE=llm from the environment', async () => {
  const previousMode = process.env.LLMWIKI_COMPILER_MODE;
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });

  try {
    process.env.LLMWIKI_COMPILER_MODE = 'llm';
    await compileWiki({
      scanDir,
      planFile,
      wikiDir,
      config: { compiler: { mode: 'deterministic' } },
      _provider: new MockLLMProvider()
    });

    const modulePage = await fs.readFile(path.join(wikiDir, 'Module-Auth.md'), 'utf8');
    assert.match(modulePage, /Generated by the mock LLM provider/);
    assert.match(modulePage, /source_commit: "llm-test-commit"/);
    assert.match(modulePage, /page_state: "generated"/);
    assert.match(modulePage, /source_paths: \["src\/auth\.ts"\]/);
  } finally {
    if (previousMode === undefined) {
      delete process.env.LLMWIKI_COMPILER_MODE;
    } else {
      process.env.LLMWIKI_COMPILER_MODE = previousMode;
    }
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in LLM mode honors explicit mock provider config without API key', async () => {
  const previousProvider = process.env.LLMWIKI_LLM_PROVIDER;
  const previousKey = process.env.LLMWIKI_LLM_API_KEY;
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });

  try {
    delete process.env.LLMWIKI_LLM_PROVIDER;
    delete process.env.LLMWIKI_LLM_API_KEY;

    const result = await compileWiki({
      scanDir,
      planFile,
      wikiDir,
      config: { compiler: { mode: 'llm', llm: { provider: 'mock' } } }
    });

    const modulePage = await fs.readFile(path.join(wikiDir, 'Module-Auth.md'), 'utf8');
    assert.equal(result.summary.compiler_mode, 'llm');
    // Module-Auth + Architecture.md are both synthesized via LLM.
    assert.equal(result.summary.llm_pages, 2);
    assert.match(modulePage, /Generated by the mock LLM provider/);
  } finally {
    if (previousProvider === undefined) {
      delete process.env.LLMWIKI_LLM_PROVIDER;
    } else {
      process.env.LLMWIKI_LLM_PROVIDER = previousProvider;
    }
    if (previousKey === undefined) {
      delete process.env.LLMWIKI_LLM_API_KEY;
    } else {
      process.env.LLMWIKI_LLM_API_KEY = previousKey;
    }
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in hosted LLM mode fails when the configured API key is missing', async () => {
  const previousMode = process.env.LLMWIKI_COMPILER_MODE;
  const previousKey = process.env.REPO_WIKI_MISSING_TEST_KEY;
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });

  try {
    delete process.env.LLMWIKI_COMPILER_MODE;
    delete process.env.REPO_WIKI_MISSING_TEST_KEY;

    await assert.rejects(
      () => compileWiki({
        scanDir,
        planFile,
        wikiDir,
        config: { compiler: { mode: 'llm', llm: { provider: 'openai-compatible', api_key_env: 'REPO_WIKI_MISSING_TEST_KEY' } } }
      }),
      /requires an API key/
    );
  } finally {
    if (previousMode === undefined) {
      delete process.env.LLMWIKI_COMPILER_MODE;
    } else {
      process.env.LLMWIKI_COMPILER_MODE = previousMode;
    }
    if (previousKey === undefined) {
      delete process.env.REPO_WIKI_MISSING_TEST_KEY;
    } else {
      process.env.REPO_WIKI_MISSING_TEST_KEY = previousKey;
    }
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki skips human-owned and unmanaged module pages before creating an LLM provider', async () => {
  const plan = {
    pages: createPlan().pages,
    modules: [
      { ...createLLMPlan().modules[0], slug: 'Module-Human', name: 'Human' },
      { ...createLLMPlan().modules[0], slug: 'Module-Unmanaged', name: 'Unmanaged' }
    ]
  };
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan });

  try {
    await fs.mkdir(wikiDir, { recursive: true });
    const humanOwned = [
      '---',
      'source_commit: "old"',
      'kind: "module"',
      'compiled_at: "2024-01-01T00:00:00Z"',
      'source_paths: ["src/auth.ts"]',
      'page_state: "human-owned"',
      '---',
      '',
      '# Human page',
      ''
    ].join('\n');
    const unmanaged = '# Unmanaged page\n\nHuman content.\n';
    const humanOwnedArch = [
      '---',
      'source_commit: "old"',
      'kind: "architecture"',
      'compiled_at: "2024-01-01T00:00:00Z"',
      'source_paths: ["src/auth.ts"]',
      'page_state: "human-owned"',
      '---',
      '',
      '# Architecture',
      '',
      'Human-maintained architecture page.',
      ''
    ].join('\n');
    await fs.writeFile(path.join(wikiDir, 'Module-Human.md'), humanOwned, 'utf8');
    await fs.writeFile(path.join(wikiDir, 'Module-Unmanaged.md'), unmanaged, 'utf8');
    await fs.writeFile(path.join(wikiDir, 'Architecture.md'), humanOwnedArch, 'utf8');

    const result = await compileWiki({
      scanDir,
      planFile,
      wikiDir,
      config: { compiler: { mode: 'llm', llm: { provider: 'openai-compatible', api_key_env: 'REPO_WIKI_MISSING_TEST_KEY' } } }
    });

    assert.equal(await fs.readFile(path.join(wikiDir, 'Module-Human.md'), 'utf8'), humanOwned);
    assert.equal(await fs.readFile(path.join(wikiDir, 'Module-Unmanaged.md'), 'utf8'), unmanaged);
    assert.equal(await fs.readFile(path.join(wikiDir, 'Architecture.md'), 'utf8'), humanOwnedArch);
    assert.equal(result.summary.skipped_by_state['human-owned'], 2);
    assert.equal(result.summary.skipped_by_state.unmanaged, 1);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki deterministic mode is unaffected by config presence', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'abc123',
    mode: 'bootstrap',
    totals: { languages: { TypeScript: 1 }, categories: { source: 1 }, runtime_hints: {} },
    files: [{ path: 'src/core.ts', category: 'source', language: 'TypeScript', imports: [], runtime_hints: [], reasons: ['source'] }],
    analysis: { package_scripts: [], dependency_graph: { edges: [], summary: {} }, test_to_source: { mappings: [], summary: {} } }
  };

  const plan = {
    pages: createPlan().pages,
    modules: [
      {
        slug: 'Module-Core',
        name: 'Core',
        files: ['src/core.ts'],
        categories: { source: 1 },
        languages: { TypeScript: 1 },
        runtime_hints: {},
        important_reasons: ['source']
      }
    ]
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan });

  try {
    // Explicit deterministic mode config
    const result = await compileWiki({
      scanDir,
      planFile,
      wikiDir,
      config: { compiler: { mode: 'deterministic' } }
    });

    const modulePage = await fs.readFile(path.join(wikiDir, 'Module-Core.md'), 'utf8');

    // Deterministic renderer output (not mock LLM output)
    assert.match(modulePage, /source_paths: \["src\/core\.ts"\]/);
    assert.doesNotMatch(modulePage, /Generated by the mock LLM provider/);
    // Summary must report deterministic mode and zero LLM-generated pages.
    assert.equal(result.summary.compiler_mode, 'deterministic');
    assert.equal(result.summary.llm_pages, 0);
    assert.ok(result.summary.deterministic_pages >= 1);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Architecture LLM synthesis
// ---------------------------------------------------------------------------

test('compileWiki in LLM mode synthesizes Architecture.md through the mock provider', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  const config = { compiler: { mode: 'llm' } };

  try {
    const result = await compileWiki({ scanDir, planFile, wikiDir, config, _provider: new MockLLMProvider() });

    const archPage = await fs.readFile(path.join(wikiDir, 'Architecture.md'), 'utf8');

    // Architecture page must come from the LLM provider (mock output marker).
    assert.match(archPage, /Generated by the mock LLM provider/);
    assert.match(archPage, /kind: "architecture"/);
    assert.match(archPage, /page_state: "generated"/);
    assert.match(archPage, /source_commit: "llm-test-commit"/);

    // Architecture is counted as an LLM page together with the module page.
    assert.equal(result.summary.llm_pages, 2);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in deterministic mode renders Architecture.md without LLM synthesis', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });

  try {
    const result = await compileWiki({ scanDir, planFile, wikiDir });

    const archPage = await fs.readFile(path.join(wikiDir, 'Architecture.md'), 'utf8');

    // Deterministic renderer output — not from the LLM.
    assert.doesNotMatch(archPage, /Generated by the mock LLM provider/);
    assert.match(archPage, /# Architecture/);
    assert.match(archPage, /first-pass architecture summary/);
    assert.equal(result.summary.llm_pages, 0);
    assert.equal(result.summary.compiler_mode, 'deterministic');
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in LLM mode skips human-owned Architecture.md without overwriting', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  const config = { compiler: { mode: 'llm' } };

  const humanOwnedArch = [
    '---',
    'source_commit: "hand-written"',
    'kind: "architecture"',
    'compiled_at: "2024-01-01T00:00:00Z"',
    'source_paths: ["src/auth.ts"]',
    'page_state: "human-owned"',
    '---',
    '',
    '# Architecture',
    '',
    'Human-maintained architecture page.',
    ''
  ].join('\n');

  await fs.mkdir(wikiDir, { recursive: true });
  await fs.writeFile(path.join(wikiDir, 'Architecture.md'), humanOwnedArch, 'utf8');

  try {
    const result = await compileWiki({ scanDir, planFile, wikiDir, config, _provider: new MockLLMProvider() });

    const afterCompile = await fs.readFile(path.join(wikiDir, 'Architecture.md'), 'utf8');
    assert.equal(afterCompile, humanOwnedArch);
    assert.equal(result.summary.skipped_by_state['human-owned'], 1);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in LLM mode uses architecture archetype for Architecture.md prompt', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  const archetypes: string[] = [];

  const capturingProvider: LLMProvider = {
    name: 'archetype-capturing-mock',
    async complete(req: LLMRequest): Promise<LLMResponse> {
      archetypes.push(req.archetype);
      return {
        provider: 'archetype-capturing-mock',
        content: validLLMTestContent(req)
      };
    }
  };

  try {
    await compileWiki({
      scanDir,
      planFile,
      wikiDir,
      config: { compiler: { mode: 'llm' } },
      _provider: capturingProvider
    });

    assert.ok(archetypes.includes('architecture'), 'Architecture archetype must be used for Architecture.md');
    assert.ok(archetypes.includes('module'), 'Module archetype must be used for module pages');
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in LLM mode keeps architecture-specific system prompt guardrails', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  const capturedSystemPrompts: Record<string, string> = {};

  const capturingProvider: LLMProvider = {
    name: 'system-prompt-capturing-mock',
    async complete(req: LLMRequest): Promise<LLMResponse> {
      capturedSystemPrompts[req.archetype] = req.systemPrompt;
      return {
        provider: 'system-prompt-capturing-mock',
        content: validLLMTestContent(req)
      };
    }
  };

  try {
    await compileWiki({
      scanDir,
      planFile,
      wikiDir,
      config: { compiler: { mode: 'llm', llm: { system_prompt: 'Global custom system prompt.' } } },
      _provider: capturingProvider
    });

    assert.equal(capturedSystemPrompts.module, 'Global custom system prompt.');
    assert.match(capturedSystemPrompts.architecture, /Architecture synthesis rules:/);
    assert.match(capturedSystemPrompts.architecture, /Do not invent unsupported relationships or architectural layers/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in LLM mode normalizes Architecture.md source_paths from the prompt context', async () => {
  const manifest = {
    remote: 'origin',
    commit: 'architecture-budget-test',
    mode: 'bootstrap',
    totals: { languages: { TypeScript: 31 }, categories: { source: 31 }, runtime_hints: {} },
    files: [
      {
        path: 'src/auth.ts',
        category: 'source',
        language: 'TypeScript',
        imports: Array.from({ length: 20 }, (_, index) => `./dep-${index}.js`),
        exported_symbols: Array.from({ length: 20 }, (_, index) => ({ name: `authSymbol${index}${'X'.repeat(40)}` })),
        runtime_hints: [],
        reasons: ['source']
      },
      ...Array.from({ length: 30 }, (_, index) => ({
        path: `src/feature-${String(index).padStart(2, '0')}.ts`,
        category: 'source',
        language: 'TypeScript',
        imports: Array.from({ length: 20 }, (_, depIndex) => `./feature-${index}-dep-${depIndex}.js`),
        exported_symbols: Array.from({ length: 20 }, (_, symbolIndex) => ({ name: `feature${index}Symbol${symbolIndex}${'Y'.repeat(40)}` })),
        runtime_hints: [],
        reasons: ['source']
      }))
    ],
    analysis: { package_scripts: [], dependency_graph: { edges: [], summary: {} }, test_to_source: { mappings: [], summary: {} } }
  };
  const plan = createLLMPlan();
  let capturedArchitectureSourcePaths: string[] = [];

  const capturingProvider: LLMProvider = {
    name: 'source-path-capturing-mock',
    async complete(req: LLMRequest): Promise<LLMResponse> {
      if (req.archetype === 'architecture') {
        capturedArchitectureSourcePaths = req.sourcePaths ?? [];
      }
      return {
        provider: 'source-path-capturing-mock',
        content: validLLMTestContent(req)
      };
    }
  };

  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan });

  try {
    await compileWiki({
      scanDir,
      planFile,
      wikiDir,
      config: { compiler: { mode: 'llm' } },
      _provider: capturingProvider
    });

    assert.ok(capturedArchitectureSourcePaths.length > 0);
    assert.ok(capturedArchitectureSourcePaths.length < 20, 'test fixture should exercise a budgeted architecture context');

    const archPage = await fs.readFile(path.join(wikiDir, 'Architecture.md'), 'utf8');
    const sourcePathsMatch = /^source_paths: (\[[^\n]+\])$/m.exec(archPage);
    assert.ok(sourcePathsMatch, 'Architecture.md should contain normalized source_paths JSON');
    assert.deepEqual(JSON.parse(sourcePathsMatch[1]), capturedArchitectureSourcePaths.slice(0, 20));
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in LLM mode applies architecture request overrides', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  const capturedRequests: Record<string, { maxTokens?: number; reasoningEffort?: string | undefined }> = {};

  const capturingProvider: LLMProvider = {
    name: 'token-capturing-mock',
    async complete(req: LLMRequest): Promise<LLMResponse> {
      capturedRequests[req.archetype] = {
        maxTokens: req.maxTokens,
        reasoningEffort: req.reasoningEffort,
      };
      return {
        provider: 'token-capturing-mock',
        content: validLLMTestContent(req)
      };
    }
  };

  const config = {
    compiler: {
      mode: 'llm',
      llm: {
        provider: 'mock',
        max_output_tokens: 4000,
        reasoning_effort: 'medium',
        page_budgets: {
          architecture: { max_output_tokens: 12000, reasoning_effort: 'low' }
        }
      }
    }
  };

  try {
    await compileWiki({ scanDir, planFile, wikiDir, config, _provider: capturingProvider });

    // Architecture page must receive the architecture-specific request overrides.
    assert.equal(capturedRequests['architecture'].maxTokens, 12000);
    assert.equal(capturedRequests['architecture'].reasoningEffort, 'low');
    // Module pages must receive the global request settings.
    assert.equal(capturedRequests['module'].maxTokens, 4000);
    assert.equal(capturedRequests['module'].reasoningEffort, 'medium');
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in LLM mode preserves human notes on Architecture.md synthesis', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  const config = { compiler: { mode: 'llm' } };

  // Compile in deterministic mode first to create a generated Architecture.md.
  await compileWiki({ scanDir, planFile, wikiDir });
  const firstPage = await fs.readFile(path.join(wikiDir, 'Architecture.md'), 'utf8');

  // Simulate a human adding notes to the architecture page.
  const humanNotes = '\n## Custom architecture notes\n\nThis was written by a human.\n';
  const pageWithNotes = firstPage + `<!-- HUMAN_NOTES_START -->${humanNotes}<!-- HUMAN_NOTES_END -->\n`;
  await fs.writeFile(path.join(wikiDir, 'Architecture.md'), pageWithNotes, 'utf8');

  try {
    await compileWiki({ scanDir, planFile, wikiDir, config, _provider: new MockLLMProvider() });

    const afterLLM = await fs.readFile(path.join(wikiDir, 'Architecture.md'), 'utf8');
    // Human notes must be preserved.
    assert.equal(extractHumanNotes(afterLLM), humanNotes);
    // Page state must be "mixed" because human notes are non-empty.
    assert.match(afterLLM, /page_state: "mixed"/);
    // LLM content must be present.
    assert.match(afterLLM, /Generated by the mock LLM provider/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Architecture.md incremental gating – deterministic mode
// ---------------------------------------------------------------------------

function buildArchManifest(extra: Partial<any> = {}) {
  return {
    remote: 'origin',
    commit: 'arch-test-abc1234',
    mode: 'bootstrap',
    totals: { languages: { TypeScript: 2 }, categories: { source: 2 }, runtime_hints: {} },
    files: [
      { path: 'src/core.ts', category: 'source', language: 'TypeScript', imports: [], runtime_hints: [], reasons: ['source'] },
      { path: 'src/utils.ts', category: 'source', language: 'TypeScript', imports: [], runtime_hints: [], reasons: ['source'] }
    ],
    analysis: { package_scripts: [], dependency_graph: { edges: [], summary: {} }, test_to_source: { mappings: [], summary: {} } },
    ...extra
  };
}

function buildArchPlan(modules: any[] = []) {
  return {
    pages: createPlan().pages,
    modules: modules.length > 0 ? modules : [
      { slug: 'Module-Core', name: 'Core', files: ['src/core.ts'], categories: { source: 1 }, languages: { TypeScript: 1 }, runtime_hints: {}, important_reasons: ['source'] },
      { slug: 'Module-Utils', name: 'Utils', files: ['src/utils.ts'], categories: { source: 1 }, languages: { TypeScript: 1 }, runtime_hints: {}, important_reasons: ['source'] }
    ]
  };
}

test('computeArchDecision returns full-regenerated when no existing content', () => {
  const newContent = '---\nsource_commit: "abc"\ncompiled_at: "T"\n---\n# Architecture\n\n## Structural map\n\n```mermaid\nflowchart TD\n  Repo[Repository at abc1234]\n  Repo --> M0[Core]\n```\n\n## Module groups\n\n### Core\n\n- Files: 1\n';
  assert.equal(computeArchDecision(newContent, null), 'full-regenerated');
});

test('computeArchDecision returns skipped when content unchanged after normalizing volatile fields', () => {
  const body = '# Architecture\n\n## Structural map\n\n```mermaid\nflowchart TD\n  Repo[Repository at abc1234]\n  Repo --> M0[Core]\n```\n\n## Module groups\n\n### Core\n\n- Files: 1\n- Dominant categories: source\n- Dominant languages: TypeScript\n- Important reasons: source\n';
  const existing = `---\nsource_commit: "abc"\ncompiled_at: "2025-01-01T00:00:00Z"\n---\n${body}`;
  // New content has a different compiled_at (timestamp) but same source_commit and same body
  const newContent = `---\nsource_commit: "abc"\ncompiled_at: "2025-02-01T00:00:00Z"\n---\n${body}`;
  assert.equal(computeArchDecision(newContent, existing), 'skipped');
});

test('computeArchDecision returns section-patched when module list unchanged but details changed', () => {
  const existing = '---\ncompiled_at: "T1"\n---\n# Architecture\n\n## Structural map\n\n```mermaid\nflowchart TD\n  Repo[Repository at abc1234]\n  Repo --> M0[Core]\n```\n\n## Module groups\n\n### Core\n\n- Files: 1\n- Dominant categories: source\n';
  const newContent = '---\ncompiled_at: "T2"\n---\n# Architecture\n\n## Structural map\n\n```mermaid\nflowchart TD\n  Repo[Repository at def5678]\n  Repo --> M0[Core]\n```\n\n## Module groups\n\n### Core\n\n- Files: 5\n- Dominant categories: source\n';
  assert.equal(computeArchDecision(newContent, existing), 'section-patched');
});

test('computeArchDecision returns full-regenerated when module list changes', () => {
  const existing = '---\ncompiled_at: "T1"\n---\n# Architecture\n\n## Structural map\n\n```mermaid\nflowchart TD\n  Repo[Repository at abc1234]\n  Repo --> M0[Core]\n```\n\n## Module groups\n\n### Core\n\n- Files: 1\n';
  // New content adds a second module
  const newContent = '---\ncompiled_at: "T2"\n---\n# Architecture\n\n## Structural map\n\n```mermaid\nflowchart TD\n  Repo[Repository at def5678]\n  Repo --> M0[Core]\n  Repo --> M1[Utils]\n```\n\n## Module groups\n\n### Core\n\n- Files: 1\n\n### Utils\n\n- Files: 2\n';
  assert.equal(computeArchDecision(newContent, existing), 'full-regenerated');
});

test('computeArchDecision returns full-regenerated when existing has no module list', () => {
  const existing = '---\ncompiled_at: "T1"\n---\n# Architecture\n\nSome content without structural map.\n';
  const newContent = '---\ncompiled_at: "T2"\n---\n# Architecture\n\n## Structural map\n\n```mermaid\nflowchart TD\n  Repo[Repository at abc1234]\n  Repo --> M0[Core]\n```\n';
  assert.equal(computeArchDecision(newContent, existing), 'full-regenerated');
});

test('compileWiki deterministic mode keeps Architecture.md byte-stable on re-compile with unchanged manifest', async () => {
  const manifest = buildArchManifest();
  const plan = buildArchPlan();
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan });

  try {
    // First compile – creates Architecture.md
    const result1 = await compileWiki({ scanDir, planFile, wikiDir });
    const after1 = await fs.readFile(path.join(wikiDir, 'Architecture.md'), 'utf8');
    assert.equal(result1.summary.architecture_decision, 'full-regenerated');

    // Second compile – same manifest, same plan: should skip writing
    const result2 = await compileWiki({ scanDir, planFile, wikiDir });
    const after2 = await fs.readFile(path.join(wikiDir, 'Architecture.md'), 'utf8');

    // File must be byte-stable (not rewritten)
    assert.equal(after2, after1, 'Architecture.md must be byte-stable when inputs are unchanged');
    assert.equal(result2.summary.architecture_decision, 'skipped');
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki deterministic mode applies section-patched decision when module details change within same module list', async () => {
  const manifest = buildArchManifest();
  const plan = buildArchPlan();
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan });

  try {
    // First compile
    const result1 = await compileWiki({ scanDir, planFile, wikiDir });
    assert.equal(result1.summary.architecture_decision, 'full-regenerated');

    // Simulate a change that alters module details (more files in Core) but NOT the module list
    const planWithMoreFiles = {
      ...plan,
      modules: [
        { ...plan.modules[0], files: ['src/core.ts', 'src/extra.ts'] },
        plan.modules[1]
      ]
    };
    await fs.writeFile(planFile, JSON.stringify(planWithMoreFiles, null, 2));

    const result2 = await compileWiki({ scanDir, planFile, wikiDir });
    const after2 = await fs.readFile(path.join(wikiDir, 'Architecture.md'), 'utf8');
    assert.equal(result2.summary.architecture_decision, 'section-patched');
    // Content must reflect the new file count
    assert.match(after2, /Files: 2/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki deterministic mode applies full-regenerated when module list changes', async () => {
  const manifest = buildArchManifest();
  const plan = buildArchPlan();
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan });

  try {
    // First compile
    await compileWiki({ scanDir, planFile, wikiDir });

    // Add a new module (changes the module list)
    const planWithExtraModule = {
      ...plan,
      modules: [
        ...plan.modules,
        { slug: 'Module-Api', name: 'Api', files: ['src/api.ts'], categories: { source: 1 }, languages: { TypeScript: 1 }, runtime_hints: {}, important_reasons: ['api-surface'] }
      ]
    };
    await fs.writeFile(planFile, JSON.stringify(planWithExtraModule, null, 2));

    const result2 = await compileWiki({ scanDir, planFile, wikiDir });
    assert.equal(result2.summary.architecture_decision, 'full-regenerated');
    const after2 = await fs.readFile(path.join(wikiDir, 'Architecture.md'), 'utf8');
    assert.match(after2, /### Api/);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki summary includes architecture_decision field', async () => {
  const manifest = buildArchManifest();
  const plan = buildArchPlan();
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest, plan });

  try {
    const result = await compileWiki({ scanDir, planFile, wikiDir });
    assert.ok('architecture_decision' in result.summary, 'summary must have architecture_decision');
    assert.ok(
      ['skipped', 'section-patched', 'full-regenerated'].includes(result.summary.architecture_decision),
      'architecture_decision must be a valid status'
    );
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Architecture.md incremental gating – LLM mode
// ---------------------------------------------------------------------------

test('compileWiki in LLM mode skips Architecture.md LLM call when fingerprint unchanged', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  const config = { compiler: { mode: 'llm' } };
  let archCallCount = 0;

  const countingProvider: LLMProvider = {
    name: 'counting-mock',
    async complete(req: LLMRequest): Promise<LLMResponse> {
      if (req.archetype === 'architecture') {
        archCallCount++;
      }
      return { provider: 'counting-mock', content: validLLMTestContent(req) };
    }
  };

  try {
    // First compile – architecture LLM call expected
    const result1 = await compileWiki({ scanDir, planFile, wikiDir, config, _provider: countingProvider });
    assert.equal(archCallCount, 1, 'Architecture LLM call expected on first compile');
    assert.equal(result1.summary.architecture_decision, 'full-regenerated');
    const archAfter1 = await fs.readFile(path.join(wikiDir, 'Architecture.md'), 'utf8');
    assert.match(archAfter1, /arch_inputs_fingerprint: "[a-f0-9]{16}"/);

    // Second compile – same manifest/plan: fingerprint matches, LLM call should be skipped
    const result2 = await compileWiki({ scanDir, planFile, wikiDir, config, _provider: countingProvider });
    assert.equal(archCallCount, 1, 'Architecture LLM call must NOT be made when fingerprint matches');
    assert.equal(result2.summary.architecture_decision, 'skipped');

    // Existing LLM-generated Architecture.md must remain unchanged (byte-stable)
    const archAfter2 = await fs.readFile(path.join(wikiDir, 'Architecture.md'), 'utf8');
    assert.equal(archAfter2, archAfter1, 'Architecture.md must be byte-stable when fingerprint matches');
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in LLM mode makes Architecture.md LLM call when fingerprint changes', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  const config = { compiler: { mode: 'llm' } };
  let archCallCount = 0;

  const countingProvider: LLMProvider = {
    name: 'counting-mock-2',
    async complete(req: LLMRequest): Promise<LLMResponse> {
      if (req.archetype === 'architecture') {
        archCallCount++;
      }
      return { provider: 'counting-mock-2', content: validLLMTestContent(req) };
    }
  };

  try {
    // First compile
    await compileWiki({ scanDir, planFile, wikiDir, config, _provider: countingProvider });
    assert.equal(archCallCount, 1);

    // Change the plan by adding a new module (changes architecture fingerprint)
    const updatedPlan = {
      ...createLLMPlan(),
      modules: [
        ...createLLMPlan().modules,
        { slug: 'Module-Extra', name: 'Extra', files: ['src/extra.ts'], categories: { source: 1 }, languages: { TypeScript: 1 }, runtime_hints: {}, important_reasons: ['source'] }
      ]
    };
    await fs.writeFile(planFile, JSON.stringify(updatedPlan, null, 2));

    // Second compile – fingerprint changed, LLM call expected
    const result2 = await compileWiki({ scanDir, planFile, wikiDir, config, _provider: countingProvider });
    assert.equal(archCallCount, 2, 'Architecture LLM call expected when fingerprint changes');
    assert.equal(result2.summary.architecture_decision, 'full-regenerated');
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('compileWiki in LLM mode embeds arch_inputs_fingerprint in Architecture.md frontmatter', async () => {
  const { dir, scanDir, wikiDir, planFile } = await writeFixture({ manifest: defaultLLMManifest, plan: createLLMPlan() });
  const config = { compiler: { mode: 'llm' } };

  try {
    await compileWiki({ scanDir, planFile, wikiDir, config, _provider: new MockLLMProvider() });

    const archPage = await fs.readFile(path.join(wikiDir, 'Architecture.md'), 'utf8');
    assert.match(archPage, /^arch_inputs_fingerprint: "[a-f0-9]{16}"$/m);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

