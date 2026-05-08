import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { scanRepository } from '../src/scanner.js';
import { walkFiles } from '../src/utils/fs.js';
import { createBootstrapPlan } from '../src/planner.js';
import { compileWiki } from '../src/compiler.js';

async function makeTempRepo() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-test-'));
  await fs.mkdir(path.join(dir, 'src'), { recursive: true });
  await fs.mkdir(path.join(dir, 'src', '__tests__'), { recursive: true });
  await fs.mkdir(path.join(dir, 'test'), { recursive: true });
  await fs.mkdir(path.join(dir, 'tests'), { recursive: true });
  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'fixture-repo', scripts: { build: 'node build.js', test: 'node --test' } }, null, 2));
  await fs.writeFile(path.join(dir, 'src', 'utils.js'), 'export function value() { return 42; }\n');
  await fs.writeFile(path.join(dir, 'src', 'index.js'), "import express from 'express';\nimport fs from 'node:fs';\nimport { value } from './utils.js';\n\nconst app = express();\nexport const router = express.Router();\n\napp.get('/health', healthCheck);\nrouter.post('/users', createUser);\n\nexport function hello() {\n  return fs.existsSync('.') && value() === 42 && Boolean(process.env.PORT) && process.env['APP_MODE'] !== 'off';\n}\n\nfunction healthCheck(_req, res) {\n  return res.json({ ok: true, mode: process.env.APP_MODE });\n}\n\nconst createUser = (_req, res) => {\n  return res.json({ created: true });\n};\n");
  await fs.writeFile(path.join(dir, 'src', 'math.js'), 'export function add(left, right) { return left + right; }\n');
  await fs.writeFile(path.join(dir, 'src', 'math.test.js'), "import test from 'node:test';\nimport assert from 'node:assert/strict';\n\ntest('add', () => {\n  assert.equal(1 + 1, 2);\n});\n");
  await fs.writeFile(path.join(dir, 'src', '__tests__', 'utils.test.js'), "import test from 'node:test';\nimport assert from 'node:assert/strict';\n\ntest('value', () => {\n  assert.ok(true);\n});\n");
  await fs.writeFile(path.join(dir, 'test', 'index.test.js'), "import test from 'node:test';\nimport { hello } from '../src/index.js';\n\ntest('ok', () => {\n  hello();\n});\n");
  await fs.writeFile(path.join(dir, 'tests', 'math.spec.js'), "import test from 'node:test';\nimport assert from 'node:assert/strict';\n\ntest('spec', () => {\n  assert.ok(true);\n});\n");
  return dir;
}

