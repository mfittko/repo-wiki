import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { initProject } from '../src/init.js';
import { createBootstrapPlan } from '../src/planner.js';
import { readJson } from '../src/utils/fs.js';

async function exists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

test('initProject writes defaults, agent pointer, skip behavior, and force overwrite', async () => {
  const repoDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-init-'));

  try {
    const first = await initProject({ repoPath: repoDir, writeAgents: true });
    assert.deepEqual(first.summary.skipped, []);
    assert.ok(first.summary.written.includes('.llmwiki/config.json'));
    assert.ok(first.summary.written.includes('.llmwiki/schema.md'));
    assert.ok(first.summary.written.includes('AGENTS.repo-wiki.md'));
    assert.equal(await exists(path.join(repoDir, '.llmwiki', 'config.json')), true);
    assert.equal(await exists(path.join(repoDir, '.llmwiki', 'schema.md')), true);
    assert.equal(await exists(path.join(repoDir, 'AGENTS.repo-wiki.md')), true);

    const originalPointer = await readFile(path.join(repoDir, 'AGENTS.repo-wiki.md'), 'utf8');
    await writeFile(path.join(repoDir, 'AGENTS.repo-wiki.md'), 'custom\n', 'utf8');

    const second = await initProject({ repoPath: repoDir, writeAgents: true });
    assert.equal(second.summary.written.length, 0);
    assert.ok(second.summary.skipped.includes('AGENTS.repo-wiki.md'));
    assert.equal(await readFile(path.join(repoDir, 'AGENTS.repo-wiki.md'), 'utf8'), 'custom\n');

    const forced = await initProject({ repoPath: repoDir, writeAgents: true, force: true });
    assert.ok(forced.summary.written.includes('AGENTS.repo-wiki.md'));
    assert.equal(await readFile(path.join(repoDir, 'AGENTS.repo-wiki.md'), 'utf8'), originalPointer);
  } finally {
    await rm(repoDir, { recursive: true, force: true });
  }
});

