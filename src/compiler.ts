import path from 'node:path';
import { promises as fs } from 'node:fs';
import { createHash } from 'node:crypto';
import { hasDataModelSignals } from './data-model-signals.js';
import { assembleAllPageContexts, assemblePageContext } from './context-assembler.js';
import { ensureDir, readJson, writeText } from './utils/fs.js';
import { buildRouteSurfaceIndex, collectKnownEnvironmentVariables, collectManifestDirectories, dedupeRouteValidationFindings, normalizeRepoPath, resolveDocumentedPathFromManifest, validateRouteClaims } from './docs-validation.js';
import { classifyDocumentedCommands, extractRouteClaims, mergePackageScripts } from './docs-ingestor.js';
import { detectPageState, extractHumanNotes, preserveHumanNotes } from './page-ownership.js';
import { buildRequest, createProvider, createProviderFromResolvedConfig, LLMProviderError, resolveArchitectureOverrides, resolveProviderConfig } from './llm-provider.js';
import type { LLMProvider } from './llm-provider.js';
import { synthesizeWikiPage, WikiPatchError } from './wiki-patch.js';

export async function compileWiki({
  scanDir,
  planFile,
  wikiDir,
  config = null,
  _provider = null
}: {
  scanDir: string;
  planFile: string;
  wikiDir: string;
  /** Full config object (e.g. from loadConfig). Selects compiler.mode and LLM settings. */
  config?: any | null;
  /** Override the LLM provider (for testing). Only used when compiler.mode=llm. */
  _provider?: LLMProvider | null;
}) {
  const manifest = await readJson(path.join(scanDir, 'manifest.json'));
  const plan = await readJson(planFile);
  const pageContexts = assembleAllPageContexts({ manifest, plan });
  await ensureDir(wikiDir);

  const KNOWN_MODES = ['deterministic', 'llm'];
  const rawMode = resolveCompilerMode(config?.compiler);
  const compilerMode: string = KNOWN_MODES.includes(rawMode) ? rawMode : 'deterministic';
  if (!KNOWN_MODES.includes(rawMode)) {
    console.warn(`compileWiki: unknown compiler.mode "${rawMode}"; falling back to "deterministic".`);
  }
  const isLLMMode = compilerMode === 'llm';
  const llmCfg = config?.compiler ?? {};
  const resolvedLLMCfg = isLLMMode ? resolveProviderConfig(llmCfg) : null;
  const validationRetries = resolvedLLMCfg?.validationRetries ?? 0;
  const llmErrors: Array<{ file: string; error: string; issues?: any[] }> = [];

  const pages = new Map<string, string>();

  pages.set('Home.md', renderHome(manifest, plan));
  pages.set('_Sidebar.md', renderSidebar(manifest, plan));
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

  // Track which module pages are owned by the LLM synthesis path (success or failure).
  // These are excluded from the deterministic fallback below.
  const llmHandledModules = new Set<string>();
  // Track successfully LLM-synthesized module pages for summary reporting.
  const llmGeneratedPages = new Set<string>();
  let skipped = 0;
  const skippedByState: Record<string, number> = {};
  // Architecture.md handling decision for this compile run (reported in summary).
  let archDecision: ArchDecision | null = null;

  if (isLLMMode) {
    // In LLM mode, synthesize module pages through the provider boundary.
    // Foundation and cross-cutting pages continue to use deterministic renderers
    // (phased archetype rollout – module pages first).
    const llmCandidates: Array<{ module: any; modulePage: string; existingForPrompt?: string }> = [];

    for (const module of plan.modules || []) {
      const modulePage = `${module.slug}.md`;
      llmHandledModules.add(modulePage);

      const filePath = path.join(wikiDir, modulePage);
      let existingForPrompt: string | undefined;
      try {
        existingForPrompt = await fs.readFile(filePath, 'utf8');
      } catch (error) {
        if (!isNodeError(error) || error.code !== 'ENOENT') {
          throw error;
        }
      }

      if (existingForPrompt !== undefined) {
        const state = detectPageState(existingForPrompt);
        if (state === 'human-owned' || state === 'unmanaged') {
          skipped++;
          skippedByState[state] = (skippedByState[state] || 0) + 1;
          continue;
        }
      }

      llmCandidates.push({ module, modulePage, existingForPrompt });
    }

    const llmProvider: LLMProvider | null = llmCandidates.length > 0 ? (_provider ?? createProvider(resolvedLLMCfg!)) : null;

    for (const { module, modulePage, existingForPrompt } of llmCandidates) {
      // Assemble the page context using the standard context assembler.
      const syntheticPage = { path: modulePage, phase: 'modules', moduleName: module.name };
      const pageCtx = assemblePageContext({ manifest, plan, page: syntheticPage });
      const promptCtx = buildModulePromptContext(pageCtx, manifest, module, existingForPrompt);

      // Build LLM request from the assembled context and provider settings.
      const request = buildRequest('module', promptCtx, {
        maxOutputTokens: resolvedLLMCfg!.maxOutputTokens,
        systemPrompt: resolvedLLMCfg!.systemPrompt,
        temperature: resolvedLLMCfg!.temperature,
        reasoningEffort: resolvedLLMCfg!.reasoningEffort,
      });

      // Synthesize with validation. On success, add to the pages Map so the
      // shared write loop handles human-notes preservation and page-state checks.
      // On failure, record the error. LLM mode fails fast before the write loop
      // below, so invalid LLM output cannot trigger partial wiki writes.
      try {
        const patch = await synthesizeWikiPage(llmProvider!, request, { maxRetries: validationRetries });
        const normalized = normalizeLLMGeneratedContent(patch.content, manifest, module);
        pages.set(modulePage, normalized);
        llmGeneratedPages.add(modulePage);
      } catch (err) {
        if (err instanceof WikiPatchError) {
          llmErrors.push({ file: modulePage, error: err.message, issues: err.issues });
        } else if (err instanceof LLMProviderError) {
          llmErrors.push({ file: modulePage, error: err.message });
        } else {
          throw err;
        }
        // Page NOT added to the Map. If any LLM page fails, compilation throws
        // before writing any page, leaving the existing wiki intact.
      }
    }
  }

  if (isLLMMode) {
    // Synthesize Architecture.md through the LLM provider boundary.
    // The deterministic renderArchitecture() output already in the pages map
    // is replaced on success; on failure the error is recorded and compilation
    // throws before any page is written, leaving the existing wiki intact.
    const archOverrides = resolveArchitectureOverrides(llmCfg);

    const archFilePath = path.join(wikiDir, 'Architecture.md');
    let existingArchContent: string | undefined;
    try {
      existingArchContent = await fs.readFile(archFilePath, 'utf8');
    } catch (error) {
      if (!isNodeError(error) || error.code !== 'ENOENT') {
        throw error;
      }
    }

    const archPageState = existingArchContent !== undefined ? detectPageState(existingArchContent) : null;
    if (archPageState === 'human-owned' || archPageState === 'unmanaged') {
      // Remove from the pages map so the write loop does not process this page
      // at all (consistent with how LLM-handled module pages work). The existing
      // file is left intact; the write loop never sees it.
      pages.delete('Architecture.md');
      archDecision = 'skipped';
      skipped++;
      skippedByState[archPageState] = (skippedByState[archPageState] || 0) + 1;
    } else {
      // Gate the LLM architecture call using a fingerprint of the normalized
      // architecture-input payload. If the fingerprint matches the one stored in
      // the existing Architecture.md, the architecture inputs have not changed and
      // we can skip the LLM call entirely (byte-stable, zero model cost).
      const currentFingerprint = computeArchInputsFingerprint(manifest, plan);
      const storedFingerprint = existingArchContent ? extractArchFingerprint(existingArchContent) : null;

      const existingSourceCommit = existingArchContent ? extractFrontmatterString(existingArchContent, 'source_commit') : null;

      if (storedFingerprint !== null && storedFingerprint === currentFingerprint && existingSourceCommit === manifest.commit) {
        // Architecture inputs unchanged – skip LLM call, keep existing file byte-stable.
        pages.delete('Architecture.md');
        archDecision = 'skipped';
      } else {
        // Resolve the architecture provider. If the architecture model override
        // specifies a different model from the global resolved config, create a
        // dedicated provider for the architecture page.
        let archProvider: LLMProvider;
        if (_provider !== null) {
          archProvider = _provider;
        } else {
          archProvider = createProviderFromResolvedConfig({
            ...resolvedLLMCfg!,
            model: archOverrides.model ?? resolvedLLMCfg!.model,
            timeoutMs: archOverrides.timeoutMs ?? resolvedLLMCfg!.timeoutMs,
          });
        }

        const syntheticArchPage = { path: 'Architecture.md', phase: 'foundation' };
        const archPageCtx = assemblePageContext({ manifest, plan, page: syntheticArchPage });
        const archPromptCtx = buildArchitecturePromptContext(archPageCtx, manifest, existingArchContent);

        const archRequest = buildRequest('architecture', archPromptCtx, {
          maxOutputTokens: archOverrides.maxOutputTokens ?? resolvedLLMCfg!.maxOutputTokens,
          temperature: resolvedLLMCfg!.temperature,
          reasoningEffort: archOverrides.reasoningEffort ?? resolvedLLMCfg!.reasoningEffort,
        });

        try {
          const patch = await synthesizeWikiPage(archProvider, archRequest, { maxRetries: validationRetries });
          const normalized = normalizeLLMArchitectureContent(patch.content, manifest, archRequest.sourcePaths, currentFingerprint);
          pages.set('Architecture.md', normalized);
          llmGeneratedPages.add('Architecture.md');
          archDecision = 'full-regenerated';
        } catch (err) {
          if (err instanceof WikiPatchError) {
            llmErrors.push({ file: 'Architecture.md', error: err.message, issues: err.issues });
          } else if (err instanceof LLMProviderError) {
            llmErrors.push({ file: 'Architecture.md', error: err.message });
          } else {
            throw err;
          }
        }
      }
    }
  }

  // Deterministic module pages for modules not handled (or not eligible) for LLM synthesis.
  for (const module of plan.modules || []) {
    const modulePage = `${module.slug}.md`;
    if (!llmHandledModules.has(modulePage) && !pages.has(modulePage)) {
      pages.set(modulePage, renderModulePage(manifest, module, sourceToTestsIndex));
    }
  }

  if (llmErrors.length > 0) {
    throw new Error(`LLM compilation failed for ${llmErrors.length} page(s): ${llmErrors.map(formatLLMError).join('; ')}`);
  }

  for (const [file, initialContent] of pages) {
    let newContent = initialContent;
    const filePath = path.join(wikiDir, file);
    let existingContent: string | null = null;

    try {
      existingContent = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      if (!isNodeError(error) || error.code !== 'ENOENT') {
        throw error;
      }
      // File does not exist yet – this is a fresh page.
    }

    if (existingContent !== null) {
      const state = detectPageState(existingContent);

      // Human-owned and unmanaged pages are never overwritten implicitly.
      // Adoption of pre-existing hand-written pages must be explicit.
      if (state === 'human-owned' || state === 'unmanaged') {
        if (file === 'Architecture.md') {
          archDecision = 'skipped';
        }
        skipped++;
        skippedByState[state] = (skippedByState[state] || 0) + 1;
        continue;
      }

      // Architecture.md byte-stable skip (deterministic mode only).
      // In LLM mode, the decision was already made before the LLM call.
      if (file === 'Architecture.md' && !isLLMMode) {
        const decision = computeArchDecision(newContent, existingContent);
        archDecision = decision;
        if (decision === 'skipped') {
          continue; // Preserve existing file byte-for-byte.
        }
        if (decision === 'section-patched') {
          const patched = patchArchitectureSections(existingContent, newContent);
          if (patched && architectureUntouchedContent(patched) === architectureUntouchedContent(newContent)) {
            newContent = patched;
          } else {
            archDecision = 'full-regenerated';
          }
        }
      }

      // Preserve any human notes that exist in the current page.
      const notes = extractHumanNotes(existingContent);
      if (notes.length > 0) {
        let withNotes = preserveHumanNotes(newContent, notes);
        if (notes.trim().length > 0) {
          // Update page_state to "mixed" since human notes are present.
          // If the content already has page_state: "generated", replace it.
          // If it has no page_state field at all (e.g. LLM output), inject it.
          withNotes = setPageStateMixed(withNotes);
        }
        await writeText(filePath, withNotes);
        continue;
      }
    }

    await writeText(filePath, newContent);
    // Track first write of Architecture.md (no existing file).
    if (file === 'Architecture.md' && archDecision === null) {
      archDecision = 'full-regenerated';
    }
  }

  return {
    contexts: pageContexts,
    summary: {
      wikiDir,
      compiler_mode: compilerMode,
      pages: pages.size,
      deterministic_pages: pages.size - llmGeneratedPages.size,
      llm_pages: llmGeneratedPages.size,
      skipped,
      skipped_by_state: skippedByState,
      commit: manifest.commit,
      contexts: pageContexts.length,
      architecture_decision: archDecision ?? 'full-regenerated'
    }
  };
}

