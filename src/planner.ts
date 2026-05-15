import path from 'node:path';
import { hasDataModelSignals } from './data-model-signals.js';
import { readJson, writeJson } from './utils/fs.js';

const ALWAYS_AFFECTED_INCREMENTAL_PAGES = ['Index.md', '_Sidebar.md', 'Log.md', 'Agent-Context-Pack.md'] as const;

export async function createBootstrapPlan({ scanDir, outFile }) {
  const manifest = await readJson(path.join(scanDir, 'manifest.json'));
  const modules = groupIntoModules(manifest.files);
  const pages = createPagePlan(manifest, modules);
  const affectedPageGraph = buildAffectedPageGraph(manifest, modules, pages);
  const incrementalSelection = await buildIncrementalSelection({ manifest, scanDir, pages });

  const plan = {
    schema_version: 1,
    mode: manifest.mode || 'bootstrap',
    repo_path: manifest.repo_path,
    remote: manifest.remote,
    commit: manifest.commit,
    generated_at: new Date().toISOString(),
    phases: [
      {
        name: 'foundation',
        purpose: 'Create core navigation and agent entry points.',
        pages: pages.filter((page) => page.phase === 'foundation').map((page) => page.path)
      },
      {
        name: 'modules',
        purpose: 'Create module/service/package pages from top-level source groupings.',
        pages: pages.filter((page) => page.phase === 'modules').map((page) => page.path)
      },
      {
        name: 'cross-cutting',
        purpose: 'Create API, data, infrastructure, testing, and security pages.',
        pages: pages.filter((page) => page.phase === 'cross-cutting').map((page) => page.path)
      },
      {
        name: 'link-and-lint',
        purpose: 'Update navigation pages, verify links, flag gaps, and prepare publication.',
        pages: ['Index.md', '_Sidebar.md', 'Open-Questions.md', 'Documentation-Debt-Report.md', 'Log.md']
      }
    ],
    modules,
    pages,
    affected_page_graph: affectedPageGraph,
    ...(incrementalSelection ? { incremental_selection: incrementalSelection } : {})
  };

  await writeJson(outFile, plan);

  return {
    plan,
    summary: {
      pages: pages.length,
      modules: modules.length,
      outFile
    }
  };
}

async function buildIncrementalSelection({ manifest, scanDir, pages }: { manifest: any; scanDir: string; pages: any[] }) {
  if (manifest.mode !== 'incremental') {
    return null;
  }

  const plannedPages = new Set<string>(pages.map((page) => page.path));
  const alwaysAffected = ALWAYS_AFFECTED_INCREMENTAL_PAGES.filter((page) => plannedPages.has(page));
  const changedPaths = extractChangedPaths(manifest);
  const graphPath = path.join(path.dirname(scanDir), 'graph.json');

  let graph: any = null;
  let selectionMode: 'graph' | 'fallback_missing_graph' | 'fallback_missing_changed_paths' = 'graph';

  try {
    graph = await readJson(graphPath);
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      selectionMode = 'fallback_missing_graph';
    } else {
      throw error;
    }
  }

  if (selectionMode === 'graph' && changedPaths.length === 0) {
    selectionMode = 'fallback_missing_changed_paths';
  }

  const selectedPages = new Map<string, Set<string>>();
  const addReason = (page: string, reason: string) => {
    if (!plannedPages.has(page)) {
      return;
    }
    let reasons = selectedPages.get(page);
    if (!reasons) {
      reasons = new Set<string>();
      selectedPages.set(page, reasons);
    }
    reasons.add(reason);
  };

  if (selectionMode === 'graph') {
    const changedPathSet = new Set(changedPaths);
    const managedPages = extractManagedPagesFromGraph(graph, plannedPages);
    for (const edge of graph?.edges || []) {
      if (edge?.type !== 'affects') {
        continue;
      }
      const sourcePath = extractGraphNodePath(edge.from, 'source');
      const pagePath = extractGraphNodePath(edge.to, 'page');
      if (!sourcePath || !pagePath) {
        continue;
      }
      if (!changedPathSet.has(sourcePath)) {
        continue;
      }
      if (!managedPages.has(pagePath)) {
        continue;
      }
      addReason(pagePath, `affects:${sourcePath}`);
    }
  } else {
    const fallbackReason = selectionMode === 'fallback_missing_graph' ? 'fallback_graph_missing' : 'fallback_changed_paths_missing';
    for (const pagePath of plannedPages) {
      addReason(pagePath, fallbackReason);
    }
  }

  for (const pagePath of alwaysAffected) {
    addReason(pagePath, 'always_global');
  }

  const selected = [...selectedPages.entries()]
    .map(([page, reasons]) => ({ page, reasons: [...reasons].sort() }))
    .sort((a, b) => a.page.localeCompare(b.page));

  return {
    graph_path: '.llmwiki/graph.json',
    mode: selectionMode,
    changed_paths: changedPaths,
    always_affected_pages: [...alwaysAffected].sort((a, b) => a.localeCompare(b)),
    selected_pages: selected
  };
}

