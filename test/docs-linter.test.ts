import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { scanRepository } from '../src/scanner.js';
import { lintDocs } from '../src/docs-linter.js';
import { classifyDocumentedCommands, extractCiCommands, extractDocumentedFilePaths } from '../src/docs-ingestor.js';
import { compileWiki } from '../src/compiler.js';

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
  const refs = extractDocumentedFilePaths('# Paths\n\nSee [plan](docs/PLAN.md), `src/cli.ts`, `dist/`, and `npm run build`.\n\n```bash\ncat missing.md\n```\n');
  assert.deepEqual(refs, [
    { path: 'docs/PLAN.md', line: 3, source: 'link' },
    { path: 'src/cli.ts', line: 3, source: 'inline_code' }
  ]);
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

  // Separators inside quotes are not split into fake commands.
  const quoted = classifyDocumentedCommands(['npm run "build;prod" && npm run missing'], { 'build;prod': 'tsc' }, []);
  assert.equal(quoted.length, 2);
  assert.equal(quoted[0].script_name, 'build;prod');
  assert.equal(quoted[0].status, 'validated');
  assert.equal(quoted[1].script_name, 'missing');
  assert.equal(quoted[1].status, 'missing');
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
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\n```bash\nnpm run ci-only\ndocker build .\n```\n', 'utf8');
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
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('lintDocs reports broken documented file paths and unvalidated environment variables', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-path-env-'));
  try {
    await mkdir(path.join(dir, '.llmwiki'), { recursive: true });
    await mkdir(path.join(dir, 'src'), { recursive: true });
    await mkdir(path.join(dir, 'docs', 'plans'), { recursive: true });
    await writeFile(path.join(dir, '.llmwiki', 'config.json'), JSON.stringify({
      documentation: {
        ingest: true,
        include: ['README.md'],
        exclude: [],
        stale_after_days: 9999
      }
    }), 'utf8');
    await writeFile(path.join(dir, 'src', 'app.js'), "export const mode = process.env.APP_MODE;\nconst baseUrl = optionalEnv(env, 'LLMWIKI_LLM_BASE_URL');\n", 'utf8');
    await writeFile(path.join(dir, 'docs', 'plans', 'README.md'), '# Plans\n', 'utf8');
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\nSee `src/app.js`, `docs/plans/`, `docs/missing.md`, and configure APP_MODE, MISSING_TOKEN, or LLMWIKI_LLM_BASE_URL.\n', 'utf8');

    const scanDir = path.join(dir, '.llmwiki', 'run');
    await scanRepository({ mode: 'bootstrap', repoPath: dir, outDir: scanDir });

    const lint = await lintDocs({ scanDir, repoPath: dir });
    const brokenPathIssues = lint.issues.filter((i) => i.code === 'broken-documented-file-path');
    assert.equal(brokenPathIssues.length, 1);
    assert.match(brokenPathIssues[0].message, /README\.md:3 references missing repository path docs\/missing\.md/);

    const envIssues = lint.issues.filter((i) => i.code === 'unvalidated-env-var');
    assert.equal(envIssues.length, 1);
    assert.match(envIssues[0].message, /MISSING_TOKEN/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('Documentation Debt Report includes file path and environment variable validation', async () => {
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
    await writeFile(path.join(dir, 'src', 'app.js'), 'export const mode = process.env.APP_MODE;\n', 'utf8');
    await writeFile(path.join(dir, 'README.md'), '# Demo\n\nSee `src/app.js` and `docs/missing.md`. Configure APP_MODE and MISSING_TOKEN.\n', 'utf8');

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