/**
 * Build a PromptContext for a module page from an assembled PageContext and plan module entry.
 * Maps the context-assembler output format to the prompt-template input format.
 */
function buildModulePromptContext(
  pageCtx: ReturnType<typeof assemblePageContext>,
  manifest: any,
  module: any,
  existingContent?: string,
) {
  return {
    pageName: String(pageCtx.page.path).replace(/\.md$/, ''),
    pageTitle: module.name,
    repoRemote: manifest.remote,
    repoCommit: manifest.commit,
    sourceCards: (pageCtx.source_inputs as any[]).map((si) => ({
      path: si.path,
      category: si.category,
      language: si.language,
      symbols: si.symbols,
      imports: si.imports,
      reasons: si.reasons,
      runtime_hints: si.runtime_hints,
      environment_variables: si.environment_variables,
      routes: si.routes,
      migrations: si.migrations,
      models: si.models,
      excerpt: si.excerpt,
    })),
    docCards: (pageCtx.documentation_inputs as any[]).map((di) => ({
      path: di.path,
      status: di.status,
      claims: di.claims,
      excerpt: di.excerpt,
    })),
    existingContent,
    docsOnlyModule: isDocsOnlyModule(module),
    moduleInfo: {
      name: module.name,
      slug: module.slug,
      files: module.files,
      categories: module.categories,
      languages: module.languages,
      important_reasons: module.important_reasons,
    },
  };
}

/**
 * Build a PromptContext for the Architecture page from an assembled PageContext.
 * Maps the context-assembler output format to the prompt-template input format.
 */
function buildArchitecturePromptContext(
  pageCtx: ReturnType<typeof assemblePageContext>,
  manifest: any,
  existingContent?: string,
) {
  return {
    pageName: 'Architecture',
    pageTitle: 'Architecture',
    repoRemote: manifest.remote,
    repoCommit: manifest.commit,
    sourceCards: (pageCtx.source_inputs as any[]).map((si) => ({
      path: si.path,
      category: si.category,
      language: si.language,
      symbols: si.symbols,
      imports: si.imports,
      reasons: si.reasons,
      runtime_hints: si.runtime_hints,
      environment_variables: si.environment_variables,
      routes: si.routes,
      migrations: si.migrations,
      models: si.models,
      excerpt: si.excerpt,
    })),
    docCards: (pageCtx.documentation_inputs as any[]).map((di) => ({
      path: di.path,
      status: di.status,
      claims: di.claims,
      excerpt: di.excerpt,
    })),
    existingContent,
  };
}

/**
 * Normalize LLM-generated Architecture page content by enforcing canonical
 * provenance frontmatter fields (source_repo, source_commit, page_state,
 * source_paths) using the prompt context source paths that were actually
 * provided to the model.
 */
function normalizeLLMArchitectureContent(content: string, manifest: any, requestSourcePaths: string[] = [], archFingerprint?: string): string {
  if (!content.startsWith('---\n')) {
    return content;
  }

  const closing = content.indexOf('\n---', 4);
  if (closing === -1) {
    return content;
  }

  const frontmatterRaw = content.slice(4, closing);
  const body = content.slice(closing);
  const sourcePaths = uniqueSorted((requestSourcePaths || []).filter((value) => typeof value === 'string' && value.trim())).slice(0, 20);
  const lines = removeNormalizedFrontmatterFields(frontmatterRaw.split('\n'), /* removeConservativeEvidenceFields= */ false);
  const withoutNormalized = lines.filter((line) => line.trim().length > 0);
  const normalizedLines = [
    `source_repo: ${JSON.stringify(manifest.remote)}`,
    `source_commit: ${JSON.stringify(manifest.commit)}`,
    'page_state: "generated"',
    `source_paths: ${JSON.stringify(sourcePaths)}`,
    ...(archFingerprint ? [`${ARCH_FINGERPRINT_FIELD}: "${archFingerprint}"`] : []),
    ...withoutNormalized
  ];

  return `---\n${normalizedLines.join('\n')}${body}`;
}

// ---------------------------------------------------------------------------
// Architecture page decision helpers
// ---------------------------------------------------------------------------

/**
 * The status vocabulary for Architecture.md handling in a compile run.
 * - 'skipped': content is effectively unchanged; existing file preserved byte-for-byte.
 * - 'section-patched': only module group sections changed within the same module list.
 * - 'full-regenerated': module list or broader structure changed; full content written.
 */
export type ArchDecision = 'skipped' | 'section-patched' | 'full-regenerated';

/**
 * Frontmatter field used to store the architecture inputs fingerprint for LLM gating.
 * The value is a 16-hex-char SHA-256 prefix of the normalized architecture-input payload.
 */
