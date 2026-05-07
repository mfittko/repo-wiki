import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { scanRepository } from '../src/scanner.js';
import { lintDocs } from '../src/docs-linter.js';

test('documentation ingestion produces documentation cards and lint issues', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-docs-'));
  try {
    await mkdir(path.join(dir, 'docs'), { recursive: true });
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: {
        ingest: true,
        include: ['README.md', 'docs/**/*.md'],
        exclude: [],
        stale_after_days: 9999
      }
    }), 'utf8');
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\nRun npm test.\n\n```bash\nnpm test\n```\n', 'utf8');
    await writeFile(path.join(dir, 'docs', 'old.md'), '# Old\n\nThis is deprecated and should be reviewed.\n', 'utf8');
    await writeFile(path.join(dir, 'package.json'), JSON.stringify({ scripts: { test: 'node --test' } }), 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    const scan = await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });
    assert.equal(scan.manifest.documentation.files.length, 2);

    const lint = await lintDocs({ scanDir, repoPath: dir });
    assert.ok(lint.summary.warnings + lint.summary.errors >= 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