function extractManagedPagesFromGraph(graph: any, plannedPages: Set<string>) {
  const managed = new Set<string>();
  for (const node of graph?.nodes || []) {
    if (node?.kind !== 'page' || typeof node.path !== 'string') {
      continue;
    }
    if (!plannedPages.has(node.path)) {
      continue;
    }
    const pageState = typeof node.page_state === 'string' ? node.page_state : 'generated';
    if (pageState === 'generated' || pageState === 'mixed') {
      managed.add(node.path);
    }
  }
  if (managed.size === 0) {
    for (const pagePath of plannedPages) {
      managed.add(pagePath);
    }
  }
  return managed;
}

function extractGraphNodePath(value: unknown, kind: 'source' | 'page') {
  if (typeof value !== 'string' || !value.startsWith(`${kind}:`)) {
    return null;
  }
  const pathPart = value.slice(kind.length + 1);
  return pathPart || null;
}

function extractChangedPaths(manifest: any): string[] {
  const candidates: unknown[] = [
    manifest?.changed_paths,
    manifest?.changed_files,
    manifest?.analysis?.changed_paths,
    manifest?.analysis?.changed_files,
    manifest?.incremental?.changed_paths,
    manifest?.incremental?.changed_files
  ];

  const changed = new Set<string>();
  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) {
      continue;
    }
    for (const item of candidate) {
      if (typeof item === 'string' && item.length > 0) {
        changed.add(item);
      }
    }
  }
  return [...changed].sort((a, b) => a.localeCompare(b));
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(error) && typeof error === 'object' && 'code' in error;
}

function groupIntoModules(files) {
  const groups = new Map();

  for (const file of files) {
    if (file.skipped_content && file.bytes > 1_000_000) {
      continue;
    }

    const groupName = inferGroupName(file.path);
    const existing = groups.get(groupName) || {
      name: groupName,
      slug: slugify(groupName),
      files: [],
      categories: {},
      languages: {},
      runtime_hints: {},
      important_reasons: new Set()
    };

    existing.files.push(file.path);
    existing.categories[file.category] = (existing.categories[file.category] || 0) + 1;
    existing.languages[file.language] = (existing.languages[file.language] || 0) + 1;

    for (const hint of file.runtime_hints || []) {
      existing.runtime_hints[hint] = (existing.runtime_hints[hint] || 0) + 1;
    }

    for (const reason of file.reasons || []) {
      existing.important_reasons.add(reason);
    }

    groups.set(groupName, existing);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      important_reasons: [...group.important_reasons].sort(),
      files: group.files.sort()
    }))
    .sort((a, b) => b.files.length - a.files.length || a.name.localeCompare(b.name));
}

function inferGroupName(filePath) {
  const parts = filePath.split('/');

  if (parts[0] === 'apps' && parts[1]) return `Service ${parts[1]}`;
  if (parts[0] === 'services' && parts[1]) return `Service ${parts[1]}`;
  if (parts[0] === 'packages' && parts[1]) return `Package ${parts[1]}`;
  if (parts[0] === 'src' && parts[1]) return `Module ${parts[1]}`;
  if (parts[0] === 'lib' && parts[1]) return `Module ${parts[1]}`;
  if (parts[0] === 'infra') return 'Infrastructure';
  if (parts[0] === 'docs') return 'Documentation';
  if (parts[0] === '.github') return 'CI and Automation';

  return 'Repository Root';
}

