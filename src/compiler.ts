import path from 'node:path';
import { hasDataModelSignals } from './data-model-signals.js';
import { ensureDir, readJson, writeText } from './utils/fs.js';
import { classifyDocumentedCommands } from './docs-ingestor.js';

export async function compileWiki({ scanDir, planFile, wikiDir }) {
  const manifest = await readJson(path.join(scanDir, 'manifest.json'));
  const plan = await readJson(planFile);
  await ensureDir(wikiDir);

  const pages = new Map();

  pages.set('Home.md', renderHome(manifest, plan));
  pages.set('_Sidebar.md', renderSidebar(plan));
  pages.set('Index.md', renderIndex(manifest, plan));
  pages.set('Log.md', renderLog(manifest, plan));
  pages.set('Agent-Context-Pack.md', renderAgentContextPack(manifest, plan));
  pages.set('Repository-Overview.md', renderRepositoryOverview(manifest, plan));
  pages.set('Architecture.md', renderArchitecture(manifest, plan));
  pages.set('Build-Test-and-Run.md', renderBuildTestAndRun(manifest));
  pages.set('Open-Questions.md', renderOpenQuestions(manifest, plan));
  pages.set('Documentation-Debt-Report.md', renderDocumentationDebtReport(manifest));
  pages.set('Dependency-Map.md', renderDependencyMap(manifest));
  pages.set('Testing-Strategy.md', renderTestingStrategy(manifest));
  pages.set('Configuration-and-Environment.md', renderConfiguration(manifest));
  pages.set('Security-and-Secrets.md', renderSecurity(manifest));
  pages.set('Operational-Runbook.md', renderRunbook(manifest));

  if (manifest.totals.runtime_hints?.['http-route']) {
    pages.set('API-HTTP-Routes.md', renderHttpRoutes(manifest));
  }

  if (shouldRenderDataModelPage(manifest, plan)) {
    pages.set('Data-Model-and-Migrations.md', renderDataModel(manifest));
  }

  const sourceToTestsIndex = buildSourceToTestsIndex(manifest);

  for (const module of plan.modules || []) {
    const modulePage = `${module.slug}.md`;
    if (!pages.has(modulePage)) {
      pages.set(modulePage, renderModulePage(manifest, module, sourceToTestsIndex));
    }
  }

  for (const [file, content] of pages) {
    await writeText(path.join(wikiDir, file), content);
  }

  return {
    summary: {
      wikiDir,
      pages: pages.size,
      commit: manifest.commit
    }
  };
}