test('scanRepository creates a manifest and source cards', async () => {
  const repo = await makeTempRepo();

  try {
    const out = path.join(repo, '.llmwiki', 'run');

    const result = await scanRepository({
      mode: 'bootstrap',
      repoPath: repo,
      outDir: out
    });

    assert.equal(result.summary.files, 8);
    assert.equal(result.manifest.totals.languages.JavaScript, 7);
    assert.equal(result.manifest.totals.languages.JSON, 1);
    assert.ok(result.manifest.files.some((file) => file.path === 'src/index.js'));

    assert.deepEqual(result.manifest.analysis.package_scripts, [
      {
        path: 'package.json',
        name: 'fixture-repo',
        scripts: {
          build: 'node build.js',
          test: 'node --test'
        }
      }
    ]);

    assert.deepEqual(result.manifest.analysis.dependency_graph.edges, [
      { from: 'src/index.js', to: 'package:express', specifier: 'express' },
      { from: 'src/index.js', to: 'src/utils.js', specifier: './utils.js' },
      { from: 'test/index.test.js', to: 'src/index.js', specifier: '../src/index.js' }
    ]);
    assert.deepEqual(result.manifest.analysis.dependency_graph.summary, {
      edges: 3,
      importers: 2,
      imported_files: 2,
      imported_packages: 1
    });

    assert.deepEqual(result.manifest.analysis.test_to_source.mappings, [
      {
        test: 'src/__tests__/utils.test.js',
        sources: ['src/utils.js'],
        heuristics: ['filename_affinity']
      },
      {
        test: 'src/math.test.js',
        sources: ['src/math.js'],
        heuristics: ['filename_affinity']
      },
      {
        test: 'test/index.test.js',
        sources: ['src/index.js'],
        heuristics: ['filename_affinity', 'imports']
      },
      {
        test: 'tests/math.spec.js',
        sources: ['src/math.js'],
        heuristics: ['filename_affinity']
      }
    ]);

    const indexCard = result.manifest.files.find((file) => file.path === 'src/index.js');
    assert.ok(indexCard);
    assert.deepEqual(indexCard.exported_symbols, [
      { name: 'hello', kind: 'function' },
      { name: 'router', kind: 'const' }
    ]);
    assert.deepEqual(indexCard.environment_variables, ['APP_MODE', 'PORT']);
    assert.deepEqual(indexCard.route_surfaces, [
      {
        kind: 'http-route',
        framework: 'express',
        target: 'app',
        methods: ['GET'],
        path: '/health',
        handler: 'healthCheck'
      },
      {
        kind: 'http-route',
        framework: 'express',
        target: 'router',
        methods: ['POST'],
        path: '/users',
        handler: 'createUser'
      }
    ]);
    assert.ok(indexCard.runtime_hints.includes('environment-variable'));
    assert.ok(indexCard.runtime_hints.includes('http-route'));
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('scanRepository extracts migration and ORM model metadata without leaking file bodies', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-data-model-test-'));

  try {
    await fs.mkdir(path.join(repo, 'prisma', 'migrations', '20240101120000_init'), { recursive: true });
    await fs.mkdir(path.join(repo, 'src', 'models'), { recursive: true });
    await fs.writeFile(path.join(repo, 'package.json'), JSON.stringify({ name: 'fixture-repo' }, null, 2));
    await fs.writeFile(path.join(repo, 'prisma', 'schema.prisma'), `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id Int @id
}

model AuditLog {
  id Int @id
}
`, 'utf8');
    await fs.writeFile(path.join(repo, 'prisma', 'migrations', '20240101120000_init', 'migration.sql'), 'CREATE TABLE users(id int);\n', 'utf8');
    await fs.writeFile(path.join(repo, 'src', 'models', 'account.ts'), `
import { Entity } from 'typeorm';
import { Model } from 'sequelize';
@Entity()
export class AccountEntity {}
export class Session extends Model {}
`, 'utf8');

    const out = path.join(repo, '.llmwiki', 'run');
    const result = await scanRepository({ mode: 'bootstrap', repoPath: repo, outDir: out });

    const migrationCard = result.manifest.files.find((file) => file.path === 'prisma/migrations/20240101120000_init/migration.sql');
    assert.ok(migrationCard);
    assert.deepEqual(migrationCard.migration_surfaces, [
      { kind: 'prisma-migration', id: '20240101120000', name: 'init' }
    ]);
    assert.ok(migrationCard.runtime_hints.includes('database-migration'));
    assert.ok(migrationCard.runtime_hints.includes('data-model'));

    const schemaCard = result.manifest.files.find((file) => file.path === 'prisma/schema.prisma');
    assert.ok(schemaCard);
    assert.deepEqual(schemaCard.model_surfaces, [
      { name: 'AuditLog', kind: 'model', framework: 'prisma' },
      { name: 'User', kind: 'model', framework: 'prisma' }
    ]);
    assert.ok(schemaCard.runtime_hints.includes('orm-model'));

    const modelCard = result.manifest.files.find((file) => file.path === 'src/models/account.ts');
    assert.ok(modelCard);
    assert.ok(modelCard.model_surfaces.some((entry) => entry.name === 'AccountEntity' && entry.framework === 'typeorm'));
    assert.ok(modelCard.model_surfaces.some((entry) => entry.name === 'Session' && entry.framework === 'sequelize'));
    assert.ok(modelCard.reasons.includes('data-model'));

    assert.equal(JSON.stringify(result.manifest).includes('DATABASE_URL'), false);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('scanRepository extracts deterministic Python imports and symbols', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-python-test-'));

  try {
    await fs.mkdir(path.join(repo, 'src'), { recursive: true });
    await fs.writeFile(path.join(repo, 'src', 'app.py'), `import os
from collections import defaultdict

SETTING = "prod"

class Service:
    pass

def helper():
    return True

async def run_job():
    return None
`, 'utf8');

    const out = path.join(repo, '.llmwiki', 'run');
    const result = await scanRepository({
      mode: 'bootstrap',
      repoPath: repo,
      outDir: out
    });

    assert.equal(result.manifest.totals.languages.Python, 1);
    const pythonCard = result.manifest.files.find((file) => file.path === 'src/app.py');
    assert.ok(pythonCard);
    assert.deepEqual(pythonCard.imports, ['collections', 'os']);
    assert.deepEqual(pythonCard.symbols, ['SETTING', 'Service', 'helper', 'run_job']);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('scanRepository extracts deterministic Ruby imports and symbols', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-ruby-test-'));

  try {
    await fs.mkdir(path.join(repo, 'lib'), { recursive: true });
    await fs.writeFile(path.join(repo, 'lib', 'scanner.rb'), `require 'json'
require_relative './support/helpers'

module RepoWiki
  VERSION = "1.0.0"

  class Scanner
    def run
      true
    end

    def self.build
      new
    end
  end
end
`, 'utf8');

    const out = path.join(repo, '.llmwiki', 'run');
    const result = await scanRepository({
      mode: 'bootstrap',
      repoPath: repo,
      outDir: out
    });

    assert.equal(result.manifest.totals.languages.Ruby, 1);
    const rubyCard = result.manifest.files.find((file) => file.path === 'lib/scanner.rb');
    assert.ok(rubyCard);
    assert.deepEqual(rubyCard.imports, ['./support/helpers', 'json']);
    assert.deepEqual(rubyCard.symbols, [
      'RepoWiki',
      'RepoWiki::Scanner',
      'RepoWiki::Scanner#run',
      'RepoWiki::Scanner.build',
      'RepoWiki::VERSION'
    ]);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('scanRepository honors config source excludes when walking files', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-source-exclude-test-'));

  try {
    await fs.mkdir(path.join(repo, '.llmwiki'), { recursive: true });
    await fs.mkdir(path.join(repo, 'src'), { recursive: true });
    await fs.mkdir(path.join(repo, 'tmp', 'scratch'), { recursive: true });
    await fs.writeFile(path.join(repo, '.llmwiki', 'config.json'), JSON.stringify({
      source: {
        exclude: ['tmp/**']
      }
    }, null, 2), 'utf8');
    await fs.writeFile(path.join(repo, 'src', 'index.js'), 'export const ok = true;\n', 'utf8');
    await fs.writeFile(path.join(repo, 'tmp', 'scratch', 'package.json'), JSON.stringify({ name: 'nested' }, null, 2), 'utf8');
    await fs.writeFile(path.join(repo, 'tmpfile.js'), 'export const sibling = true;\n', 'utf8');

    const out = path.join(repo, '.llmwiki', 'run');
    const result = await scanRepository({
      mode: 'bootstrap',
      repoPath: repo,
      outDir: out
    });

    assert.ok(result.manifest.files.some((file) => file.path === 'src/index.js'));
    assert.ok(result.manifest.files.some((file) => file.path === 'tmpfile.js'));
    assert.equal(result.manifest.files.some((file) => file.path === 'tmp/scratch/package.json'), false);
    assert.deepEqual(result.manifest.config.source.exclude, ['tmp/**']);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('walkFiles preserves explicit exclude override semantics', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-walk-override-test-'));

  try {
    await fs.mkdir(path.join(repo, 'node_modules', 'kept'), { recursive: true });
    await fs.mkdir(path.join(repo, 'tmp'), { recursive: true });
    await fs.writeFile(path.join(repo, 'node_modules', 'kept', 'index.js'), 'module.exports = 1;\n', 'utf8');
    await fs.writeFile(path.join(repo, 'tmp', 'ignored.js'), 'export const ignored = true;\n', 'utf8');

    const files = await walkFiles(repo, { exclude: ['tmp/**'] });

    assert.ok(files.some((file) => file.relative === 'node_modules/kept/index.js'));
    assert.equal(files.some((file) => file.relative === 'tmp/ignored.js'), false);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('scanRepository suppresses nested repository worktree noise', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-nested-repo-test-'));

  try {
    await fs.mkdir(path.join(repo, 'src'), { recursive: true });
    await fs.mkdir(path.join(repo, 'tmp', 'nested', '.github', 'workflows'), { recursive: true });
    await fs.writeFile(path.join(repo, 'src', 'index.js'), 'export const app = 1;\n', 'utf8');
    await fs.writeFile(path.join(repo, 'tmp', 'nested', '.git'), 'gitdir: /tmp/worktrees/nested\n', 'utf8');
    await fs.writeFile(path.join(repo, 'tmp', 'nested', 'package.json'), JSON.stringify({ name: 'nested-worktree' }, null, 2), 'utf8');
    await fs.writeFile(path.join(repo, 'tmp', 'nested', '.github', 'workflows', 'ci.yml'), 'name: nested-ci\n', 'utf8');

    const out = path.join(repo, '.llmwiki', 'run');
    const result = await scanRepository({
      mode: 'bootstrap',
      repoPath: repo,
      outDir: out
    });

    assert.ok(result.manifest.files.some((file) => file.path === 'src/index.js'));
    assert.equal(result.manifest.files.some((file) => file.path.startsWith('tmp/nested/')), false);
    assert.equal((result.manifest.analysis.package_scripts || []).some((entry) => entry.path.startsWith('tmp/nested/')), false);
    assert.equal((result.manifest.analysis.ci_workflow_commands || []).length, 0);

    const planFile = path.join(repo, '.llmwiki', 'plan.json');
    const wikiDir = path.join(repo, '.llmwiki', 'wiki');
    await createBootstrapPlan({ scanDir: out, outFile: planFile });
    await compileWiki({ scanDir: out, planFile, wikiDir });

    const buildTestAndRun = await fs.readFile(path.join(wikiDir, 'Build-Test-and-Run.md'), 'utf8');
    assert.equal(buildTestAndRun.includes('tmp/nested/package.json'), false);
    assert.equal(buildTestAndRun.includes('tmp/nested/.github/workflows/ci.yml'), false);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('walkFiles suppresses nested repositories marked by .git symlinks', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-nested-repo-symlink-test-'));

  try {
    await fs.mkdir(path.join(repo, 'vendor', 'submodule'), { recursive: true });
    await fs.writeFile(path.join(repo, 'vendor', 'submodule', 'package.json'), JSON.stringify({ name: 'submodule' }, null, 2), 'utf8');

    try {
      await fs.symlink('../.git/modules/submodule', path.join(repo, 'vendor', 'submodule', '.git'));
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'EPERM') {
        return;
      }
      throw error;
    }

    const files = await walkFiles(repo, { suppressNestedRepositories: true });

    assert.equal(files.some((file) => file.relative === 'vendor/submodule/package.json'), false);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('scanRepository can include nested repository content when configured', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-nested-repo-optout-test-'));

  try {
    await fs.mkdir(path.join(repo, '.llmwiki'), { recursive: true });
    await fs.mkdir(path.join(repo, 'vendor', 'submodule'), { recursive: true });
    await fs.writeFile(path.join(repo, '.llmwiki', 'config.json'), JSON.stringify({
      source: {
        suppress_nested_repositories: false
      }
    }, null, 2), 'utf8');
    await fs.writeFile(path.join(repo, 'vendor', 'submodule', '.git'), 'gitdir: ../.git/modules/submodule\n', 'utf8');
    await fs.writeFile(path.join(repo, 'vendor', 'submodule', 'package.json'), JSON.stringify({ name: 'submodule' }, null, 2), 'utf8');

    const result = await scanRepository({
      mode: 'bootstrap',
      repoPath: repo,
      outDir: path.join(repo, '.llmwiki', 'run')
    });

    assert.ok(result.manifest.files.some((file) => file.path === 'vendor/submodule/package.json'));
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});
