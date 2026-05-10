export type PageContextType = 'foundation' | 'module' | 'cross-cutting';

export type PageContextBudget = {
  maxChars: number;
  maxSourceCards: number;
  maxDocumentationCards: number;
  maxExcerptChars: number;
};

export type PageContextPage = {
  path: string;
  phase?: string;
  moduleName?: string | null;
};

export type AssemblePageContextInput = {
  manifest: any;
  plan: any;
  page: PageContextPage;
  budget?: Partial<PageContextBudget>;
};

export type PageContext = ReturnType<typeof assemblePageContext>;

const DEFAULT_BUDGET: PageContextBudget = {
  maxChars: 12_000,
  maxSourceCards: 24,
  maxDocumentationCards: 12,
  maxExcerptChars: 320
};
const EXTERNAL_PACKAGE_PREFIX = 'package:';
const SOURCE_EXCERPT_LIMITS = {
  imports: 8,
  symbols: 10,
  envVars: 8,
  hints: 8
};
const DOC_EXCERPT_LIMITS = {
  headings: 3,
  claims: 2,
  commands: 3
};

export function assembleAllPageContexts({ manifest, plan, budget }: { manifest: any; plan: any; budget?: Partial<PageContextBudget> }) {
  return (plan?.pages || []).map((page: any) => assemblePageContext({ manifest, plan, page, budget }));
}

export function assemblePageContext({ manifest, plan, page, budget }: AssemblePageContextInput) {
  const limits = normalizeBudget(budget);
  const sourceCards = sortByPath(manifest?.files || []);
  const documentationCards = sortByPath(manifest?.documentation?.files || []);
  const selectedSources = selectSourceCards({ sourceCards, manifest, plan, page });
  const selectedDocs = selectDocumentationCards({ documentationCards, page, selectedSources, plan });
  const omitted = {
    source_cards: [] as string[],
    documentation_cards: [] as string[],
    excerpts: [] as string[],
    reasons: [] as string[]
  };

  let usedChars = 0;
  const source_inputs: any[] = [];
  const documentation_inputs: any[] = [];

  for (const card of selectedSources) {
    if (source_inputs.length >= limits.maxSourceCards) {
      omitted.source_cards.push(card.path);
      continue;
    }

    const excerpt = buildSourceExcerpt(card);
    const truncatedExcerpt = truncateText(excerpt, limits.maxExcerptChars);
    if (truncatedExcerpt.truncated) {
      omitted.excerpts.push(`source:${card.path}`);
    }

    const sourceInput = {
      path: card.path,
      category: card.category,
      language: card.language,
      reasons: uniqueSorted(card.reasons || []),
      symbols: boundedStrings(sourceSymbolNames(card), SOURCE_EXCERPT_LIMITS.symbols),
      imports: boundedStrings(card.imports, SOURCE_EXCERPT_LIMITS.imports),
      runtime_hints: uniqueSorted(card.runtime_hints || []),
      environment_variables: boundedStrings(card.environment_variables, SOURCE_EXCERPT_LIMITS.envVars),
      routes: summarizeRoutes(card.route_surfaces),
      migrations: summarizeMigrations(card.migration_surfaces),
      models: summarizeModels(card.model_surfaces),
      excerpt: truncatedExcerpt.value
    };
    const estimatedChars = estimateInputChars(sourceInput);
    if (usedChars + estimatedChars > limits.maxChars) {
      omitted.source_cards.push(card.path);
      omitted.reasons.push('max_chars_exceeded');
      continue;
    }

    usedChars += estimatedChars;
    source_inputs.push(sourceInput);
  }

  for (const card of selectedDocs) {
    if (documentation_inputs.length >= limits.maxDocumentationCards) {
      omitted.documentation_cards.push(card.path);
      continue;
    }

    const excerpt = buildDocumentationExcerpt(card);
    const truncatedExcerpt = truncateText(excerpt, limits.maxExcerptChars);
    if (truncatedExcerpt.truncated) {
      omitted.excerpts.push(`docs:${card.path}`);
    }

    const documentationInput = {
      path: card.path,
      status: card.status,
      authority: card.authority,
      stale: Boolean(card.stale),
      excerpt: truncatedExcerpt.value
    };
    const estimatedChars = estimateInputChars(documentationInput);
    if (usedChars + estimatedChars > limits.maxChars) {
      omitted.documentation_cards.push(card.path);
      omitted.reasons.push('max_chars_exceeded');
      continue;
    }

    usedChars += estimatedChars;
    documentation_inputs.push(documentationInput);
  }

  if (selectedSources.length > limits.maxSourceCards) {
    omitted.reasons.push('max_source_cards_exceeded');
  }
  if (selectedDocs.length > limits.maxDocumentationCards) {
    omitted.reasons.push('max_documentation_cards_exceeded');
  }

  const contextType = pageType(page);
  const source_paths = uniqueSorted(source_inputs.map((input) => input.path));

  return {
    page: {
      path: page.path,
      phase: page.phase || null,
      type: contextType
    },
    budget: {
      ...limits,
      usedChars
    },
    source_paths,
    source_inputs,
    documentation_inputs,
    metadata: selectMetadata(manifest, page),
    omitted: {
      source_cards: uniqueSorted(omitted.source_cards),
      documentation_cards: uniqueSorted(omitted.documentation_cards),
      excerpts: uniqueSorted(omitted.excerpts),
      reasons: uniqueSorted(omitted.reasons)
    }
  };
}

