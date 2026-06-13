import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, stat, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import repoWikiExtension from '../src/extension.js';
import { runExtensionInstall } from '../src/extension-install.js';

const currentFile = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(currentFile), '../..');

function createFakeExtensionApi() {
  const commands: Array<{ name: string; description?: string }> = [];
  const tools: Array<{ name: string; label: string; description: string }> = [];
  const events: Array<{ name: string; handler: unknown }> = [];

  const pi = {
    registerCommand: (name: string, options: { description?: string; handler: unknown }) => {
      commands.push({ name, description: options.description });
    },
    registerTool: (tool: { name: string; label: string; description: string; execute?: unknown }) => {
      tools.push({ name: tool.name, label: tool.label, description: tool.description });
    },
    on: (name: string, handler: unknown) => {
      events.push({ name, handler });
    },
    registerShortcut: () => {},
    registerFlag: () => {},
    getFlag: () => undefined,
    registerMessageRenderer: () => {},
    sendMessage: () => {},
    sendUserMessage: () => {},
    appendEntry: () => {},
    setSessionName: () => {},
    getSessionName: () => undefined,
    setLabel: () => {},
    exec: async () => ({ code: 0, stdout: '', stderr: '' }),
    getActiveTools: () => [],
    getAllTools: () => [],
    setActiveTools: () => {},
    setModel: async () => false,
    getThinkingLevel: () => 'off',
    setThinkingLevel: () => {},
    events: { on: () => {}, emit: () => {} },
    registerProvider: () => {},
    unregisterProvider: () => {},
    getCommands: () => commands,
  };

  return { pi, commands, tools, events };
}

test('repoWikiExtension registers the repo_wiki command and expected tools', () => {
  const { pi, commands, tools } = createFakeExtensionApi();

  repoWikiExtension(pi as unknown as import('@earendil-works/pi-coding-agent').ExtensionAPI);

  const commandNames = commands.map((c) => c.name);
  assert.ok(commandNames.includes('repo_wiki'), `expected repo_wiki command, got ${commandNames.join(', ')}`);

  const toolNames = tools.map((t) => t.name);
  for (const name of [
    'repo_wiki_cli',
    'repo_wiki_scan',
    'repo_wiki_plan',
    'repo_wiki_compile',
    'repo_wiki_lint',
    'repo_wiki_publish',
    'repo_wiki_search',
    'repo_wiki_query',
    'repo_wiki_path',
    'repo_wiki_explain',
  ]) {
    assert.ok(toolNames.includes(name), `expected tool ${name}, got ${toolNames.join(', ')}`);
  }
});

test('extension install writes shim and skill to custom piDir', async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-ext-install-'));
  try {
    await runExtensionInstall({ piDir: tmpDir });

    const shimPath = path.join(tmpDir, 'extensions', 'repo-wiki.ts');
    const skillPath = path.join(tmpDir, 'skills', 'repo-wiki-cli', 'SKILL.md');

    assert.ok(await stat(shimPath).then(() => true, () => false), 'shim not written');
    const shim = await readFile(shimPath, 'utf8');
    assert.ok(shim.includes("@mfittko/repo-wiki/extension"), 'shim does not import extension export');
    assert.ok(shim.includes('export default repoWiki'), 'shim does not re-export default');

    assert.ok(await stat(skillPath).then(() => true, () => false), 'skill not copied');
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

test('extension entrypoint and skill files are listed in package files', async () => {
  const files = new Set([
    path.join(packageRoot, 'dist/src/extension.js'),
    path.join(packageRoot, 'dist/src/extension.d.ts'),
    path.join(packageRoot, 'skills/repo-wiki-cli/SKILL.md'),
  ]);

  for (const file of files) {
    assert.ok(await stat(file).then(() => true, () => false), `missing ${path.relative(packageRoot, file)}`);
  }
});