function frontmatter(manifest, extra = {}) {
  const fields = {
    source_repo: manifest.remote,
    source_commit: manifest.commit,
    compiled_at: new Date().toISOString(),
    ...extra
  };

  const lines = ['---'];
  for (const [key, value] of Object.entries(fields)) {
    lines.push(`${key}: ${JSON.stringify(value)}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

function wikiLink(page) {
  return `[${page.replace(/\.md$/, '').replaceAll('-', ' ')}](${page.replace(/\.md$/, '')})`;
}

function renderHome(manifest, plan) {
  return `${frontmatter(manifest, { kind: 'home' })}# Repository Knowledge Base\n\nGenerated from \`${manifest.remote}\` at commit \`${manifest.commit}\`.\n\n## Start here\n\n- ${wikiLink('Agent-Context-Pack.md')}\n- ${wikiLink('Repository-Overview.md')}\n- ${wikiLink('Architecture.md')}\n- ${wikiLink('Build-Test-and-Run.md')}\n- ${wikiLink('Index.md')}\n\n## Important rule\n\nSource code at the pinned commit is authoritative. Tests, CI, and generated schemas are high-authority evidence. Markdown documentation is ingested as configurable secondary evidence and must be validated before it changes generated claims.\n\n## Generated module pages\n\n${(plan.modules || []).slice(0, 20).map((module) => `- [${module.name}](${module.slug})`).join('\n') || '- No module pages generated.'}\n`;
}

function renderSidebar(plan) {
  const moduleLinks = (plan.modules || []).slice(0, 25).map((module) => `  - [${module.name}](${module.slug})`).join('\n');
  return `# Navigation\n\n- [Home](Home)\n- [Agent Context Pack](Agent-Context-Pack)\n- [Repository Overview](Repository-Overview)\n- [Architecture](Architecture)\n- [Build, Test, and Run](Build-Test-and-Run)\n- [Index](Index)\n- [Log](Log)\n\n## Modules\n\n${moduleLinks || '- No module pages generated.'}\n\n## Cross-cutting\n\n- [Dependency Map](Dependency-Map)\n- [Testing Strategy](Testing-Strategy)\n- [Configuration and Environment](Configuration-and-Environment)\n- [Security and Secrets](Security-and-Secrets)\n- [Operational Runbook](Operational-Runbook)\n- [Documentation Debt Report](Documentation-Debt-Report)
- [Open Questions](Open-Questions)\n`;
}

function renderIndex(manifest, plan) {
  return `${frontmatter(manifest, { kind: 'index' })}# Index\n\n## Foundation\n\n${plan.pages.filter((page) => page.phase === 'foundation').map((page) => `- ${wikiLink(page.path)} - ${page.purpose}`).join('\n')}\n\n## Modules\n\n${plan.pages.filter((page) => page.phase === 'modules').map((page) => `- ${wikiLink(page.path)} - ${page.purpose}`).join('\n') || '- No module pages generated.'}\n\n## Cross-cutting\n\n${plan.pages.filter((page) => page.phase === 'cross-cutting').map((page) => `- ${wikiLink(page.path)} - ${page.purpose}`).join('\n')}\n\n## Source inventory summary\n\n\`\`\`json\n${JSON.stringify(manifest.totals, null, 2)}\n\`\`\`\n`;
}

function renderLog(manifest, plan) {
  return `${frontmatter(manifest, { kind: 'log' })}# Wiki Compilation Log\n\n## ${new Date().toISOString().slice(0, 10)} | ${manifest.mode} | ${manifest.commit}\n\nGenerated initial wiki scaffold.\n\n- Files scanned: ${manifest.files.length}\n- Planned pages: ${plan.pages.length}\n- Module groups: ${plan.modules.length}\n\n`;
}

function renderAgentContextPack(manifest, plan) {
  const topModules = (plan.modules || []).slice(0, 10);
  return `${frontmatter(manifest, { kind: 'agent_context_pack' })}# Agent Context Pack\n\nThis page is the compact entry point for coding agents and developers.\n\n## Repository snapshot\n\n- Source: \`${manifest.remote}\`\n- Commit: \`${manifest.commit}\`\n- Files scanned: ${manifest.files.length}\n\n## Read first\n\n1. ${wikiLink('Architecture.md')}\n2. ${wikiLink('Build-Test-and-Run.md')}\n3. ${wikiLink('Index.md')}\n4. Relevant module page from the routing table below\n\n## Task routing\n\n| Task | Read these pages first |\n|---|---|\n${topModules.map((module) => `| Work in ${module.name} | [${module.name}](${module.slug}), ${wikiLink('Testing-Strategy.md')}, ${wikiLink('Dependency-Map.md')} |`).join('\n') || '| General change | Architecture, Build Test and Run, Index |'}\n\n## Verification policy\n\nRun the repository's own test, lint, and type-check commands when available. If commands are not detected, inspect package manifests and CI workflows before changing behavior.\n\n## Confidence rule\n\nThe wiki is generated from source cards and documentation cards. Treat code, tests, CI, and config as authoritative when there is disagreement. Treat markdown documentation as useful but potentially stale unless marked validated.\n`;
}

function renderRepositoryOverview(manifest, plan) {
  return `${frontmatter(manifest, { kind: 'repository_overview' })}# Repository Overview\n\n## Languages\n\n${tableFromObject(manifest.totals.languages, ['Language', 'Files'])}\n\n## File categories\n\n${tableFromObject(manifest.totals.categories, ['Category', 'Files'])}\n\n## Main knowledge units\n\n${(plan.modules || []).map((module) => `- [${module.name}](${module.slug}) - ${module.files.length} files`).join('\n')}\n`;
}

function renderArchitecture(manifest, plan) {
  return `${frontmatter(manifest, { kind: 'architecture' })}# Architecture\n\nThis page is a first-pass architecture summary based on repository structure. The production compiler should replace this with an LLM-reviewed synthesis that uses source cards and targeted code excerpts.\n\n## Structural map\n\n\`\`\`mermaid\nflowchart TD\n  Repo[Repository at ${shortCommit(manifest.commit)}]\n${(plan.modules || []).slice(0, 12).map((module, index) => `  Repo --> M${index}[${escapeMermaid(module.name)}]`).join('\n')}\n\`\`\`\n\n## Module groups\n\n${(plan.modules || []).map((module) => `### ${module.name}\n\n- Files: ${module.files.length}\n- Dominant categories: ${Object.keys(module.categories).join(', ') || 'unknown'}\n- Dominant languages: ${Object.keys(module.languages).join(', ') || 'unknown'}\n- Important reasons: ${module.important_reasons.join(', ') || 'none detected'}\n`).join('\n')}\n`;
}

function renderBuildTestAndRun(manifest) {
  const packageFiles = manifest.files.filter((file) => file.path.endsWith('package.json'));
  const ciFiles = manifest.files.filter((file) => file.category === 'ci');
  const packageScripts = (manifest.analysis?.package_scripts || []).filter((entry) => Object.keys(entry.scripts || {}).length > 0);
  const scriptRows = packageScripts.flatMap((entry) => Object.entries(entry.scripts || {}).map(([name, command]) => [code(entry.path), entry.name ? code(entry.name) : 'unknown', code(name), code(String(command))]));
  const scriptsSection = scriptRows.length
    ? `## Package scripts\n\n- Package manifests with scripts: ${packageScripts.length}\n- Scripts detected: ${scriptRows.length}\n\n${markdownTable(['Manifest', 'Package', 'Script', 'Command'], scriptRows)}\n`
    : `## Package scripts\n\nNo package scripts were extracted from manifest analysis. Inspect package manifests, task runners, and CI workflows directly when confirming canonical commands.\n`;

  return `${frontmatter(manifest, { kind: 'build_test_run' })}# Build, Test, and Run\n\n## Detected package manifests\n\n${packageFiles.map((file) => `- \`${file.path}\``).join('\n') || '- No package manifests detected.'}\n\n## Detected CI files\n\n${ciFiles.map((file) => `- \`${file.path}\``).join('\n') || '- No CI files detected.'}\n\n${scriptsSection}\n## Manual verification guidance\n\nTreat extracted scripts as a starting point. Verify the canonical build, test, and run paths against CI workflows, container entrypoints, and deployment configs when they exist.\n`;
}

