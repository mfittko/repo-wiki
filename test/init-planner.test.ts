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
    //   apps/api/server.ts  → Service api module (no imports; imported by others)
    //   apps/api/routes.ts  → Service api module (has route surfaces)
    //   apps/api/config.ts  → Service api module (has environment variables + auth reason)
    //   apps/web/client.ts  → Service web module (imports apps/api/server.ts)
    //   test/server.test.ts → test file (imports apps/api/server.ts)
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

    const bySource = new Map(plan.affected_page_graph.source_to_pages.map((e: any) => [e.source, e]));

    // Direct module change: apps/api/server.ts belongs to Service-api module
    const apiServer: any = bySource.get('apps/api/server.ts');
    assert.ok(apiServer, 'apps/api/server.ts should have affected pages');
    assert.ok(apiServer.pages.includes('Service-api.md'), 'direct_module: server.ts is in Service api');
    assert.ok(apiServer.reasons.includes('direct_module'), 'should carry direct_module reason');

    // Import-transitive: client.ts (in Service web) imports server.ts → Service-web.md affected
    assert.ok(apiServer.pages.includes('Service-web.md'), 'import_transitive: importing module page affected');
    assert.ok(apiServer.reasons.includes('import_transitive'), 'should carry import_transitive reason');

    // Same-module import (routes.ts → server.ts, both in Service api) must NOT produce import_transitive
    // for Service-api.md; direct_module already covers that page, so reasons must stay clean
    assert.equal(apiServer.pages.filter((pg: string) => pg === 'Service-api.md').length, 1,
      'Service-api.md must appear exactly once even when imported within the same module');
    assert.ok(!apiServer.reasons.includes('import_transitive') ||
      !apiServer.pages.every((pg: string) => pg !== 'Service-web.md'),
      'import_transitive reason must come from a cross-module importer only');

    // Dependency map: server.ts is imported by others
    assert.ok(apiServer.pages.includes('Dependency-Map.md'), 'dependency_change: server.ts is in dep graph');
    assert.ok(apiServer.reasons.includes('dependency_change'));

    // Web module: client.ts has imports → direct + dependency_change
    const webClient: any = bySource.get('apps/web/client.ts');
    assert.ok(webClient, 'apps/web/client.ts should have affected pages');
    assert.ok(webClient.pages.includes('Service-web.md'), 'direct_module: client.ts is in Service web');
    assert.ok(webClient.pages.includes('Dependency-Map.md'), 'dependency_change: client.ts has imports');
    assert.ok(!webClient.pages.includes('Service-api.md'), 'client.ts should not directly affect api module page');

    // Cross-cutting routes: routes.ts has route surfaces → API-HTTP-Routes.md
    const apiRoutes: any = bySource.get('apps/api/routes.ts');
    assert.ok(apiRoutes, 'apps/api/routes.ts should have affected pages');
    assert.ok(apiRoutes.pages.includes('API-HTTP-Routes.md'), 'cross_cutting_routes: routes file affects HTTP routes page');
    assert.ok(apiRoutes.reasons.includes('cross_cutting_routes'));

    // Cross-cutting config + security: config.ts has env vars and auth reason
    const apiConfig: any = bySource.get('apps/api/config.ts');
    assert.ok(apiConfig, 'apps/api/config.ts should have affected pages');
    assert.ok(apiConfig.pages.includes('Configuration-and-Environment.md'), 'cross_cutting_config: env vars present');
    assert.ok(apiConfig.reasons.includes('cross_cutting_config'));
    assert.ok(apiConfig.pages.includes('Security-and-Secrets.md'), 'cross_cutting_security: auth reason present');
    assert.ok(apiConfig.reasons.includes('cross_cutting_security'));

    // Test file change → Testing-Strategy.md
    const testFile: any = bySource.get('test/server.test.ts');
    assert.ok(testFile, 'test file should have affected pages');
    assert.ok(testFile.pages.includes('Testing-Strategy.md'), 'test_coverage: test file affects Testing-Strategy.md');
    assert.ok(testFile.reasons.includes('test_coverage'));

    // Documentation file change → Documentation-Debt-Report.md
    const docFile: any = bySource.get('docs/guide.md');
    assert.ok(docFile, 'documentation file should have affected pages');
    assert.ok(docFile.pages.includes('Documentation-Debt-Report.md'), 'docs_debt: doc file affects Documentation-Debt-Report.md');
    assert.ok(docFile.reasons.includes('docs_debt'));

    // Data model file change → Data-Model-and-Migrations.md
    const schemaFile: any = bySource.get('prisma/schema.prisma');
    assert.ok(schemaFile, 'data model file should have affected pages');
    assert.ok(schemaFile.pages.includes('Data-Model-and-Migrations.md'), 'cross_cutting_data_model: model surfaces present');
    assert.ok(schemaFile.reasons.includes('cross_cutting_data_model'));

    // source_to_pages is deterministically sorted by source path
    const sources: string[] = plan.affected_page_graph.source_to_pages.map((e: any) => e.source);
    assert.deepEqual(sources, [...sources].sort(), 'source_to_pages must be sorted by source path');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