function createPagePlan(manifest, modules) {
  const foundation = [
    page('Home.md', 'foundation', 'Human and agent entry point.'),
    page('_Sidebar.md', 'foundation', 'GitHub Wiki navigation sidebar.'),
    page('Index.md', 'foundation', 'Full page index and routing map.'),
    page('Log.md', 'foundation', 'Chronological compilation log.'),
    page('Agent-Context-Pack.md', 'foundation', 'Small, high-signal entry page for coding agents.'),
    page('Repository-Overview.md', 'foundation', 'Repository purpose, languages, and structure.'),
    page('Architecture.md', 'foundation', 'Architecture summary inferred from source layout.'),
    page('Build-Test-and-Run.md', 'foundation', 'Detected build, test, and run commands.'),
    page('Open-Questions.md', 'foundation', 'Known gaps and uncertain inferences.'),
    page('Documentation-Debt-Report.md', 'foundation', 'Markdown documentation validation, staleness, and claim-confidence report.')
  ];

  const modulePages = modules
    .filter((module) => module.files.length >= 1)
    .slice(0, 50)
    .map((module) => page(`${module.slug}.md`, 'modules', `Compiled page for ${module.name}.`, module.name));

  const crossCutting = [
    page('Dependency-Map.md', 'cross-cutting', 'Internal and external dependency overview.'),
    page('Testing-Strategy.md', 'cross-cutting', 'Detected tests and verification strategy.'),
    page('Configuration-and-Environment.md', 'cross-cutting', 'Environment variables and configuration surfaces.'),
    page('Security-and-Secrets.md', 'cross-cutting', 'Security-sensitive areas and secret-handling policy.'),
    page('Operational-Runbook.md', 'cross-cutting', 'Operational commands, deployment, and troubleshooting notes.')
  ];

  if (manifest.totals.runtime_hints?.['http-route']) {
    crossCutting.push(page('API-HTTP-Routes.md', 'cross-cutting', 'Detected HTTP routing surfaces.'));
  }

  if (hasDataModelSignals(manifest)) {
    crossCutting.push(page('Data-Model-and-Migrations.md', 'cross-cutting', 'Data models, migrations, and schema-related files.'));
  }

  return [...foundation, ...modulePages, ...crossCutting];
}

function page(path, phase, purpose, moduleName = null) {
  return { path, phase, purpose, moduleName };
}

function slugify(value: string): string {
  return value
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'Page';
}