const ARCH_FINGERPRINT_FIELD = 'arch_inputs_fingerprint';

/**
 * Normalize volatile fields in Architecture.md content for structural comparison.
 * Strips compiled_at timestamp and the short commit hash from the mermaid structural map.
 */
function normalizeArchForComparison(content: string): string {
  return content
    .replace(/^(compiled_at: )"[^"]*"$/m, '$1""')
    .replace(/^page_state: "[^"]*"$/m, 'page_state: "generated"')
    .replace(/<!-- HUMAN_NOTES_START -->[\s\S]*?<!-- HUMAN_NOTES_END -->/g, '<!-- HUMAN_NOTES_START -->\n<!-- HUMAN_NOTES_END -->')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\bRepository at [^\]]+\]/g, 'Repository at ]');
}

/**
 * Extract the ordered list of module names from the `## Module groups` section.
 * HUMAN_NOTES content is ignored so user-authored `###` headings do not affect
 * architecture change detection.
 */
function extractArchitectureModuleNames(content: string): string[] {
  const names: string[] = [];
  const normalizedBody = splitFrontmatterAndBody(content).body
    .replace(/<!-- HUMAN_NOTES_START -->[\s\S]*?<!-- HUMAN_NOTES_END -->/g, '<!-- HUMAN_NOTES_START -->\n<!-- HUMAN_NOTES_END -->');
  const moduleGroups = extractSection(normalizedBody, 'Module groups') || normalizedBody;
  const re = /^### (.+)$/gm;
  let match;
  while ((match = re.exec(moduleGroups)) !== null) {
    names.push(match[1].trim());
  }
  return names;
}

/**
 * Compute the Architecture.md handling decision by comparing new vs existing content.
 *
 * Returns:
 * - 'skipped' if content is effectively unchanged after normalizing volatile fields.
 * - 'section-patched' if only module group sections changed within the same module list.
 * - 'full-regenerated' if the module list or broader structure changed.
 */
export function computeArchDecision(newContent: string, existingContent: string | null): ArchDecision {
  if (!existingContent) {
    return 'full-regenerated';
  }

  const normalizedNew = normalizeArchForComparison(newContent);
  const normalizedExisting = normalizeArchForComparison(existingContent);

  if (normalizedNew === normalizedExisting) {
    return 'skipped';
  }

  // Check if the module list is unchanged – prerequisite for safe section patching.
  const newModules = extractArchitectureModuleNames(newContent);
  const existingModules = extractArchitectureModuleNames(existingContent);
  const sameModuleList = (
    newModules.length > 0 &&
    newModules.length === existingModules.length &&
    newModules.every((name, i) => name === existingModules[i])
  );

  return sameModuleList ? 'section-patched' : 'full-regenerated';
}

function splitFrontmatterAndBody(content: string): { frontmatter: string; body: string } {
  if (!content.startsWith('---\n')) {
    return { frontmatter: '', body: content };
  }
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) {
    return { frontmatter: '', body: content };
  }
  return { frontmatter: content.slice(0, end + 5), body: content.slice(end + 5) };
}

function sectionBounds(body: string, heading: string): { start: number; end: number } | null {
  const marker = `## ${heading}\n`;
  const start = body.indexOf(marker);
  if (start === -1) {
    return null;
  }
  const next = body.indexOf('\n## ', start + marker.length);
  return { start, end: next === -1 ? body.length : next + 1 };
}

function extractSection(body: string, heading: string): string | null {
  const bounds = sectionBounds(body, heading);
  return bounds ? body.slice(bounds.start, bounds.end) : null;
}

function replaceSection(body: string, heading: string, replacement: string): string {
  const bounds = sectionBounds(body, heading);
  if (!bounds) {
    return body;
  }
  return `${body.slice(0, bounds.start)}${replacement.trimEnd()}\n\n${body.slice(bounds.end)}`;
}

function patchArchitectureSections(existingContent: string, newContent: string): string | null {
  const existingParts = splitFrontmatterAndBody(existingContent);
  const newParts = splitFrontmatterAndBody(newContent);
  const newStructuralMap = extractSection(newParts.body, 'Structural map');
  const newModuleGroups = extractSection(newParts.body, 'Module groups');
  const newSignals = extractSection(newParts.body, 'Architecture signals');
  if (!newStructuralMap || !newModuleGroups || !newSignals) {
    return null;
  }
  let patchedBody = existingParts.body;
  if (!extractSection(patchedBody, 'Structural map') || !extractSection(patchedBody, 'Module groups') || !extractSection(patchedBody, 'Architecture signals')) {
    return null;
  }
  patchedBody = replaceSection(patchedBody, 'Structural map', newStructuralMap);
  patchedBody = replaceSection(patchedBody, 'Module groups', newModuleGroups);
  patchedBody = replaceSection(patchedBody, 'Architecture signals', newSignals);
  return `${newParts.frontmatter}${patchedBody}`;
}

