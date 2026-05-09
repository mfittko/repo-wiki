import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadDotEnv, parseDotEnv } from '../src/utils/dotenv.js';
import { runCli } from '../src/cli.js';

test('parseDotEnv parses common .env forms without treating quoted hashes as comments', () => {
  const parsed = parseDotEnv([
    '# ignored',
    'LLMWIKI_PUBLISH_REMOTE=https://github.com/OWNER/REPO.wiki.git',
    'export LLMWIKI_GIT_USER_NAME="repo wiki # bot"',
    "LLMWIKI_GIT_USER_EMAIL='bot@example.com'",
    'INLINE_COMMENT=value # comment',
    'HASH_VALUE=value#not-comment',
    'INVALID-NAME=ignored'
  ].join('\n'));

  assert.deepEqual(parsed, {
    LLMWIKI_PUBLISH_REMOTE: 'https://github.com/OWNER/REPO.wiki.git',
    LLMWIKI_GIT_USER_NAME: 'repo wiki # bot',
    LLMWIKI_GIT_USER_EMAIL: 'bot@example.com',
    INLINE_COMMENT: 'value',
    HASH_VALUE: 'value#not-comment'
  });
});

test('loadDotEnv loads .env values without overriding existing process environment', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-dotenv-test-'));
  const previousRemote = process.env.LLMWIKI_PUBLISH_REMOTE;
  const previousUser = process.env.LLMWIKI_GIT_USER_NAME;

  try {
    delete process.env.LLMWIKI_PUBLISH_REMOTE;
    process.env.LLMWIKI_GIT_USER_NAME = 'from-process';
    await fs.writeFile(path.join(tempDir, '.env'), [
      'LLMWIKI_PUBLISH_REMOTE=https://github.com/OWNER/REPO.wiki.git',
      'LLMWIKI_GIT_USER_NAME=from-env-file'
    ].join('\n'), 'utf8');

    const result = await loadDotEnv(tempDir);

    assert.equal(result.loaded, true);
    assert.deepEqual(result.keys, ['LLMWIKI_PUBLISH_REMOTE']);
    assert.equal(process.env.LLMWIKI_PUBLISH_REMOTE, 'https://github.com/OWNER/REPO.wiki.git');
    assert.equal(process.env.LLMWIKI_GIT_USER_NAME, 'from-process');
  } finally {
    restoreEnv('LLMWIKI_PUBLISH_REMOTE', previousRemote);
    restoreEnv('LLMWIKI_GIT_USER_NAME', previousUser);
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('runCli reads publish remote from .env for dry-run publishing', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-dotenv-cli-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const previousRemote = process.env.LLMWIKI_PUBLISH_REMOTE;
  const previousCwd = process.cwd();
  const logs: string[] = [];
  const originalLog = console.log;

  try {
    delete process.env.LLMWIKI_PUBLISH_REMOTE;
    await fs.mkdir(wikiDir, { recursive: true });
    await fs.writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await fs.writeFile(path.join(tempDir, '.env'), 'LLMWIKI_PUBLISH_REMOTE=https://github.com/OWNER/REPO.wiki.git\n', 'utf8');
    process.chdir(tempDir);
    console.log = (message?: unknown) => {
      logs.push(String(message));
    };

    await runCli(['publish', '--wiki', wikiDir, '--dry-run']);

    assert.equal(JSON.parse(logs[0]).remote, 'https://github.com/OWNER/REPO.wiki.git');
  } finally {
    console.log = originalLog;
    process.chdir(previousCwd);
    restoreEnv('LLMWIKI_PUBLISH_REMOTE', previousRemote);
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