test('createBootstrapPlan groups modules and emits cross-cutting pages from manifest signals', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-plan-'));
  const scanDir = path.join(dir, 'scan');
  const outFile = path.join(dir, 'bootstrap-plan.json');

  try {
    await mkdir(scanDir, { recursive: true });
    await writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify({
      mode: 'bootstrap',
      repo_path: dir,
      remote: 'origin',
      commit: 'abc123',
      totals: {
        runtime_hints: { 'http-route': 1 },
        categories: { data: 1 }
      },
      files: [
        { path: 'apps/web/server.ts', category: 'source', language: 'TypeScript', runtime_hints: ['http-route'], reasons: ['api-surface'], bytes: 100 },
        { path: 'services/auth/index.ts', category: 'source', language: 'TypeScript', runtime_hints: [], reasons: ['auth'], bytes: 100 },
        { path: 'packages/core/index.ts', category: 'source', language: 'TypeScript', runtime_hints: [], reasons: ['source'], bytes: 100 },
        { path: 'src/compiler.ts', category: 'source', language: 'TypeScript', runtime_hints: [], reasons: ['source'], bytes: 100 },
        { path: 'lib/helpers.ts', category: 'source', language: 'TypeScript', runtime_hints: [], reasons: ['source'], bytes: 100 },
        { path: 'infra/docker.ts', category: 'infra', language: 'TypeScript', runtime_hints: ['deployment'], reasons: ['infra'], bytes: 100 },
        { path: 'docs/guide.md', category: 'docs', language: 'Markdown', runtime_hints: [], reasons: ['docs'], bytes: 100 },
        { path: '.github/workflows/ci.yml', category: 'ci', language: 'YAML', runtime_hints: [], reasons: ['ci'], bytes: 100 },
        { path: 'root-file.ts', category: 'source', language: 'TypeScript', runtime_hints: [], reasons: ['source'], bytes: 100 },
        { path: 'db/migrations/001.sql', category: 'data', language: 'SQL', runtime_hints: [], reasons: ['data-model'], bytes: 100 },
        { path: 'src/ignored.ts', category: 'source', language: 'TypeScript', runtime_hints: [], reasons: ['source'], bytes: 1_000_001, skipped_content: true }
      ]
    }, null, 2), 'utf8');

    const result = await createBootstrapPlan({ scanDir, outFile });
    const plan = await readJson(outFile);

    assert.equal(result.summary.outFile, outFile);
    assert.ok(plan.modules.some((module: any) => module.name === 'Service web'));
    assert.ok(plan.modules.some((module: any) => module.name === 'Service auth'));
    assert.ok(plan.modules.some((module: any) => module.name === 'Package core'));
    assert.ok(plan.modules.some((module: any) => module.name === 'Module compiler.ts' || module.name === 'Module compiler'));
    assert.ok(plan.modules.some((module: any) => module.name === 'Module helpers.ts' || module.name === 'Module helpers'));
    assert.ok(plan.modules.some((module: any) => module.name === 'Infrastructure'));
    assert.ok(plan.modules.some((module: any) => module.name === 'Documentation'));
    assert.ok(plan.modules.some((module: any) => module.name === 'CI and Automation'));
    assert.ok(plan.modules.some((module: any) => module.name === 'Repository Root'));
    assert.ok(!plan.modules.some((module: any) => module.files.includes('src/ignored.ts')));
    assert.ok(plan.pages.some((page: any) => page.path === 'API-HTTP-Routes.md'));
    assert.ok(plan.pages.some((page: any) => page.path === 'Data-Model-and-Migrations.md'));
    assert.ok(plan.phases.some((phase: any) => phase.name === 'link-and-lint'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('createBootstrapPlan emits data-model page for ORM-only signal paths', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-plan-orm-'));
  const scanDir = path.join(dir, 'scan');
  const outFile = path.join(dir, 'bootstrap-plan.json');

  try {
    await mkdir(scanDir, { recursive: true });
    await writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify({
      mode: 'bootstrap',
      repo_path: dir,
      remote: 'origin',
      commit: 'abc123',
      totals: {
        runtime_hints: { 'orm-model': 1 },
        categories: { source: 1 }
      },
      files: [
        {
          path: 'src/models/user.entity.ts',
          category: 'source',
          language: 'TypeScript',
          runtime_hints: ['data-model', 'orm-model'],
          reasons: ['data-model', 'orm-model'],
          model_surfaces: [{ name: 'UserEntity', kind: 'entity', framework: 'typeorm' }],
          bytes: 100
        }
      ]
    }, null, 2), 'utf8');

    const result = await createBootstrapPlan({ scanDir, outFile });
    const plan = await readJson(outFile);

    assert.equal(result.summary.outFile, outFile);
    assert.ok(plan.pages.some((page: any) => page.path === 'Data-Model-and-Migrations.md'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('createBootstrapPlan builds affected_page_graph mapping source files to wiki pages', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-plan-affected-'));
  const scanDir = path.join(dir, 'scan');
  const outFile = path.join(dir, 'bootstrap-plan.json');

  try {
    await mkdir(scanDir, { recursive: true });

    // Fixture:
    //   apps/api/server.ts  → Service api module (no imports; imported by client + test + routes)
    //   apps/api/routes.ts  → Service api module (has route surfaces; imports server.ts - same module)
    //   apps/api/config.ts  → Service api module (has environment variables + auth reason)
    //   apps/web/client.ts  → Service web module (imports apps/api/server.ts cross-module)
    //   test/server.test.ts → test file (imports apps/api/server.ts; covers apps/api/server.ts)
    //   docs/guide.md       → doc card (Documentation-Debt-Report.md)
    //   prisma/schema.prisma→ data file (has model surfaces → Data-Model-and-Migrations.md)
    await writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify({
      mode: 'bootstrap',
      repo_path: dir,
      remote: 'origin',
      commit: 'abc123',
      totals: {
        runtime_hints: { 'http-route': 2, 'orm-model': 1 },
        categories: { source: 4, test: 1, data: 1 }
      },
      files: [
        {
          path: 'apps/api/server.ts',
          category: 'source',
          language: 'TypeScript',
          imports: [],
          route_surfaces: [],
          migration_surfaces: [],
          model_surfaces: [],
          environment_variables: [],
          runtime_hints: [],
          reasons: ['source'],
          bytes: 100
        },
        {
          path: 'apps/api/routes.ts',
          category: 'source',
          language: 'TypeScript',
          imports: [],
          route_surfaces: [{ kind: 'http-route', framework: 'express', target: 'router', methods: ['GET'], path: '/health', handler: null }],
          migration_surfaces: [],
          model_surfaces: [],
          environment_variables: [],
          runtime_hints: ['http-route'],
          reasons: ['api-surface'],
          bytes: 100
        },
        {
          path: 'apps/api/config.ts',
          category: 'source',
          language: 'TypeScript',
          imports: [],
          route_surfaces: [],
          migration_surfaces: [],
          model_surfaces: [],
          environment_variables: ['APP_SECRET', 'DB_URL'],
          runtime_hints: ['environment-variable'],
          reasons: ['auth', 'configuration'],
          bytes: 100
        },
        {
          path: 'apps/web/client.ts',
          category: 'source',
          language: 'TypeScript',
          imports: ['../api/server'],
          route_surfaces: [],
          migration_surfaces: [],
          model_surfaces: [],
          environment_variables: [],
          runtime_hints: [],
          reasons: ['source'],
          bytes: 100
        },
        {
          path: 'test/server.test.ts',
          category: 'test',
          language: 'TypeScript',
          imports: ['../apps/api/server'],
          route_surfaces: [],
          migration_surfaces: [],
          model_surfaces: [],
          environment_variables: [],
          runtime_hints: [],
          reasons: ['test'],
          bytes: 100
        },
        {
          path: 'docs/guide.md',
          category: 'docs',
          language: 'Markdown',
          imports: [],
          route_surfaces: [],
          migration_surfaces: [],
          model_surfaces: [],
          environment_variables: [],
          runtime_hints: [],
          reasons: ['docs'],
          bytes: 100
        },
        {
          path: 'prisma/schema.prisma',
          category: 'data',
          language: 'Text',
          imports: [],
          route_surfaces: [],
          migration_surfaces: [],
          model_surfaces: [{ name: 'User', kind: 'model', framework: 'prisma' }],
          environment_variables: [],
          runtime_hints: ['orm-model'],
          reasons: ['data-model', 'orm-model'],
          bytes: 100
        }
      ],
      analysis: {
        dependency_graph: {
          edges: [
            // Cross-module import: web/client.ts (Service web) imports api/server.ts (Service api)
            { from: 'apps/web/client.ts', to: 'apps/api/server.ts', specifier: '../api/server' },
            // Test file imports: test file imports api/server.ts
            { from: 'test/server.test.ts', to: 'apps/api/server.ts', specifier: '../apps/api/server' },
            // Same-module import: api/routes.ts (Service api) imports api/server.ts (same module)
            { from: 'apps/api/routes.ts', to: 'apps/api/server.ts', specifier: './server' }
          ]
        },
        test_to_source: {
          mappings: [
            {
              test: 'test/server.test.ts',
              sources: ['apps/api/server.ts'],
              heuristics: ['imports']
            }
          ]
        }
      },
      documentation: {
        files: [
          {
            kind: 'documentation_card',
            path: 'docs/guide.md',
            authority: 'secondary',
            status: 'unvalidated',
            stale: false,
            claims: [],
            validation: { contradictions: [], validated: [], commands: [], env_vars: [] }
          }
        ]
      }
    }, null, 2), 'utf8');

    await createBootstrapPlan({ scanDir, outFile });
    const plan = await readJson(outFile);

    assert.ok(plan.affected_page_graph, 'plan should include affected_page_graph');
    assert.ok(Array.isArray(plan.affected_page_graph.source_to_pages), 'source_to_pages should be an array');
    assert.ok(typeof plan.affected_page_graph.summary.mapped_sources === 'number');
    assert.ok(typeof plan.affected_page_graph.summary.total_page_references === 'number');

    // Helper: look up a source entry and build a page→reasons map for easy assertions
    const bySource = new Map(plan.affected_page_graph.source_to_pages.map((e: any) => [e.source, e]));
    function pageReasons(entry: any, pageName: string): string[] {
      const found = entry?.pages.find((p: any) => p.page === pageName);
      return found ? found.reasons : [];
    }
    function pageNames(entry: any): string[] {
      return (entry?.pages || []).map((p: any) => p.page);
    }

    // Direct module change: apps/api/server.ts belongs to Service-api module
    const apiServer: any = bySource.get('apps/api/server.ts');
    assert.ok(apiServer, 'apps/api/server.ts should have affected pages');
    assert.ok(pageReasons(apiServer, 'Service-api.md').includes('direct_module'),
      'direct_module: server.ts is in Service api');

    // Import-transitive: client.ts (in Service web) imports server.ts → Service-web.md affected
    assert.ok(pageReasons(apiServer, 'Service-web.md').includes('import_transitive'),
      'import_transitive: importing module page affected when importer is in a different module');

    // Same-module import (routes.ts → server.ts, both in Service api) must NOT produce import_transitive
    // for Service-api.md; the page appears only once with only direct_module
    assert.equal(pageNames(apiServer).filter((pg: string) => pg === 'Service-api.md').length, 1,
      'Service-api.md must appear exactly once even when imported within the same module');
    assert.ok(!pageReasons(apiServer, 'Service-api.md').includes('import_transitive'),
      'import_transitive must not appear on Service-api.md when the importer (routes.ts) is in the same module');

    // Dependency map: server.ts is imported by others
    assert.ok(pageReasons(apiServer, 'Dependency-Map.md').includes('dependency_change'),
      'dependency_change: server.ts is imported so it participates in the dep graph');

    // Web module: client.ts has imports → direct + dependency_change
    const webClient: any = bySource.get('apps/web/client.ts');
    assert.ok(webClient, 'apps/web/client.ts should have affected pages');
    assert.ok(pageReasons(webClient, 'Service-web.md').includes('direct_module'),
      'direct_module: client.ts is in Service web');
    assert.ok(pageReasons(webClient, 'Dependency-Map.md').includes('dependency_change'),
      'dependency_change: client.ts has imports');
    assert.ok(!pageNames(webClient).includes('Service-api.md'),
      'client.ts should not directly affect api module page');

    // Cross-cutting routes: routes.ts has route surfaces → API-HTTP-Routes.md
    const apiRoutes: any = bySource.get('apps/api/routes.ts');
    assert.ok(apiRoutes, 'apps/api/routes.ts should have affected pages');
    assert.ok(pageReasons(apiRoutes, 'API-HTTP-Routes.md').includes('cross_cutting_routes'),
      'cross_cutting_routes: routes file affects HTTP routes page');

    // Cross-cutting config + security: config.ts has env vars and auth reason
    const apiConfig: any = bySource.get('apps/api/config.ts');
    assert.ok(apiConfig, 'apps/api/config.ts should have affected pages');
    assert.ok(pageReasons(apiConfig, 'Configuration-and-Environment.md').includes('cross_cutting_config'),
      'cross_cutting_config: env vars present');
    assert.ok(pageReasons(apiConfig, 'Security-and-Secrets.md').includes('cross_cutting_security'),
      'cross_cutting_security: auth reason present');

    // Test file change → Testing-Strategy.md AND covered source module pages
    const testFile: any = bySource.get('test/server.test.ts');
    assert.ok(testFile, 'test file should have affected pages');
    assert.ok(pageReasons(testFile, 'Testing-Strategy.md').includes('test_coverage'),
      'test_coverage: test file affects Testing-Strategy.md');
    // test_to_source maps server.test.ts → apps/api/server.ts (in Service api)
    // so changing the test should also flag the covered module page
    assert.ok(pageReasons(testFile, 'Service-api.md').includes('test_covered_module'),
      'test_covered_module: test file affects the module page of the source files it covers');
    assert.ok(!pageReasons(testFile, 'Service-api.md').includes('direct_module'),
      'test file should not claim direct_module on the covered source module page');

    // Documentation file change → Documentation-Debt-Report.md
    const docFile: any = bySource.get('docs/guide.md');
    assert.ok(docFile, 'documentation file should have affected pages');
    assert.ok(pageReasons(docFile, 'Documentation-Debt-Report.md').includes('docs_debt'),
      'docs_debt: doc file affects Documentation-Debt-Report.md');

    // Data model file change → Data-Model-and-Migrations.md
    const schemaFile: any = bySource.get('prisma/schema.prisma');
    assert.ok(schemaFile, 'data model file should have affected pages');
    assert.ok(pageReasons(schemaFile, 'Data-Model-and-Migrations.md').includes('cross_cutting_data_model'),
      'cross_cutting_data_model: model surfaces present');

    // source_to_pages is deterministically sorted by source path
    const sources: string[] = plan.affected_page_graph.source_to_pages.map((e: any) => e.source);
    assert.deepEqual(sources, [...sources].sort(), 'source_to_pages must be sorted by source path');

    // Each page entry's reasons array must itself be sorted
    for (const entry of plan.affected_page_graph.source_to_pages) {
      for (const pageEntry of entry.pages) {
        assert.deepEqual(pageEntry.reasons, [...pageEntry.reasons].sort(),
          `reasons for ${entry.source} → ${pageEntry.page} must be sorted`);
      }
    }

    // pages within each source entry must be sorted by page name
    for (const entry of plan.affected_page_graph.source_to_pages) {
      const names = entry.pages.map((p: any) => p.page);
      assert.deepEqual(names, [...names].sort(),
        `pages for ${entry.source} must be sorted by page name`);
    }

    // Architecture.md architecture-relevant signals:

    // Module membership: files that are in modules should mark Architecture.md
    const apiServerArch = pageReasons(apiServer, 'Architecture.md');
    assert.ok(apiServerArch.includes('module_membership'),
      'module_membership: apps/api/server.ts is in Service api → Architecture.md affected');

    // Cross-module dependency: server.ts is imported by web/client.ts (different module)
    assert.ok(apiServerArch.includes('cross_module_dependency'),
      'cross_module_dependency: server.ts imported by client.ts (different module) → Architecture.md affected');

    // Cross-cutting routes: routes.ts has route surfaces → Architecture.md affected
    const apiRoutesArch = pageReasons(apiRoutes, 'Architecture.md');
    assert.ok(apiRoutesArch.includes('cross_cutting_routes'),
      'cross_cutting_routes: routes file has route surfaces → Architecture.md affected');

    // Cross-cutting config: config.ts has env vars → Architecture.md affected
    assert.ok(pageReasons(apiConfig, 'Architecture.md').includes('cross_cutting_config'),
      'cross_cutting_config: config.ts has env vars → Architecture.md affected');

    // Cross-cutting security: config.ts has auth reason → Architecture.md affected
    assert.ok(pageReasons(apiConfig, 'Architecture.md').includes('cross_cutting_security'),
      'cross_cutting_security: config.ts has auth reason → Architecture.md affected');

    // Cross-cutting data model: schema.prisma has model surfaces → Architecture.md affected
    assert.ok(pageReasons(schemaFile, 'Architecture.md').includes('cross_cutting_data_model'),
      'cross_cutting_data_model: schema.prisma has model surfaces → Architecture.md affected');

    // Architecture.md should appear for test files that have module membership
    // (test/server.test.ts resolves to 'Repository Root' module in this fixture)
    const testFileArchEntry = pageReasons(testFile, 'Architecture.md');
    assert.ok(testFileArchEntry.includes('module_membership'),
      'test file in Repository Root module should have module_membership for Architecture.md');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('createBootstrapPlan incremental mode selects affected pages from graph and always includes global pages', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-plan-incremental-graph-'));
  const llmwikiDir = path.join(dir, '.llmwiki');
  const scanDir = path.join(llmwikiDir, 'run');
  const outFile = path.join(llmwikiDir, 'incremental-plan.json');

  try {
    await mkdir(scanDir, { recursive: true });
    await writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify({
      mode: 'incremental',
      repo_path: dir,
      remote: 'origin',
      commit: 'abc123',
      changed_paths: ['docs/guide.md', 'apps/api/server.ts'],
      totals: {
        runtime_hints: {},
        categories: { source: 1, docs: 1 }
      },
      files: [
        { path: 'apps/api/server.ts', category: 'source', language: 'TypeScript', runtime_hints: [], reasons: ['source'], bytes: 100 },
        { path: 'docs/guide.md', category: 'docs', language: 'Markdown', runtime_hints: [], reasons: ['docs'], bytes: 100 }
      ],
      documentation: {
        files: [
          {
            kind: 'documentation_card',
            path: 'docs/guide.md',
            authority: 'secondary',
            status: 'unvalidated',
            stale: false,
            claims: [],
            validation: { contradictions: [], validated: [], commands: [], env_vars: [] }
          }
        ]
      }
    }, null, 2), 'utf8');

    await writeFile(path.join(llmwikiDir, 'graph.json'), JSON.stringify({
      schema_version: 1,
      nodes: [
        { id: 'page:Service-api.md', kind: 'page', path: 'Service-api.md', page_state: 'generated' },
        { id: 'page:Documentation-Debt-Report.md', kind: 'page', path: 'Documentation-Debt-Report.md', page_state: 'mixed' },
        { id: 'page:Security-and-Secrets.md', kind: 'page', path: 'Security-and-Secrets.md', page_state: 'human-owned' },
        { id: 'source:apps/api/server.ts', kind: 'source', path: 'apps/api/server.ts' },
        { id: 'source:docs/guide.md', kind: 'documentation', path: 'docs/guide.md' }
      ],
      edges: [
        { type: 'affects', from: 'source:apps/api/server.ts', to: 'page:Security-and-Secrets.md' },
        { type: 'affects', from: 'source:apps/api/server.ts', to: 'page:Service-api.md' },
        { type: 'affects', from: 'source:docs/guide.md', to: 'page:Documentation-Debt-Report.md' }
      ]
    }, null, 2), 'utf8');

    await createBootstrapPlan({ scanDir, outFile });
    const plan = await readJson(outFile);
    assert.ok(plan.incremental_selection, 'incremental plan should include incremental_selection');
    assert.equal(plan.incremental_selection.summary.graph_available, true);
    assert.equal(plan.incremental_selection.summary.graph_used, true);
    assert.deepEqual(plan.incremental_selection.changed_paths, ['apps/api/server.ts', 'docs/guide.md']);

    const selectedByPage = new Map<string, any>(plan.incremental_selection.selected_pages.map((entry: any) => [entry.page, entry]));
    assert.ok(selectedByPage.has('Service-api.md'), 'source change should affect module page');
    assert.deepEqual(selectedByPage.get('Service-api.md').changed_paths, ['apps/api/server.ts']);
    assert.ok(selectedByPage.get('Service-api.md').reasons.includes('graph_affects'));

    assert.ok(selectedByPage.has('Documentation-Debt-Report.md'), 'docs change should affect docs debt page');
    assert.deepEqual(selectedByPage.get('Documentation-Debt-Report.md').changed_paths, ['docs/guide.md']);
    assert.ok(selectedByPage.get('Documentation-Debt-Report.md').reasons.includes('graph_affects'));

    assert.ok(!selectedByPage.has('Security-and-Secrets.md'),
      'human-owned page should be excluded from graph-selected incremental regeneration set');

    for (const page of ['Index.md', '_Sidebar.md', 'Log.md', 'Agent-Context-Pack.md']) {
      const selected: any = selectedByPage.get(page);
      assert.ok(selected, `${page} must always be selected in incremental mode`);
      assert.ok(selected.reasons.includes('always_affected_global'));
    }

    const selectedPageNames = plan.incremental_selection.selected_pages.map((entry: any) => entry.page);
    assert.deepEqual(selectedPageNames, [...selectedPageNames].sort((a, b) => a.localeCompare(b)),
      'selected_pages must be sorted by page path');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('createBootstrapPlan incremental mode supports documentation graph node IDs', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-plan-incremental-doc-node-'));
  const llmwikiDir = path.join(dir, '.llmwiki');
  const scanDir = path.join(llmwikiDir, 'run');
  const outFile = path.join(llmwikiDir, 'incremental-plan.json');

  try {
    await mkdir(scanDir, { recursive: true });
    await writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify({
      mode: 'incremental',
      repo_path: dir,
      remote: 'origin',
      commit: 'abc123',
      changed_paths: ['docs/guide.md'],
      totals: {
        runtime_hints: {},
        categories: { docs: 1 }
      },
      files: [
        { path: 'docs/guide.md', category: 'docs', language: 'Markdown', runtime_hints: [], reasons: ['docs'], bytes: 100 }
      ],
      documentation: {
        files: [
          {
            kind: 'documentation_card',
            path: 'docs/guide.md',
            authority: 'secondary',
            status: 'unvalidated',
            stale: false,
            claims: [],
            validation: { contradictions: [], validated: [], commands: [], env_vars: [] }
          }
        ]
      }
    }, null, 2), 'utf8');

    await writeFile(path.join(llmwikiDir, 'graph.json'), JSON.stringify({
      schema_version: 1,
      nodes: [
        { id: 'page:Documentation-Debt-Report.md', kind: 'page', path: 'Documentation-Debt-Report.md', page_state: 'generated' },
        { id: 'documentation:docs/guide.md', kind: 'documentation', path: 'docs/guide.md' }
      ],
      edges: [
        { type: 'affects', from: 'documentation:docs/guide.md', to: 'page:Documentation-Debt-Report.md' }
      ]
    }, null, 2), 'utf8');

    await createBootstrapPlan({ scanDir, outFile });
    const plan = await readJson(outFile);
    const selectedByPage = new Map<string, any>(plan.incremental_selection.selected_pages.map((entry: any) => [entry.page, entry]));

    assert.ok(selectedByPage.has('Documentation-Debt-Report.md'), 'documentation node ids should resolve docs changes to affected pages');
    assert.deepEqual(selectedByPage.get('Documentation-Debt-Report.md').changed_paths, ['docs/guide.md']);
    assert.ok(selectedByPage.get('Documentation-Debt-Report.md').reasons.includes('graph_affects'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('createBootstrapPlan incremental mode rejects malformed graph artifacts', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-plan-incremental-bad-graph-'));
  const llmwikiDir = path.join(dir, '.llmwiki');
  const scanDir = path.join(llmwikiDir, 'run');
  const outFile = path.join(llmwikiDir, 'incremental-plan.json');

  try {
    await mkdir(scanDir, { recursive: true });
    await writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify({
      mode: 'incremental',
      repo_path: dir,
      remote: 'origin',
      commit: 'abc123',
      changed_paths: ['apps/api/server.ts'],
      totals: {
        runtime_hints: {},
        categories: { source: 1 }
      },
      files: [
        { path: 'apps/api/server.ts', category: 'source', language: 'TypeScript', runtime_hints: [], reasons: ['source'], bytes: 100 }
      ],
      documentation: { files: [] }
    }, null, 2), 'utf8');

    await writeFile(path.join(llmwikiDir, 'graph.json'), '{ not valid json\n', 'utf8');

    await assert.rejects(createBootstrapPlan({ scanDir, outFile }), SyntaxError);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('createBootstrapPlan incremental mode falls back deterministically when graph artifact is missing', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-plan-incremental-fallback-'));
  const llmwikiDir = path.join(dir, '.llmwiki');
  const scanDir = path.join(llmwikiDir, 'run');
  const outFile = path.join(llmwikiDir, 'incremental-plan.json');

  try {
    await mkdir(scanDir, { recursive: true });
    await writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify({
      mode: 'incremental',
      repo_path: dir,
      remote: 'origin',
      commit: 'abc123',
      changed_paths: ['apps/api/server.ts'],
      totals: {
        runtime_hints: {},
        categories: { source: 1 }
      },
      files: [
        { path: 'apps/api/server.ts', category: 'source', language: 'TypeScript', runtime_hints: [], reasons: ['source'], bytes: 100 }
      ],
      documentation: { files: [] }
    }, null, 2), 'utf8');

    await createBootstrapPlan({ scanDir, outFile });
    const plan = await readJson(outFile);

    assert.ok(plan.incremental_selection, 'incremental plan should include incremental_selection');
    assert.equal(plan.incremental_selection.summary.graph_available, false);
    assert.equal(plan.incremental_selection.summary.graph_used, false);
    assert.equal(plan.incremental_selection.summary.fallback_reason, 'fallback_missing_graph');

    const selectedByPage = new Map<string, any>(plan.incremental_selection.selected_pages.map((entry: any) => [entry.page, entry]));
    for (const plannedPage of plan.pages.map((page: any) => page.path)) {
      assert.ok(selectedByPage.has(plannedPage), `fallback must include planned page ${plannedPage}`);
      assert.ok(selectedByPage.get(plannedPage).reasons.includes('fallback_missing_graph'));
    }

    for (const page of ['Index.md', '_Sidebar.md', 'Log.md', 'Agent-Context-Pack.md']) {
      const selected: any = selectedByPage.get(page);
      assert.ok(selected, `${page} must always be selected in fallback mode`);
      assert.ok(selected.reasons.includes('always_affected_global'));
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
