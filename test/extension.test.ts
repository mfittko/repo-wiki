import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, stat, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import repoWikiExtension, { splitArgs } from '../src/extension.js';
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

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile, mkdir } from 'node:fs/promises';

const execFileAsync = promisify(execFile);

function createCapturingExtensionApi() {
  const commands: Array<{ name: string; options: { description?: string; handler: (args: string, ctx: unknown) => Promise<void> | void } }> = [];
  const tools: Array<{ name: string; execute: (toolCallId: string, params: unknown, signal?: AbortSignal) => Promise<unknown> }> = [];

  const pi = {
    registerCommand: (name: string, options: { description?: string; handler: (args: string, ctx: unknown) => Promise<void> | void }) => {
      commands.push({ name, options });
    },
    registerTool: (tool: { name: string; execute: (toolCallId: string, params: unknown, signal?: AbortSignal) => Promise<unknown> }) => {
      tools.push(tool);
    },
    on: () => {},
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
  };

  return { pi, commands, tools };
}

async function createGitRepo(parentDir: string) {
  const repoDir = path.join(parentDir, 'repo');
  const srcDir = path.join(repoDir, 'src');
  await mkdir(srcDir, { recursive: true });
  await writeFile(path.join(srcDir, 'index.js'), 'export function hello() { return 1; }\n', 'utf8');
  await execFileAsync('git', ['init'], { cwd: repoDir });
  await execFileAsync('git', ['config', 'user.email', 'test@example.com'], { cwd: repoDir });
  await execFileAsync('git', ['config', 'user.name', 'Test User'], { cwd: repoDir });
  await execFileAsync('git', ['add', '.'], { cwd: repoDir });
  await execFileAsync('git', ['commit', '-m', 'init'], { cwd: repoDir });
  return repoDir;
}

