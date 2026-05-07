import test from 'node:test';
import assert from 'node:assert/strict';
import { chmod, mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const scriptPath = path.resolve('scripts/update-changelog.mjs');

async function runScript(args: string[], cwd: string, env: NodeJS.ProcessEnv = {}) {
  return execFileAsync(process.execPath, [scriptPath, ...args], {
    cwd,
    env: { ...process.env, ...env },
    maxBuffer: 10 * 1024 * 1024
  });
}

test('update-changelog derives Keep a Changelog content from PR metadata', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-changelog-'));

  try {
    const metadataPath = path.join(tempDir, 'pr-metadata.json');
    await writeFile(metadataPath, JSON.stringify({
      title: 'Add changelog automation',
      body: 'This change updates release automation and repository guidance.',
      files: [
        { path: 'scripts/update-changelog.mjs' },
        { path: '.github/workflows/changelog-on-merge.yml' },
        { path: '.github/skills/keep-a-changelog/SKILL.md' },
        { path: 'test/update-changelog.test.ts' }
      ]
    }, null, 2), 'utf8');

    await runScript(['ensure'], tempDir);
    let changelog = await readFile(path.join(tempDir, 'CHANGELOG.md'), 'utf8');
    assert.match(changelog, /## \[Unreleased\]/);

    await runScript(['update', '--pr-metadata-file', 'pr-metadata.json'], tempDir);
    await runScript(['update', '--pr-metadata-file', 'pr-metadata.json'], tempDir);
    changelog = await readFile(path.join(tempDir, 'CHANGELOG.md'), 'utf8');
    assert.equal((changelog.match(/Add changelog automation\./g) || []).length, 1);
    assert.equal((changelog.match(/Clarify repository guidance and review workflow expectations\./g) || []).length, 1);
    assert.equal((changelog.match(/Expand automated test coverage for the updated behavior\./g) || []).length, 1);

    const fakeBin = path.join(tempDir, 'fake-bin');
    await mkdir(fakeBin, { recursive: true });
    const fakeGh = path.join(fakeBin, 'gh');
    await writeFile(fakeGh, `#!/usr/bin/env node
const args = process.argv.slice(2);
if (args[0] === 'pr' && args[1] === 'view' && args[2] === '17') {
  process.stdout.write(JSON.stringify({
    title: 'Fix duplicate changelog entry handling',
    body: 'This corrects changelog deduplication for merged pull requests.',
    files: [
      { path: 'scripts/update-changelog.mjs' },
      { path: 'test/update-changelog.test.ts' }
    ],
    number: 17,
    url: 'https://example.com/pr/17'
  }));
} else {
  process.stderr.write('unexpected gh args: ' + args.join(' '));
  process.exit(1);
}
`, 'utf8');
    await chmod(fakeGh, 0o755);

    await runScript(['update', '--pr', '17', '--repo', 'mfittko/repo-wiki'], tempDir, {
      PATH: `${fakeBin}:${process.env.PATH || ''}`
    });

    changelog = await readFile(path.join(tempDir, 'CHANGELOG.md'), 'utf8');
    assert.match(changelog, /### Fixed/);
    assert.match(changelog, /Fix duplicate changelog entry handling\./);

    await runScript(['release', '--version', '0.2.0', '--date', '2026-05-07'], tempDir);
    changelog = await readFile(path.join(tempDir, 'CHANGELOG.md'), 'utf8');
    assert.match(changelog, /## \[Unreleased\]/);
    assert.match(changelog, /## \[0\.2\.0\] - 2026-05-07/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update-changelog skips documentation-only and test-only pull requests', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-changelog-skip-'));

  try {
    const metadataPath = path.join(tempDir, 'pr-metadata.json');
    await writeFile(metadataPath, JSON.stringify({
      title: 'Tighten plan wording',
      body: 'Docs-only clarification for the implementation plan.',
      files: [
        { path: 'docs/plans/agent-integration/PLAN.md' },
        { path: 'test/update-changelog.test.ts' }
      ]
    }, null, 2), 'utf8');

    await runScript(['ensure'], tempDir);
    const before = await readFile(path.join(tempDir, 'CHANGELOG.md'), 'utf8');
    await runScript(['update', '--pr-metadata-file', 'pr-metadata.json'], tempDir);
    const after = await readFile(path.join(tempDir, 'CHANGELOG.md'), 'utf8');
    assert.equal(after, before);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
