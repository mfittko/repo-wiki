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
  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ scripts: { test: 'node --test' } }, null, 2));
  await fs.writeFile(path.join(dir, 'src', 'index.js'), "import fs from 'node:fs';\nexport function hello() { return fs.existsSync('.'); }\n");
  await fs.writeFile(path.join(dir, 'test', 'index.test.js'), "import test from 'node:test';\ntest('ok', () => {});\n");
  return dir;
}

test('scanRepository creates a manifest and source cards', async () => {
  const repo = await makeTempRepo();
  const out = path.join(repo, '.llmwiki', 'run');

  const result = await scanRepository({
    mode: 'bootstrap',
    repoPath: repo,
    outDir: out
  });

  assert.equal(result.summary.files, 3);
  assert.equal(result.manifest.totals.languages.JavaScript, 2);
  assert.equal(result.manifest.totals.languages.JSON, 1);
  assert.ok(result.manifest.files.some((file) => file.path === 'src/index.js'));
});
