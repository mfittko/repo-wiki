import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { scanRepository } from '../src/scanner.js';
import { createBootstrapPlan } from '../src/planner.js';
import { compileWiki } from '../src/compiler.js';
import { runGit } from '../src/utils/git.js';
import type { LLMRequest } from '../src/llm-provider.js';

const fixtureRoot = path.resolve(process.cwd(), 'test', 'fixtures', 'compiler-e2e');

async function prepareFixtureRepo(fixtureName: string) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `repo-wiki-compiler-e2e-${fixtureName}-`));
  const repoPath = path.join(tempDir, 'repo');
  const fixtureRepoPath = path.join(fixtureRoot, fixtureName, 'repo');
  const scanDir = path.join(tempDir, '.llmwiki', 'run');
  const planFile = path.join(tempDir, '.llmwiki', 'bootstrap-plan.json');
  const wikiDir = path.join(tempDir, '.llmwiki', 'wiki');

  await fs.cp(fixtureRepoPath, repoPath, { recursive: true });
  await initializeGitRepository(repoPath, fixtureName);

  return { tempDir, repoPath, scanDir, planFile, wikiDir };
}

async function initializeGitRepository(repoPath: string, fixtureName: string) {
  const env = {
    ...process.env,
    GIT_AUTHOR_NAME: 'Repo Wiki',
    GIT_AUTHOR_EMAIL: 'repo-wiki@example.com',
    GIT_COMMITTER_NAME: 'Repo Wiki',
    GIT_COMMITTER_EMAIL: 'repo-wiki@example.com',
    GIT_AUTHOR_DATE: '2026-01-01T00:00:00Z',
    GIT_COMMITTER_DATE: '2026-01-01T00:00:00Z'
  };

  await runGit(['init'], { cwd: repoPath, env });
  await runGit(['config', 'user.name', 'Repo Wiki'], { cwd: repoPath, env });
  await runGit(['config', 'user.email', 'repo-wiki@example.com'], { cwd: repoPath, env });
  await runGit(['remote', 'add', 'origin', `https://github.com/example/${fixtureName}.git`], { cwd: repoPath, env });
  await runGit(['add', '.'], { cwd: repoPath, env });
  await runGit(['commit', '-m', 'fixture'], { cwd: repoPath, env });
}

async function runFixturePipeline(fixtureName: string, compileOptions: Record<string, unknown> = {}) {
  const prepared = await prepareFixtureRepo(fixtureName);

  const scan = await scanRepository({
    mode: 'bootstrap',
    repoPath: prepared.repoPath,
    outDir: prepared.scanDir
  });
  const plan = await createBootstrapPlan({
    scanDir: prepared.scanDir,
    outFile: prepared.planFile
  });
  const compile = await compileWiki({
    scanDir: prepared.scanDir,
    planFile: prepared.planFile,
    wikiDir: prepared.wikiDir,
    ...compileOptions
  });

  return { ...prepared, scan, plan, compile };
}

async function readWikiPage(wikiDir: string, pageName: string) {
  const content = await fs.readFile(path.join(wikiDir, pageName), 'utf8');
  return { content, normalized: normalizeVolatileContent(content), frontmatter: parseFrontmatter(content) };
}

function parseFrontmatter(content: string) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(content);
  if (!match) {
    return {};
  }

  const fields: Record<string, unknown> = {};
  for (const line of match[1].split('\n')) {
    const entry = /^([A-Za-z0-9_-]+):\s*(.+)$/.exec(line);
    if (!entry) {
      continue;
    }

    const [, key, valueRaw] = entry;
    let value: unknown = valueRaw;
    try {
      value = JSON.parse(valueRaw);
    } catch {
      value = valueRaw;
    }
    fields[key] = value;
  }

  return fields;
}

