import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { scanRepository } from '../src/scanner.js';

async function makeTempRepo() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-test-'));
  await fs.mkdir(path.join(dir, 'src'), { recursive: true });
  await fs.mkdir(path.join(dir, 'src', '__tests__'), { recursive: true });
  await fs.mkdir(path.join(dir, 'test'), { recursive: true });
  await fs.mkdir(path.join(dir, 'tests'), { recursive: true });
  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'fixture-repo', scripts: { build: 'node build.js', test: 'node --test' } }, null, 2));
  await fs.writeFile(path.join(dir, '.env.example'), 'EXAMPLE_MODE=on\n');
  await fs.writeFile(path.join(dir, 'Dockerfile'), 'ARG DOCKER_MODE\nENV DOCKER_HOST=localhost DOCKER_PORT=8080 DOCKER_PATH=/app\n');
  await fs.writeFile(path.join(dir, 'config.yml'), 'env_var: CONFIG_MODE\nHTTP_PORT: 3000\n');
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

    assert.equal(result.summary.files, 11);
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
    const envExampleCard = result.manifest.files.find((file) => file.path === '.env.example');
    assert.ok(envExampleCard);
    assert.deepEqual(envExampleCard.environment_variables, ['EXAMPLE_MODE']);
    const dockerfileCard = result.manifest.files.find((file) => file.path === 'Dockerfile');
    assert.ok(dockerfileCard);
    assert.deepEqual(dockerfileCard.environment_variables, ['DOCKER_HOST', 'DOCKER_MODE', 'DOCKER_PATH', 'DOCKER_PORT']);
    const configCard = result.manifest.files.find((file) => file.path === 'config.yml');
    assert.ok(configCard);
    assert.deepEqual(configCard.environment_variables, ['CONFIG_MODE']);
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

test('scanRepository redacts secret-bearing compiler config fields from manifest', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-secret-config-'));
  try {
    await fs.mkdir(path.join(repo, '.llmwiki'), { recursive: true });
    await fs.writeFile(path.join(repo, '.llmwiki', 'config.json'), JSON.stringify({
      compiler: {
        mode: 'llm',
        llm: {
          apiKey: 'plain-secret-key',
          api_key: 'snake-secret-key',
          provider_token: 'provider-secret-token',
          secret_key: 'provider-secret-key',
          tokenizer: 'safe-tokenizer-name',
          credential_type: 'bearer',
          secret_sauce: 'documentation-only-label',
          api_key_env: 'SAFE_ENV_NAME',
          apiKeyEnv: 'SAFE_CAMEL_ENV_NAME',
          model: 'safe-model-name'
        }
      }
    }), 'utf8');
    await fs.writeFile(path.join(repo, 'README.md'), '# Demo\n', 'utf8');

    const result = await scanRepository({
      mode: 'bootstrap',
      repoPath: repo,
      outDir: path.join(repo, '.llmwiki', 'run')
    });

    assert.equal(result.manifest.config.compiler.llm.apiKey, '[REDACTED]');
    assert.equal(result.manifest.config.compiler.llm.api_key, '[REDACTED]');
    assert.equal(result.manifest.config.compiler.llm.provider_token, '[REDACTED]');
    assert.equal(result.manifest.config.compiler.llm.secret_key, '[REDACTED]');
    assert.equal(result.manifest.config.compiler.llm.tokenizer, 'safe-tokenizer-name');
    assert.equal(result.manifest.config.compiler.llm.credential_type, 'bearer');
    assert.equal(result.manifest.config.compiler.llm.secret_sauce, 'documentation-only-label');
    assert.equal(result.manifest.config.compiler.llm.api_key_env, 'SAFE_ENV_NAME');
    assert.equal(result.manifest.config.compiler.llm.apiKeyEnv, 'SAFE_CAMEL_ENV_NAME');
    assert.equal(result.manifest.config.compiler.llm.model, 'safe-model-name');
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});
