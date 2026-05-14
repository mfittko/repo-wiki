import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm, readFile, utimes } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { scanRepository } from '../src/scanner.js';
import { lintDocs } from '../src/docs-linter.js';
import {
  classifyDocumentedCommands,
  extractCiCommandSources,
  extractCiCommands,
  extractDocumentedFilePaths,
  extractJustfileTargetSources,
  extractRouteClaims,
  extractTaskfileTargetSources
} from '../src/docs-ingestor.js';
import { compileWiki } from '../src/compiler.js';
import { candidateRepoPaths, normalizeRoutePath } from '../src/docs-validation.js';

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
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\nRun npm test with MY_API_TOKEN. See [old docs](docs/old.md).\n\n```bash\nnpm test\n```\n', 'utf8');
    await writeFile(path.join(dir, 'docs', 'old.md'), '# Old\n\nThis is deprecated and should be reviewed.\n', 'utf8');
    await writeFile(path.join(dir, 'package.json'), JSON.stringify({ scripts: { test: 'node --test' } }), 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    const scan = await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });
    assert.equal(scan.manifest.documentation.files.length, 2);
    const readmeCard = scan.manifest.documentation.files.find((doc) => doc.path === 'README.md');
    assert.ok(readmeCard.validation.env_vars.includes('MY_API_TOKEN'));
    assert.ok(readmeCard.links.includes('docs/old.md'));
    assert.ok(readmeCard.file_paths.some((reference) => reference.path === 'docs/old.md'));

    const lint = await lintDocs({ scanDir, repoPath: dir });
    assert.ok(lint.summary.warnings + lint.summary.errors >= 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('extractDocumentedFilePaths extracts deterministic markdown link and inline code path references', () => {
  const refs = extractDocumentedFilePaths('# Paths\n\nSee [plan](docs/PLAN.md), [titled](docs/TITLE.md "Title"), [paren](docs/guide(arch).md), [angle](<docs/another(arch).md>), `src/cli.ts`, `../README.md`, `dist/`, `1..2`, and `npm run build`.\n\n```bash\ncat missing.md\n```\n\n~~~bash\ncat also-missing.md\n~~~\n');
  assert.deepEqual(refs, [
    { path: 'docs/PLAN.md', line: 3, source: 'link' },
    { path: 'docs/TITLE.md', line: 3, source: 'link' },
    { path: 'docs/guide(arch).md', line: 3, source: 'link' },
    { path: 'docs/another(arch).md', line: 3, source: 'link' },
    { path: 'src/cli.ts', line: 3, source: 'inline_code' },
    { path: '../README.md', line: 3, source: 'inline_code' }
  ]);
});

test('markdown links with parentheses are ingested without truncated fallback links', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-link-parens-'));
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await mkdir(path.join(dir, 'docs'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: {
        ingest: true,
        include: ['README.md', 'docs/**/*.md'],
        exclude: [],
        stale_after_days: 9999
      }
    }), 'utf8');
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\nSee [guide](docs/guide(arch).md).\n', 'utf8');
    await writeFile(path.join(dir, 'docs', 'guide(arch).md'), '# Guide\n', 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    const scan = await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });
    const readmeCard = scan.manifest.documentation.files.find((doc) => doc.path === 'README.md');
    assert.ok(readmeCard.links.includes('docs/guide(arch).md'));
    assert.ok(!readmeCard.links.includes('docs/guide(arch'));

    const lint = await lintDocs({ scanDir, repoPath: dir });
    assert.equal(lint.issues.filter((i) => i.code === 'broken-documentation-link').length, 0);
    assert.equal(lint.issues.filter((i) => i.code === 'broken-documented-file-path').length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('candidateRepoPaths normalizes Windows separators before resolving relative paths', () => {
  assert.deepEqual(candidateRepoPaths('..\\README.md', 'docs/guides/intro.md'), ['../README.md', 'docs/README.md']);
});

test('extractRouteClaims captures prose, lists, tables, and fenced route mentions including ALL', () => {
  const claims = extractRouteClaims([
    '# Routes',
    '',
    'The API serves GET /health and POST /users endpoints.',
    '- ALL /maintenance',
    '| Method | Path |',
    '| --- | --- |',
    '| GET | /table-health |',
    '```http',
    'POST /from-fence',
    '```'
  ].join('\n'));

  assert.deepEqual(claims, [
    { line: 3, text: 'The API serves GET /health and POST /users endpoints.', snippet: 'The API serves GET /health and POST /users endpoints.', path: '/health', method: 'GET' },
    { line: 3, text: 'The API serves GET /health and POST /users endpoints.', snippet: 'The API serves GET /health and POST /users endpoints.', path: '/users', method: 'POST' },
    { line: 4, text: '- ALL /maintenance', snippet: '- ALL /maintenance', path: '/maintenance', method: 'ALL' },
    { line: 7, text: '| GET | /table-health |', snippet: '| GET | /table-health |', path: '/table-health', method: 'GET' },
    { line: 9, text: 'POST /from-fence', snippet: 'POST /from-fence', path: '/from-fence', method: 'POST' }
  ]);
});

test('extractRouteClaims normalizes punctuation, query/fragment suffixes, and duplicate slashes', () => {
  const claims = extractRouteClaims([
    'Use GET /health.',
    'Use GET /api/users?active=true',
    'Use GET /api/users#list',
    'Use GET /api//users',
    'Use GET /api/users, POST /api/items.'
  ].join('\n'));

  assert.deepEqual(claims, [
    { line: 1, text: 'Use GET /health.', snippet: 'Use GET /health.', path: '/health', method: 'GET' },
    { line: 2, text: 'Use GET /api/users?active=true', snippet: 'Use GET /api/users?active=true', path: '/api/users', method: 'GET' },
    { line: 3, text: 'Use GET /api/users#list', snippet: 'Use GET /api/users#list', path: '/api/users', method: 'GET' },
    { line: 4, text: 'Use GET /api//users', snippet: 'Use GET /api//users', path: '/api/users', method: 'GET' },
    { line: 5, text: 'Use GET /api/users, POST /api/items.', snippet: 'Use GET /api/users, POST /api/items.', path: '/api/users', method: 'GET' },
    { line: 5, text: 'Use GET /api/users, POST /api/items.', snippet: 'Use GET /api/users, POST /api/items.', path: '/api/items', method: 'POST' }
  ]);
});

test('extractRouteClaims rejects degenerate slash-only route claims', () => {
  const claims = extractRouteClaims([
    'Use GET /, GET //, POST ////, and GET /health.',
    '| Method | Path |',
    '| --- | --- |',
    '| GET | // |'
  ].join('\n'));

  assert.deepEqual(claims, [
    { line: 1, text: 'Use GET /, GET //, POST ////, and GET /health.', snippet: 'Use GET /, GET //, POST ////, and GET /health.', path: '/', method: 'GET' },
    { line: 1, text: 'Use GET /, GET //, POST ////, and GET /health.', snippet: 'Use GET /, GET //, POST ////, and GET /health.', path: '/health', method: 'GET' }
  ]);
});

test('normalizeRoutePath aligns scanner and documented route path variants', () => {
  assert.equal(normalizeRoutePath('`/api/users`.'), '/api/users');
  assert.equal(normalizeRoutePath('/api/users?active=true'), '/api/users');
  assert.equal(normalizeRoutePath('/api/users#list'), '/api/users');
  assert.equal(normalizeRoutePath('/api//users'), '/api/users');
  assert.equal(normalizeRoutePath('/api/users/'), '/api/users');
});

test('classifyDocumentedCommands validates known package scripts, flags missing scripts, and marks unknowns', () => {
  const packageScripts = { test: 'node --test', build: 'tsc', lint: 'eslint .' };

  // Known npm run script → validated
  const knownRun = classifyDocumentedCommands(['npm run build'], packageScripts, []);
  assert.equal(knownRun.length, 1);
  assert.equal(knownRun[0].status, 'validated');
  assert.equal(knownRun[0].source, 'package_scripts');
  assert.equal(knownRun[0].script_name, 'build');

  // Missing npm run script → missing
  const missingRun = classifyDocumentedCommands(['npm run deploy'], packageScripts, []);
  assert.equal(missingRun.length, 1);
  assert.equal(missingRun[0].status, 'missing');
  assert.equal(missingRun[0].source, 'package_scripts');
  assert.equal(missingRun[0].script_name, 'deploy');

  // npm run options and quoted script names should not be treated as script names
  const optionRun = classifyDocumentedCommands(['npm run --silent "build"'], packageScripts, []);
  assert.equal(optionRun[0].status, 'validated');
  assert.equal(optionRun[0].script_name, 'build');

  // npm test lifecycle → validated when test script exists
  const npmTest = classifyDocumentedCommands(['npm test'], packageScripts, []);
  assert.equal(npmTest[0].status, 'validated');
  assert.equal(npmTest[0].script_name, 'test');

  // Chained commands are classified independently so later missing scripts are not hidden
  const chained = classifyDocumentedCommands(['npm run build && npm run deploy'], packageScripts, []);
  assert.equal(chained.length, 2);
  assert.equal(chained[0].script_name, 'build');
  assert.equal(chained[0].status, 'validated');
  assert.equal(chained[1].script_name, 'deploy');
  assert.equal(chained[1].status, 'missing');

  // Unrecognised command without CI match → unvalidated
  const unknown = classifyDocumentedCommands(['docker compose up'], packageScripts, []);
  assert.equal(unknown[0].status, 'unvalidated');
  assert.equal(unknown[0].source, 'unknown');

  // Workspace selectors are conservatively unvalidated unless an exact CI match exists.
  const workspace = classifyDocumentedCommands(['npm --workspace packages/app run build'], {}, []);
  assert.equal(workspace[0].status, 'unvalidated');
  assert.equal(workspace[0].source, 'unknown');

  const makeKnown = classifyDocumentedCommands(['make build'], packageScripts, [], { makeTargets: ['build'] });
  assert.equal(makeKnown[0].status, 'validated');
  assert.equal(makeKnown[0].source, 'makefile');
  assert.equal(makeKnown[0].target_name, 'build');

  const makeMissing = classifyDocumentedCommands(['make deploy'], packageScripts, [], { makeTargets: ['build'] });
  assert.equal(makeMissing[0].status, 'missing');
  assert.equal(makeMissing[0].source, 'makefile');
  assert.equal(makeMissing[0].target_name, 'deploy');

  const taskKnown = classifyDocumentedCommands(['just build'], packageScripts, [], {
    taskRunnerTargetsByRunner: { just: ['build'] }
  });
  assert.equal(taskKnown[0].status, 'validated');
  assert.equal(taskKnown[0].source, 'task_runner');
  assert.equal(taskKnown[0].target_name, 'build');

  const taskfileKnown = classifyDocumentedCommands(['task build'], packageScripts, [], {
    taskRunnerTargetsByRunner: { taskfile: ['build'] }
  });
  assert.equal(taskfileKnown[0].status, 'validated');
  assert.equal(taskfileKnown[0].source, 'task_runner');
  assert.equal(taskfileKnown[0].target_name, 'build');

  const crossRunnerMissing = classifyDocumentedCommands(['task build', 'just release'], packageScripts, [], {
    taskRunnerTargetsByRunner: { just: ['build'], taskfile: ['release'] }
  });
  assert.equal(crossRunnerMissing[0].status, 'missing');
  assert.equal(crossRunnerMissing[1].status, 'missing');

  // Separators inside quotes are not split into fake commands.
  const quoted = classifyDocumentedCommands(['npm run "build;prod" && npm run missing'], { 'build;prod': 'tsc' }, []);
  assert.equal(quoted.length, 2);
  assert.equal(quoted[0].script_name, 'build;prod');
  assert.equal(quoted[0].status, 'validated');
  assert.equal(quoted[1].script_name, 'missing');
  assert.equal(quoted[1].status, 'missing');
});

test('task-runner target extractors accept underscore-prefixed names', () => {
  assert.deepEqual(extractJustfileTargetSources('_docs:\n  @echo docs\n'), [
    { target: '_docs', runner: 'just', line: 1 }
  ]);

  assert.deepEqual(extractTaskfileTargetSources('version: "3"\ntasks:\n  _publish:\n    cmds:\n      - echo publish\n'), [
    { target: '_publish', runner: 'taskfile', line: 3 }
  ]);
});

test('classifyDocumentedCommands validates CI workflow commands', () => {
  const packageScripts = {};
  const ciCommands = ['npm run check', 'npm run coverage'];

  const ciValidated = classifyDocumentedCommands(['npm run check'], packageScripts, ciCommands);
  assert.equal(ciValidated[0].status, 'validated');
  assert.equal(ciValidated[0].source, 'ci_workflow');

  // A non-npm command that appears verbatim in CI is validated against CI
  const dockerCmd = classifyDocumentedCommands(['docker build .'], packageScripts, ['docker build .']);
  assert.equal(dockerCmd[0].status, 'validated');
  assert.equal(dockerCmd[0].source, 'ci_workflow');
});

test('extractCiCommands parses run: and command: fields from workflow YAML', () => {
  const yaml = `
jobs:
  test:
    steps:
      - run: npm ci
      - name: Lint
        run: npm run lint:code
      - name: Scripted
        run: bash scripts/check.sh || python tools/check.py; ./local-check
      - name: Templated echo
        run: echo \${{ matrix.foo }}
      - name: Matrix step
        run: \${{ matrix.task.command }}
      - name: Block script
        run: |-
          if [ -f package.json ]; then
            npm run block
          else
            bash scripts/block.sh && python tools/block.py
          fi
          echo \${{ matrix.skip }}
      - name: Folded script
        run: >
          ./folded-check
  matrix:
    task:
      - name: Check
        command: npm run check
      - name: Pack
        command: npm run pack:check
`;

  const cmds = extractCiCommands(yaml);
  assert.ok(cmds.includes('npm ci'));
  assert.ok(cmds.includes('npm run lint:code'));
  assert.ok(cmds.includes('bash scripts/check.sh'));
  assert.ok(cmds.includes('python tools/check.py'));
  assert.ok(cmds.includes('./local-check'));
  assert.ok(cmds.includes('npm run block'));
  assert.ok(cmds.includes('bash scripts/block.sh'));
  assert.ok(cmds.includes('python tools/block.py'));
  assert.ok(cmds.includes('./folded-check'));
  assert.ok(!cmds.some((c) => ['if [ -f package.json ]', 'then', 'else', 'fi'].includes(c)));
  assert.ok(cmds.includes('npm run check'));
  assert.ok(cmds.includes('npm run pack:check'));
  // Template expressions anywhere in the command should be excluded
  assert.ok(!cmds.some((c) => c.includes('${{')));
});

test('extractCiCommandSources captures end_line for multiline run blocks', () => {
  const yaml = `
jobs:
  test:
    steps:
      - run: |-
          npm run build \\
            && npm run test
`;

  const sources = extractCiCommandSources(yaml);
  assert.deepEqual(sources, [
    { command: 'npm run build', line: 6, end_line: 7 },
    { command: 'npm run test', line: 6, end_line: 7 }
  ]);
});

test('extractCiCommandSources handles multiple multiline blocks and keeps single-line commands un-ranged', () => {
  const yaml = `
jobs:
  test:
    steps:
      - run: |-
          npm run lint \\
            && npm run test
      - run: npm run pack:check
      - run: |-
          npm run build \\
            && npm run coverage
`;

  const sources = extractCiCommandSources(yaml);
  assert.deepEqual(sources, [
    { command: 'npm run lint', line: 6, end_line: 7 },
    { command: 'npm run test', line: 6, end_line: 7 },
    { command: 'npm run pack:check', line: 8 },
    { command: 'npm run build', line: 10, end_line: 11 },
    { command: 'npm run coverage', line: 10, end_line: 11 }
  ]);
});

test('extractCiCommandSources preserves literal trailing backslashes on non-continuation lines', () => {
  const yaml = `
jobs:
  test:
    steps:
      - run: |-
          printf path\\\\
`;

  const sources = extractCiCommandSources(yaml);
  assert.deepEqual(sources, [
    { command: 'printf path\\\\', line: 6 }
  ]);
});

test('lintDocs reports missing-package-script for commands not in package.json', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-cmd-'));
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: {
        ingest: true,
        include: ['README.md'],
        exclude: [],
        stale_after_days: 9999
      }
    }), 'utf8');
    // Document a script that does NOT exist in package.json after a valid script in a chained command
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\nRun the deploy script:\n\n```bash\nnpm run build && npm run deploy\n```\n', 'utf8');
    await writeFile(path.join(dir, 'package.json'), JSON.stringify({ scripts: { test: 'node --test', build: 'tsc' } }), 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });

    const lint = await lintDocs({ scanDir, repoPath: dir });
    const missingIssues = lint.issues.filter((i) => i.code === 'missing-package-script');
    assert.ok(missingIssues.length >= 1, 'expected at least one missing-package-script issue');
    assert.ok(missingIssues[0].message.includes('deploy'), 'issue message should name the missing script');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintDocs and Documentation Debt Report validate exact commands from CI workflows', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-ci-'));
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await mkdir(path.join(dir, '.github', 'workflows', 'bad.yaml'), { recursive: true });
    await writeFile(path.join(dir, '.github', 'workflows', 'notes.txt'), 'ignored', 'utf8');
    await writeFile(path.join(dir, '.github', 'workflows', 'good.yml'), 'jobs:\n  test:\n    steps:\n      - run: npm run ci-only\n      - run: docker build .\n', 'utf8');
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: {
        ingest: true,
        include: ['README.md'],
        exclude: [],
        stale_after_days: 9999
      }
    }), 'utf8');
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\n```bash\nnpm run ci-only\ndocker login --password supersecretvalue\ndocker build .\n```\n', 'utf8');
    await writeFile(path.join(dir, 'package.json'), JSON.stringify({ scripts: {} }), 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    const scan = await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });
    assert.ok(scan.manifest.analysis.ci_workflow_commands.includes('npm run ci-only'));

    const lint = await lintDocs({ scanDir, repoPath: dir });
    assert.equal(lint.issues.filter((i) => i.code === 'missing-package-script').length, 0);

    const wikiDir = path.join(dir, '.llmwiki', 'wiki');
    const planFile = path.join(dir, '.llmwiki', 'plan.json');
    await writeFile(planFile, JSON.stringify({ pages: [], modules: [] }), 'utf8');
    await compileWiki({ scanDir, planFile, wikiDir });
    const report = await readFile(path.join(wikiDir, 'Documentation-Debt-Report.md'), 'utf8');
    assert.match(report, /\| `npm run ci-only` \| ✅ validated \| CI workflow \|/);
    assert.match(report, /`docker login --password \[REDACTED\]`/);
    assert.doesNotMatch(report, /supersecretvalue/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('scanRepository ignores similarly named non-target files when validating Make/task-runner commands', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-false-targets-'));
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: {
        ingest: true,
        include: ['README.md'],
        exclude: [],
        stale_after_days: 9999
      }
    }), 'utf8');
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\n```bash\nmake build\njust docs\ntask publish\n```\n', 'utf8');
    await writeFile(path.join(dir, 'CMakefile'), 'build:\n\t@echo cmake\n', 'utf8');
    await writeFile(path.join(dir, 'adjustfile'), 'docs:\n  @echo docs\n', 'utf8');
    await writeFile(path.join(dir, 'mytaskfile.yml'), 'version: "3"\ntasks:\n  publish:\n    cmds:\n      - echo publish\n', 'utf8');
    await writeFile(path.join(dir, 'package.json'), JSON.stringify({ scripts: {} }), 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    const scan = await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });
    assert.deepEqual(scan.manifest.analysis.make_targets || [], []);
    assert.deepEqual(scan.manifest.analysis.task_runner_targets || [], []);

    const lint = await lintDocs({ scanDir, repoPath: dir });
    assert.equal(lint.issues.filter((i) => i.code === 'missing-make-target').length, 1);
    assert.equal(lint.issues.filter((i) => i.code === 'missing-task-runner-target').length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintDocs and Documentation Debt Report validate Makefile and task-runner targets', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-make-task-'));
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: {
        ingest: true,
        include: ['README.md'],
        exclude: [],
        stale_after_days: 9999
      }
    }), 'utf8');
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\n```bash\nmake build\nmake deploy\njust docs\njust release\njust _docs\ntask publish\ntask docs\ntask _publish\n```\n', 'utf8');
    await writeFile(path.join(dir, 'Makefile'), 'build:\n\t@echo build\n', 'utf8');
    await writeFile(path.join(dir, 'justfile'), 'docs:\n  @echo docs\n_docs:\n  @echo underscore docs\n', 'utf8');
    await writeFile(path.join(dir, 'Taskfile.yml'), 'version: "3"\ntasks:\n  publish:\n    cmds:\n      - echo publish\n  _publish:\n    cmds:\n      - echo underscore publish\n', 'utf8');
    await writeFile(path.join(dir, 'package.json'), JSON.stringify({ scripts: {} }), 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });
    const lint = await lintDocs({ scanDir, repoPath: dir });
    assert.equal(lint.issues.filter((i) => i.code === 'missing-make-target').length, 1);
    assert.equal(lint.issues.filter((i) => i.code === 'missing-task-runner-target').length, 2);

    const wikiDir = path.join(dir, '.llmwiki', 'wiki');
    const planFile = path.join(dir, '.llmwiki', 'plan.json');
    await writeFile(planFile, JSON.stringify({ pages: [], modules: [] }), 'utf8');
    await compileWiki({ scanDir, planFile, wikiDir });
    const report = await readFile(path.join(wikiDir, 'Documentation-Debt-Report.md'), 'utf8');
    assert.match(report, /\| `make build` \| ✅ validated \| Makefile \|/);
    assert.match(report, /\| `make deploy` \| ❌ missing \| Makefile \|/);
    assert.match(report, /\| `just docs` \| ✅ validated \| Task runner \|/);
    assert.match(report, /\| `just release` \| ❌ missing \| Task runner \|/);
    assert.match(report, /\| `just _docs` \| ✅ validated \| Task runner \|/);
    assert.match(report, /\| `task publish` \| ✅ validated \| Task runner \|/);
    assert.match(report, /\| `task docs` \| ❌ missing \| Task runner \|/);
    assert.match(report, /\| `task _publish` \| ✅ validated \| Task runner \|/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintDocs reports broken documented file paths, broken image links, and unvalidated environment variables', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-path-env-'));
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await mkdir(path.join(dir, 'src'), { recursive: true });
    await mkdir(path.join(dir, 'docs', 'plans'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: {
        ingest: true,
        include: ['README.md', 'docs/**/*.md'],
        exclude: [],
        stale_after_days: 9999
      }
    }), 'utf8');
    await writeFile(path.join(dir, 'src', 'app.js'), "export const mode = process.env.APP_MODE;\nconst port = process.env.PORT;\nconst baseUrl = optionalEnv(env, 'LLMWIKI_LLM_BASE_URL');\n", 'utf8');
    await writeFile(path.join(dir, '.env.example'), 'EXAMPLE_MODE=on\n', 'utf8');
    await writeFile(path.join(dir, 'docs', 'plans', 'README.md'), '# Plans\n', 'utf8');
    await writeFile(path.join(dir, 'docs', 'guide.md'), '# Guide\n\n[local readme](README.md)\n', 'utf8');
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\nSee `src/app.js`, `docs/plans/`, `docs/missing.md`, ![missing](assets/missing.png), and configure APP_MODE, PORT, EXAMPLE_MODE, MISSING_TOKEN, or LLMWIKI_LLM_BASE_URL.\n', 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });

    const lint = await lintDocs({ scanDir, repoPath: dir });
    const brokenPathIssues = lint.issues.filter((i) => i.code === 'broken-documented-file-path');
    assert.equal(brokenPathIssues.length, 3);
    assert.ok(brokenPathIssues.some((item) => /README\.md:3 references missing repository path docs\/missing\.md/.test(item.message)));
    assert.ok(brokenPathIssues.some((item) => /README\.md:3 references missing repository path assets\/missing\.png/.test(item.message)));
    assert.ok(brokenPathIssues.some((item) => /docs\/guide\.md:3 references missing repository path README\.md/.test(item.message)));

    const envIssues = lint.issues.filter((i) => i.code === 'unvalidated-env-var');
    assert.equal(envIssues.length, 1);
    assert.match(envIssues[0].message, /MISSING_TOKEN/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintDocs keeps link validation inside repo and exempts generated-output roots', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-link-safety-'));
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await mkdir(path.join(dir, 'docs'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: {
        ingest: true,
        include: ['README.md'],
        exclude: [],
        stale_after_days: 9999
      }
    }), 'utf8');
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\nSee [outside](../outside.txt), [dist](dist/), [escaped](dist/../../outside.txt), [missing](docs/missing.md), [angle](<docs/guide.md>), and [titled](docs/guide.md "Guide").\n', 'utf8');
    await writeFile(path.join(dir, 'docs', 'guide.md'), '# Guide\n', 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });

    const lint = await lintDocs({ scanDir, repoPath: dir });
    const brokenPaths = lint.issues.filter((i) => i.code === 'broken-documented-file-path');
    assert.equal(brokenPaths.length, 3);
    assert.ok(brokenPaths.some((i) => i.message.includes('../outside.txt')));
    assert.ok(brokenPaths.some((i) => i.message.includes('dist/../../outside.txt')));
    assert.ok(brokenPaths.some((i) => i.message.includes('docs/missing.md')));
    assert.ok(!brokenPaths.some((i) => i.message.endsWith('repository path dist/.')));
    assert.ok(!brokenPaths.some((i) => i.message.includes('docs/guide.md')));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintDocs only treats config strings as env vars under env-specific keys', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-config-env-'));
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: {
        ingest: true,
        include: ['README.md'],
        exclude: [],
        stale_after_days: 9999
      },
      compiler: {
        profile: 'FEATURE_FLAG',
        api_key_env: 'REAL_API_KEY'
      }
    }), 'utf8');
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\nConfigure FEATURE_FLAG and REAL_API_KEY.\n', 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });

    const lint = await lintDocs({ scanDir, repoPath: dir });
    const envIssues = lint.issues.filter((i) => i.code === 'unvalidated-env-var');
    assert.equal(envIssues.length, 1);
    assert.match(envIssues[0].message, /FEATURE_FLAG/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('Documentation Debt Report includes route source evidence and deduplicated route findings', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-debt-path-env-'));
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await mkdir(path.join(dir, 'src'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: {
        ingest: true,
        include: ['README.md'],
        exclude: [],
        stale_after_days: 9999
      }
    }), 'utf8');
    await writeFile(path.join(dir, 'src', 'app.js'), "const app = express();\napp.get('/health', handler);\nexport const mode = process.env.APP_MODE;\n", 'utf8');
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\nSee `src/app.js` and `docs/missing.md`. Configure APP_MODE and MISSING_TOKEN.\nUse GET /health API endpoint.\nUse GET /health API endpoint.\nUse POST /missing API endpoint.\n', 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });
    const wikiDir = path.join(dir, '.llmwiki', 'wiki');
    const planFile = path.join(dir, '.llmwiki', 'plan.json');
    await writeFile(planFile, JSON.stringify({ pages: [], modules: [] }), 'utf8');
    await compileWiki({ scanDir, planFile, wikiDir });

    const report = await readFile(path.join(wikiDir, 'Documentation-Debt-Report.md'), 'utf8');
    assert.match(report, /## File path validation/);
    assert.match(report, /\| `README\.md:3` \| `src\/app\.js` \| ✅ valid \| `src\/app\.js` \|/);
    assert.match(report, /\| `README\.md:3` \| `docs\/missing\.md` \| ❌ missing \| not found \|/);
    assert.match(report, /## Environment variable validation/);
    assert.match(report, /\| `README\.md` \| `APP_MODE` \| ✅ validated \|/);
    assert.match(report, /\| `README\.md` \| `MISSING_TOKEN` \| ❓ unvalidated \|/);
    assert.match(report, /## Route\/API claim validation/);
    assert.match(report, /\| `README\.md:4, README\.md:5` \| `GET \/health` \| ✅ validated \| .*`src\/app\.js`.*express GET `\/health`/);
    assert.match(report, /\| `README\.md:6` \| `POST \/missing` \| ❓ unvalidated \| route claim did not match scanner route surfaces for path \/missing\./);
    assert.match(report, /## Findings by category/);
    assert.match(report, /### Stale/);
    assert.match(report, /### Contradicted/);
    assert.match(report, /### Unvalidated/);
    assert.match(report, /### Broken-reference/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintDocs applies documentation validation strictness levels predictably', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-doc-strictness-'));
  const scanDir = path.join(dir, '.llmwiki', 'run');
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await writeFile(path.join(dir, 'README.md'), '# Existing\n', 'utf8');
    await mkdir(scanDir, { recursive: true });
    await writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify({
      files: [],
      documentation: {
        files: [
          {
            path: 'docs/problem.md',
            stale: true,
            age_days: 365,
            status: 'unvalidated',
            claims: [{ line: 3, text: 'Use GET /missing API endpoint.' }],
            validation: {
              contradictions: [{ text: 'deprecated' }],
              commands: [],
              env_vars: [],
              route_claims: [{ line: 3, text: 'Use GET /missing API endpoint.', path: '/missing', method: 'GET' }]
            },
            file_paths: [],
            links: ['missing.md']
          }
        ]
      }
    }), 'utf8');

    // Baseline findings in this fixture:
    // stale-documentation, contradicted-documentation, unvalidated-documentation-claims,
    // unvalidated-route-claim, and broken-documentation-link.
    for (const [strictness, expected] of [
      ['standard', { errors: 1, warnings: 4 }],
      ['lenient', { errors: 0, warnings: 5 }],
      ['strict', { errors: 5, warnings: 0 }],
      ['off', { errors: 0, warnings: 0 }]
    ] as const) {
      await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
        documentation: {
          validation_strictness: strictness
        }
      }), 'utf8');
      const lint = await lintDocs({ scanDir, repoPath: dir });
      assert.equal(lint.summary.strictness, strictness);
      assert.equal(lint.summary.errors, expected.errors);
      assert.equal(lint.summary.warnings, expected.warnings);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('scanRepository and lintDocs detect ADR recency/supersession conservatively', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-adr-docs-'));
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await mkdir(path.join(dir, 'ADR'), { recursive: true });
    await mkdir(path.join(dir, 'docs', 'adrs'), { recursive: true });
    await mkdir(path.join(dir, 'docs', 'architecture'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: {
        ingest: true,
        include: ['README.md', 'docs/**/*.md', 'ADR/**/*.md'],
        exclude: [],
        stale_after_days: 2
      }
    }), 'utf8');
    await writeFile(path.join(dir, 'README.md'), '# Demo\n', 'utf8');
    await writeFile(path.join(dir, 'ADR', '0001-accepted.md'), '# ADR-0001\n\nStatus: Accepted\n', 'utf8');
    await writeFile(path.join(dir, 'docs', 'adrs', '0002-superseded.md'), '---\nstatus: Superseded\nsuperseded_by: ADR-0003\n---\n\n# ADR-0002\n', 'utf8');
    await writeFile(path.join(dir, 'docs', 'adrs', '0000-legacy.md'), '# ADR-0000\n\nLegacy decision text without metadata.\n', 'utf8');
    await writeFile(path.join(dir, 'docs', 'architecture', 'overview.md'), '# Architecture Overview\n\nSystem design notes.\n', 'utf8');
    await writeFile(path.join(dir, 'docs', 'notes.md'), '# Notes\n\nStatus: Current\n\nRelease operations note, not an ADR.\n', 'utf8');
    await writeFile(path.join(dir, 'package.json'), JSON.stringify({ scripts: {} }), 'utf8');
    const oldDate = new Date(Date.now() - (10 * 86_400_000));
    await utimes(path.join(dir, 'docs', 'adrs', '0000-legacy.md'), oldDate, oldDate);

    const scanDir = path.join(dir, '.llmwiki', 'run');
    const scan = await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });
    const docs = scan.manifest.documentation.files;
    const accepted = docs.find((doc) => doc.path === 'ADR/0001-accepted.md');
    const superseded = docs.find((doc) => doc.path === 'docs/adrs/0002-superseded.md');
    const legacy = docs.find((doc) => doc.path === 'docs/adrs/0000-legacy.md');
    const architectureOverview = docs.find((doc) => doc.path === 'docs/architecture/overview.md');
    const notes = docs.find((doc) => doc.path === 'docs/notes.md');

    assert.equal(accepted.adr.detected, true);
    assert.equal(accepted.adr.status, 'Accepted');
    assert.equal(accepted.adr.superseded, false);
    assert.equal(superseded.adr.detected, true);
    assert.equal(superseded.adr.superseded, true);
    assert.equal(superseded.adr.superseded_by, 'ADR-0003');
    assert.equal(legacy.adr.detected, true);
    assert.equal(legacy.adr.has_status_metadata, false);
    assert.equal(legacy.stale, true);
    assert.equal(architectureOverview.adr.detected, false);
    assert.equal(notes.adr.detected, false);
    assert.equal(notes.adr.detection_source, 'none');

    const lint = await lintDocs({ scanDir, repoPath: dir });
    const supersededIssues = lint.issues.filter((issue) => issue.code === 'superseded-adr');
    const missingStatusIssues = lint.issues.filter((issue) => issue.code === 'adr-without-status-metadata');
    assert.equal(supersededIssues.length, 1);
    assert.match(supersededIssues[0].message, /0002-superseded\.md/);
    assert.equal(missingStatusIssues.length, 1);
    assert.match(missingStatusIssues[0].message, /0000-legacy\.md/);
    assert.ok(!lint.issues.some((issue) => issue.code === 'superseded-adr' && issue.message.includes('0001-accepted')));
    assert.ok(!lint.issues.some((issue) => issue.message.includes('docs/architecture/overview.md') && issue.code.startsWith('adr-')));
    assert.ok(!lint.issues.some((issue) => issue.message.includes('docs/notes.md') && issue.code.startsWith('adr-')));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintDocs validates route claims with clear reasons and suppresses duplicate route issues', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-route-claims-'));
  const scanDir = path.join(dir, '.llmwiki', 'run');
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await mkdir(scanDir, { recursive: true });
    await writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify({
      files: [
        {
          path: 'src/server.ts',
          route_surfaces: [
            { path: '/health', methods: ['GET'] }
          ],
          environment_variables: []
        }
      ],
      documentation: {
        files: [
          {
            path: 'README.md',
            stale: false,
            age_days: 1,
            status: 'partially_validated',
            claims: [{ line: 3, text: 'Use GET /health API endpoint.' }],
            validation: {
              contradictions: [],
              commands: [],
              env_vars: [],
              route_claims: [
                { line: 3, text: 'Use GET /health API endpoint.', path: '/health', method: 'GET' },
                { line: 4, text: 'Use POST /health API endpoint.', path: '/health', method: 'POST' },
                { line: 6, text: 'Use POST /health API endpoint.', path: '/health', method: 'POST' },
                { line: 5, text: 'Use GET /missing?debug=true. API endpoint.', path: '/missing?debug=true.', method: 'GET' }
              ]
            },
            file_paths: [],
            links: []
          }
        ]
      }
    }), 'utf8');

    const lint = await lintDocs({ scanDir, repoPath: dir });
    const routeIssues = lint.issues.filter((item) => item.code === 'unvalidated-route-claim');
    assert.equal(routeIssues.length, 2);
    assert.ok(routeIssues.some((issue) => issue.message.includes('README.md:4,6 route claim method POST for /health did not match')));
    assert.ok(routeIssues.some((issue) => issue.message.includes('did not match scanner route surfaces for path /missing (normalized from /missing?debug=true.)')));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintDocs treats ANY/ALL/USE route methods as wildcard matches', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-route-wildcards-'));
  const scanDir = path.join(dir, '.llmwiki', 'run');
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await mkdir(scanDir, { recursive: true });
    await writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify({
      files: [
        {
          path: 'src/server.ts',
          route_surfaces: [
            { path: '/health', methods: ['ALL'] },
            { path: '/middleware', methods: ['USE'] },
            { path: '/mixed', methods: ['GET', 'POST'] }
          ],
          environment_variables: []
        }
      ],
      documentation: {
        files: [
          {
            path: 'README.md',
            stale: false,
            age_days: 1,
            status: 'partially_validated',
            claims: [],
            validation: {
              contradictions: [],
              commands: [],
              env_vars: [],
              route_claims: [
                { line: 3, text: 'Use GET /health API endpoint.', path: '/health', method: 'GET' },
                { line: 4, text: 'Use POST /middleware API endpoint.', path: '/middleware', method: 'POST' },
                { line: 5, text: 'Use ALL /mixed API endpoint.', path: '/mixed', method: 'ALL' },
                { line: 6, text: 'Use GET /missing API endpoint.', path: '/missing', method: 'GET' }
              ]
            },
            file_paths: [],
            links: []
          }
        ]
      }
    }), 'utf8');

    const lint = await lintDocs({ scanDir, repoPath: dir });
    const routeIssues = lint.issues.filter((item) => item.code === 'unvalidated-route-claim');
    assert.equal(routeIssues.length, 1);
    assert.ok(routeIssues[0].message.includes('did not match scanner route surfaces for path /missing'));
    assert.ok(!routeIssues.some((item) => item.message.includes('/health')));
    assert.ok(!routeIssues.some((item) => item.message.includes('/middleware')));
    assert.ok(!routeIssues.some((item) => item.message.includes('/mixed')));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintDocs does not report missing-package-script for validated scripts', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-valid-'));
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: {
        ingest: true,
        include: ['README.md'],
        exclude: [],
        stale_after_days: 9999
      }
    }), 'utf8');
    // Document a script that EXISTS in package.json
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\nBuild the project:\n\n```bash\nnpm run build\n```\n', 'utf8');
    await writeFile(path.join(dir, 'package.json'), JSON.stringify({ scripts: { build: 'tsc' } }), 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });

    const lint = await lintDocs({ scanDir, repoPath: dir });
    const missingIssues = lint.issues.filter((i) => i.code === 'missing-package-script');
    assert.equal(missingIssues.length, 0, 'should not report missing-package-script for a known script');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintDocs does not flag wiki page name references as broken paths when the page exists in .llmwiki/wiki', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-wikiref-'));
  try {
    await mkdir(path.join(dir, '.llmwiki', 'wiki'), { recursive: true });
    await mkdir(path.join(dir, 'docs'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: { ingest: true, include: ['docs/**/*.md'], exclude: [], stale_after_days: 9999 }
    }), 'utf8');
    // Plan doc references bare wiki page names that live in .llmwiki/wiki/
    await writeFile(path.join(dir, 'docs', 'PLAN.md'), '# Plan\n\nSee `Index.md` and `Log.md`.\n', 'utf8');
    await writeFile(path.join(dir, '.llmwiki', 'wiki', 'Index.md'), '# Index\n', 'utf8');
    await writeFile(path.join(dir, '.llmwiki', 'wiki', 'Log.md'), '# Log\n', 'utf8');
    await writeFile(path.join(dir, 'package.json'), JSON.stringify({ scripts: {} }), 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });
    const lint = await lintDocs({ scanDir, repoPath: dir });
    const broken = lint.issues.filter((i) => i.code === 'broken-documented-file-path');
    assert.equal(broken.length, 0, 'should not flag wiki page references that exist in .llmwiki/wiki/');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintDocs still flags bare .md references that do not exist in repo or .llmwiki/wiki', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-missingwiki-'));
  try {
    await mkdir(path.join(dir, '.llmwiki', 'wiki'), { recursive: true });
    await mkdir(path.join(dir, 'docs'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: { ingest: true, include: ['docs/**/*.md'], exclude: [], stale_after_days: 9999 }
    }), 'utf8');
    await writeFile(path.join(dir, 'docs', 'PLAN.md'), '# Plan\n\nSee `TotallyMissingPage.md`.\n', 'utf8');
    await writeFile(path.join(dir, 'package.json'), JSON.stringify({ scripts: {} }), 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });
    const lint = await lintDocs({ scanDir, repoPath: dir });
    const broken = lint.issues.filter((i) => i.code === 'broken-documented-file-path');
    assert.ok(broken.length >= 1, 'should flag .md references that do not exist anywhere');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('extractDocumentedFilePaths does not treat .git remote URLs as file path candidates', () => {
  const refs = extractDocumentedFilePaths('# Publish\n\nPublish to `OWNER/REPO.wiki.git` using the CLI.\n');
  assert.ok(!refs.some((r) => r.path.endsWith('.git')), '.git remote URL should not be extracted as a file path');
});

test('isEnvironmentVariableMention does not flag HUMAN_NOTES or CHANGES_REQUESTED', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-envmarker-'));
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: { ingest: true, include: ['README.md'], exclude: [], stale_after_days: 9999 }
    }), 'utf8');
    await writeFile(path.join(dir, 'README.md'), '# Guide\n\nPreserve `HUMAN_NOTES` sections. Use `CHANGES_REQUESTED` for review states.\n', 'utf8');
    await writeFile(path.join(dir, 'package.json'), JSON.stringify({ scripts: {} }), 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    const scan = await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });
    const readmeCard = scan.manifest.documentation.files.find((doc) => doc.path === 'README.md');
    assert.ok(!readmeCard.validation.env_vars.includes('HUMAN_NOTES'), 'HUMAN_NOTES should not be extracted as env var');
    assert.ok(!readmeCard.validation.env_vars.includes('CHANGES_REQUESTED'), 'CHANGES_REQUESTED should not be extracted as env var');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