function normalizeVolatileContent(content: string) {
  return content
    .replace(/compiled_at: \"[^\"]+\"/g, 'compiled_at: "<normalized>"')
    .replace(/## \d{4}-\d{2}-\d{2} \|/g, '## <normalized-date> |')
    .replace(/Last compiled: `[^`]+`/g, 'Last compiled: `<normalized>`')
    .replace(/source_commit: \"[0-9a-f]{40}\"/g, 'source_commit: "<normalized>"')
    .replace(/\/blob\/[0-9a-f]{40}\//g, '/blob/<normalized>/');
}

function frontmatterSourcePaths(frontmatter: Record<string, unknown>) {
  const value = frontmatter.source_paths;
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function assertAllPathsGrounded(paths: string[], manifestPaths: Set<string>, fixtureName: string, pageName: string) {
  for (const sourcePath of paths) {
    assert.ok(
      manifestPaths.has(sourcePath),
      `${fixtureName}/${pageName}: expected source path to exist in scan manifest: ${sourcePath}`
    );
  }
}

function validProviderContent(req: LLMRequest) {
  const sourcePaths = req.sourcePaths?.length ? req.sourcePaths : ['README.md'];
  const lines = [
    '---',
    `kind: ${JSON.stringify(req.archetype)}`,
    'compiled_at: "mock"',
    'source_repo: "mock"',
    'source_commit: "mock"',
    'page_state: "generated"',
    ...(req.archetype === 'architecture' ? ['confidence: "medium"', 'claim_status: "grounded"'] : []),
    `source_paths: ${JSON.stringify(sourcePaths)}`,
    '---',
    '',
    `# ${req.pageTitle}`,
    '',
    'Provider generated body.',
    ''
  ];

  if (req.archetype === 'architecture') {
    lines.push(
      '## Executive Architecture Summary',
      '',
      'Provider architecture summary.',
      '',
      '## System and Repository Context',
      '',
      'Provider repository context.',
      '',
      '## Major Modules and Responsibilities',
      '',
      'Provider module responsibilities.',
      '',
      '## Runtime, Data, and Control-Flow Relationships',
      '',
      'Provider runtime relationships.',
      '',
      '## Build, Test, Deployment, and Operational Surfaces',
      '',
      'Provider operational surfaces.',
      '',
      '## Cross-Cutting Concerns',
      '',
      'Provider cross-cutting concerns.',
      '',
      '## Caveats and Open Questions',
      '',
      'Provider caveats.',
      ''
    );
  }

  lines.push('<!-- HUMAN_NOTES_START -->', '<!-- HUMAN_NOTES_END -->', '');
  return lines.join('\n');
}

test('compiler e2e fixture basic-node-service keeps source-grounded outputs across scan-plan-compile', async () => {
  const fixtureName = 'basic-node-service';
  const run = await runFixturePipeline(fixtureName);

  try {
    const manifestPaths = new Set(run.scan.manifest.files.map((file) => file.path));

    assert.ok(run.plan.plan.pages.some((page) => page.path === 'Build-Test-and-Run.md'), `${fixtureName}: expected foundation page`);
    const apiModule = run.plan.plan.modules.find((module) =>
      Array.isArray(module.files) && module.files.some((file) => typeof file === 'string' && file.startsWith('services/api/'))
    );
    assert.ok(apiModule, `${fixtureName}: expected a services/api module in bootstrap plan`);

    const buildPage = await readWikiPage(run.wikiDir, 'Build-Test-and-Run.md');
    const modulePage = await readWikiPage(run.wikiDir, `${apiModule!.slug}.md`);
    const dependencyPage = await readWikiPage(run.wikiDir, 'Dependency-Map.md');
    const testingPage = await readWikiPage(run.wikiDir, 'Testing-Strategy.md');
    const configPage = await readWikiPage(run.wikiDir, 'Configuration-and-Environment.md');
    const routesPage = await readWikiPage(run.wikiDir, 'API-HTTP-Routes.md');

    assert.equal(buildPage.frontmatter.kind, 'build_test_run', `${fixtureName}/Build-Test-and-Run.md: unexpected kind`);
    assert.equal(buildPage.frontmatter.claim_status, 'grounded', `${fixtureName}/Build-Test-and-Run.md: unexpected claim_status`);
    assert.match(buildPage.normalized, /npm ci/, `${fixtureName}/Build-Test-and-Run.md: missing CI command evidence`);
    assert.match(buildPage.normalized, /node --test/, `${fixtureName}/Build-Test-and-Run.md: missing package script evidence`);

    const buildSourcePaths = frontmatterSourcePaths(buildPage.frontmatter);
    assert.ok(buildSourcePaths.includes('package.json'), `${fixtureName}/Build-Test-and-Run.md: missing package.json source path`);
    assert.ok(buildSourcePaths.includes('.github/workflows/ci.yml'), `${fixtureName}/Build-Test-and-Run.md: missing workflow source path`);
    assertAllPathsGrounded(buildSourcePaths, manifestPaths, fixtureName, 'Build-Test-and-Run.md');

    assert.equal(modulePage.frontmatter.kind, 'module', `${fixtureName}/${apiModule!.slug}.md: unexpected kind`);
    assert.equal(modulePage.frontmatter.claim_status, 'grounded', `${fixtureName}/${apiModule!.slug}.md: unexpected claim_status`);
    assert.equal(modulePage.frontmatter.confidence, 'high', `${fixtureName}/${apiModule!.slug}.md: unexpected confidence`);
    const moduleSourcePaths = frontmatterSourcePaths(modulePage.frontmatter);
    assert.ok(moduleSourcePaths.includes('services/api/server.js'), `${fixtureName}/${apiModule!.slug}.md: missing server source path`);
    assert.ok(moduleSourcePaths.includes('services/api/routes.js'), `${fixtureName}/${apiModule!.slug}.md: missing routes source path`);
    assertAllPathsGrounded(moduleSourcePaths, manifestPaths, fixtureName, `${apiModule!.slug}.md`);

    assert.match(dependencyPage.normalized, /services\/api\/server\.js/, `${fixtureName}/Dependency-Map.md: missing server dependency`);
    assert.match(dependencyPage.normalized, /packages\/core\/health\.js/, `${fixtureName}/Dependency-Map.md: missing package dependency`);
    assertAllPathsGrounded(frontmatterSourcePaths(dependencyPage.frontmatter), manifestPaths, fixtureName, 'Dependency-Map.md');

    assert.match(testingPage.normalized, /test\/api\/server\.test\.js/, `${fixtureName}/Testing-Strategy.md: missing test linkage`);
    assert.match(testingPage.normalized, /services\/api\/server\.js/, `${fixtureName}/Testing-Strategy.md: missing source linkage`);
    assertAllPathsGrounded(frontmatterSourcePaths(testingPage.frontmatter), manifestPaths, fixtureName, 'Testing-Strategy.md');

    assert.match(configPage.normalized, /APP_MODE/, `${fixtureName}/Configuration-and-Environment.md: missing APP_MODE evidence`);
    assert.match(configPage.normalized, /PORT/, `${fixtureName}/Configuration-and-Environment.md: missing PORT evidence`);
    assertAllPathsGrounded(frontmatterSourcePaths(configPage.frontmatter), manifestPaths, fixtureName, 'Configuration-and-Environment.md');

    assert.match(routesPage.normalized, /\/health/, `${fixtureName}/API-HTTP-Routes.md: missing /health route`);
    assert.match(routesPage.normalized, /GET/, `${fixtureName}/API-HTTP-Routes.md: missing GET method evidence`);
    assertAllPathsGrounded(frontmatterSourcePaths(routesPage.frontmatter), manifestPaths, fixtureName, 'API-HTTP-Routes.md');
  } finally {
    await fs.rm(run.tempDir, { recursive: true, force: true });
  }
});

test('compiler e2e fixture docs-only-module-downgrade preserves conservative review-needed grounding in llm mode', async () => {
  const fixtureName = 'docs-only-module-downgrade';
  const provider = {
    name: 'docs-only-overclaim-provider',
    async complete(req: LLMRequest) {
      if (req.archetype === 'architecture') {
        return { provider: 'docs-only-overclaim-provider', content: validProviderContent(req) };
      }

      return {
        provider: 'docs-only-overclaim-provider',
        content: [
          '---',
          'kind: "module"',
          'compiled_at: "2026-05-10T00:00:00.000Z"',
          'source_repo: "provider-origin"',
          'source_commit: "provider-commit"',
          'source_paths: ["invented/path.ts"]',
          'page_state: "generated"',
          'confidence: "high"',
          'claim_status: "source-grounded"',
          '---',
          '',
          `# ${req.pageTitle}`,
          '',
          'Provider claims this module is authoritative and grounded.',
          '',
          '<!-- HUMAN_NOTES_START -->',
          '<!-- HUMAN_NOTES_END -->',
          ''
        ].join('\n')
      };
    }
  };

  const run = await runFixturePipeline(fixtureName, {
    config: { compiler: { mode: 'llm' } },
    _provider: provider
  });

  try {
    const manifestPaths = new Set(run.scan.manifest.files.map((file) => file.path));
    const docsModule = run.plan.plan.modules.find((module) =>
      Array.isArray(module.files) && module.files.every((file) => typeof file === 'string' && (file.endsWith('.md') || file.startsWith('docs/')))
    );
    assert.ok(docsModule, `${fixtureName}: expected docs-only module in bootstrap plan`);

    const docsModulePage = await readWikiPage(run.wikiDir, 'Documentation.md');
    assert.equal(docsModulePage.frontmatter.kind, 'module', `${fixtureName}/Documentation.md: unexpected kind`);
    assert.equal(docsModulePage.frontmatter.claim_status, 'review-needed', `${fixtureName}/Documentation.md: docs-only module should be downgraded`);
    assert.equal(docsModulePage.frontmatter.confidence, 'low', `${fixtureName}/Documentation.md: docs-only module confidence should be low`);
    assert.doesNotMatch(docsModulePage.normalized, /claim_status: "source-grounded"/, `${fixtureName}/Documentation.md: should not keep provider overclaim`);
    assert.doesNotMatch(docsModulePage.normalized, /confidence: "high"/, `${fixtureName}/Documentation.md: should not keep provider overclaim confidence`);
    assert.match(docsModulePage.normalized, /markdown documentation is secondary evidence/i, `${fixtureName}/Documentation.md: missing conservative evidence note`);

    const docsSourcePaths = frontmatterSourcePaths(docsModulePage.frontmatter);
    assert.deepEqual(docsSourcePaths, docsModule.files, `${fixtureName}/Documentation.md: source paths should remain constrained to docs module inputs`);
    assertAllPathsGrounded(docsSourcePaths, manifestPaths, fixtureName, 'Documentation.md');
  } finally {
    await fs.rm(run.tempDir, { recursive: true, force: true });
  }
});