function buildAffectedPageGraph(manifest: any, modules: any[], pages: any[]) {
  // Index: source file path → module wiki page filename
  const fileToModuleSlug = new Map<string, string>();
  for (const module of modules) {
    const slugPage = `${module.slug}.md`;
    for (const file of module.files) {
      fileToModuleSlug.set(file, slugPage);
    }
  }

  // Reverse import graph: imported file → Set of importer file paths
  const reverseImports = new Map<string, Set<string>>();
  for (const edge of manifest.analysis?.dependency_graph?.edges || []) {
    if (typeof edge.to === 'string' && !edge.to.startsWith('package:')) {
      if (!reverseImports.has(edge.to)) {
        reverseImports.set(edge.to, new Set());
      }
      reverseImports.get(edge.to)!.add(edge.from);
    }
  }

  // Index: test file path → Set of covered source file paths
  const testToCoveredSources = new Map<string, Set<string>>();
  for (const mapping of manifest.analysis?.test_to_source?.mappings || []) {
    if (mapping.test && Array.isArray(mapping.sources)) {
      testToCoveredSources.set(mapping.test, new Set(mapping.sources));
    }
  }

  // Set of wiki pages that are actually planned
  const plannedPages = new Set(pages.map((p) => p.path));

  // Internal structure: source → page → Set<reason>
  const entries = new Map<string, Map<string, Set<string>>>();

  function addPage(source: string, wikiPage: string, reason: string) {
    if (!plannedPages.has(wikiPage)) {
      return;
    }
    let pageMap = entries.get(source);
    if (!pageMap) {
      pageMap = new Map();
      entries.set(source, pageMap);
    }
    let reasons = pageMap.get(wikiPage);
    if (!reasons) {
      reasons = new Set();
      pageMap.set(wikiPage, reasons);
    }
    reasons.add(reason);
  }

  for (const card of manifest.files || []) {
    const source: string = card.path;

    // Direct module page
    const directSlug = fileToModuleSlug.get(source);
    if (directSlug) {
      addPage(source, directSlug, 'direct_module');
    }

    // Transitive module pages: pages of modules that import this file
    for (const importer of reverseImports.get(source) || []) {
      const importerSlug = fileToModuleSlug.get(importer);
      if (importerSlug && importerSlug !== directSlug) {
        addPage(source, importerSlug, 'import_transitive');
      }
    }

    // Test files → Testing-Strategy.md and covered source module pages
    if (card.category === 'test') {
      addPage(source, 'Testing-Strategy.md', 'test_coverage');

      for (const coveredSource of testToCoveredSources.get(source) ?? new Set<string>()) {
        const coveredSlug = fileToModuleSlug.get(coveredSource);
        if (coveredSlug) {
          addPage(source, coveredSlug, 'test_covered_module');
        }
      }
    }

    // Files participating in the dependency graph → Dependency-Map.md
    if ((card.imports?.length ?? 0) > 0 || reverseImports.has(source)) {
      addPage(source, 'Dependency-Map.md', 'dependency_change');
    }

    // Route surfaces → API-HTTP-Routes.md
    if ((card.route_surfaces?.length ?? 0) > 0) {
      addPage(source, 'API-HTTP-Routes.md', 'cross_cutting_routes');
    }

    // Migration or ORM model surfaces → Data-Model-and-Migrations.md
    if ((card.migration_surfaces?.length ?? 0) > 0 || (card.model_surfaces?.length ?? 0) > 0) {
      addPage(source, 'Data-Model-and-Migrations.md', 'cross_cutting_data_model');
    }

    // Environment variables → Configuration-and-Environment.md
    if ((card.environment_variables?.length ?? 0) > 0) {
      addPage(source, 'Configuration-and-Environment.md', 'cross_cutting_config');
    }

    // Auth or billing signals → Security-and-Secrets.md
    if (card.reasons?.some((r: string) => ['auth', 'billing-or-payment'].includes(r))) {
      addPage(source, 'Security-and-Secrets.md', 'cross_cutting_security');
    }

    // Architecture-relevant signals → Architecture.md
    // Module membership: file belongs to a tracked module (affects module list / structural map)
    if (directSlug) {
      addPage(source, 'Architecture.md', 'module_membership');
    }
    // Cross-module dependency: this file is imported by a file in a different module
    for (const importer of reverseImports.get(source) || []) {
      const importerSlug = fileToModuleSlug.get(importer);
      if (importerSlug && importerSlug !== directSlug) {
        addPage(source, 'Architecture.md', 'cross_module_dependency');
        break; // One cross-module importer is sufficient to mark Architecture.md affected
      }
    }
    // Route surfaces affect architecture-level API claims
    if ((card.route_surfaces?.length ?? 0) > 0) {
      addPage(source, 'Architecture.md', 'cross_cutting_routes');
    }
    // Data model / migration surfaces affect architecture-level data claims
    if ((card.migration_surfaces?.length ?? 0) > 0 || (card.model_surfaces?.length ?? 0) > 0) {
      addPage(source, 'Architecture.md', 'cross_cutting_data_model');
    }
    // Environment variables / config surfaces affect architecture-level config claims
    if ((card.environment_variables?.length ?? 0) > 0) {
      addPage(source, 'Architecture.md', 'cross_cutting_config');
    }
    // Auth / billing signals affect architecture-level security claims
    if (card.reasons?.some((r: string) => ['auth', 'billing-or-payment'].includes(r))) {
      addPage(source, 'Architecture.md', 'cross_cutting_security');
    }
  }

  // Documentation cards → Documentation-Debt-Report.md (plus their direct module page if any)
  for (const docCard of manifest.documentation?.files || []) {
    const source: string = docCard.path;
    addPage(source, 'Documentation-Debt-Report.md', 'docs_debt');
    const directSlug = fileToModuleSlug.get(source);
    if (directSlug) {
      addPage(source, directSlug, 'direct_module');
    }
  }

  const sourceToPagesArray = [...entries.entries()]
    .filter(([, pageMap]) => pageMap.size > 0)
    .map(([source, pageMap]) => ({
      source,
      pages: [...pageMap.entries()]
        .map(([page, reasons]) => ({ page, reasons: [...reasons].sort() }))
        .sort((a, b) => a.page.localeCompare(b.page))
    }))
    .sort((a, b) => a.source.localeCompare(b.source));

  return {
    source_to_pages: sourceToPagesArray,
    summary: {
      mapped_sources: sourceToPagesArray.length,
      total_page_references: sourceToPagesArray.reduce((sum, entry) => sum + entry.pages.length, 0)
    }
  };
}
