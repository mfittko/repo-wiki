import path from 'node:path';
import { ensureDir, readJson, writeText } from './utils/fs.js';

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

  if (manifest.totals.categories?.data) {
    pages.set('Data-Model-and-Migrations.md', renderDataModel(manifest));
  }

  for (const module of plan.modules || []) {
    const modulePage = `${module.slug}.md`;
    if (!pages.has(modulePage)) {
      pages.set(modulePage, renderModulePage(manifest, module));
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

  return `${frontmatter(manifest, { kind: 'build_test_run' })}# Build, Test, and Run\n\n## Detected package manifests\n\n${packageFiles.map((file) => `- \`${file.path}\``).join('\n') || '- No package manifests detected.'}\n\n## Detected CI files\n\n${ciFiles.map((file) => `- \`${file.path}\``).join('\n') || '- No CI files detected.'}\n\n## Commands to verify manually\n\nThe sketch scanner does not yet parse scripts from package manifests. The production scanner should extract commands from package files, task runners, CI workflows, Dockerfiles, and project documentation.\n`;
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
  const importRows = manifest.files
    .filter((file) => file.imports?.length)
    .slice(0, 100)
    .map((file) => `| \`${file.path}\` | ${file.imports.map((imp) => `\`${imp}\``).join(', ')} |`);

  return `${frontmatter(manifest, { kind: 'dependency_map' })}# Dependency Map\n\n| Source file | Imports |\n|---|---|\n${importRows.join('\n') || '| None detected | |'}\n`;
}

function renderTestingStrategy(manifest) {
  const tests = manifest.files.filter((file) => file.category === 'test');
  return `${frontmatter(manifest, { kind: 'testing_strategy' })}# Testing Strategy\n\n## Detected test files\n\n${tests.map((file) => `- \`${file.path}\``).join('\n') || '- No tests detected by the sketch scanner.'}\n\n## Next refinement\n\nThe production compiler should map tests to modules, entry points, and public APIs.\n`;
}

function renderConfiguration(manifest) {
  const configFiles = manifest.files.filter((file) => file.runtime_hints?.includes('environment-variable') || /(^|\/)(\.env|config|settings)/i.test(file.path));
  return `${frontmatter(manifest, { kind: 'configuration' })}# Configuration and Environment\n\n## Detected configuration-related files\n\n${configFiles.map((file) => `- \`${file.path}\``).join('\n') || '- No configuration surfaces detected by the sketch scanner.'}\n\n## Secret handling\n\nGenerated wiki pages must describe variable names and configuration concepts, not copy secret values.\n`;
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
  return `${frontmatter(manifest, { kind: 'api_http_routes' })}# API: HTTP Routes\n\n## Detected route-related files\n\n${routeFiles.map((file) => `- \`${file.path}\``).join('\n') || '- No HTTP routes detected.'}\n\n## Next refinement\n\nAdd framework-specific extractors for Express, Fastify, NestJS, Next.js route handlers, Hono, Koa, tRPC, OpenAPI, and GraphQL.\n`;
}

function renderDataModel(manifest) {
  const dataFiles = manifest.files.filter((file) => file.category === 'data' || file.reasons?.includes('data-model'));
  return `${frontmatter(manifest, { kind: 'data_model' })}# Data Model and Migrations\n\n## Detected data-related files\n\n${dataFiles.map((file) => `- \`${file.path}\``).join('\n') || '- No data files detected.'}\n`;
}

function renderModulePage(manifest, module) {
  const sampleFiles = module.files.slice(0, 80).map((file) => `- \`${file}\``).join('\n');
  return `${frontmatter(manifest, { kind: 'module', module: module.name, source_paths: module.files.slice(0, 20) })}# ${module.name}\n\n## Purpose\n\nGenerated first-pass page for files grouped under ${module.name}. This should be refined by the LLM compiler using source cards and targeted source excerpts.\n\n## Signals\n\n- Files: ${module.files.length}\n- Categories: ${Object.keys(module.categories).join(', ') || 'unknown'}\n- Languages: ${Object.keys(module.languages).join(', ') || 'unknown'}\n- Runtime hints: ${Object.keys(module.runtime_hints).join(', ') || 'none'}\n- Reasons: ${module.important_reasons.join(', ') || 'none'}\n\n## Source files\n\n${sampleFiles || '- None'}\n\n## Related pages\n\n- ${wikiLink('Dependency-Map.md')}\n- ${wikiLink('Testing-Strategy.md')}\n- ${wikiLink('Open-Questions.md')}\n\n<!-- HUMAN_NOTES_START -->\n<!-- HUMAN_NOTES_END -->\n`;
}

function tableFromObject(object, headers) {
  const rows = Object.entries(object || {}).sort((a, b) => b[1] - a[1]);
  if (!rows.length) {
    return 'No entries detected.';
  }

  return [`| ${headers[0]} | ${headers[1]} |`, '|---|---:|', ...rows.map(([key, value]) => `| ${key} | ${value} |`)].join('\n');
}

function shortCommit(commit) {
  return String(commit || 'unknown').slice(0, 8);
}

function escapeMermaid(value) {
  return String(value).replace(/[\[\]{}]/g, '').replace(/"/g, "'");
}