function architectureUntouchedContent(content: string): string {
  let normalized = normalizeArchForComparison(content);
  const { frontmatter, body } = splitFrontmatterAndBody(normalized);
  let remainder = body;
  for (const heading of ['Structural map', 'Module groups', 'Architecture signals']) {
    const section = extractSection(remainder, heading);
    if (section) {
      remainder = remainder.replace(section, '');
    }
  }
  return `${frontmatter}${remainder}`.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Compute a short fingerprint of architecture inputs for LLM mode gating.
 * The fingerprint is derived from a normalized architecture-input payload built from the
 * current manifest/plan slices that influence architecture synthesis.
 */
function computeArchInputsFingerprint(manifest: any, plan: any): string {
  const modules = (plan?.modules || []).map((module: any) => ({
    name: module.name,
    slug: module.slug,
    files: [...(module.files || [])].sort(),
    important_reasons: [...(module.important_reasons || [])].sort()
  }));

  const dependencyEdges = (manifest?.analysis?.dependency_graph?.edges || [])
    .filter((edge: any) => typeof edge?.from === 'string' && typeof edge?.to === 'string')
    .map((edge: any) => ({ from: edge.from, to: edge.to, specifier: edge.specifier || null }))
    .sort((a: any, b: any) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

  const routeSignals = (manifest?.files || [])
    .flatMap((file: any) => (file.route_surfaces || []).map((route: any) => ({
      path: file.path,
      framework: route.framework || null,
      methods: [...(route.methods || [])].sort(),
      route_path: route.path || null,
      handler: route.handler || null
    })))
    .sort((a: any, b: any) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

  const envSignals = (manifest?.files || [])
    .filter((file: any) => (file.environment_variables || []).length > 0)
    .map((file: any) => ({ path: file.path, env: [...(file.environment_variables || [])].sort() }))
    .sort((a: any, b: any) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

  const dataSignals = (manifest?.files || [])
    .filter((file: any) => (file.migration_surfaces || []).length > 0 || (file.model_surfaces || []).length > 0)
    .map((file: any) => ({
      path: file.path,
      migrations: (file.migration_surfaces || []).map((entry: any) => ({ kind: entry.kind || null, id: entry.id || null, name: entry.name || null })),
      models: (file.model_surfaces || []).map((entry: any) => ({ name: entry.name || null, kind: entry.kind || null, framework: entry.framework || null }))
    }))
    .sort((a: any, b: any) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

  const securitySignals = (manifest?.files || [])
    .filter((file: any) => (file.reasons || []).some((reason: string) => ['auth', 'billing-or-payment'].includes(reason)))
    .map((file: any) => ({ path: file.path, reasons: [...(file.reasons || [])].sort() }))
    .sort((a: any, b: any) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

  const infrastructureSignals = (manifest?.files || [])
    .filter((file: any) => file.category === 'infra' || (file.runtime_hints || []).includes('deployment'))
    .map((file: any) => ({ path: file.path, category: file.category || null, runtime_hints: [...(file.runtime_hints || [])].sort() }))
    .sort((a: any, b: any) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

  const payload = { modules, dependencyEdges, routeSignals, envSignals, dataSignals, securitySignals, infrastructureSignals };
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 16);
}

/**
 * Extract the stored arch_inputs_fingerprint from an Architecture.md frontmatter.
 * Returns null when the field is absent (e.g. first run or deterministic render).
 */
function extractArchFingerprint(content: string): string | null {
  const match = new RegExp(`^${ARCH_FINGERPRINT_FIELD}: "([^"]+)"$`, 'm').exec(content);
  return match ? match[1] : null;
}

function extractFrontmatterString(content: string, key: string): string | null {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^${escaped}: \"([^\"]+)\"$`, 'm').exec(content);
  return match ? match[1] : null;
}

function isDocsOnlyModule(module: any) {
  const files = Array.isArray(module?.files) ? module.files : [];
  return files.length > 0 && files.every((entry) => isDocumentationPath(entry));
}

function formatLLMError(entry: { file: string; error: string; issues?: any[] }): string {
  const issueSummary = Array.isArray(entry.issues) && entry.issues.length > 0
    ? ` (${entry.issues.map((issue) => `${issue.code}: ${issue.message}`).join(', ')})`
    : '';
  return `${entry.file}: ${entry.error}${issueSummary}`;
}

function resolveCompilerMode(compilerConfig: any): string {
  const envMode = typeof process.env.LLMWIKI_COMPILER_MODE === 'string' && process.env.LLMWIKI_COMPILER_MODE.trim()
    ? process.env.LLMWIKI_COMPILER_MODE.trim()
    : undefined;
  if (envMode) {
    return envMode;
  }

  try {
    return resolveProviderConfig(compilerConfig ?? {}).mode || 'deterministic';
  } catch {
    return typeof compilerConfig?.mode === 'string' ? compilerConfig.mode : 'deterministic';
  }
}

function normalizeLLMGeneratedContent(content: string, manifest: any, module: any): string {
  if (!content.startsWith('---\n')) {
    return content;
  }

  const closing = content.indexOf('\n---', 4);
  if (closing === -1) {
    return content;
  }

  const frontmatterRaw = content.slice(4, closing);
  const sourcePaths = Array.isArray(module?.files) && module.files.length > 0 ? module.files.slice(0, 20) : collectPrimarySourcePaths(manifest).slice(0, 20);
  const docsOnlyModule = sourcePaths.length > 0 && sourcePaths.every((entry) => isDocumentationPath(entry));
  const body = normalizeLLMGeneratedBody(content.slice(closing), docsOnlyModule);
  const lines = removeNormalizedFrontmatterFields(frontmatterRaw.split('\n'), docsOnlyModule);
  const withoutNormalized = lines.filter((line) => line.trim().length > 0);
  const normalizedLines = [
    `source_repo: ${JSON.stringify(manifest.remote)}`,
    `source_commit: ${JSON.stringify(manifest.commit)}`,
    'page_state: "generated"',
    `source_paths: ${JSON.stringify(sourcePaths)}`,
    ...(docsOnlyModule ? ['claim_status: "review-needed"', 'confidence: "low"'] : []),
    ...withoutNormalized
  ];

  return `---\n${normalizedLines.join('\n')}${body}`;
}

function normalizeLLMGeneratedBody(body: string, docsOnlyModule: boolean): string {
  if (!docsOnlyModule || hasSecondaryDocumentationLabel(body)) {
    return body;
  }

  const evidenceNote = [
    '',
    '> Evidence note: This module page is generated from markdown documentation only. Markdown documentation is secondary evidence; operational and current-behavior claims must be validated against source code, tests, CI workflows, runtime configuration, or schemas before being treated as authoritative.',
    ''
  ].join('\n');

  const titleMatch = /^(\n---[^\n]*\n\s*# [^\n]+\n?)/.exec(body);
  if (titleMatch) {
    return `${titleMatch[1]}${evidenceNote}${body.slice(titleMatch[1].length)}`;
  }

  return `${body}${evidenceNote}`;
}

function hasSecondaryDocumentationLabel(content: string) {
  return /(secondary evidence|secondary documentation|unvalidated documentation|markdown documentation is ingested as secondary evidence)/i.test(content);
}

function removeNormalizedFrontmatterFields(lines: string[], removeConservativeEvidenceFields = false): string[] {
  const normalizedFields = new Set(['source_repo', 'source_commit', 'page_state', 'source_paths', ARCH_FINGERPRINT_FIELD]);
  if (removeConservativeEvidenceFields) {
    normalizedFields.add('claim_status');
    normalizedFields.add('confidence');
  }
  const result: string[] = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const match = /^([A-Za-z0-9_-]+):(?:\s|$)/.exec(line);
    if (match && normalizedFields.has(match[1])) {
      index++;
      while (index < lines.length && (/^\s+\S/.test(lines[index]) || lines[index].trim().length === 0)) {
        index++;
      }
      continue;
    }

    result.push(line);
    index++;
  }

  return result;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

/**
 * Update the page_state frontmatter field to "mixed".
 * - If `page_state: "generated"` is present, replaces it.
 * - If no `page_state:` field is present, injects one into the frontmatter block.
 * - If `page_state: "mixed"` or any other value is already present, leaves it unchanged.
 */
function setPageStateMixed(content: string): string {
  if (/^page_state: "generated"/m.test(content)) {
    return content.replace(/^page_state: "generated"/m, 'page_state: "mixed"');
  }
  if (/^page_state:/m.test(content)) {
    // Already set to something other than "generated"; leave it.
    return content;
  }
  // No page_state field – inject it as the first field in the frontmatter block.
  // The pattern anchors to the absolute start of the document to avoid matching
  // any `---\n` sequences that may appear in the content body.
  return content.replace(/^---\n/, '---\npage_state: "mixed"\n');
}

function frontmatter(manifest, extra: any = {}) {
  const kind = typeof extra.kind === 'string' ? extra.kind : undefined;
  const fields = {
    source_repo: manifest.remote,
    source_commit: manifest.commit,
    compiled_at: new Date().toISOString(),
    ...extra,
    confidence: extra.confidence || confidenceForKind(kind),
    page_state: 'generated'
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
  return `${frontmatter(manifest, { kind: 'home' })}# Repository Knowledge Base\n\n## Start here\n\n- ${wikiLink('Agent-Context-Pack.md')}\n- ${wikiLink('Repository-Overview.md')}\n- ${wikiLink('Architecture.md')}\n- ${wikiLink('Build-Test-and-Run.md')}\n- ${wikiLink('Index.md')}\n\n## Important rule\n\nSource code at the pinned commit is authoritative. Tests, CI, and generated schemas are high-authority evidence. Markdown documentation is ingested as configurable secondary evidence and must be validated before it changes generated claims.\n\n## Generated module pages\n\n${(plan.modules || []).slice(0, 20).map((module) => `- [${module.name}](${module.slug})`).join('\n') || '- No module pages generated.'}\n`;
}

function renderSidebar(manifest, plan) {
  const moduleLinks = (plan.modules || []).slice(0, 25).map((module) => `  - [${module.name}](${module.slug})`).join('\n');
  return `${frontmatter(manifest, { kind: 'sidebar' })}# Navigation\n\n- [Home](Home)\n- [Agent Context Pack](Agent-Context-Pack)\n- [Repository Overview](Repository-Overview)\n- [Architecture](Architecture)\n- [Build, Test, and Run](Build-Test-and-Run)\n- [Index](Index)\n- [Log](Log)\n\n## Modules\n\n${moduleLinks || '- No module pages generated.'}\n\n## Cross-cutting\n\n- [Dependency Map](Dependency-Map)\n- [Testing Strategy](Testing-Strategy)\n- [Configuration and Environment](Configuration-and-Environment)\n- [Security and Secrets](Security-and-Secrets)\n- [Operational Runbook](Operational-Runbook)\n- [Documentation Debt Report](Documentation-Debt-Report)
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
  const compiledAt = new Date().toISOString();
  return `${frontmatter(manifest, {
    kind: 'agent_context_pack',
    claim_status: 'grounded',
    source_paths: collectPrimarySourcePaths(manifest).slice(0, 50)
  })}# Agent Context Pack\n\nThis page is the compact entry point for coding agents and developers.\n\n## Repository snapshot\n\n- Source: \`${manifest.remote}\`\n- Commit: \`${manifest.commit}\`\n- Last compiled: \`${compiledAt}\`\n- Files scanned: ${manifest.files.length}\n\n## Read first\n\n1. ${wikiLink('Architecture.md')}\n2. ${wikiLink('Build-Test-and-Run.md')}\n3. ${wikiLink('Index.md')}\n4. Relevant module page from the routing table below\n\n## Task routing\n\n| Task | Read these pages first |\n|---|---|\n${topModules.map((module) => `| Work in ${module.name} | [${module.name}](${module.slug}), ${wikiLink('Testing-Strategy.md')}, ${wikiLink('Dependency-Map.md')} |`).join('\n') || '| General change | Architecture, Build Test and Run, Index |'}\n\n## Verification policy\n\nRun the repository's own test, lint, and type-check commands when available. If commands are not detected, inspect package manifests and CI workflows before changing behavior.\n\n## Confidence rule\n\nThe wiki is generated from source cards and documentation cards. Treat code, tests, CI, and config as authoritative when there is disagreement. Treat markdown documentation as useful but potentially stale unless marked validated.\n`;
}

function renderRepositoryOverview(manifest, plan) {
  return `${frontmatter(manifest, {
    kind: 'repository_overview',
    claim_status: 'grounded',
    source_paths: collectPrimarySourcePaths(manifest).slice(0, 50)
  })}# Repository Overview\n\n## Languages\n\n${tableFromObject(manifest.totals.languages, ['Language', 'Files'])}\n\n## File categories\n\n${tableFromObject(manifest.totals.categories, ['Category', 'Files'])}\n\n## Main knowledge units\n\n${(plan.modules || []).map((module) => `- [${module.name}](${module.slug}) - ${module.files.length} files`).join('\n')}\n`;
}

function renderArchitecture(manifest, plan) {
  const dependencySummary = manifest.analysis?.dependency_graph?.summary || {};
  const routeFiles = (manifest.files || []).filter((file) => (file.route_surfaces?.length ?? 0) > 0).length;
  const configFiles = (manifest.files || []).filter((file) => (file.environment_variables?.length ?? 0) > 0).length;
  const dataModelFiles = (manifest.files || []).filter((file) => (file.migration_surfaces?.length ?? 0) > 0 || (file.model_surfaces?.length ?? 0) > 0).length;
  const securityFiles = (manifest.files || []).filter((file) => (file.reasons || []).some((reason) => ['auth', 'billing-or-payment'].includes(reason))).length;
  const infrastructureFiles = (manifest.files || []).filter((file) => file.category === 'infra' || (file.runtime_hints || []).includes('deployment')).length;

  return `${frontmatter(manifest, {
    kind: 'architecture',
    claim_status: 'grounded',
    source_paths: collectPrimarySourcePaths(manifest).slice(0, 50)
  })}# Architecture

This page is a first-pass architecture summary based on repository structure. The production compiler should replace this with an LLM-reviewed synthesis that uses source cards and targeted code excerpts.

## Structural map

\`\`\`mermaid
flowchart TD
  Repo[Repository at ${shortCommit(manifest.commit)}]
${(plan.modules || []).slice(0, 12).map((module, index) => `  Repo --> M${index}[${escapeMermaid(module.name)}]`).join('\n')}
\`\`\`

## Module groups

${(plan.modules || []).map((module) => `### ${module.name}

- Files: ${module.files.length}
- Dominant categories: ${Object.keys(module.categories).join(', ') || 'unknown'}
- Dominant languages: ${Object.keys(module.languages).join(', ') || 'unknown'}
- Important reasons: ${module.important_reasons.join(', ') || 'none detected'}
`).join('\n')}

## Architecture signals

- Module groups: ${(plan.modules || []).length}
- Dependency edges: ${dependencySummary.edges ?? 0}
- Route-bearing files: ${routeFiles}
- Config-bearing files: ${configFiles}
- Data-model files: ${dataModelFiles}
- Security-sensitive files: ${securityFiles}
- Infrastructure files: ${infrastructureFiles}
`;
}

function renderBuildTestAndRun(manifest) {
  const packageFiles = manifest.files.filter((file) => file.path.endsWith('package.json'));
  const ciFiles = manifest.files.filter((file) => file.category === 'ci');
  const packageScripts = (manifest.analysis?.package_scripts || []).filter((entry) => Object.keys(entry.scripts || {}).length > 0);
  const scriptRows = packageScripts.flatMap((entry) => Object.entries(entry.scripts || {}).map(([name, command]) => [
    sourcePathLink(manifest, entry.path, findNamedSourceRange(entry.script_sources, name)),
    entry.name ? code(entry.name) : 'unknown',
    code(name),
    code(redactSensitiveText(String(command)))
  ]));
  const scriptsSection = scriptRows.length
    ? `## Package scripts\n\n- Package manifests with scripts: ${packageScripts.length}\n- Scripts detected: ${scriptRows.length}\n\n${markdownTable(['Manifest', 'Package', 'Script', 'Command'], scriptRows)}\n`
    : `## Package scripts\n\nNo package scripts were extracted from manifest analysis. Inspect package manifests, task runners, and CI workflows directly when confirming canonical commands.\n`;
  const ciCommandSources = manifest.analysis?.ci_workflow_command_sources || [];
  const ciCommandsSection = ciCommandSources.length
    ? `## CI workflow commands\n\n- Commands detected: ${ciCommandSources.length}\n\n${markdownTable(['Source', 'Command'], ciCommandSources.map((entry) => [sourcePathLink(manifest, entry.path, entry), code(redactSensitiveText(entry.command))]))}\n`
    : manifest.analysis?.ci_workflow_commands?.length
      ? `## CI workflow commands\n\n- Commands detected: ${manifest.analysis.ci_workflow_commands.length}\n\n${manifest.analysis.ci_workflow_commands.map((command) => `- ${code(redactSensitiveText(command))}`).join('\n')}\n`
      : `## CI workflow commands\n\nNo workflow commands were extracted from CI analysis.\n`;

  return `${frontmatter(manifest, {
    kind: 'build_test_run',
    claim_status: 'grounded',
    source_paths: uniqueSorted([...packageFiles.map((file) => file.path), ...ciFiles.map((file) => file.path)]).slice(0, 50)
  })}# Build, Test, and Run\n\n## Detected package manifests\n\n${packageFiles.map((file) => `- ${sourcePathLink(manifest, file.path)}`).join('\n') || '- No package manifests detected.'}\n\n## Detected CI files\n\n${ciFiles.map((file) => `- ${sourcePathLink(manifest, file.path)}`).join('\n') || '- No CI files detected.'}\n\n${scriptsSection}\n${ciCommandsSection}\n## Manual verification guidance\n\nTreat extracted scripts as a starting point. Verify the canonical build, test, and run paths against CI workflows, container entrypoints, and deployment configs when they exist.\n`;
}

function renderOpenQuestions(manifest, plan) {
  const docs = manifest.documentation?.files || [];
  const reviewQueue = buildDocumentationReviewQueue(docs);
  const reviewRows = reviewQueue.map((entry) => `- \`${entry.path}\` - ${entry.reasons.join(', ')}.`);
  return `${frontmatter(manifest, {
    kind: 'open_questions',
    claim_status: 'review-needed',
    confidence: 'low',
    source_paths: uniqueSorted(reviewQueue.map((entry) => entry.path)).slice(0, 50)
  })}# Open Questions\n\n- What pages should be human-owned versus generated?\n- Which source paths should be excluded from wiki compilation?\n- Which modules require deeper AST-level extraction?\n- Which package manager and CI commands should be treated as canonical?\n- How should large files and generated files be summarized?\n- What confidence threshold should block publishing?\n\n## Documentation review queue\n\nDocumentation cards listed below are secondary evidence and require review. Do not promote these items as authoritative wiki claims until validated against source, tests, CI, config, or generated schemas.\n\n${reviewRows.join('\n') || '- No stale, contradicted, or unvalidated documentation findings detected.'}\n\n## Bootstrap gaps\n\n- This first-pass compiler uses repository structure, not an LLM synthesis pass.\n- Existing human wiki reconciliation is not implemented yet.\n- GitHub Wiki publishing is a placeholder.\n`;
}

function renderDocumentationDebtReport(manifest) {
  const docs = manifest.documentation?.files || [];
  const summary = manifest.documentation?.summary || {};
  const rows = docs.slice(0, 100).map((doc) => `| \`${doc.path}\` | ${doc.status} | ${doc.authority} | ${doc.age_days} | ${doc.claims?.length || 0} | ${doc.validation?.commands?.length || 0} | ${doc.validation?.env_vars?.length || 0} |`);

  // Build merged package scripts from manifest analysis for command validation
  const allPackageScripts = mergePackageScripts(manifest);

  // Classify all documented commands against known package scripts and CI
  // workflow commands extracted into the scan manifest.
  const allDocCommands: string[] = docs.flatMap((doc) => doc.validation?.commands || []);
  const uniqueDocCommands = [...new Set(allDocCommands)];
  const ciCommands: string[] = manifest.analysis?.ci_workflow_commands || [];
  const makeTargets: string[] = manifest.analysis?.make_targets || [];
  const taskRunnerTargetSources: Array<{ target: string; runner: 'just' | 'taskfile' }> = manifest.analysis?.task_runner_target_sources || [];
  const taskRunnerTargetsByRunner = {
    just: [...new Set(taskRunnerTargetSources.filter((entry) => entry.runner === 'just').map((entry) => entry.target))],
    taskfile: [...new Set(taskRunnerTargetSources.filter((entry) => entry.runner === 'taskfile').map((entry) => entry.target))]
  };
  const classified = classifyDocumentedCommands(uniqueDocCommands, allPackageScripts, ciCommands, {
    makeTargets,
    taskRunnerTargetsByRunner
  });
  const validatedCmds = classified.filter((c) => c.status === 'validated');
  const missingCmds = classified.filter((c) => c.status === 'missing');
  const unvalidatedCmds = classified.filter((c) => c.status === 'unvalidated');
  const manifestFiles = new Set<string>((manifest.files || []).map((file) => normalizeRepoPath(file.path)));
  const manifestDirectories = collectManifestDirectories(manifestFiles);
  const filePathFindings = docs.flatMap((doc) => (doc.file_paths || []).map((reference) => {
    const resolved = resolveDocumentedPathFromManifest(reference.path, doc.path, manifestFiles, manifestDirectories, reference.source);
    return {
      doc: doc.path,
      line: reference.line,
      source: reference.source,
      reference_path: reference.path,
      resolved_path: resolved.path,
      valid: resolved.valid
    };
  }));
  const validFilePaths = filePathFindings.filter((finding) => finding.valid);
  const brokenFilePaths = filePathFindings.filter((finding) => !finding.valid);
  const knownEnvVars = collectKnownEnvironmentVariables(manifest);
  const envFindings = docs.flatMap((doc) => (doc.validation?.env_vars || []).map((name) => ({ doc: doc.path, name, valid: knownEnvVars.has(name) })));
  const validatedEnvVars = envFindings.filter((finding) => finding.valid);
  const unvalidatedEnvVars = envFindings.filter((finding) => !finding.valid);
  const routeIndex = buildRouteSurfaceIndex(manifest);
  const routeFindings = docs.flatMap((doc) => {
    const routeClaims = doc.validation?.route_claims || extractRouteClaims((doc.claims || []).map((claim) => claim.text || '').join('\n'));
    const findings = validateRouteClaims(routeClaims, routeIndex).map((finding) => ({ ...finding, doc: doc.path }));
    return dedupeRouteValidationFindings(findings, doc.path);
  });
  const validatedRouteClaims = routeFindings.filter((finding) => finding.valid);
  const unvalidatedRouteClaims = routeFindings.filter((finding) => !finding.valid);
  const staleFindings = docs.filter((doc) => doc.stale).map((doc) => `- \`${doc.path}\` - age ${doc.age_days} days, status ${doc.status}`);
  const contradictedFindings = docs.filter((doc) => doc.validation?.contradictions?.length).map((doc) => `- \`${doc.path}\` - ${doc.validation.contradictions.length} contradiction-review signals`);
  const adrDocs = docs.filter((doc) => doc.adr?.detected);
  const supersededAdrDocs = adrDocs.filter((doc) => doc.adr?.superseded);
  const oldUnknownAdrDocs = adrDocs.filter((doc) => doc.stale && !doc.adr?.has_status_metadata);
  const unvalidatedFindings = [
    ...docs.filter((doc) => doc.claims?.length && doc.status === 'unvalidated').map((doc) => `- \`${doc.path}\` - documentation claims have no validation signal.`),
    ...missingCmds.map((finding) => {
      if (finding.source === 'package_scripts') return `- \`${redactSensitiveText(finding.command)}\` - package script not found.`;
      if (finding.source === 'makefile') return `- \`${redactSensitiveText(finding.command)}\` - Makefile target not found.`;
      if (finding.source === 'task_runner') return `- \`${redactSensitiveText(finding.command)}\` - task-runner target not found.`;
      return `- \`${redactSensitiveText(finding.command)}\` - command reference not found.`;
    }),
    ...unvalidatedCmds.map((finding) => `- \`${redactSensitiveText(finding.command)}\` - command source unknown.`),
    ...unvalidatedEnvVars.map((finding) => `- \`${finding.doc}\` mentions \`${finding.name}\` without scanner/config validation.`),
    ...unvalidatedRouteClaims.map((finding) => {
      const location = finding.locations?.length ? finding.locations.map((line) => `${finding.doc}:${line}`).join(', ') : `${finding.doc}:${finding.claim.line}`;
      return `- \`${location}\` - ${finding.reason}`;
    })
  ];
  const brokenReferenceFindings = brokenFilePaths.map((finding) => `- \`${finding.doc}:${finding.line}\` references \`${finding.reference_path}\` (missing).`);
  const adrFindings = [
    ...supersededAdrDocs.map((doc) => `- \`${doc.path}\` - superseded ADR${doc.adr?.superseded_by ? ` (superseded by ${doc.adr.superseded_by})` : ''}.`),
    ...oldUnknownAdrDocs.map((doc) => `- \`${doc.path}\` - stale ADR missing explicit status metadata.`)
  ];

  const commandRows = classified.map((c) => {
    const badge = c.status === 'validated' ? '✅ validated' : c.status === 'missing' ? '❌ missing' : '❓ unvalidated';
    const sourceLabels: Record<string, string> = {
      package_scripts: 'package.json',
      ci_workflow: 'CI workflow',
      makefile: 'Makefile',
      task_runner: 'Task runner'
    };
    const source = sourceLabels[c.source] || 'unknown';
    return tableRow([code(redactSensitiveText(c.command)), badge, source]);
  });
  const filePathRows = filePathFindings.slice(0, 200).map((finding) => {
    const badge = finding.valid ? '✅ valid' : '❌ missing';
    return tableRow([
      code(`${finding.doc}:${finding.line}`),
      code(finding.reference_path),
      badge,
      finding.valid ? code(finding.resolved_path) : 'not found'
    ]);
  });
  const envRows = envFindings.slice(0, 200).map((finding) => {
    const badge = finding.valid ? '✅ validated' : '❓ unvalidated';
    return tableRow([code(finding.doc), code(finding.name), badge]);
  });
  const routeRows = routeFindings.slice(0, 200).map((finding) => {
    const badge = finding.valid ? '✅ validated' : '❓ unvalidated';
    const method = finding.claim.method || 'ANY';
    const routePath = finding.claim.path || '(none)';
    const location = finding.locations?.length ? finding.locations.map((line) => `${finding.doc}:${line}`).join(', ') : `${finding.doc}:${finding.claim.line}`;
    const evidence = finding.valid
      ? formatRouteEvidence(manifest, finding.evidence || [])
      : finding.reason;
    return tableRow([code(location), code(`${method} ${routePath}`), badge, evidence]);
  });
  const adrRows = adrDocs.slice(0, 200).map((doc) => {
    const status = doc.adr?.status || 'unknown';
    const supersession = doc.adr?.superseded_by || doc.adr?.replaces || '-';
    const review = doc.adr?.superseded
      ? '⚠ superseded'
      : doc.stale && !doc.adr?.has_status_metadata
        ? '⚠ old without status metadata'
        : '✅ current/explicit';
    return tableRow([code(doc.path), code(status), code(supersession), String(doc.age_days ?? '-'), review]);
  });

  return `${frontmatter(manifest, {
    kind: 'documentation_debt_report',
    documentation_authority: manifest.documentation?.authority || 'secondary',
    claim_status: 'review-needed',
    confidence: 'low',
    source_paths: uniqueSorted(docs.map((doc) => doc.path)).slice(0, 50)
  })}# Documentation Debt Report

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
- File path references: ${summary.file_paths || 0}

## Documentation status table

| File | Status | Authority | Age days | Claims | Commands | Env vars |
|---|---|---:|---:|---:|---:|---:|
${rows.join('\n') || '| No documentation files scanned | | | | | | |'}

## Command validation

Commands extracted from documentation code blocks, validated against \`package.json\` scripts and CI workflow commands captured in the scan manifest.

- Validated: ${validatedCmds.length}
- Missing (package script / Makefile / task-runner target): ${missingCmds.length}
- Unvalidated (source unknown): ${unvalidatedCmds.length}

${commandRows.length > 0 ? `| Command | Status | Source |\n|---|---|---|\n${commandRows.join('\n')}` : '- No commands extracted from documentation.'}

## File path validation

Repository file and directory references extracted from markdown links and inline code spans. Generated-output roots such as \`dist/\`, \`coverage/\`, and \`.llmwiki/\` are excluded from extraction.

- Valid: ${validFilePaths.length}
- Missing: ${brokenFilePaths.length}

${filePathRows.length > 0 ? `| Documentation location | Reference | Status | Resolved path |\n|---|---|---|---|\n${filePathRows.join('\n')}${filePathFindings.length > filePathRows.length ? `\n\n_Showing first ${filePathRows.length} of ${filePathFindings.length} file path findings._` : ''}` : '- No file path references extracted from documentation.'}

## Environment variable validation

Environment variable names extracted from documentation are validated against scanner-detected source usage and configured environment-variable names. Values are never copied into generated markdown.

- Validated: ${validatedEnvVars.length}
- Unvalidated: ${unvalidatedEnvVars.length}

${envRows.length > 0 ? `| Documentation file | Variable | Status |\n|---|---|---|\n${envRows.join('\n')}${envFindings.length > envRows.length ? `\n\n_Showing first ${envRows.length} of ${envFindings.length} environment variable findings._` : ''}` : '- No environment variable mentions extracted from documentation.'}

## Route/API claim validation

Route and API claims from documentation prose are validated against scanner-extracted route surfaces when available.

- Validated: ${validatedRouteClaims.length}
- Unvalidated: ${unvalidatedRouteClaims.length}

${routeRows.length > 0 ? `| Claim location | Route claim | Status | Evidence / reason |\n|---|---|---|---|\n${routeRows.join('\n')}${routeFindings.length > routeRows.length ? `\n\n_Showing first ${routeRows.length} of ${routeFindings.length} route claim findings._` : ''}` : '- No route/API claims extracted from documentation.'}

## ADR validation

Conservative ADR detection uses deterministic path hints (\`ADR/**\`, \`docs/adr/**\`, \`docs/adrs/**\`) and explicit markers (e.g. \`Status:\`, \`Superseded by:\`, \`Replaces:\`, or ADR heading/title markers).

- ADR files detected: ${adrDocs.length}
- Superseded ADRs: ${supersededAdrDocs.length}
- Old ADRs missing status metadata: ${oldUnknownAdrDocs.length}

${adrRows.length > 0 ? `| ADR file | Status | Superseded by / Replaces | Age days | Review signal |\n|---|---|---|---:|---|\n${adrRows.join('\n')}${adrDocs.length > adrRows.length ? `\n\n_Showing first ${adrRows.length} of ${adrDocs.length} ADR findings._` : ''}` : '- No ADR-like documentation files detected.'}

## Findings by category

### Stale

${staleFindings.join('\n') || '- None detected.'}

### Contradicted

${contradictedFindings.join('\n') || '- None detected.'}

### Unvalidated

${unvalidatedFindings.join('\n') || '- None detected.'}

### Broken-reference

${brokenReferenceFindings.join('\n') || '- None detected.'}

### ADR-specific

${adrFindings.join('\n') || '- None detected.'}

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
    const rows = dependencyEdges.slice(0, 200).map((edge) => [sourcePathLink(manifest, edge.from), sourcePathLink(manifest, edge.to), code(edge.specifier)]);
    const summary = manifest.analysis?.dependency_graph?.summary || {};

    return `${frontmatter(manifest, {
      kind: 'dependency_map',
      claim_status: 'grounded',
      source_paths: uniqueSorted(dependencyEdges.flatMap((edge) => [edge.from, edge.to]).filter((value) => !String(value).startsWith('package:'))).slice(0, 50)
    })}# Dependency Map\n\n## Resolved internal dependency edges\n\n- Edges detected: ${summary.edges ?? dependencyEdges.length}\n- Importing files: ${summary.importers ?? uniqueCount(dependencyEdges.map((edge) => edge.from))}\n- Imported files: ${summary.imported_files ?? uniqueCount(dependencyEdges.map((edge) => edge.to))}\n\n${markdownTable(['From', 'To', 'Specifier'], rows)}\n`;
  }

  const importRows = manifest.files
    .filter((file) => file.imports?.length)
    .slice(0, 100)
    .map((file) => `| ${sourcePathLink(manifest, file.path)} | ${file.imports.map((imp) => `\`${imp}\``).join(', ')} |`);

  return `${frontmatter(manifest, {
    kind: 'dependency_map',
    claim_status: 'grounded',
    source_paths: uniqueSorted(manifest.files.filter((file) => file.imports?.length).map((file) => file.path)).slice(0, 50)
  })}# Dependency Map\n\n| Source file | Imports |\n|---|---|\n${importRows.join('\n') || '| None detected | |'}\n`;
}

function renderTestingStrategy(manifest) {
  const tests = manifest.files.filter((file) => file.category === 'test');
  const mappings = manifest.analysis?.test_to_source?.mappings || [];
  const mappingSection = mappings.length
    ? `## Test-to-source mappings\n\n- Mapped tests: ${manifest.analysis?.test_to_source?.summary?.mapped_tests ?? mappings.length}\n- Source files covered: ${manifest.analysis?.test_to_source?.summary?.source_files ?? uniqueCount(mappings.flatMap((mapping) => mapping.sources))}\n\n${markdownTable(['Test', 'Source files', 'Heuristics'], mappings.map((mapping) => [sourcePathLink(manifest, mapping.test), formatSourcePathList(manifest, mapping.sources), mapping.heuristics.join(', ') || 'unknown']))}\n`
    : `## Next refinement\n\nThe compiler will add direct test-to-source mappings when manifest analysis includes them.\n`;

  return `${frontmatter(manifest, {
    kind: 'testing_strategy',
    claim_status: 'grounded',
    source_paths: uniqueSorted([...tests.map((file) => file.path), ...mappings.flatMap((mapping) => [mapping.test, ...mapping.sources])]).slice(0, 50)
  })}# Testing Strategy\n\n## Detected test files\n\n${tests.map((file) => `- ${sourcePathLink(manifest, file.path)}`).join('\n') || '- No tests detected by the sketch scanner.'}\n\n${mappingSection}`;
}

function renderConfiguration(manifest) {
  const configFiles = manifest.files.filter((file) => file.runtime_hints?.includes('environment-variable') || /(^|\/)(\.env|config|settings)/i.test(file.path));
  const envRows = collectEnvironmentRows(manifest.files);
  const envNames = uniqueSorted(envRows.flatMap((row) => row.variables));
  const envSection = envRows.length
    ? `## Explicit environment variables\n\n- Unique variable names detected: ${envNames.length}\n- Variable names: ${formatCodeList(envNames)}\n\n${markdownTable(['Source file', 'Variables'], envRows.map((row) => [sourcePathLink(manifest, row.path), formatCodeList(row.variables)]))}\n`
    : `## Explicit environment variables\n\nNo explicit environment variable names were extracted from source cards.\n`;

  return `${frontmatter(manifest, {
    kind: 'configuration',
    claim_status: 'grounded',
    source_paths: sourcePathsOrPrimary(manifest, uniqueSorted([...configFiles.map((file) => file.path), ...envRows.map((row) => row.path)])).slice(0, 50)
  })}# Configuration and Environment\n\n## Detected configuration-related files\n\n${configFiles.map((file) => `- ${sourcePathLink(manifest, file.path)}`).join('\n') || '- No configuration surfaces detected by the sketch scanner.'}\n\n${envSection}\n## Secret handling\n\nGenerated wiki pages must describe variable names and configuration concepts, not copy secret values.\n`;
}

function renderSecurity(manifest) {
  const securityFiles = manifest.files.filter((file) => file.reasons?.some((reason) => ['auth', 'billing-or-payment', 'configuration'].includes(reason)));
  return `${frontmatter(manifest, {
    kind: 'security',
    claim_status: 'grounded',
    source_paths: sourcePathsOrPrimary(manifest, uniqueSorted(securityFiles.map((file) => file.path))).slice(0, 50)
  })}# Security and Secrets\n\n## Security-sensitive source areas\n\n${securityFiles.map((file) => `- ${sourcePathLink(manifest, file.path)} - ${file.reasons.join(', ')}`).join('\n') || '- No obvious security-sensitive areas detected by the sketch scanner.'}\n\n## Policy\n\n- Do not copy secrets or private tokens into wiki pages.\n- Cite source paths instead of embedding sensitive source content.\n- Require human review before publishing changes to authentication, authorization, billing, or deployment documentation.\n`;
}

function renderRunbook(manifest) {
  const infra = manifest.files.filter((file) => file.category === 'infra' || file.runtime_hints?.includes('deployment'));
  return `${frontmatter(manifest, {
    kind: 'runbook',
    claim_status: 'grounded',
    source_paths: sourcePathsOrPrimary(manifest, uniqueSorted(infra.map((file) => file.path))).slice(0, 50)
  })}# Operational Runbook\n\n## Deployment and operations files\n\n${infra.map((file) => `- ${sourcePathLink(manifest, file.path)}`).join('\n') || '- No deployment or operations files detected by the sketch scanner.'}\n\n## Next refinement\n\nThe production compiler should extract deployment commands, rollback notes, service dependencies, queue names, cron jobs, and operational dashboards when those are represented in source.\n`;
}

function renderHttpRoutes(manifest) {
  const routeFiles = manifest.files.filter((file) => file.runtime_hints?.includes('http-route') || file.reasons?.includes('api-surface'));
  const routes = collectRoutes(manifest.files);
  const routeSection = routes.length
    ? `## Detected routes\n\n- Route surfaces detected: ${routes.length}\n\n${markdownTable(['Source file', 'Framework', 'Target', 'Methods', 'Path', 'Handler'], routes.map((route) => [sourcePathLink(manifest, route.file), route.framework, code(route.target), route.methods.join(', ') || 'ANY', code(route.path), code(route.handler)]))}\n`
    : `## Detected route-related files\n\n${routeFiles.map((file) => `- ${sourcePathLink(manifest, file.path)}`).join('\n') || '- No HTTP routes detected.'}\n`;

  return `${frontmatter(manifest, {
    kind: 'api_http_routes',
    claim_status: 'grounded',
    source_paths: uniqueSorted([...routeFiles.map((file) => file.path), ...routes.map((route) => route.file)]).slice(0, 50)
  })}# API: HTTP Routes\n\n${routeSection}\n## Next refinement\n\nAdd framework-specific extractors for Express, Fastify, NestJS, Next.js route handlers, Hono, Koa, tRPC, OpenAPI, and GraphQL.\n`;
}

function renderDataModel(manifest) {
  const dataFiles = manifest.files.filter((file) => file.category === 'data' || file.reasons?.includes('data-model'));
  return `${frontmatter(manifest, {
    kind: 'data_model',
    claim_status: 'grounded',
    source_paths: uniqueSorted(dataFiles.map((file) => file.path)).slice(0, 50)
  })}# Data Model and Migrations\n\n## Detected data-related files\n\n${dataFiles.map((file) => `- ${sourcePathLink(manifest, file.path)}`).join('\n') || '- No data files detected.'}\n`;
}

function renderModulePage(manifest, module, sourceToTestsIndex: Map<string, Set<string>>) {
  const sampleFiles = module.files.slice(0, 80).map((file) => `- ${sourcePathLink(manifest, file)}`).join('\n');
  const relatedTests = lookupRelatedTests(module.files, sourceToTestsIndex);
  const relatedTestsSection = relatedTests.length
    ? `## Related tests\n\n${relatedTests.map((testPath) => `- ${sourcePathLink(manifest, testPath)}`).join('\n')}\n\n`
    : '';
  return `${frontmatter(manifest, {
    kind: 'module',
    module: module.name,
    claim_status: 'grounded',
    confidence: 'high',
    source_paths: module.files.slice(0, 20)
  })}# ${module.name}\n\n## Purpose\n\nGenerated first-pass page for files grouped under ${module.name}. This should be refined by the LLM compiler using source cards and targeted source excerpts.\n\n## Signals\n\n- Files: ${module.files.length}\n- Categories: ${Object.keys(module.categories).join(', ') || 'unknown'}\n- Languages: ${Object.keys(module.languages).join(', ') || 'unknown'}\n- Runtime hints: ${Object.keys(module.runtime_hints).join(', ') || 'none'}\n- Reasons: ${module.important_reasons.join(', ') || 'none'}\n\n## Source files\n\n${sampleFiles || '- None'}\n\n${relatedTestsSection}## Related pages\n\n- ${wikiLink('Dependency-Map.md')}\n- ${wikiLink('Testing-Strategy.md')}\n- ${wikiLink('Open-Questions.md')}\n\n<!-- HUMAN_NOTES_START -->\n<!-- HUMAN_NOTES_END -->\n`;
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
    tableRow(headers),
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => tableRow(row))
  ].join('\n');
}

function tableRow(cells: Array<string | number>) {
  return `| ${cells.map((cell) => sanitizeTableCell(cell)).join(' | ')} |`;
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

function formatRouteEvidence(manifest: any, evidence: any[]) {
  if (!evidence?.length) return 'scanner route match';
  return evidence.slice(0, 3).map((item) => {
    const source = sourcePathLink(manifest, item.source_path);
    const details = [item.framework, item.method, code(item.path)].filter(Boolean).join(' ');
    return `${source} (${details})`;
  }).join('; ');
}

function formatCodeList(values: Array<string | number>) {
  return values.map((value) => code(value)).join(', ');
}

function formatSourcePathList(manifest: any, values: string[]) {
  return values.map((value) => sourcePathLink(manifest, value)).join(', ');
}

function sourcePathLink(manifest: any, filePath: string, sourceRange?: { line?: number; end_line?: number }) {
  const browserUrl = githubSourceUrl(manifest, filePath, sourceRange);
  if (!browserUrl) {
    return code(filePath);
  }
  return `[${escapeMarkdownLinkText(filePath)}](${browserUrl})`;
}

function githubSourceUrl(manifest: any, filePath: string, sourceRange?: { line?: number; end_line?: number }) {
  const repoUrl = githubRepositoryUrl(manifest?.remote);
  const commit = manifest?.commit;
  if (!repoUrl || !commit || !filePath) {
    return null;
  }
  return `${repoUrl}/blob/${encodeURIComponent(String(commit))}/${encodePathSegments(filePath)}${formatGitHubLineAnchor(sourceRange)}`;
}

function githubRepositoryUrl(remote: string | undefined) {
  if (!remote) {
    return null;
  }

  const normalized = String(remote).trim();
  const httpsMatch = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(normalized);
  if (httpsMatch) {
    return `https://github.com/${httpsMatch[1]}/${httpsMatch[2]}`;
  }

  const sshMatch = /^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/.exec(normalized);
  if (sshMatch) {
    return `https://github.com/${sshMatch[1]}/${sshMatch[2]}`;
  }

  const sshUrlMatch = /^ssh:\/\/git@github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(normalized);
  if (sshUrlMatch) {
    return `https://github.com/${sshUrlMatch[1]}/${sshUrlMatch[2]}`;
  }

  return null;
}

function encodePathSegments(filePath: string) {
  return String(filePath).split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

function formatGitHubLineAnchor(sourceRange?: { line?: number; end_line?: number }) {
  const line = sanitizeLineNumber(sourceRange?.line);
  if (!line) {
    return '';
  }
  const endLine = sanitizeLineNumber(sourceRange?.end_line);
  if (!endLine || endLine === line) {
    return `#L${line}`;
  }
  if (endLine > line) {
    return `#L${line}-L${endLine}`;
  }
  return `#L${line}`;
}

function sanitizeLineNumber(value: number | undefined) {
  const numeric = typeof value === 'number' ? Math.floor(value) : Number.NaN;
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function escapeMarkdownLinkText(value: string) {
  return String(value).replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

function findNamedSourceRange(
  sources: Array<{ name?: string; line?: number; end_line?: number }> | undefined,
  name: string
) {
  return (sources || []).find((source) => source.name === name);
}

function uniqueSorted(values: Array<string | number>) {
  return [...new Set(values || [])].sort((left, right) => String(left).localeCompare(String(right)));
}

function collectPrimarySourcePaths(manifest: any) {
  return uniqueSorted((manifest.files || [])
    .filter((file) => file?.path && file.category !== 'docs')
    .map((file) => file.path));
}

function isDocumentationPath(entry: string | number) {
  const normalized = String(entry).trim().replace(/\\/g, '/').toLowerCase();
  const segments = normalized.split('/').filter(Boolean);
  const basename = segments.at(-1) || '';
  const extension = path.extname(basename);
  const firstSegment = segments[0] || '';

  if (['.md', '.mdx', '.markdown'].includes(extension)) {
    return true;
  }

  if (['readme', 'changelog'].includes(basename)) {
    return true;
  }

  return extension === '.json' && firstSegment === '.llmwiki' && segments.includes('docs');
}

function sourcePathsOrPrimary(manifest: any, paths: Array<string | number>) {
  return paths.length > 0 ? paths : collectPrimarySourcePaths(manifest);
}

function uniqueCount(values: Array<string | number>) {
  return new Set(values || []).size;
}

function confidenceForKind(pageKind: string | undefined): 'high' | 'medium' | 'low' {
  switch (pageKind) {
    case 'module':
    case 'build_test_run':
    case 'testing_strategy':
    case 'dependency_map':
    case 'configuration':
    case 'api_http_routes':
    case 'data_model':
      return 'high';
    case 'documentation_debt_report':
    case 'open_questions':
    case 'log':
      return 'low';
    default:
      return 'medium';
  }
}

function buildDocumentationReviewQueue(docs: any[]) {
  const queue = new Map<string, Set<string>>();

  for (const doc of docs || []) {
    const reasons = new Set<string>();
    const contradictionCount = doc.validation?.contradictions?.length || 0;
    if (doc.stale) reasons.add(`stale (${doc.age_days} days old)`);
    if (contradictionCount > 0) reasons.add(formatContradictionReason(contradictionCount));
    if (doc.status === 'unvalidated') reasons.add('unvalidated status');
    if ((doc.claims?.length || 0) > 0 && !['validated', 'unvalidated'].includes(doc.status)) reasons.add('claims need validation');

    if (!reasons.size) continue;

    if (!queue.has(doc.path)) queue.set(doc.path, new Set<string>());
    for (const reason of reasons) {
      queue.get(doc.path)!.add(reason);
    }
  }

  return [...queue.entries()]
    .map(([path, reasons]) => ({ path, reasons: [...reasons].sort() }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function formatContradictionReason(count: number) {
  return `contradicted (${count} ${pluralize(count, 'signal', 'signals')})`;
}

function pluralize(count: number, singularForm: string, pluralForm: string) {
  return count === 1 ? singularForm : pluralForm;
}

function code(value: string | number) {
  return `\`${String(value).replace(/`/g, '\\`')}\``;
}

function sanitizeTableCell(value: string | number) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').replace(/\|/g, '\\|').trim();
}

function redactSensitiveText(value: string | number) {
  return String(value ?? '')
    .replace(/(authorization:\s*bearer\s+)[^\s"']+/ig, '$1[REDACTED]')
    .replace(/((?:--?token|--?password|--?api[-_]?key|--?secret)(?:=|\s+))[^\s"']+/ig, '$1[REDACTED]')
    .replace(/((?:token|password|api[_-]?key|secret)=)[^\s&]+/ig, '$1[REDACTED]');
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
