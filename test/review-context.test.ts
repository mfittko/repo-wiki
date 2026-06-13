import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import { runGit } from '../src/utils/git.js';
import {
  buildReviewContextBundle,
  formatReviewContextBundle,
  writeReviewContextBundle,
  parseGitDiff,
  resolveReviewTarget
} from '../src/review-context.js';

const execFileAsync = promisify(execFile);
const cliPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../bin/repo-wiki.js');

async function makeReviewFixture() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-review-context-'));

  await fs.mkdir(path.join(dir, 'src'), { recursive: true });
  await fs.mkdir(path.join(dir, '.llmwiki', 'run'), { recursive: true });
  await fs.mkdir(path.join(dir, '.llmwiki', 'wiki'), { recursive: true });

  await fs.writeFile(
    path.join(dir, 'src', 'greeting.ts'),
    'export function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n'
  );
  await fs.writeFile(
    path.join(dir, 'src', 'main.ts'),
    "import { greet } from './greeting';\n\nexport function run() {\n  console.log(greet('world'));\n}\n"
  );

  await runGit(['init', '-b', 'main'], { cwd: dir });
  await runGit(['config', 'user.email', 'test@example.com'], { cwd: dir });
  await runGit(['config', 'user.name', 'Test User'], { cwd: dir });
  await runGit(['add', '.'], { cwd: dir });
  await runGit(['commit', '-m', 'base'], { cwd: dir });

  await runGit(['checkout', '-b', 'feature'], { cwd: dir });
  await fs.writeFile(
    path.join(dir, 'src', 'main.ts'),
    "import { greet } from './greeting';\n\nexport const APP = 'demo';\n\nexport function run() {\n  console.log(greet('world'));\n}\n"
  );
  await runGit(['add', '.'], { cwd: dir });
  await runGit(['commit', '-m', 'head'], { cwd: dir });

  const manifest = {
    schema_version: 1,
    mode: 'bootstrap',
    repo_path: dir,
    remote: 'unknown',
    commit: 'HEAD',
    base_ref: null,
    head_ref: 'HEAD',
    generated_at: '2026-01-01T00:00:00.000Z',
    config: {},
    totals: {},
    analysis: {},
    documentation: { enabled: false, files: [], summary: {} },
    files: [
      {
        kind: 'source_card',
        path: 'src/greeting.ts',
        language: 'TypeScript',
        imports: [],
        symbols: ['greet'],
        exported_symbols: [{ name: 'greet', kind: 'function' }]
      },
      {
        kind: 'source_card',
        path: 'src/main.ts',
        language: 'TypeScript',
        imports: ['./greeting'],
        symbols: ['run', 'APP'],
        exported_symbols: [
          { name: 'run', kind: 'function' },
          { name: 'APP', kind: 'const' }
        ]
      }
    ]
  };
  await fs.writeFile(
    path.join(dir, '.llmwiki', 'run', 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  const graph = {
    schema_version: 1,
    nodes: [
      { id: 'source:src/main.ts', kind: 'source', path: 'src/main.ts' },
      { id: 'source:src/greeting.ts', kind: 'source', path: 'src/greeting.ts' },
      {
        id: 'page:Module-main-ts.md',
        kind: 'page',
        path: 'Module-main-ts.md',
        page_state: 'generated'
      }
    ],
    edges: [{ type: 'affects', from: 'source:src/main.ts', to: 'page:Module-main-ts.md' }]
  };
  await fs.writeFile(path.join(dir, '.llmwiki', 'graph.json'), JSON.stringify(graph, null, 2));

  await fs.writeFile(
    path.join(dir, '.llmwiki', 'wiki', 'Module-main-ts.md'),
    '---\nsource_repo: owner/repo\nsource_commit: abc123\ncompiled_at: 2026-01-01T00:00:00.000Z\npage_state: generated\nkind: module\nsource_paths:\n  - src/main.ts\n---\n\n# Module main.ts\n\nEntry point.\n'
  );

  return dir;
}

test('buildReviewContextBundle produces deterministic markdown bundle', async () => {
  const repo = await makeReviewFixture();
  try {
    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });

    const md = formatReviewContextBundle(bundle, 'md');

    assert.match(md, /# Review context for/);
    assert.match(md, /## Changed lines/);
    assert.match(md, /### src\/main\.ts/);
    assert.match(md, /^\+export const APP = 'demo';$/m);
    assert.match(md, /## Adjacent context \(depth 1\)/);
    assert.match(md, /### src\/greeting\.ts \(imported by src\/main\.ts\)/);
    assert.match(md, /## Related wiki pages/);
    assert.match(md, /### Module-main-ts/);
    assert.match(md, /src\/main\.ts/);
    assert.equal(bundle.adjacentDepth, 1);

    const second = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    assert.equal(formatReviewContextBundle(second, 'md'), md);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('buildReviewContextBundle emits JSON format', async () => {
  const repo = await makeReviewFixture();
  try {
    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    const json = formatReviewContextBundle(bundle, 'json');
    const parsed = JSON.parse(json);
    assert.ok(parsed.changedFiles.some((file: any) => file.newPath === 'src/main.ts'));
    assert.ok(parsed.adjacentFiles.some((file: any) => file.path === 'src/greeting.ts'));
    assert.ok(parsed.relatedWikiPages.some((page: any) => page.path === 'Module-main-ts.md'));
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('buildReviewContextBundle warns when wiki graph is missing', async () => {
  const repo = await makeReviewFixture();
  try {
    await fs.rm(path.join(repo, '.llmwiki', 'graph.json'));
    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    assert.ok(bundle.warnings.some((w) => w.includes('Wiki graph not found')));
    assert.equal(bundle.relatedWikiPages.length, 0);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('parseGitDiff preserves +/- context per line', () => {
  const diff = [
    'diff --git a/src/main.ts b/src/main.ts',
    'index 1111111..2222222 100644',
    '--- a/src/main.ts',
    '+++ b/src/main.ts',
    '@@ -1,3 +1,4 @@',
    ' export function run() {',
    '+  const x = 1;',
    '   return x;',
    ' }'
  ].join('\n');

  const files = parseGitDiff(diff);
  assert.equal(files.length, 1);
  const file = files[0];
  assert.equal(file.newPath, 'src/main.ts');
  assert.equal(file.hunks.length, 1);
  const hunk = file.hunks[0];
  assert.equal(hunk.lines.length, 4);
  assert.equal(hunk.lines[0].prefix, ' ');
  assert.equal(hunk.lines[1].prefix, '+');
  assert.equal(hunk.lines[1].newLine, 2);
});

test('resolveReviewTarget resolves a base..head range', async () => {
  const repo = await makeReviewFixture();
  try {
    const target = await resolveReviewTarget(repo, 'main..feature');
    assert.equal(target.kind, 'range');
    assert.match(target.baseCommit, /^[0-9a-f]{40}$/);
    assert.match(target.headCommit, /^[0-9a-f]{40}$/);
    assert.notEqual(target.baseCommit, target.headCommit);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

async function runReviewContextCli(argv: string[]) {
  const result = await execFileAsync(process.execPath, [cliPath, ...argv], { maxBuffer: 20 * 1024 * 1024 });
  return result.stdout.trim();
}

test('CLI review-context emits markdown by default', async () => {
  const repo = await makeReviewFixture();
  try {
    const stdout = await runReviewContextCli(['review-context', 'main..feature', '--repo', repo]);
    assert.match(stdout, /## Changed lines/);
    assert.match(stdout, /## Adjacent context/);
    assert.match(stdout, /## Related wiki pages/);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('CLI review-context writes both formats with --out', async () => {
  const repo = await makeReviewFixture();
  const out = path.join(repo, 'bundle');
  try {
    await runReviewContextCli(['review-context', 'main..feature', '--repo', repo, '--format', 'both', '--out', out]);
    const md = await fs.readFile(out + '.md', 'utf8');
    const json = await fs.readFile(out + '.json', 'utf8');
    assert.match(md, /### src\/main\.ts/);
    const parsed = JSON.parse(json);
    assert.ok(Array.isArray(parsed.changedFiles));
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});


test('buildReviewContextBundle falls back to walking source files when manifest is missing', async () => {
  const repo = await makeReviewFixture();
  try {
    await fs.rm(path.join(repo, '.llmwiki', 'run', 'manifest.json'));
    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    assert.ok(bundle.adjacentFiles.some((file) => file.path === 'src/greeting.ts'));
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('buildReviewContextBundle uses symbol grep fallback for non-JavaScript languages', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-review-context-py-'));
  try {
    await fs.mkdir(path.join(repo, 'src'), { recursive: true });
    await fs.mkdir(path.join(repo, '.llmwiki', 'run'), { recursive: true });
    await fs.writeFile(path.join(repo, 'src', 'helper.py'), 'def helper():\n    return 1\n');
    await fs.writeFile(path.join(repo, 'src', 'app.py'), 'from helper import helper\n\ndef main():\n    print(helper())\n');
    await fs.writeFile(path.join(repo, 'src', 'consumer.py'), 'from app import main\n\nmain()\n');

    await runGit(['init', '-b', 'main'], { cwd: repo });
    await runGit(['config', 'user.email', 'test@example.com'], { cwd: repo });
    await runGit(['config', 'user.name', 'Test User'], { cwd: repo });
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'base'], { cwd: repo });

    await runGit(['checkout', '-b', 'feature'], { cwd: repo });
    await fs.writeFile(
      path.join(repo, 'src', 'app.py'),
      'from helper import helper\n\nAPP = "demo"\n\ndef main():\n    print(helper())\n'
    );
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'head'], { cwd: repo });

    const manifest = {
      files: [
        {
          path: 'src/helper.py',
          language: 'Python',
          imports: [],
          symbols: ['helper'],
          exported_symbols: [{ name: 'helper', kind: 'function' }]
        },
        {
          path: 'src/app.py',
          language: 'Python',
          imports: ['helper'],
          symbols: ['main', 'APP'],
          exported_symbols: [{ name: 'main', kind: 'function' }]
        },
        {
          path: 'src/consumer.py',
          language: 'Python',
          imports: ['app'],
          symbols: [],
          exported_symbols: []
        }
      ]
    };
    await fs.writeFile(path.join(repo, '.llmwiki', 'run', 'manifest.json'), JSON.stringify(manifest, null, 2));

    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    assert.ok(bundle.changedFiles.some((file) => file.newPath === 'src/app.py'));
    assert.ok(bundle.adjacentFiles.some((file) => file.path === 'src/consumer.py'));
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('buildReviewContextBundle with adjacencyDepth=0 returns no adjacent files', async () => {
  const repo = await makeReviewFixture();
  try {
    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 0
    });
    assert.equal(bundle.adjacentFiles.length, 0);
    assert.match(formatReviewContextBundle(bundle, 'md'), /## Adjacent context \(depth 0\)/);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('buildReviewContextBundle warns on malformed graph', async () => {
  const repo = await makeReviewFixture();
  try {
    await fs.writeFile(path.join(repo, '.llmwiki', 'graph.json'), '{invalid');
    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    assert.ok(bundle.warnings.some((w) => w.includes('Could not load wiki graph')));
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('CLI review-context emits JSON with --json', async () => {
  const repo = await makeReviewFixture();
  try {
    const stdout = await runReviewContextCli(['review-context', 'main..feature', '--repo', repo, '--json']);
    const parsed = JSON.parse(stdout);
    assert.ok(Array.isArray(parsed.changedFiles));
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('CLI review-context handles --format both without --out by falling back to markdown', async () => {
  const repo = await makeReviewFixture();
  try {
    const stdout = await runReviewContextCli(['review-context', 'main..feature', '--repo', repo, '--format', 'both']);
    assert.match(stdout, /## Changed lines/);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('CLI review-context respects --adjacency 0 (disables adjacent context)', async () => {
  const repo = await makeReviewFixture();
  try {
    const stdout = await runReviewContextCli(['review-context', 'main..feature', '--repo', repo, '--adjacency', '0']);
    assert.match(stdout, /## Changed lines/);
    // With depth 0 there must be no Adjacent context section content (no "imported by" headings).
    assert.doesNotMatch(stdout, /imported by/i);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('writeReviewContextBundle writes markdown and JSON files', async () => {
  const repo = await makeReviewFixture();
  try {
    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    const outMd = path.join(repo, 'bundle.md');
    const mdFiles = await writeReviewContextBundle(bundle, outMd, 'md');
    assert.deepEqual(mdFiles, [outMd]);
    assert.ok((await fs.readFile(outMd, 'utf8')).includes('## Changed lines'));

    const outJson = path.join(repo, 'bundle.json');
    const jsonFiles = await writeReviewContextBundle(bundle, outJson, 'json');
    assert.deepEqual(jsonFiles, [outJson]);
    assert.ok((await fs.readFile(outJson, 'utf8')).includes('"changedFiles"'));
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('resolveReviewTarget resolves a branch target against origin/HEAD', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-review-context-branch-'));
  try {
    await fs.mkdir(path.join(repo, 'src'), { recursive: true });
    await fs.writeFile(path.join(repo, 'src', 'a.ts'), 'export const A = 1;\n');
    await runGit(['init', '-b', 'main'], { cwd: repo });
    await runGit(['config', 'user.email', 'test@example.com'], { cwd: repo });
    await runGit(['config', 'user.name', 'Test User'], { cwd: repo });
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'base'], { cwd: repo });
    await runGit(['remote', 'add', 'origin', repo], { cwd: repo });
    await runGit(['push', 'origin', 'main'], { cwd: repo });
    await runGit(['remote', 'set-head', 'origin', 'main'], { cwd: repo });

    await runGit(['checkout', '-b', 'feature'], { cwd: repo });
    await fs.writeFile(path.join(repo, 'src', 'a.ts'), 'export const A = 2;\n');
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'head'], { cwd: repo });

    const target = await resolveReviewTarget(repo, 'feature');
    assert.equal(target.kind, 'branch');
    assert.equal(target.headRef, 'feature');
    assert.match(target.baseCommit, /^[0-9a-f]{40}$/);
    assert.match(target.headCommit, /^[0-9a-f]{40}$/);
    assert.notEqual(target.baseCommit, target.headCommit);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('resolveReviewTarget throws on invalid range', async () => {
  const repo = await makeReviewFixture();
  try {
    await assert.rejects(() => resolveReviewTarget(repo, '..feature'), /Invalid range target/);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('buildReviewContextBundle detects JS importers of a changed file', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-review-context-importer-'));
  try {
    await fs.mkdir(path.join(repo, 'src'), { recursive: true });
    await fs.mkdir(path.join(repo, '.llmwiki', 'run'), { recursive: true });
    await fs.writeFile(
      path.join(repo, 'src', 'greeting.ts'),
      'export function greet(): string {\n  return "hello";\n}\n'
    );
    await fs.writeFile(
      path.join(repo, 'src', 'main.ts'),
      "import { greet } from './greeting';\n\ngreet();\n"
    );

    await runGit(['init', '-b', 'main'], { cwd: repo });
    await runGit(['config', 'user.email', 'test@example.com'], { cwd: repo });
    await runGit(['config', 'user.name', 'Test User'], { cwd: repo });
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'base'], { cwd: repo });

    await runGit(['checkout', '-b', 'feature'], { cwd: repo });
    await fs.writeFile(
      path.join(repo, 'src', 'greeting.ts'),
      'export function greet(): string {\n  return "hi";\n}\n'
    );
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'head'], { cwd: repo });

    const manifest = {
      files: [
        {
          path: 'src/greeting.ts',
          language: 'TypeScript',
          imports: [],
          symbols: ['greet'],
          exported_symbols: [{ name: 'greet', kind: 'function' }]
        },
        {
          path: 'src/main.ts',
          language: 'TypeScript',
          imports: ['./greeting'],
          symbols: [],
          exported_symbols: []
        }
      ]
    };
    await fs.writeFile(path.join(repo, '.llmwiki', 'run', 'manifest.json'), JSON.stringify(manifest, null, 2));

    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    assert.ok(bundle.changedFiles.some((file) => file.newPath === 'src/greeting.ts'));
    assert.ok(bundle.adjacentFiles.some((file) => file.path === 'src/main.ts' && file.relation.includes('imports')));
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('writeReviewContextBundle writes both formats', async () => {
  const repo = await makeReviewFixture();
  try {
    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    const out = path.join(repo, 'bundle');
    const files = await writeReviewContextBundle(bundle, out, 'both');
    assert.deepEqual(files.sort(), [out + '.json', out + '.md'].sort());
    assert.ok((await fs.readFile(out + '.md', 'utf8')).includes('## Changed lines'));
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('related wiki page body fallback when frontmatter is absent', async () => {
  const repo = await makeReviewFixture();
  try {
    const graph = JSON.parse(await fs.readFile(path.join(repo, '.llmwiki', 'graph.json'), 'utf8'));
    graph.nodes.push({
      id: 'page:Notes.md',
      kind: 'page',
      path: 'Notes.md',
      page_state: 'generated'
    });
    graph.edges.push({ type: 'affects', from: 'source:src/main.ts', to: 'page:Notes.md' });
    await fs.writeFile(path.join(repo, '.llmwiki', 'graph.json'), JSON.stringify(graph, null, 2));
    await fs.writeFile(path.join(repo, '.llmwiki', 'wiki', 'Notes.md'), '# Notes\n\nNo frontmatter here.\n');

    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    const notes = bundle.relatedWikiPages.find((page) => page.path === 'Notes.md');
    assert.ok(notes);
    assert.equal(notes!.frontmatter, null);
    assert.match(notes!.body, /No frontmatter here/);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('buildReviewContextBundle handles an empty diff range', async () => {
  const repo = await makeReviewFixture();
  try {
    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'HEAD..HEAD',
      adjacencyDepth: 1
    });
    assert.equal(bundle.changedFiles.length, 0);
    const md = formatReviewContextBundle(bundle, 'md');
    assert.match(md, /No changed source files in this range/);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('writeReviewContextBundle preserves .json out path', async () => {
  const repo = await makeReviewFixture();
  try {
    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    const out = path.join(repo, 'bundle.json');
    const files = await writeReviewContextBundle(bundle, out, 'json');
    assert.deepEqual(files, [out]);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('symbol grep returns empty when changed file has no symbols', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-review-context-empty-'));
  try {
    await fs.mkdir(path.join(repo, 'src'), { recursive: true });
    await fs.mkdir(path.join(repo, '.llmwiki', 'run'), { recursive: true });
    await fs.writeFile(path.join(repo, 'src', 'a.py'), '# only a comment\n');
    await fs.writeFile(path.join(repo, 'src', 'b.py'), 'x = 1\n');

    await runGit(['init', '-b', 'main'], { cwd: repo });
    await runGit(['config', 'user.email', 'test@example.com'], { cwd: repo });
    await runGit(['config', 'user.name', 'Test User'], { cwd: repo });
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'base'], { cwd: repo });

    await runGit(['checkout', '-b', 'feature'], { cwd: repo });
    await fs.writeFile(path.join(repo, 'src', 'a.py'), '# changed comment\n');
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'head'], { cwd: repo });

    const manifest = {
      files: [
        { path: 'src/a.py', language: 'Python', imports: [], symbols: [], exported_symbols: [] },
        { path: 'src/b.py', language: 'Python', imports: [], symbols: ['x'], exported_symbols: [] }
      ]
    };
    await fs.writeFile(path.join(repo, '.llmwiki', 'run', 'manifest.json'), JSON.stringify(manifest, null, 2));

    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    assert.equal(bundle.adjacentFiles.length, 0);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('missing related wiki page emits warning', async () => {
  const repo = await makeReviewFixture();
  try {
    const graph = JSON.parse(await fs.readFile(path.join(repo, '.llmwiki', 'graph.json'), 'utf8'));
    graph.nodes.push({
      id: 'page:Missing.md',
      kind: 'page',
      path: 'Missing.md',
      page_state: 'generated'
    });
    graph.edges.push({ type: 'affects', from: 'source:src/main.ts', to: 'page:Missing.md' });
    await fs.writeFile(path.join(repo, '.llmwiki', 'graph.json'), JSON.stringify(graph, null, 2));

    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    assert.ok(bundle.warnings.some((w) => w.includes('Related wiki page missing')));
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('non-JS changed file with no symbols returns no adjacent files', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-review-context-text-'));
  try {
    await fs.mkdir(path.join(repo, 'src'), { recursive: true });
    await fs.mkdir(path.join(repo, '.llmwiki', 'run'), { recursive: true });
    await fs.writeFile(path.join(repo, 'src', 'a.txt'), 'hello\n');

    await runGit(['init', '-b', 'main'], { cwd: repo });
    await runGit(['config', 'user.email', 'test@example.com'], { cwd: repo });
    await runGit(['config', 'user.name', 'Test User'], { cwd: repo });
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'base'], { cwd: repo });

    await runGit(['checkout', '-b', 'feature'], { cwd: repo });
    await fs.writeFile(path.join(repo, 'src', 'a.txt'), 'hello world\n');
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'head'], { cwd: repo });

    const manifest = {
      files: [
        { path: 'src/a.txt', language: 'Text', imports: [], symbols: [], exported_symbols: [] }
      ]
    };
    await fs.writeFile(path.join(repo, '.llmwiki', 'run', 'manifest.json'), JSON.stringify(manifest, null, 2));

    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    assert.equal(bundle.adjacentFiles.length, 0);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('markdown bundle includes warnings section when warnings exist', async () => {
  const repo = await makeReviewFixture();
  try {
    await fs.writeFile(path.join(repo, '.llmwiki', 'graph.json'), '{invalid');
    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    const md = formatReviewContextBundle(bundle, 'md');
    assert.match(md, /## Warnings/);
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('unreadable changed file surfaces gracefully in symbol fallback', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-review-context-unreadable-'));
  try {
    await fs.mkdir(path.join(repo, 'src'), { recursive: true });
    await fs.mkdir(path.join(repo, '.llmwiki', 'run'), { recursive: true });
    await fs.writeFile(path.join(repo, 'src', 'a.py'), 'def helper():\n    return 1\n');
    await fs.writeFile(path.join(repo, 'src', 'b.py'), 'from a import helper\n');

    await runGit(['init', '-b', 'main'], { cwd: repo });
    await runGit(['config', 'user.email', 'test@example.com'], { cwd: repo });
    await runGit(['config', 'user.name', 'Test User'], { cwd: repo });
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'base'], { cwd: repo });

    await runGit(['checkout', '-b', 'feature'], { cwd: repo });
    await fs.writeFile(path.join(repo, 'src', 'a.py'), 'def helper():\n    return 2\n');
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'head'], { cwd: repo });

    const manifest = {
      files: [
        { path: 'src/a.py', language: 'Python', imports: [], symbols: ['helper'], exported_symbols: [{ name: 'helper', kind: 'function' }] },
        { path: 'src/b.py', language: 'Python', imports: ['a'], symbols: [], exported_symbols: [] }
      ]
    };
    await fs.writeFile(path.join(repo, '.llmwiki', 'run', 'manifest.json'), JSON.stringify(manifest, null, 2));

    await fs.chmod(path.join(repo, 'src', 'a.py'), 0o000);
    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    assert.equal(bundle.adjacentFiles.length, 0);
  } finally {
    try { await fs.chmod(path.join(repo, 'src', 'a.py'), 0o644); } catch { /* ignore */ }
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('walk fallback reports unreadable source files', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-review-context-walk-unread-'));
  try {
    await fs.mkdir(path.join(repo, 'src'), { recursive: true });
    await fs.writeFile(path.join(repo, 'src', 'a.ts'), 'export const A = 1;\n');
    await fs.writeFile(path.join(repo, 'src', 'secret.ts'), 'export const SECRET = 1;\n');

    await runGit(['init', '-b', 'main'], { cwd: repo });
    await runGit(['config', 'user.email', 'test@example.com'], { cwd: repo });
    await runGit(['config', 'user.name', 'Test User'], { cwd: repo });
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'base'], { cwd: repo });

    await runGit(['checkout', '-b', 'feature'], { cwd: repo });
    await fs.writeFile(path.join(repo, 'src', 'a.ts'), 'export const A = 2;\n');
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'head'], { cwd: repo });

    await fs.chmod(path.join(repo, 'src', 'secret.ts'), 0o000);
    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    assert.ok(bundle.warnings.some((w) => w.includes('Could not read source file for adjacency')));
  } finally {
    try { await fs.chmod(path.join(repo, 'src', 'secret.ts'), 0o644); } catch { /* ignore */ }
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('package imports are skipped during JS adjacency resolution', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-review-context-pkg-'));
  try {
    await fs.mkdir(path.join(repo, 'src'), { recursive: true });
    await fs.mkdir(path.join(repo, '.llmwiki', 'run'), { recursive: true });
    await fs.writeFile(path.join(repo, 'src', 'util.ts'), 'export const U = 1;\n');
    await fs.writeFile(path.join(repo, 'src', 'main.ts'), "import fs from 'node:fs';\nimport { U } from './util';\n");

    await runGit(['init', '-b', 'main'], { cwd: repo });
    await runGit(['config', 'user.email', 'test@example.com'], { cwd: repo });
    await runGit(['config', 'user.name', 'Test User'], { cwd: repo });
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'base'], { cwd: repo });

    await runGit(['checkout', '-b', 'feature'], { cwd: repo });
    await fs.writeFile(path.join(repo, 'src', 'main.ts'), "import fs from 'node:fs';\nimport { U } from './util';\nexport const A = 1;\n");
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'head'], { cwd: repo });

    const manifest = {
      files: [
        { path: 'src/util.ts', language: 'TypeScript', imports: [], symbols: ['U'], exported_symbols: [{ name: 'U', kind: 'const' }] },
        { path: 'src/main.ts', language: 'TypeScript', imports: ['node:fs', './util'], symbols: ['A'], exported_symbols: [{ name: 'A', kind: 'const' }] }
      ]
    };
    await fs.writeFile(path.join(repo, '.llmwiki', 'run', 'manifest.json'), JSON.stringify(manifest, null, 2));

    const bundle = await buildReviewContextBundle({
      repoPath: repo,
      target: 'main..feature',
      adjacencyDepth: 1
    });
    assert.ok(bundle.adjacentFiles.some((file) => file.path === 'src/util.ts'));
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('resolveReviewTarget rejects PR numbers when gh is unavailable', async () => {
  const repo = await makeReviewFixture();
  const originalPath = process.env.PATH;
  process.env.PATH = '';
  try {
    await assert.rejects(
      () => resolveReviewTarget(repo, '999999'),
      /GitHub CLI \(gh\) is required/
    );
  } finally {
    process.env.PATH = originalPath;
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('formatReviewContextBundle emits per-line diff markers including empty lines', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-review-context-diff-'));
  try {
    await fs.mkdir(path.join(repo, 'src'), { recursive: true });
    await fs.mkdir(path.join(repo, '.llmwiki', 'run'), { recursive: true });
    // File with a blank line in the middle so context includes an empty line.
    await fs.writeFile(path.join(repo, 'src', 'main.ts'), [
      'export function greet() {',
      '  return "hi";',
      '',
      'export function farewell() {',
      '  return "bye";',
      '}',
      ''
    ].join('\n'));

    await runGit(['init', '-b', 'main'], { cwd: repo });
    await runGit(['config', 'user.email', 'test@example.com'], { cwd: repo });
    await runGit(['config', 'user.name', 'Test User'], { cwd: repo });
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'base'], { cwd: repo });

    await runGit(['checkout', '-b', 'feature'], { cwd: repo });
    await fs.writeFile(path.join(repo, 'src', 'main.ts'), [
      'export function greet() {',
      '  return "hello";',
      '',
      'export function farewell() {',
      '  return "bye";',
      '}',
      ''
    ].join('\n'));
    await runGit(['add', '.'], { cwd: repo });
    await runGit(['commit', '-m', 'head'], { cwd: repo });

    await fs.writeFile(path.join(repo, '.llmwiki', 'run', 'manifest.json'), JSON.stringify({
      files: [{ path: 'src/main.ts', language: 'TypeScript', imports: [], symbols: ['greet', 'farewell'], exported_symbols: [] }]
    }, null, 2));

    const bundle = await buildReviewContextBundle({ repoPath: repo, target: 'main..feature', adjacencyDepth: 0 });
    const md = formatReviewContextBundle(bundle, 'md');
    // Every non-empty changed block line must start with + / - / space.
    const block = md.split('```diff').slice(1)[0]?.split('```')[0] ?? '';
    const lines = block.split('\n');
    for (const line of lines) {
      if (line === '') continue; // block separator
      // Hunk headers (e.g. "@@ -1,5 +1,5 @@") are diff metadata, not per-line markers.
      if (line.startsWith('@@')) continue;
      const first = line[0];
      assert.ok(first === '+' || first === '-' || first === ' ', `diff line missing prefix: ${JSON.stringify(line)}`);
    }
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('CLI review-context --format json writes only the JSON bundle (no markdown)', async () => {
  const repo = await makeReviewFixture();
  try {
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-review-context-format-'));
    try {
      const outBase = path.join(outDir, 'bundle');
      const stdout = await runReviewContextCli(['review-context', 'main..feature', '--repo', repo, '--format', 'json', '--out', outBase]);
      const parsed = JSON.parse(stdout);
      assert.equal(parsed.status, 'ok');
      const files = await fs.readdir(outDir);
      assert.ok(files.includes('bundle.json'), `expected bundle.json in ${outDir}, got ${files.join(', ')}`);
      assert.ok(!files.includes('bundle.md'), `expected NO bundle.md, got ${files.join(', ')}`);
    } finally {
      await fs.rm(outDir, { recursive: true, force: true });
    }
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});

test('CLI review-context rejects unknown --format value', async () => {
  const repo = await makeReviewFixture();
  try {
    await assert.rejects(
      () => runReviewContextCli(['review-context', 'main..feature', '--repo', repo, '--format', 'yaml']),
      /Unknown --format/
    );
  } finally {
    await fs.rm(repo, { recursive: true, force: true });
  }
});
