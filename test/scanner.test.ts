import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { scanRepository } from '../src/scanner.js';

async function makeTempRepo() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-test-'));
  await fs.mkdir(path.join(dir, 'src'), { recursive: true });
  await fs.mkdir(path.join(dir, 'test'), { recursive: true });
  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'fixture-repo', scripts: { build: 'node build.js', test: 'node --test' } }, null, 2));
  await fs.writeFile(path.join(dir, 'src', 'utils.js'), 'export function value() { return 42; }\n');
  await fs.writeFile(path.join(dir, 'src', 'index.js'), "import express from 'express';\nimport fs from 'node:fs';\nimport { value } from './utils.js';\n\nconst app = express();\nexport const router = express.Router();\n\napp.get('/health', healthCheck);\nrouter.post('/users', createUser);\n\nexport function hello() {\n  return fs.existsSync('.') && value() === 42 && Boolean(process.env.PORT) && process.env['APP_MODE'] !== 'off';\n}\n\nfunction healthCheck(_req, res) {\n  return res.json({ ok: true, mode: process.env.APP_MODE });\n}\n\nconst createUser = (_req, res) => {\n  return res.json({ created: true });\n};\n");
  await fs.writeFile(path.join(dir, 'src', 'math.js'), 'export function add(left, right) { return left + right; }\n');
  await fs.writeFile(path.join(dir, 'src', 'math.test.js'), "import test from 'node:test';\nimport assert from 'node:assert/strict';\n\ntest('add', () => {\n  assert.equal(1 + 1, 2);\n});\n");
  await fs.writeFile(path.join(dir, 'test', 'index.test.js'), "import test from 'node:test';\nimport { hello } from '../src/index.js';\n\ntest('ok', () => {\n  hello();\n});\n");
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

    assert.equal(result.summary.files, 6);
    assert.equal(result.manifest.totals.languages.JavaScript, 5);
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
        test: 'src/math.test.js',
        sources: ['src/math.js'],
        heuristics: ['filename_affinity']
      },
      {
        test: 'test/index.test.js',
        sources: ['src/index.js'],
        heuristics: ['filename_affinity', 'imports']
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
  url      = "postgresql://testuser:testpass@localhost:5432/app"
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

    assert.equal(JSON.stringify(result.manifest).includes('postgresql://testuser:testpass@localhost:5432/app'), false);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});
