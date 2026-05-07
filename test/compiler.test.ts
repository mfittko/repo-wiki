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