function renderOpenQuestions(manifest, plan) {
  return `${frontmatter(manifest, { kind: 'open_questions' })}# Open Questions\n\n- What pages should be human-owned versus generated?\n- Which source paths should be excluded from wiki compilation?\n- Which modules require deeper AST-level extraction?\n- Which package manager and CI commands should be treated as canonical?\n- How should large files and generated files be summarized?\n- What confidence threshold should block publishing?\n\n## Bootstrap gaps\n\n- This first-pass compiler uses repository structure, not an LLM synthesis pass.\n- Existing human wiki reconciliation is not implemented yet.\n- GitHub Wiki publishing is a placeholder.\n`;
}

function renderDocumentationDebtReport(manifest) {
  const docs = manifest.documentation?.files || [];
  const summary = manifest.documentation?.summary || {};
  const rows = docs.slice(0, 100).map((doc) => `| \`${doc.path}\` | ${doc.status} | ${doc.authority} | ${doc.age_days} | ${doc.claims?.length || 0} | ${doc.validation?.commands?.length || 0} | ${doc.validation?.env_vars?.length || 0} |`);
  const staleDocs = docs.filter((doc) => doc.stale).map((doc) => `- \`${doc.path}\` - age ${doc.age_days} days, status ${doc.status}`);
  const contradicted = docs.filter((doc) => doc.validation?.contradictions?.length).map((doc) => `- \`${doc.path}\` - ${doc.validation.contradictions.length} contradiction-review signals`);

  // Build merged package scripts from manifest analysis for command validation
  const allPackageScripts: Record<string, string> = {};
  for (const pkg of manifest.analysis?.package_scripts || []) {
    Object.assign(allPackageScripts, pkg.scripts || {});
  }

  // Classify all documented commands against known package scripts
  // CI command validation requires running lint-docs with repo access
  const allDocCommands: string[] = docs.flatMap((doc) => doc.validation?.commands || []);
  const uniqueDocCommands = [...new Set(allDocCommands)];
  const classified = classifyDocumentedCommands(uniqueDocCommands, allPackageScripts, []);
  const validatedCmds = classified.filter((c) => c.status === 'validated');
  const missingCmds = classified.filter((c) => c.status === 'missing');
  const unvalidatedCmds = classified.filter((c) => c.status === 'unvalidated');

  const commandRows = classified.map((c) => {
    const badge = c.status === 'validated' ? '✅ validated' : c.status === 'missing' ? '❌ missing' : '❓ unvalidated';
    const source = c.source === 'package_scripts' ? 'package.json' : c.source === 'ci_workflow' ? 'CI workflow' : 'unknown';
    return `| \`${c.command}\` | ${badge} | ${source} |`;
  });

  return `${frontmatter(manifest, { kind: 'documentation_debt_report', documentation_authority: manifest.documentation?.authority || 'secondary' })}# Documentation Debt Report

Markdown documentation is ingested as secondary evidence. It is useful for intent, terminology, onboarding, and architectural rationale, but material claims should be validated against code, tests, configuration, generated schemas, or CI before the wiki presents them as current behavior.

## Configuration

\`\`\`json
${JSON.stringify(manifest.config?.documentation || {}, null, 2)}
\`\`\`

## Summary

- Documentation ingestion enabled: ${manifest.documentation?.enabled !== false}
- Documentation files scanned: ${summary.files || 0}
- Claims extracted: ${summary.claims || 0}
- Stale documents: ${summary.stale || 0}
- Commands found in docs: ${summary.commands || 0}
- Environment variable mentions: ${summary.env_vars || 0}

## Documentation status table

| File | Status | Authority | Age days | Claims | Commands | Env vars |
|---|---|---:|---:|---:|---:|---:|
${rows.join('\n') || '| No documentation files scanned | | | | | | |'}

## Command validation

Commands extracted from documentation code blocks, validated against \`package.json\` scripts. Run \`lint-docs\` for CI workflow validation.

- Validated: ${validatedCmds.length}
- Missing (script not in package.json): ${missingCmds.length}
- Unvalidated (source unknown): ${unvalidatedCmds.length}

${commandRows.length > 0 ? `| Command | Status | Source |\n|---|---|---|\n${commandRows.join('\n')}` : '- No commands extracted from documentation.'}

## Stale documentation candidates

${staleDocs.join('\n') || '- None detected.'}

## Contradiction-review candidates

${contradicted.join('\n') || '- None detected.'}

## Compiler policy

- Do not suppress documentation by default.
- Never treat docs as more authoritative than code at the pinned commit.
- Promote documentation-derived claims only when validated or clearly labeled.
- Include unvalidated operational claims in this report and in ${wikiLink('Open-Questions.md')}.
- Fail publishing when project policy marks stale or contradicted docs as error-level.
`;
}