function pageType(page: { phase?: string }): PageContextType {
  if (page?.phase === 'modules') {
    return 'module';
  }
  if (page?.phase === 'cross-cutting') {
    return 'cross-cutting';
  }
  return 'foundation';
}

function normalizeBudget(budget?: Partial<PageContextBudget>): PageContextBudget {
  return {
    maxChars: normalizeNonNegativeInt(budget?.maxChars, DEFAULT_BUDGET.maxChars),
    maxSourceCards: normalizeNonNegativeInt(budget?.maxSourceCards, DEFAULT_BUDGET.maxSourceCards),
    maxDocumentationCards: normalizeNonNegativeInt(budget?.maxDocumentationCards, DEFAULT_BUDGET.maxDocumentationCards),
    maxExcerptChars: normalizeNonNegativeInt(budget?.maxExcerptChars, DEFAULT_BUDGET.maxExcerptChars)
  };
}

function normalizeNonNegativeInt(value: unknown, fallback: number) {
  const number = typeof value === 'number' ? Math.floor(value) : Number.NaN;
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function selectSourceCards({ sourceCards, manifest, plan, page }: { sourceCards: any[]; manifest: any; plan: any; page: any }) {
  const type = pageType(page);
  if (type === 'module') {
    const module = findModuleForPage(plan, page);
    const moduleFiles = new Set(module?.files || []);
    return sourceCards.filter((card) => moduleFiles.has(card.path));
  }

  if (type === 'cross-cutting') {
    const pagePath = String(page.path || '');
    const dependencyParticipants = dependencyGraphParticipants(manifest);
    const testMappedSources = new Set((manifest?.analysis?.test_to_source?.mappings || []).flatMap((mapping: any) => mapping.sources || []));

    if (pagePath === 'Dependency-Map.md') {
      return sourceCards.filter((card) => (card.imports || []).length > 0 || dependencyParticipants.has(card.path));
    }
    if (pagePath === 'Testing-Strategy.md') {
      return sourceCards.filter((card) => card.category === 'test' || testMappedSources.has(card.path));
    }
    if (pagePath === 'Configuration-and-Environment.md') {
      return sourceCards.filter((card) =>
        (card.environment_variables || []).length > 0
        || (card.runtime_hints || []).includes('environment-variable')
        || (card.reasons || []).includes('configuration')
      );
    }
    if (pagePath === 'Security-and-Secrets.md') {
      return sourceCards.filter((card) => (card.reasons || []).some((reason: string) => ['auth', 'billing-or-payment', 'configuration'].includes(reason)));
    }
    if (pagePath === 'Operational-Runbook.md') {
      return sourceCards.filter((card) => card.category === 'infra' || (card.runtime_hints || []).includes('deployment'));
    }
    if (pagePath === 'API-HTTP-Routes.md') {
      return sourceCards.filter((card) => (card.route_surfaces || []).length > 0 || (card.runtime_hints || []).includes('http-route') || (card.reasons || []).includes('api-surface'));
    }
    if (pagePath === 'Data-Model-and-Migrations.md') {
      return sourceCards.filter((card) =>
        card.category === 'data'
        || (card.migration_surfaces || []).length > 0
        || (card.model_surfaces || []).length > 0
        || (card.reasons || []).some((reason: string) => ['data-model', 'orm-model', 'database-migration'].includes(reason))
      );
    }
  }

  return sourceCards;
}

function selectDocumentationCards({ documentationCards, page, selectedSources, plan }: { documentationCards: any[]; page: any; selectedSources: any[]; plan: any }) {
  const type = pageType(page);
  if (type === 'module') {
    const module = findModuleForPage(plan, page);
    const moduleDirectories = new Set((module?.files || []).map((file: string) => file.split('/')[0]).filter(Boolean));
    return documentationCards.filter((card) => moduleDirectories.has(String(card.path || '').split('/')[0]));
  }

  if (page?.path === 'Documentation-Debt-Report.md' || page?.path === 'Open-Questions.md') {
    return documentationCards;
  }

  if (type === 'cross-cutting') {
    const selectedDirectories = new Set(selectedSources.map((card) => String(card.path).split('/')[0]));
    return documentationCards.filter((card) => selectedDirectories.has(String(card.path || '').split('/')[0]) || card.status === 'stale' || card.status === 'contradicted');
  }

  return documentationCards.filter((card) => card.status === 'stale' || card.status === 'contradicted' || card.status === 'partially_validated');
}

function selectMetadata(manifest: any, page: any) {
  const packageScripts = (manifest?.analysis?.package_scripts || []).map((entry: any) => ({
    path: entry.path,
    script_count: Object.keys(entry.scripts || {}).length,
    ...((entry.script_sources || []).length > 0 ? {
      script_sources: (entry.script_sources || []).map((source: any) => ({
        name: source.name,
        ...(typeof source.line === 'number' ? { line: source.line } : {}),
        ...(typeof source.end_line === 'number' ? { end_line: source.end_line } : {})
      }))
    } : {})
  }));
  const base = {
    dependency_graph: manifest?.analysis?.dependency_graph?.summary || null,
    test_to_source: manifest?.analysis?.test_to_source?.summary || null,
    package_scripts: packageScripts
  };

  if (page?.path === 'Dependency-Map.md') {
    return base;
  }
  if (page?.path === 'Testing-Strategy.md') {
    return { test_to_source: base.test_to_source };
  }
  if (page?.path === 'Build-Test-and-Run.md') {
    return {
      package_scripts: base.package_scripts,
      ci_workflow_command_sources: (manifest?.analysis?.ci_workflow_command_sources || []).map((entry: any) => ({
        path: entry.path,
        command: entry.command,
        ...(typeof entry.line === 'number' ? { line: entry.line } : {}),
        ...(typeof entry.end_line === 'number' ? { end_line: entry.end_line } : {})
      }))
    };
  }
  return {
    dependency_graph: base.dependency_graph,
    test_to_source: base.test_to_source
  };
}

function findModuleForPage(plan: any, page: any) {
  const byModuleName = (plan?.modules || []).find((module: any) => module.name === page?.moduleName);
  if (byModuleName) {
    return byModuleName;
  }
  const slug = String(page?.path || '').replace(/\.md$/, '');
  return (plan?.modules || []).find((module: any) => module.slug === slug);
}

function dependencyGraphParticipants(manifest: any) {
  const participants = new Set<string>();
  for (const edge of manifest?.analysis?.dependency_graph?.edges || []) {
    if (typeof edge.from === 'string') {
      participants.add(edge.from);
    }
    // Exclude external package pseudo-paths so dependency participants stay repository-local.
    if (typeof edge.to === 'string' && !edge.to.startsWith(EXTERNAL_PACKAGE_PREFIX)) {
      participants.add(edge.to);
    }
  }
  return participants;
}

function sortByPath(items: any[]) {
  return [...items].sort((left, right) => compareStrings(String(left.path || ''), String(right.path || '')));
}

function sourceSymbols(card: any) {
  return nonEmptyArray(card.exported_symbols) ? card.exported_symbols : (card.symbols || []);
}

function sourceSymbolNames(card: any) {
  return sourceSymbols(card).map((symbol: any) => symbol?.name || symbol).filter(Boolean);
}

function nonEmptyArray(value: unknown): value is any[] {
  return Array.isArray(value) && value.length > 0;
}

function boundedStrings(values: unknown, limit: number) {
  return (Array.isArray(values) ? values : []).slice(0, limit).map((value) => String(value));
}

function summarizeRoutes(values: unknown) {
  return (Array.isArray(values) ? values : []).slice(0, 5).map((route: any) => ({
    kind: route?.kind || null,
    framework: route?.framework || null,
    methods: boundedStrings(route?.methods, 4),
    path: route?.path || null,
    handler: route?.handler || route?.target || null
  }));
}

function summarizeMigrations(values: unknown) {
  return (Array.isArray(values) ? values : []).slice(0, 5).map((migration: any) => ({
    kind: migration?.kind || null,
    id: migration?.id || null,
    name: migration?.name || null
  }));
}

function summarizeModels(values: unknown) {
  return (Array.isArray(values) ? values : []).slice(0, 5).map((model: any) => ({
    name: model?.name || null,
    kind: model?.kind || null,
    framework: model?.framework || null
  }));
}

function buildSourceExcerpt(card: any) {
  const parts = [
    `path=${card.path}`,
    `category=${card.category}`,
    `language=${card.language}`,
    `imports=${(card.imports || []).slice(0, SOURCE_EXCERPT_LIMITS.imports).join(', ') || 'none'}`,
    `symbols=${sourceSymbols(card).slice(0, SOURCE_EXCERPT_LIMITS.symbols).map((symbol: any) => symbol?.name || symbol).join(', ') || 'none'}`,
    `env=${(card.environment_variables || []).slice(0, SOURCE_EXCERPT_LIMITS.envVars).join(', ') || 'none'}`,
    `hints=${(card.runtime_hints || []).slice(0, SOURCE_EXCERPT_LIMITS.hints).join(', ') || 'none'}`
  ];
  return parts.join(' | ');
}

function buildDocumentationExcerpt(card: any) {
  const headingPreview = (card.headings || []).slice(0, DOC_EXCERPT_LIMITS.headings).map((heading: any) => redactSecretLikeText(heading.text)).join(' > ');
  const claimPreview = (card.claims || []).slice(0, DOC_EXCERPT_LIMITS.claims).map((claim: any) => redactSecretLikeText(claim.text)).join(' || ');
  const commandPreview = (card.validation?.commands || []).slice(0, DOC_EXCERPT_LIMITS.commands).map((command: string) => redactSecretLikeText(command)).join(', ');
  return [
    `path=${card.path}`,
    `status=${card.status || 'unknown'}`,
    headingPreview ? `headings=${headingPreview}` : '',
    claimPreview ? `claims=${claimPreview}` : '',
    commandPreview ? `commands=${commandPreview}` : ''
  ].filter(Boolean).join(' | ');
}

function truncateText(value: string, maxChars: number) {
  if (value.length <= maxChars) {
    return { value, truncated: false };
  }
  if (maxChars <= 0) {
    return { value: '', truncated: true };
  }
  if (maxChars === 1) {
    return { value: '…', truncated: true };
  }
  return { value: `${value.slice(0, maxChars - 1)}…`, truncated: true };
}

function estimateInputChars(input: unknown) {
  return JSON.stringify(input).length;
}

const SECRET_LIKE_PATTERNS: Array<RegExp | { pattern: RegExp; preservePrefix: true }> = [
  /AKIA[0-9A-Z]{16}/g,
  /-----BEGIN (?:RSA|DSA|EC|OPENSSH) PRIVATE KEY-----[\s\S]*?-----END (?:RSA|DSA|EC|OPENSSH) PRIVATE KEY-----/g,
  /ghp_[A-Za-z0-9_]{30,}/g,
  /github_pat_[A-Za-z0-9_]{22,}/g,
  /glpat-[A-Za-z0-9_-]{20,}/g,
  /npm_[A-Za-z0-9]{20,}/g,
  /xox[baprs]-[A-Za-z0-9-]{20,}/g,
  /sk-[A-Za-z0-9]{20,}/g,
  { pattern: /(\bBearer\s+)([A-Za-z0-9._~+/-]{20,}={0,2})/gi, preservePrefix: true },
  { pattern: /([A-Z][A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD)\s*=\s*)([^\s'"`]+)/gi, preservePrefix: true },
  { pattern: /([A-Z][A-Z0-9_]{2,}\s*=\s*)([A-Za-z0-9._~+/-]{32,}={0,2})/g, preservePrefix: true }
];

export function redactSecretLikeText(value: unknown) {
  let output = String(value || '');
  for (const entry of SECRET_LIKE_PATTERNS) {
    const pattern = entry instanceof RegExp ? entry : entry.pattern;
    output = output.replace(pattern, (...args: any[]) => {
      if (!(entry instanceof RegExp) && entry.preservePrefix && typeof args[1] === 'string') {
        return `${args[1]}[REDACTED]`;
      }
      return '[REDACTED]';
    });
  }
  return output;
}

function uniqueSorted(values: string[]) {
  return [...new Set(values || [])].sort(compareStrings);
}

function compareStrings(left: string, right: string) {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}
