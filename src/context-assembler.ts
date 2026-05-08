type AssemblePageContextInput = {
  manifest: any;
  plan: any;
  page: { path: string; phase?: string; moduleName?: string | null };
  budget?: Partial<PageContextBudget>;
};

type PageContextBudget = {
  maxChars: number;
  maxSourceCards: number;
  maxDocumentationCards: number;
  maxExcerptChars: number;
};

const DEFAULT_BUDGET: PageContextBudget = {
  maxChars: 12_000,
  maxSourceCards: 24,
  maxDocumentationCards: 12,
  maxExcerptChars: 320
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

    const estimatedChars = card.path.length + truncatedExcerpt.value.length + 48;
    if (usedChars + estimatedChars > limits.maxChars) {
      omitted.source_cards.push(card.path);
      omitted.reasons.push('max_chars_exceeded');
      continue;
    }

    usedChars += estimatedChars;
    source_inputs.push({
      path: card.path,
      category: card.category,
      language: card.language,
      reasons: uniqueSorted(card.reasons || []),
      runtime_hints: uniqueSorted(card.runtime_hints || []),
      excerpt: truncatedExcerpt.value
    });
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

    const estimatedChars = card.path.length + truncatedExcerpt.value.length + 48;
    if (usedChars + estimatedChars > limits.maxChars) {
      omitted.documentation_cards.push(card.path);
      omitted.reasons.push('max_chars_exceeded');
      continue;
    }

    usedChars += estimatedChars;
    documentation_inputs.push({
      path: card.path,
      status: card.status,
      authority: card.authority,
      stale: Boolean(card.stale),
      excerpt: truncatedExcerpt.value
    });
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
      used_chars: usedChars
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

function pageType(page: { phase?: string }) {
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
    maxChars: positiveInt(budget?.maxChars, DEFAULT_BUDGET.maxChars),
    maxSourceCards: positiveInt(budget?.maxSourceCards, DEFAULT_BUDGET.maxSourceCards),
    maxDocumentationCards: positiveInt(budget?.maxDocumentationCards, DEFAULT_BUDGET.maxDocumentationCards),
    maxExcerptChars: positiveInt(budget?.maxExcerptChars, DEFAULT_BUDGET.maxExcerptChars)
  };
}

function positiveInt(value: unknown, fallback: number) {
  const number = typeof value === 'number' ? Math.floor(value) : Number.NaN;
  return Number.isFinite(number) && number > 0 ? number : fallback;
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
    const prefixes = new Set((module?.files || []).map((file: string) => file.split('/')[0]).filter(Boolean));
    return documentationCards.filter((card) => prefixes.has(String(card.path || '').split('/')[0]));
  }

  if (page?.path === 'Documentation-Debt-Report.md' || page?.path === 'Open-Questions.md') {
    return documentationCards;
  }

  if (type === 'cross-cutting') {
    const selectedPaths = new Set(selectedSources.map((card) => String(card.path).split('/')[0]));
    return documentationCards.filter((card) => selectedPaths.has(String(card.path || '').split('/')[0]) || card.status === 'stale' || card.status === 'contradicted');
  }

  return documentationCards.filter((card) => card.status === 'stale' || card.status === 'contradicted' || card.status === 'partially_validated');
}

function selectMetadata(manifest: any, page: any) {
  const base = {
    dependency_graph: manifest?.analysis?.dependency_graph?.summary || null,
    test_to_source: manifest?.analysis?.test_to_source?.summary || null,
    package_scripts: (manifest?.analysis?.package_scripts || []).map((entry: any) => ({
      path: entry.path,
      script_count: Object.keys(entry.scripts || {}).length
    }))
  };

  if (page?.path === 'Dependency-Map.md') {
    return base;
  }
  if (page?.path === 'Testing-Strategy.md') {
    return { test_to_source: base.test_to_source };
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
    if (typeof edge.to === 'string' && !edge.to.startsWith('package:')) {
      participants.add(edge.to);
    }
  }
  return participants;
}

function sortByPath(items: any[]) {
  return [...items].sort((left, right) => String(left.path || '').localeCompare(String(right.path || '')));
}

function buildSourceExcerpt(card: any) {
  const parts = [
    `path=${card.path}`,
    `category=${card.category}`,
    `language=${card.language}`,
    `imports=${(card.imports || []).slice(0, 8).join(', ') || 'none'}`,
    `symbols=${(card.exported_symbols || card.symbols || []).slice(0, 10).map((symbol: any) => symbol?.name || symbol).join(', ') || 'none'}`,
    `env=${(card.environment_variables || []).slice(0, 8).join(', ') || 'none'}`,
    `hints=${(card.runtime_hints || []).slice(0, 8).join(', ') || 'none'}`
  ];
  return parts.join(' | ');
}

function buildDocumentationExcerpt(card: any) {
  const headingPreview = (card.headings || []).slice(0, 3).map((heading: any) => heading.text).join(' > ');
  const claimPreview = (card.claims || []).slice(0, 2).map((claim: any) => claim.text).join(' || ');
  const commandPreview = (card.validation?.commands || []).slice(0, 3).join(', ');
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
  if (maxChars <= 1) {
    return { value: '…', truncated: true };
  }
  return { value: `${value.slice(0, maxChars - 1)}…`, truncated: true };
}

function uniqueSorted(values: string[]) {
  return [...new Set(values || [])].sort((left, right) => left.localeCompare(right));
}