test('extension tool execute covers scan, plan, compile, lint, search, query, explain, path, publish dry-run, and cli fallback', async () => {
  const { pi, tools, commands } = createCapturingExtensionApi();
  repoWikiExtension(pi as unknown as import('@earendil-works/pi-coding-agent').ExtensionAPI);

  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-ext-e2e-'));
  try {
    const repoDir = await createGitRepo(tmpDir);
    const scanDir = path.join(tmpDir, 'scan');
    const planFile = path.join(tmpDir, 'plan.json');
    const wikiDir = path.join(tmpDir, 'wiki');

    const getTool = (name: string) => {
      const tool = tools.find((t) => t.name === name);
      assert.ok(tool, `tool ${name} not registered`);
      return tool;
    };

    const scanResult = await getTool('repo_wiki_scan').execute('id', { repoPath: repoDir, mode: 'bootstrap', outDir: scanDir });
    const scanSummary = (scanResult as any).details;
    assert.equal(scanSummary.mode, 'bootstrap');
    assert.equal(scanSummary.files, 1);

    const planResult = await getTool('repo_wiki_plan').execute('id', { scanDir, outFile: planFile });
    assert.ok((planResult as any).details.pages >= 1);

    const compileResult = await getTool('repo_wiki_compile').execute('id', { repoPath: repoDir, scanDir, planFile, wikiDir });
    assert.ok((compileResult as any).details.pages >= 1);

    const lintResult = await getTool('repo_wiki_lint').execute('id', { wikiDir, scanDir });
    assert.equal(typeof (lintResult as any).details.errors, 'number');

    const searchResult = await getTool('repo_wiki_search').execute('id', { query: 'function', wikiDir, limit: 5 });
    assert.ok((searchResult as any).details.results);

    const queryResult = await getTool('repo_wiki_query').execute('id', { question: 'what does hello do?', wikiDir, limit: 5 });
    assert.ok((queryResult as any).details.answer);

    const explainResult = await getTool('repo_wiki_explain').execute('id', { target: 'Module-index-js.md', wikiDir });
    assert.equal((explainResult as any).details.found, true);

    const pathResult = await getTool('repo_wiki_path').execute('id', { from: 'src/index.js', to: 'Module-index-js.md', wikiDir });
    assert.equal((pathResult as any).details.found, true);

    const publishResult = await getTool('repo_wiki_publish').execute('id', { wikiDir, dryRun: true });
    assert.ok(['published', 'skipped-no-remote', 'dry-run'].includes((publishResult as any).details.status));

    await getTool('repo_wiki_cli').execute('id', { args: `scan --repo ${repoDir} --out ${path.join(tmpDir, 'cli-scan')}` });

    const repoWikiCmd = commands.find((c) => c.name === 'repo_wiki');
    assert.ok(repoWikiCmd);
    await repoWikiCmd!.options.handler('--help', { ui: { notify: () => {} } });
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

test('extension install supports global scope', async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-ext-global-'));
  try {
    await runExtensionInstall({ global: true, piDir: tmpDir });
    const shimPath = path.join(tmpDir, 'extensions', 'repo-wiki.ts');
    assert.ok(await stat(shimPath).then(() => true, () => false));
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

test('extension install refuses to overwrite existing files without --force', async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-ext-refuse-'));
  try {
    await runExtensionInstall({ piDir: tmpDir });

    // Second run without --force must throw EXT_INSTALL_COLLISION.
    await assert.rejects(
      () => runExtensionInstall({ piDir: tmpDir }),
      (err: Error & { code?: string }) => err.code === 'EXT_INSTALL_COLLISION'
    );

    // The pre-existing shim must remain untouched.
    const shim = await readFile(path.join(tmpDir, 'extensions', 'repo-wiki.ts'), 'utf8');
    assert.ok(shim.includes('@mfittko/repo-wiki/extension'), 'shim should not have been clobbered');

    // With --force, install succeeds and replaces both paths.
    await runExtensionInstall({ piDir: tmpDir, force: true });
    const shimAfter = await readFile(path.join(tmpDir, 'extensions', 'repo-wiki.ts'), 'utf8');
    assert.ok(shimAfter.includes('@mfittko/repo-wiki/extension'));
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

test('repo_wiki_lint tool throws when wiki has lint errors', async () => {
  const { pi, tools } = createCapturingExtensionApi();
  repoWikiExtension(pi as unknown as import('@earendil-works/pi-coding-agent').ExtensionAPI);

  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-ext-lint-'));
  try {
    const wikiDir = path.join(tmpDir, 'wiki');
    const scanDir = path.join(tmpDir, 'scan');
    await mkdir(wikiDir, { recursive: true });
    await mkdir(scanDir, { recursive: true });
    await writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify({ files: [] }), 'utf8');
    await writeFile(path.join(wikiDir, 'Orphan.md'), '# Orphan\n', 'utf8');

    const lintTool = tools.find((t) => t.name === 'repo_wiki_lint')!;
    await assert.rejects(async () => { await lintTool.execute('id', { wikiDir, scanDir }); }, /Wiki lint failed/);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

test('repo_wiki_path tool throws when no path exists', async () => {
  const { pi, tools } = createCapturingExtensionApi();
  repoWikiExtension(pi as unknown as import('@earendil-works/pi-coding-agent').ExtensionAPI);

  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-ext-path-'));
  try {
    const wikiDir = path.join(tmpDir, 'wiki');
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(tmpDir, 'graph.json'), JSON.stringify({ schema_version: 1, nodes: [], edges: [] }), 'utf8');

    const pathTool = tools.find((t) => t.name === 'repo_wiki_path')!;
    await assert.rejects(async () => { await pathTool.execute('id', { from: 'missing-a', to: 'missing-b', wikiDir, graphPath: path.join(tmpDir, 'graph.json') }); }, /No path found/);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

test('repo_wiki_explain tool throws when target is not found', async () => {
  const { pi, tools } = createCapturingExtensionApi();
  repoWikiExtension(pi as unknown as import('@earendil-works/pi-coding-agent').ExtensionAPI);

  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-ext-explain-'));
  try {
    const wikiDir = path.join(tmpDir, 'wiki');
    await mkdir(wikiDir, { recursive: true });

    const explainTool = tools.find((t) => t.name === 'repo_wiki_explain')!;
    await assert.rejects(async () => { await explainTool.execute('id', { target: 'missing-target', wikiDir }); }, /Could not explain/);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

test('repo_wiki command handler propagates CLI errors', async () => {
  const { pi, commands } = createCapturingExtensionApi();
  repoWikiExtension(pi as unknown as import('@earendil-works/pi-coding-agent').ExtensionAPI);

  const cmd = commands.find((c) => c.name === 'repo_wiki')!;
  await assert.rejects(async () => {
    await cmd.options.handler('this-command-does-not-exist-fortest', { ui: { notify: () => {} } });
  }, /Unknown command/);
});

test('extension install defaults to project scope in cwd', async () => {
  const { pi } = createCapturingExtensionApi();
  repoWikiExtension(pi as unknown as import('@earendil-works/pi-coding-agent').ExtensionAPI);

  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-ext-project-'));
  const originalCwd = process.cwd();
  try {
    process.chdir(tmpDir);
    await runExtensionInstall({ project: true });
    const extensionFile = path.join(tmpDir, '.pi', 'extensions', 'repo-wiki.ts');
    const skillFile = path.join(tmpDir, '.pi', 'skills', 'repo-wiki-cli', 'SKILL.md');
    assert.ok(await stat(extensionFile).then(() => true, () => false), 'project shim not written');
    assert.ok(await stat(skillFile).then(() => true, () => false), 'project skill not copied');
  } finally {
    process.chdir(originalCwd);
    await rm(tmpDir, { recursive: true, force: true });
  }
});

test('splitArgs parses simple and quoted arguments', () => {
  assert.deepEqual(splitArgs('scan --repo .'), ['scan', '--repo', '.']);
  assert.deepEqual(splitArgs('  scan   --repo .  '), ['scan', '--repo', '.']);
  assert.deepEqual(splitArgs('compile --wiki "./my wiki"'), ['compile', '--wiki', './my wiki']);
  assert.deepEqual(splitArgs("compile --wiki 'my wiki'"), ['compile', '--wiki', 'my wiki']);
  assert.deepEqual(splitArgs('a "b c" d'), ['a', 'b c', 'd']);
  assert.deepEqual(splitArgs(''), []);
  assert.deepEqual(splitArgs('   '), []);
});

test('runExtensionInstall rejects --global combined with --project', async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-ext-scope-conflict-'));
  try {
    await assert.rejects(
      () => runExtensionInstall({ global: true, project: true, piDir: tmpDir }),
      (err: Error & { code?: string }) => err.code === 'EXT_INSTALL_SCOPE_CONFLICT'
    );
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
});