function renderDependencyMap(manifest) {
  const dependencyEdges = manifest.analysis?.dependency_graph?.edges || [];

  if (dependencyEdges.length > 0) {
    const rows = dependencyEdges.slice(0, 200).map((edge) => [code(edge.from), code(edge.to), code(edge.specifier)]);
    const summary = manifest.analysis?.dependency_graph?.summary || {};

    return `${frontmatter(manifest, { kind: 'dependency_map' })}# Dependency Map\n\n## Resolved internal dependency edges\n\n- Edges detected: ${summary.edges ?? dependencyEdges.length}\n- Importing files: ${summary.importers ?? uniqueCount(dependencyEdges.map((edge) => edge.from))}\n- Imported files: ${summary.imported_files ?? uniqueCount(dependencyEdges.map((edge) => edge.to))}\n\n${markdownTable(['From', 'To', 'Specifier'], rows)}\n`;
  }

  const importRows = manifest.files
    .filter((file) => file.imports?.length)
    .slice(0, 100)
    .map((file) => `| \`${file.path}\` | ${file.imports.map((imp) => `\`${imp}\``).join(', ')} |`);

  return `${frontmatter(manifest, { kind: 'dependency_map' })}# Dependency Map\n\n| Source file | Imports |\n|---|---|\n${importRows.join('\n') || '| None detected | |'}\n`;
}

