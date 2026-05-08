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
