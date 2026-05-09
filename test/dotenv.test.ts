import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadDotEnv, parseDotEnv } from '../src/utils/dotenv.js';

test('parseDotEnv parses common .env forms without treating quoted hashes as comments', () => {
  const parsed = parseDotEnv([
    '# ignored',
    '',
    'LLMWIKI_PUBLISH_REMOTE=https://github.com/OWNER/REPO.wiki.git',
    'export LLMWIKI_GIT_USER_NAME="repo wiki # bot"',
    'DOUBLE_ESCAPES="line\\nnext\\t\\"quoted\\"\\\\slash"',
    "LLMWIKI_GIT_USER_EMAIL='bot@example.com'",
    'UNCLOSED_SINGLE=\'left open',
    'UNCLOSED_DOUBLE="left open',
    'INLINE_COMMENT=value # comment',
    'HASH_VALUE=value#not-comment',
    'NO_EQUALS',
    '=NO_KEY',
    'INVALID-NAME=ignored'
  ].join('\n'));

  assert.deepEqual(parsed, {
    LLMWIKI_PUBLISH_REMOTE: 'https://github.com/OWNER/REPO.wiki.git',
    LLMWIKI_GIT_USER_NAME: 'repo wiki # bot',
    DOUBLE_ESCAPES: 'line\nnext\t"quoted"\\slash',
    LLMWIKI_GIT_USER_EMAIL: 'bot@example.com',
    UNCLOSED_SINGLE: 'left open',
    UNCLOSED_DOUBLE: 'left open',
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

test('loadDotEnv returns loaded false when .env is absent', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-dotenv-test-'));

  try {
    const result = await loadDotEnv(tempDir);

    assert.equal(result.loaded, false);
    assert.deepEqual(result.keys, []);
    assert.equal(result.path, path.join(tempDir, '.env'));
  } finally {
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