function renderTestingStrategy(manifest) {
  const tests = manifest.files.filter((file) => file.category === 'test');
  const mappings = manifest.analysis?.test_to_source?.mappings || [];
  const mappingSection = mappings.length
    ? `## Test-to-source mappings\n\n- Mapped tests: ${manifest.analysis?.test_to_source?.summary?.mapped_tests ?? mappings.length}\n- Source files covered: ${manifest.analysis?.test_to_source?.summary?.source_files ?? uniqueCount(mappings.flatMap((mapping) => mapping.sources))}\n\n${markdownTable(['Test', 'Source files', 'Heuristics'], mappings.map((mapping) => [code(mapping.test), formatCodeList(mapping.sources), mapping.heuristics.join(', ') || 'unknown']))}\n`
    : `## Next refinement\n\nThe compiler will add direct test-to-source mappings when manifest analysis includes them.\n`;

  return `${frontmatter(manifest, { kind: 'testing_strategy' })}# Testing Strategy\n\n## Detected test files\n\n${tests.map((file) => `- \`${file.path}\``).join('\n') || '- No tests detected by the sketch scanner.'}\n\n${mappingSection}`;
}

function renderConfiguration(manifest) {
  const configFiles = manifest.files.filter((file) => file.runtime_hints?.includes('environment-variable') || /(^|\/)(\.env|config|settings)/i.test(file.path));
  const envRows = collectEnvironmentRows(manifest.files);
  const envNames = uniqueSorted(envRows.flatMap((row) => row.variables));
  const envSection = envRows.length
    ? `## Explicit environment variables\n\n- Unique variable names detected: ${envNames.length}\n- Variable names: ${formatCodeList(envNames)}\n\n${markdownTable(['Source file', 'Variables'], envRows.map((row) => [code(row.path), formatCodeList(row.variables)]))}\n`
    : `## Explicit environment variables\n\nNo explicit environment variable names were extracted from source cards.\n`;

  return `${frontmatter(manifest, { kind: 'configuration' })}# Configuration and Environment\n\n## Detected configuration-related files\n\n${configFiles.map((file) => `- \`${file.path}\``).join('\n') || '- No configuration surfaces detected by the sketch scanner.'}\n\n${envSection}\n## Secret handling\n\nGenerated wiki pages must describe variable names and configuration concepts, not copy secret values.\n`;
}

function renderSecurity(manifest) {
  const securityFiles = manifest.files.filter((file) => file.reasons?.some((reason) => ['auth', 'billing-or-payment', 'configuration'].includes(reason)));
  return `${frontmatter(manifest, { kind: 'security' })}# Security and Secrets\n\n## Security-sensitive source areas\n\n${securityFiles.map((file) => `- \`${file.path}\` - ${file.reasons.join(', ')}`).join('\n') || '- No obvious security-sensitive areas detected by the sketch scanner.'}\n\n## Policy\n\n- Do not copy secrets or private tokens into wiki pages.\n- Cite source paths instead of embedding sensitive source content.\n- Require human review before publishing changes to authentication, authorization, billing, or deployment documentation.\n`;
}

function renderRunbook(manifest) {
  const infra = manifest.files.filter((file) => file.category === 'infra' || file.runtime_hints?.includes('deployment'));
  return `${frontmatter(manifest, { kind: 'runbook' })}# Operational Runbook\n\n## Deployment and operations files\n\n${infra.map((file) => `- \`${file.path}\``).join('\n') || '- No deployment or operations files detected by the sketch scanner.'}\n\n## Next refinement\n\nThe production compiler should extract deployment commands, rollback notes, service dependencies, queue names, cron jobs, and operational dashboards when those are represented in source.\n`;
}

function renderHttpRoutes(manifest) {
  const routeFiles = manifest.files.filter((file) => file.runtime_hints?.includes('http-route') || file.reasons?.includes('api-surface'));
  const routes = collectRoutes(manifest.files);
  const routeSection = routes.length
    ? `## Detected routes\n\n- Route surfaces detected: ${routes.length}\n\n${markdownTable(['Source file', 'Framework', 'Target', 'Methods', 'Path', 'Handler'], routes.map((route) => [code(route.file), route.framework, code(route.target), route.methods.join(', ') || 'ANY', code(route.path), code(route.handler)]))}\n`
    : `## Detected route-related files\n\n${routeFiles.map((file) => `- \`${file.path}\``).join('\n') || '- No HTTP routes detected.'}\n`;

  return `${frontmatter(manifest, { kind: 'api_http_routes' })}# API: HTTP Routes\n\n${routeSection}\n## Next refinement\n\nAdd framework-specific extractors for Express, Fastify, NestJS, Next.js route handlers, Hono, Koa, tRPC, OpenAPI, and GraphQL.\n`;
}

