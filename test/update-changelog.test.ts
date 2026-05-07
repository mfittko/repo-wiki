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

test('update-changelog maintains Keep a Changelog content from PR input', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-changelog-'));

  try {
    const prBodyPath = path.join(tempDir, 'pr-body.md');
    await writeFile(prBodyPath, [
      '## Changelog',
      '### Added',
      '- Adds changelog automation via a repository script.',
      '### Fixed',
      '- Fixes duplicate changelog entry handling.'
    ].join('\n'), 'utf8');

    await runScript(['ensure'], tempDir);
    let changelog = await readFile(path.join(tempDir, 'CHANGELOG.md'), 'utf8');
    assert.match(changelog, /## \[Unreleased\]/);

    await runScript(['update', '--pr-body-file', 'pr-body.md'], tempDir);
    await runScript(['update', '--pr-body-file', 'pr-body.md'], tempDir);
    changelog = await readFile(path.join(tempDir, 'CHANGELOG.md'), 'utf8');
    assert.equal((changelog.match(/Adds changelog automation via a repository script\./g) || []).length, 1);
    assert.equal((changelog.match(/Fixes duplicate changelog entry handling\./g) || []).length, 1);

    const fakeBin = path.join(tempDir, 'fake-bin');
    await mkdir(fakeBin, { recursive: true });
    const fakeGh = path.join(fakeBin, 'gh');
    await writeFile(fakeGh, `#!/usr/bin/env node
const args = process.argv.slice(2);
if (args[0] === 'pr' && args[1] === 'view' && args[2] === '17') {
  process.stdout.write(JSON.stringify({
    body: '## Changelog\\n### Changed\\n- Uses gh to load PR metadata.\\n',
    reviewDecision: 'APPROVED',
    number: 17,
    title: 'Example PR',
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
    assert.match(changelog, /### Changed/);
    assert.match(changelog, /Uses gh to load PR metadata\./);

    await runScript(['release', '--version', '0.2.0', '--date', '2026-05-07'], tempDir);
    changelog = await readFile(path.join(tempDir, 'CHANGELOG.md'), 'utf8');
    assert.match(changelog, /## \[Unreleased\]/);
    assert.match(changelog, /## \[0\.2\.0\] - 2026-05-07/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
