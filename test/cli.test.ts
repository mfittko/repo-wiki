import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const execFileAsync = promisify(execFile);
const cliPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../bin/repo-wiki.js');

async function captureCli(argv: string[], cwd: string) {
  const result = await execFileAsync(process.execPath, [cliPath, ...argv], { cwd });
  return { stdout: result.stdout.trim(), stderr: result.stderr.trim() };
}

async function captureCliResult(argv: string[], cwd: string) {
  try {
    const result = await execFileAsync(process.execPath, [cliPath, ...argv], { cwd });
    return { stdout: result.stdout.trim(), stderr: result.stderr.trim(), exitCode: 0 };
  } catch (error: any) {
    const exitCode = typeof error?.code === 'number' ? error.code : 1;
    return {
      stdout: String(error.stdout || '').trim(),
      stderr: String(error.stderr || '').trim(),
      exitCode
    };
  }
}

test('CLI help describes GitHub Wiki and GitHub Pages publish targets', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));

  try {
    const { stdout } = await captureCli(['--help'], tempDir);
    assert.match(stdout, /publish\s+Push local wiki pages to GitHub Wiki or GitHub Pages\./);
    assert.match(stdout, /run\s+Run scan -> plan -> lint-docs -> compile -> lint, optionally followed by publish\./);
    assert.match(stdout, /--target <github-wiki\|github-pages>/);
    assert.match(stdout, /search\s+Search local wiki pages through the built-in offline index\./);
    assert.doesNotMatch(stdout, /local-artifact/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI publish wires github-pages target, pages path, and target-specific defaults', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');

    const { stdout } = await captureCli([
      'publish',
      '--wiki', wikiDir,
      '--target', 'github-pages',
      '--pages-path', 'docs',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.status, 'dry-run');
    assert.equal(summary.target, 'github-pages');
    assert.equal(summary.branch, 'gh-pages');
    assert.equal(summary.path, 'docs');
    assert.equal(summary.frontmatterPolicy, 'preserve');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI publish reads target-specific defaults from config', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const configDir = path.join(tempDir, '.llmwiki');

  try {
    await mkdir(wikiDir, { recursive: true });
    await mkdir(configDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');
    await writeFile(path.join(configDir, 'config.json'), JSON.stringify({
      publish: {
        target: 'github-pages',
        pages: {
          branch: 'site',
          path: 'docs',
          frontmatter: 'preserve'
        },
        wiki: {
          branch: 'master',
          frontmatter: 'strip'
        }
      }
    }), 'utf8');

    const { stdout } = await captureCli(['publish', '--wiki', wikiDir, '--dry-run'], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.target, 'github-pages');
    assert.equal(summary.branch, 'site');
    assert.equal(summary.path, 'docs');
    assert.equal(summary.frontmatterPolicy, 'preserve');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI warns and falls back for unknown target and frontmatter policy', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');

    const { stdout, stderr } = await captureCli([
      'publish',
      '--wiki', wikiDir,
      '--target', 'unknown-target',
      '--frontmatter-policy', 'unknown-policy',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.target, 'github-wiki');
    assert.equal(summary.branch, 'master');
    assert.equal(summary.frontmatterPolicy, 'provenance');
    assert.match(stderr, /unknown --target/);
    assert.match(stderr, /unknown --frontmatter-policy/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI publish falls back to target default for unknown frontmatter policy', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');

    const { stdout, stderr } = await captureCli([
      'publish',
      '--wiki', wikiDir,
      '--target', 'github-pages',
      '--frontmatter-policy', 'unknown-policy',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.target, 'github-pages');
    assert.equal(summary.frontmatterPolicy, 'preserve');
    assert.match(stderr, /falling back to "preserve"/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI publish accepts html-comment frontmatter policy with warning', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');

    const { stdout, stderr } = await captureCli([
      'publish',
      '--wiki', wikiDir,
      '--frontmatter-policy', 'html-comment',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.frontmatterPolicy, 'html-comment');
    assert.match(stderr, /reserved for future metadata comments/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI publish accepts provenance frontmatter policy for github-pages', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');

    const { stdout } = await captureCli([
      'publish',
      '--wiki', wikiDir,
      '--target', 'github-pages',
      '--frontmatter-policy', 'provenance',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.target, 'github-pages');
    assert.equal(summary.frontmatterPolicy, 'provenance');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI publish accepts --frontmatter as an alias for --frontmatter-policy', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Home.md'), '# Home\n', 'utf8');

    const { stdout } = await captureCli([
      'publish',
      '--wiki', wikiDir,
      '--frontmatter', 'strip',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.target, 'github-wiki');
    assert.equal(summary.frontmatterPolicy, 'strip');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI compile --repo loads that repository .env for LLM mode', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const repoDir = path.join(tempDir, 'repo');
  const scanDir = path.join(tempDir, 'scan');
  const planFile = path.join(tempDir, 'plan.json');
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(path.join(repoDir, 'src'), { recursive: true });
    await writeFile(path.join(repoDir, 'src', 'auth.ts'), 'export function login() { return true; }\n', 'utf8');
    await writeFile(path.join(repoDir, '.env'), 'LLMWIKI_COMPILER_MODE=llm\nLLMWIKI_LLM_PROVIDER=mock\n', 'utf8');

    await captureCli(['scan', '--repo', repoDir, '--out', scanDir], tempDir);
    await captureCli(['plan', '--scan', scanDir, '--out', planFile], tempDir);
    const { stdout } = await captureCli(['compile', '--repo', repoDir, '--scan', scanDir, '--plan', planFile, '--wiki', wikiDir], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.pages > 0, true);
    const moduleFile = await import('node:fs/promises').then(({ readdir }) => readdir(wikiDir)).then((files) => files.find((file) => file.startsWith('Module-'))!);
    const modulePage = await import('node:fs/promises').then(({ readFile }) => readFile(path.join(wikiDir, moduleFile), 'utf8'));
    assert.match(modulePage, /Generated by the mock LLM provider/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI run executes scan-plan-lint-compile and dry-run publish with pages target', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const repoDir = path.join(tempDir, 'repo');
  const scanDir = path.join(tempDir, 'scan');
  const planFile = path.join(tempDir, 'plan.json');
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(path.join(repoDir, 'src'), { recursive: true });
    await mkdir(path.join(repoDir, '.llmwiki'), { recursive: true });
    await writeFile(path.join(repoDir, 'package.json'), JSON.stringify({ name: 'fixture', scripts: { test: 'node --test' } }), 'utf8');
    await writeFile(path.join(repoDir, 'src', 'index.ts'), 'export const value = 1;\n', 'utf8');
    await writeFile(path.join(repoDir, '.llmwiki', 'config.json'), JSON.stringify({
      publish: {
        target: 'github-pages',
        pages: { branch: 'site', path: 'docs', frontmatter: 'preserve' }
      }
    }), 'utf8');

    const { stdout } = await captureCli([
      'run',
      '--repo', repoDir,
      '--scan', scanDir,
      '--plan', planFile,
      '--wiki', wikiDir,
      '--publish',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.mode, 'bootstrap');
    assert.equal(summary.repoPath, repoDir);
    assert.equal(summary.scan.files > 0, true);
    assert.equal(summary.plan.pages > 0, true);
    assert.equal(summary.compile.pages > 0, true);
    assert.equal(summary.publish.status, 'dry-run');
    assert.equal(summary.publish.target, 'github-pages');
    assert.equal(summary.publish.branch, 'site');
    assert.equal(summary.publish.path, 'docs');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI run blocks before compile when docs lint reports errors', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const repoDir = path.join(tempDir, 'repo');
  const scanDir = path.join(tempDir, 'scan');
  const planFile = path.join(tempDir, 'plan.json');
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(path.join(repoDir, 'src'), { recursive: true });
    await mkdir(path.join(repoDir, '.llmwiki'), { recursive: true });
    await writeFile(path.join(repoDir, 'package.json'), JSON.stringify({ name: 'fixture', scripts: { test: 'node --test' } }), 'utf8');
    await writeFile(path.join(repoDir, 'README.md'), '# Docs\n\nSee [missing](docs/missing.md).\n', 'utf8');
    await writeFile(path.join(repoDir, 'src', 'index.ts'), 'export const value = 1;\n', 'utf8');
    await writeFile(path.join(repoDir, '.llmwiki', 'config.json'), JSON.stringify({
      lint: {
        broken_file_references: 'error'
      }
    }), 'utf8');

    const { stdout, exitCode } = await captureCliResult([
      'run',
      '--repo', repoDir,
      '--scan', scanDir,
      '--plan', planFile,
      '--wiki', wikiDir,
      '--publish',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(exitCode, 1);
    assert.equal(summary.status, 'blocked');
    assert.equal(summary.blockedStage, 'lint-docs');
    assert.ok(summary.docsLint.errors > 0);
    assert.deepEqual(summary.compile, { status: 'skipped', reason: 'docs-lint-errors' });
    assert.deepEqual(summary.lint, { status: 'skipped', reason: 'docs-lint-errors' });
    assert.deepEqual(summary.publish, { status: 'blocked', reason: 'docs-lint-errors' });
    await assert.rejects(access(wikiDir));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI run continues to compile when docs lint is warning-only', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const repoDir = path.join(tempDir, 'repo');
  const scanDir = path.join(tempDir, 'scan');
  const planFile = path.join(tempDir, 'plan.json');
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(path.join(repoDir, 'src'), { recursive: true });
    await mkdir(path.join(repoDir, '.llmwiki'), { recursive: true });
    await writeFile(path.join(repoDir, 'package.json'), JSON.stringify({ name: 'fixture', scripts: { test: 'node --test' } }), 'utf8');
    await writeFile(path.join(repoDir, 'README.md'), '# Docs\n\nSee [missing](docs/missing.md).\n', 'utf8');
    await writeFile(path.join(repoDir, 'src', 'index.ts'), 'export const value = 1;\n', 'utf8');
    await writeFile(path.join(repoDir, '.llmwiki', 'config.json'), JSON.stringify({
      lint: {
        broken_file_references: 'warning'
      }
    }), 'utf8');

    const { stdout } = await captureCli([
      'run',
      '--repo', repoDir,
      '--scan', scanDir,
      '--plan', planFile,
      '--wiki', wikiDir
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.status, 'ok');
    assert.equal(summary.blockedStage, null);
    assert.equal(summary.docsLint.errors, 0);
    assert.ok(summary.docsLint.warnings > 0);
    assert.equal(summary.compile.pages > 0, true);
    assert.equal(summary.lint.errors, 0);
    assert.equal(summary.publish, null);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI run --publish blocks publish when wiki lint reports errors', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const repoDir = path.join(tempDir, 'repo');
  const scanDir = path.join(tempDir, 'scan');
  const planFile = path.join(tempDir, 'plan.json');
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(path.join(repoDir, 'src'), { recursive: true });
    await mkdir(path.join(repoDir, '.llmwiki'), { recursive: true });
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(repoDir, 'package.json'), JSON.stringify({ name: 'fixture', scripts: { test: 'node --test' } }), 'utf8');
    await writeFile(path.join(repoDir, 'README.md'), '# Docs\n', 'utf8');
    await writeFile(path.join(repoDir, 'src', 'index.ts'), 'export const value = 1;\n', 'utf8');
    await writeFile(path.join(wikiDir, 'Bad.md'), 'token=12345678\n', 'utf8');

    const { stdout, exitCode } = await captureCliResult([
      'run',
      '--repo', repoDir,
      '--scan', scanDir,
      '--plan', planFile,
      '--wiki', wikiDir,
      '--publish',
      '--dry-run'
    ], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(exitCode, 1);
    assert.equal(summary.status, 'blocked');
    assert.equal(summary.blockedStage, 'lint');
    assert.ok(summary.lint.errors > 0);
    assert.deepEqual(summary.publish, { status: 'blocked', reason: 'wiki-lint-errors' });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI lint prints graph-health findings to stderr and returns machine-readable JSON', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const scanDir = path.join(tempDir, 'scan');
  const wikiDir = path.join(tempDir, 'wiki');

  const requiredPage = (title: string) => ['---', 'source_commit: "abc123"', 'page_state: "generated"', '---', '', `# ${title}`].join('\n');

  try {
    await mkdir(scanDir, { recursive: true });
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify({ commit: 'abc123', files: [] }), 'utf8');
    await writeFile(path.join(wikiDir, 'Home.md'), requiredPage('Home'), 'utf8');
    await writeFile(path.join(wikiDir, '_Sidebar.md'), requiredPage('Navigation'), 'utf8');
    await writeFile(path.join(wikiDir, 'Index.md'), requiredPage('Index'), 'utf8');
    await writeFile(path.join(wikiDir, 'Log.md'), requiredPage('Log'), 'utf8');
    await writeFile(path.join(wikiDir, 'Agent-Context-Pack.md'), requiredPage('Agent Context Pack'), 'utf8');
    await writeFile(path.join(wikiDir, 'Repository-Overview.md'), requiredPage('Repository Overview'), 'utf8');
    await writeFile(path.join(wikiDir, 'Architecture.md'), requiredPage('Architecture'), 'utf8');
    await writeFile(path.join(wikiDir, 'Build-Test-and-Run.md'), requiredPage('Build Test and Run'), 'utf8');
    await writeFile(path.join(wikiDir, 'Open-Questions.md'), requiredPage('Open Questions'), 'utf8');
    await writeFile(path.join(tempDir, 'graph.json'), JSON.stringify({
      schema_version: 1,
      nodes: [
        { id: 'page:Home.md', kind: 'page', path: 'Home.md', page_state: 'generated' },
        { id: 'page:Repository-Overview.md', kind: 'page', path: 'Repository-Overview.md', page_state: 'generated' },
        { id: 'source:src/index.ts', kind: 'source', path: 'src/index.ts' }
      ],
      edges: [
        { type: 'provenance', from: 'page:Repository-Overview.md', to: 'source:src/index.ts' }
      ]
    }), 'utf8');

    const { stdout, stderr } = await captureCli(['lint', '--wiki', wikiDir, '--scan', scanDir], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(Array.isArray(summary.graph_health.findings), true);
    assert.equal(summary.graph_health.findings.length, 1);
    assert.equal(summary.graph_health.findings[0].code, 'GRAPH001');
    assert.match(summary.graph_health.findings[0].message, /graph\.json/);
    assert.doesNotMatch(summary.graph_health.findings[0].message, /\.llmwiki\/graph\.json/);
    assert.match(stderr, /GRAPH001/);
    assert.match(stderr, /graph\.json/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('CLI search returns stable JSON results for local wiki pages', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-test-'));
  const wikiDir = path.join(tempDir, 'wiki');

  try {
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Architecture.md'), `---
kind: "foundation"
page_state: "generated"
source_paths:
  - "src/compiler.ts"
---
# Architecture

Architecture covers compile and search flow.
`, 'utf8');
    await writeFile(path.join(wikiDir, 'Module-scanner-ts.md'), `---
kind: "module"
page_state: "generated"
source_paths:
  - "src/scanner.ts"
---
# Module scanner ts

Scanner builds repository manifests.
`, 'utf8');

    const { stdout } = await captureCli(['search', 'scanner', '--wiki', wikiDir, '--json'], tempDir);
    const summary = JSON.parse(stdout);

    assert.equal(summary.query, 'scanner');
    assert.equal(summary.results[0].pagePath, 'Module-scanner-ts.md');
    assert.deepEqual(summary.results[0].sourcePaths, ['src/scanner.ts']);
    assert.equal(summary.index.pages, 2);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});


test('CLI query, path, and explain expose stable JSON over local wiki artifacts', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cli-query-test-'));
  const wikiDir = path.join(tempDir, 'wiki');
  const graphPath = path.join(tempDir, 'graph.json');

  try {
    await mkdir(wikiDir, { recursive: true });
    await writeFile(path.join(wikiDir, 'Architecture.md'), `---
kind: "foundation"
page_state: "generated"
source_paths:
  - "src/compiler.ts"
---
# Architecture

Architecture covers compile and query flow.
`, 'utf8');
    await writeFile(path.join(wikiDir, 'Module-compiler-ts.md'), `---
kind: "module"
page_state: "generated"
source_paths:
  - "src/compiler.ts"
---
# Module compiler ts

Compiler writes generated wiki pages from source cards.
`, 'utf8');
    await writeFile(graphPath, JSON.stringify({
      schema_version: 1,
      nodes: [
        { id: 'page:Architecture.md', kind: 'page', path: 'Architecture.md', page_state: 'generated' },
        { id: 'page:Module-compiler-ts.md', kind: 'page', path: 'Module-compiler-ts.md', page_state: 'generated' },
        { id: 'source:src/compiler.ts', kind: 'source', path: 'src/compiler.ts' }
      ],
      edges: [
        { type: 'wiki_link', from: 'page:Architecture.md', to: 'page:Module-compiler-ts.md' },
        { type: 'provenance', from: 'page:Module-compiler-ts.md', to: 'source:src/compiler.ts' }
      ]
    }), 'utf8');

    const query = JSON.parse((await captureCli(['query', 'compiler pages', '--wiki', wikiDir, '--graph', graphPath, '--json'], tempDir)).stdout);
    assert.equal(query.question, 'compiler pages');
    assert.equal(query.evidence.some((item: any) => item.ref === 'src/compiler.ts'), true);

    const traversal = JSON.parse((await captureCli(['path', 'Architecture.md', 'src/compiler.ts', '--wiki', wikiDir, '--graph', graphPath, '--json'], tempDir)).stdout);
    assert.equal(traversal.found, true);
    assert.deepEqual(traversal.edges.map((edge: any) => edge.type), ['wiki_link', 'provenance']);

    const explain = JSON.parse((await captureCli(['explain', 'Module-compiler-ts.md', '--wiki', wikiDir, '--graph', graphPath, '--json'], tempDir)).stdout);
    assert.equal(explain.found, true);
    assert.equal(explain.page.pagePath, 'Module-compiler-ts.md');
    assert.deepEqual(explain.evidence.map((item: any) => item.ref), ['src/compiler.ts']);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