function renderDataModel(manifest) {
  const dataFiles = manifest.files.filter((file) => file.category === 'data' || file.reasons?.includes('data-model'));
  return `${frontmatter(manifest, { kind: 'data_model' })}# Data Model and Migrations\n\n## Detected data-related files\n\n${dataFiles.map((file) => `- \`${file.path}\``).join('\n') || '- No data files detected.'}\n`;
}

function renderModulePage(manifest, module, sourceToTestsIndex: Map<string, Set<string>>) {
  const sampleFiles = module.files.slice(0, 80).map((file) => `- \`${file}\``).join('\n');
  const relatedTests = lookupRelatedTests(module.files, sourceToTestsIndex);
  const relatedTestsSection = relatedTests.length
    ? `## Related tests\n\n${relatedTests.map((t) => `- \`${t}\``).join('\n')}\n\n`
    : '';
  return `${frontmatter(manifest, { kind: 'module', module: module.name, source_paths: module.files.slice(0, 20) })}# ${module.name}\n\n## Purpose\n\nGenerated first-pass page for files grouped under ${module.name}. This should be refined by the LLM compiler using source cards and targeted source excerpts.\n\n## Signals\n\n- Files: ${module.files.length}\n- Categories: ${Object.keys(module.categories).join(', ') || 'unknown'}\n- Languages: ${Object.keys(module.languages).join(', ') || 'unknown'}\n- Runtime hints: ${Object.keys(module.runtime_hints).join(', ') || 'none'}\n- Reasons: ${module.important_reasons.join(', ') || 'none'}\n\n## Source files\n\n${sampleFiles || '- None'}\n\n${relatedTestsSection}## Related pages\n\n- ${wikiLink('Dependency-Map.md')}\n- ${wikiLink('Testing-Strategy.md')}\n- ${wikiLink('Open-Questions.md')}\n\n<!-- HUMAN_NOTES_START -->\n<!-- HUMAN_NOTES_END -->\n`;
}

function buildSourceToTestsIndex(manifest: any): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const mapping of manifest.analysis?.test_to_source?.mappings || []) {
    for (const source of mapping.sources) {
      if (!index.has(source)) {
        index.set(source, new Set());
      }
      index.get(source)!.add(mapping.test);
    }
  }
  return index;
}

function lookupRelatedTests(sourceFiles: string[], index: Map<string, Set<string>>): string[] {
  const tests = new Set<string>();
  for (const source of sourceFiles) {
    const related = index.get(source);
    if (related) {
      for (const test of related) {
        tests.add(test);
      }
    }
  }
  return [...tests].sort();
}

function tableFromObject(object: Record<string, number> | undefined, headers: string[]) {
  const rows = Object.entries(object || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
  if (!rows.length) {
    return 'No entries detected.';
  }

  return [`| ${headers[0]} | ${headers[1]} |`, '|---|---:|', ...rows.map(([key, value]) => `| ${sanitizeTableCell(key)} | ${sanitizeTableCell(value)} |`)].join('\n');
}

function markdownTable(headers: string[], rows: Array<Array<string | number>>) {
  return [
    `| ${headers.map((header) => sanitizeTableCell(header)).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map((value) => sanitizeTableCell(value)).join(' | ')} |`)
  ].join('\n');
}

function collectEnvironmentRows(files: any[]) {
  return files
    .filter((file) => (file.environment_variables || []).length > 0)
    .map((file) => ({ path: file.path, variables: uniqueSorted(file.environment_variables) }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function collectRoutes(files: any[]) {
  return files
    .flatMap((file) => (file.route_surfaces || []).map((route) => ({
      file: file.path,
      framework: route.framework || 'unknown',
      target: route.target || 'unknown',
      methods: route.methods || [],
      path: route.path || 'unknown',
      handler: route.handler || 'unknown'
    })))
    .sort((left, right) => {
      if (left.file !== right.file) {
        return left.file.localeCompare(right.file);
      }

      if (left.path !== right.path) {
        return left.path.localeCompare(right.path);
      }

      return left.target.localeCompare(right.target);
    });
}

function formatCodeList(values: Array<string | number>) {
  return values.map((value) => code(value)).join(', ');
}

function uniqueSorted(values: Array<string | number>) {
  return [...new Set(values || [])].sort((left, right) => String(left).localeCompare(String(right)));
}

function uniqueCount(values: Array<string | number>) {
  return new Set(values || []).size;
}

function code(value: string | number) {
  return `\`${String(value).replace(/`/g, '\\`')}\``;
}

function sanitizeTableCell(value: string | number) {
  return String(value ?? '').replace(/\n/g, ' ').replace(/\|/g, '\\|');
}

function shortCommit(commit: string) {
  return String(commit || 'unknown').slice(0, 8);
}

function escapeMermaid(value: string) {
  return String(value).replace(/[\[\]{}]/g, '').replace(/"/g, "'");
}

function shouldRenderDataModelPage(manifest: any, plan: any): boolean {
  return hasDataModelSignals(manifest) || (plan.pages || []).some((page) => page.path === 'Data-Model-and-Migrations.md');
}
