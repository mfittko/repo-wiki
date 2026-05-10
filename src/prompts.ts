/**
 * Prompt template structure for LLM-backed wiki synthesis.
 *
 * Three page archetypes map to distinct templates:
 *   - foundation   : repo-wide pages (Home, Architecture, Build-Test-and-Run, …)
 *   - module       : per-module pages derived from grouped source cards
 *   - cross-cutting: shared-concern pages (Dependency-Map, Testing-Strategy, …)
 */

export type PageArchetype = 'foundation' | 'module' | 'cross-cutting' | 'architecture';

// ── Context shapes ─────────────────────────────────────────────────────────

export type RouteContext = {
  kind?: string | null;
  framework?: string | null;
  methods?: string[];
  path?: string | null;
  handler?: string | null;
};

export type MigrationContext = {
  kind?: string | null;
  id?: string | null;
  name?: string | null;
};

export type ModelContext = {
  name?: string | null;
  kind?: string | null;
  framework?: string | null;
};

export interface SourceCardContext {
  path: string;
  category: string;
  language: string;
  symbols?: string[];
  imports?: string[];
  reasons?: string[];
  runtime_hints?: string[];
  environment_variables?: string[];
  routes?: RouteContext[];
  migrations?: MigrationContext[];
  models?: ModelContext[];
  excerpt?: string;
}

export interface DocCardContext {
  path: string;
  status: string;
  claims?: string[];
  excerpt?: string;
}

export interface ModuleInfo {
  name: string;
  slug: string;
  files: string[];
  categories: Record<string, number>;
  languages: Record<string, number>;
  important_reasons?: string[];
}

export interface PromptContext {
  /** Wiki page slug/filename without .md extension (e.g. "Module-Auth"). */
  pageName: string;
  /** Human-readable page title (e.g. "Auth"). */
  pageTitle: string;
  repoRemote?: string;
  repoCommit?: string;
  sourceCards: SourceCardContext[];
  docCards?: DocCardContext[];
  /** True when a module's evidence paths are all markdown/documentation files. */
  docsOnlyModule?: boolean;
  /** Current wiki page text, if one already exists. */
  existingContent?: string;
  /** Only set for module archetype. */
  moduleInfo?: ModuleInfo;
}

export interface BuiltPrompt {
  system: string;
  user: string;
}

// ── Shared system prompt ───────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are compiling a Git repository into a GitHub Wiki knowledge base.

Authority rules:
- Source code at the pinned commit is authoritative.
- Tests, CI, configuration, schemas, and migrations are high-authority evidence.
- Markdown documentation is secondary evidence; use it for intent, terminology, and rationale, but validate operational claims before presenting them as current behaviour.
- If documentation conflicts with code, trust code and add the conflict to Documentation-Debt-Report or Open-Questions.
- Preserve human-maintained sections between HUMAN_NOTES_START and HUMAN_NOTES_END markers.
- Every material claim must cite source paths or documentation cards.
- Do not copy secrets, tokens, private keys, or environment variable values.

Output contract:
- Output only the complete markdown page.
- The first line of the response must be exactly \`---\`.
- Do not include preamble, explanation, commentary, a markdown fence, or any code block wrapper around the page.
- Produce valid GitHub-flavored Markdown.
- Include a YAML frontmatter block with required keys: source_repo, source_commit, compiled_at, kind, page_state, source_paths.
- Include conservative confidence metadata and claim status where appropriate (for example confidence and claim_status frontmatter fields).
- source_paths must be non-empty for generated content and must cite evidence paths used by the page.
- Use headings, tables, and code blocks where appropriate.
- End module pages with a human notes block:
  <!-- HUMAN_NOTES_START -->
  <!-- HUMAN_NOTES_END -->`;

// ── Budget constants ───────────────────────────────────────────────────────

/**
 * Maximum source cards included per prompt.
 * Keeps prompts within a reasonable LLM context-window budget.
 * Both formatSourceCards and the module file list use this same limit
 * so the two sections stay proportional.
 */
const MAX_SOURCE_CARDS = 50;

/**
 * Maximum documentation cards included per prompt.
 * Doc cards tend to be longer; a smaller cap reduces noise.
 */
const MAX_DOC_CARDS = 20;

// ── Helpers ────────────────────────────────────────────────────────────────

function formatSourceCards(cards: SourceCardContext[]): string {
  if (!cards.length) return '(none)';
  return cards
    .slice(0, MAX_SOURCE_CARDS)
    .map((card) => {
      const parts: string[] = [`- ${card.path} [${card.language}, ${card.category}]`];
      if (card.symbols?.length) {
        parts.push(`  symbols: ${card.symbols.slice(0, 10).join(', ')}`);
      }
      if (card.imports?.length) {
        parts.push(`  imports: ${card.imports.slice(0, 5).join(', ')}`);
      }
      if (card.reasons?.length) {
        parts.push(`  reasons: ${card.reasons.join(', ')}`);
      }
      if (card.runtime_hints?.length) {
        parts.push(`  runtime hints: ${card.runtime_hints.join(', ')}`);
      }
      if (card.environment_variables?.length) {
        parts.push(`  env vars: ${card.environment_variables.join(', ')}`);
      }
      if (card.routes?.length) {
        parts.push(`  routes: ${card.routes.slice(0, 5).map(formatRoute).join('; ')}`);
      }
      if (card.models?.length) {
        parts.push(`  models: ${card.models.slice(0, 5).map(formatModel).join('; ')}`);
      }
      if (card.migrations?.length) {
        parts.push(`  migrations: ${card.migrations.slice(0, 5).map(formatMigration).join('; ')}`);
      }
      if (card.excerpt) {
        parts.push(`  excerpt: ${card.excerpt}`);
      }
      return parts.join('\n');
    })
    .join('\n');
}

function formatRoute(route: RouteContext): string {
  const methodPrefix = route.methods?.length ? `${route.methods.join('|')} ` : '';
  const pathPart = route.path || '(unknown path)';
  const details = [route.framework, route.kind, route.handler ? `handler=${route.handler}` : ''].filter(Boolean).join(', ');
  return details ? `${methodPrefix}${pathPart} (${details})` : `${methodPrefix}${pathPart}`;
}

function formatModel(model: ModelContext): string {
  const name = model.name || '(unknown model)';
  const details = [model.kind, model.framework].filter(Boolean).join(', ');
  return details ? `${name} (${details})` : name;
}

function formatMigration(migration: MigrationContext): string {
  const label = [migration.id, migration.name].filter(Boolean).join(' ') || '(unknown migration)';
  return migration.kind ? `${label} (${migration.kind})` : label;
}

function formatDocCards(cards: DocCardContext[]): string {
  if (!cards.length) return '(none)';
  return cards
    .slice(0, MAX_DOC_CARDS)
    .map((card) => {
      const parts: string[] = [`- ${card.path} [${card.status}]`];
      if (card.claims?.length) {
        parts.push(`  claims: ${card.claims.slice(0, 3).join('; ')}`);
      }
      if (card.excerpt) {
        parts.push(`  excerpt: ${card.excerpt}`);
      }
      return parts.join('\n');
    })
    .join('\n');
}

function existingContentBlock(existingContent?: string): string {
  if (!existingContent) return 'No existing wiki content (bootstrap mode).';
  const fence = markdownFenceFor(existingContent);
  return `Existing wiki content to update:\n${fence}\n${existingContent}\n${fence}`;
}

function markdownFenceFor(content: string): string {
  const longestTildeRun = Math.max(0, ...Array.from(content.matchAll(/~+/g), (match) => match[0].length));
  return '~'.repeat(Math.max(4, longestTildeRun + 1));
}

function assertUnreachable(value: never): never {
  throw new Error(`Unsupported page archetype: ${String(value)}`);
}

// ── Archetype template builders ────────────────────────────────────────────

/**
 * Architecture page: dedicated archetype for `Architecture.md`.
 * Uses a richer system prompt and an outline with Mermaid diagram guidance.
 */
export function buildArchitecturePrompt(context: PromptContext): BuiltPrompt {
  const ARCHITECTURE_SYSTEM_PROMPT = `${BASE_SYSTEM_PROMPT}

Architecture synthesis rules:
- Include Mermaid diagrams only when source cards, CI/config evidence, or verified repository structure directly support the relationship shown.
- If a diagram is inferred from structure rather than directly verified source evidence, label that limitation explicitly.
- Do not invent unsupported relationships or architectural layers just to fill a diagram.
- Prefer fewer accurate diagrams over many speculative ones.
- Put uncertain or missing evidence into the Caveats and Open Questions section.
- Suggested Mermaid diagram types (use only when evidence supports them):
  - flowchart: system/context diagram for repository boundaries and external surfaces
  - flowchart or graph: component/module diagram for major internal modules and relationships
  - flowchart: build/test/deploy flow diagram when package scripts, CI workflows, or deployment config exist
  - sequenceDiagram: only when source evidence supports a concrete interaction sequence`;

  return {
    system: ARCHITECTURE_SYSTEM_PROMPT,
    user: `Generate the Architecture wiki page for this repository.

Repository:
- Remote: ${context.repoRemote ?? 'unknown'}
- Commit: ${context.repoCommit ?? 'unknown'}
- Page name: ${context.pageName}

Source cards (${context.sourceCards.length} files):
${formatSourceCards(context.sourceCards)}

Documentation cards:
${formatDocCards(context.docCards ?? [])}

${existingContentBlock(context.existingContent)}

Generate a complete Architecture wiki page with the following output contract:
- Output only the raw markdown page; do not wrap it in a markdown fence or code block.
- The first line must be exactly \`---\`.
- The YAML frontmatter must include: source_repo, source_commit, compiled_at, kind: "architecture", page_state, source_paths, confidence, and claim_status.
- source_paths must be a non-empty array drawn only from the Source cards listed above.
- Use conservative confidence and claim status metadata that matches the evidence provided.
- End with this exact human notes block:
  <!-- HUMAN_NOTES_START -->
  <!-- HUMAN_NOTES_END -->

Required sections (use these headings exactly):
1. ## Executive Architecture Summary
   - A concise overview of the repository's purpose, major subsystems, and key design decisions grounded in source evidence.
2. ## System and Repository Context
   - Repository structure, external surfaces, and repository boundaries (e.g. entry points, public APIs, external dependencies).
   - Include a \`flowchart\` context diagram when source evidence supports repository boundaries and external surfaces.
3. ## Major Modules and Responsibilities
   - One subsection per logical module/grouping derived from source cards and plan modules.
   - Include a component/module diagram (\`flowchart\` or \`graph\`) when source structure supports module relationships.
4. ## Runtime, Data, and Control-Flow Relationships
   - How modules interact at runtime: data flow, dependency chains, control paths.
   - Include dependency or control-flow diagrams only when scanner/import/runtime evidence supports the relationship.
5. ## Build, Test, Deployment, and Operational Surfaces
   - Package scripts, CI workflows, deployment configuration, operational entry points.
   - Include a build/test/deploy flow diagram when package scripts or CI workflows exist.
6. ## Cross-Cutting Concerns
   - Configuration, security, APIs, data models, documentation trust, and other shared concerns.
7. ## Caveats and Open Questions
   - Source-grounded caveats, uncertainty, and open questions.
   - If a diagram or claim is inferred from structure rather than directly verified, document that limitation here.`,
  };
}

/**
 * Foundation pages: Home, Build-Test-and-Run, Agent-Context-Pack, etc.
 * These are repo-wide summary pages derived from the full source inventory.
 */
export function buildFoundationPrompt(context: PromptContext): BuiltPrompt {
  return {
    system: BASE_SYSTEM_PROMPT,
    user: `Generate the "${context.pageTitle}" foundation wiki page for this repository.

Repository:
- Remote: ${context.repoRemote ?? 'unknown'}
- Commit: ${context.repoCommit ?? 'unknown'}
- Page name: ${context.pageName}

Source cards (${context.sourceCards.length} files):
${formatSourceCards(context.sourceCards)}

Documentation cards:
${formatDocCards(context.docCards ?? [])}

${existingContentBlock(context.existingContent)}

Generate a complete "${context.pageTitle}" wiki page that:
- Summarises the repository from source evidence
- References specific source paths for every material claim
- Includes all sections required for a foundation page of this type
- Is accurate, source-grounded, and useful to both humans and coding agents`,
  };
}

/**
 * Module pages: one page per logical code grouping.
 * Grounded in the source cards for the module's files.
 */
export function buildModulePrompt(context: PromptContext): BuiltPrompt {
  const mod = context.moduleInfo;
  const docsOnlyInstructions = context.docsOnlyModule ? `

Docs-only evidence constraint:
- Every module source path is markdown/documentation, so these paths are secondary documentation evidence, not authoritative source evidence.
- The page body must explicitly state that markdown documentation is secondary evidence and that operational/current-behavior claims must be validated against source code, tests, CI workflows, runtime configuration, or schemas.
- Use conservative metadata: claim_status: "review-needed" and confidence: "low" (or at most "medium" if the page is purely descriptive of documentation contents).
- Do not use claim_status: "source-grounded" or confidence: "high" for a docs-only module.
- Prefer describing what the documentation says, plus validation gaps, over asserting current runtime behavior.` : '';
  return {
    system: BASE_SYSTEM_PROMPT,
    user: `Generate a module wiki page for: ${mod?.name ?? context.pageTitle}

Module info:
- Files: ${mod?.files.length ?? 0}
- Categories: ${Object.keys(mod?.categories ?? {}).join(', ') || 'unknown'}
- Languages: ${Object.keys(mod?.languages ?? {}).join(', ') || 'unknown'}
- Reasons: ${mod?.important_reasons?.join(', ') || 'none'}

Source files in this module:
${mod?.files.slice(0, MAX_SOURCE_CARDS).map((f) => `- ${f}`).join('\n') || '(none)'}

Source cards:
${formatSourceCards(context.sourceCards)}

Documentation cards:
${formatDocCards(context.docCards ?? [])}

${existingContentBlock(context.existingContent)}

Generate a complete module wiki page with the following constraints:
- Output only the raw markdown page; do not wrap it in a markdown fence or code block.
- The first line must be exactly \`---\`.
- The YAML frontmatter must include: source_repo, source_commit, compiled_at, kind: "module", page_state, source_paths, confidence, and claim_status.
- source_paths must be a non-empty array drawn only from the Source files in this module and Source cards listed above.
- Minimal frontmatter skeleton:
  ---
  source_repo: "<repository remote or unknown>"
  source_commit: "<commit sha>"
  compiled_at: "<ISO-8601 timestamp>"
  kind: "module"
  page_state: "generated"
  source_paths:
    - "<module source path>"
  confidence: "medium"
  claim_status: "source-grounded"
  ---
- Use conservative confidence and claim status metadata that matches the evidence provided.${docsOnlyInstructions}
- Include the following sections:
  - Purpose (grounded in source cards, not speculation)
  - Source file list
  - Key symbols and entry points
  - Dependencies and imports
  - Related tests
  - Known gaps or open questions
- End with this exact human notes block:
  <!-- HUMAN_NOTES_START -->
  <!-- HUMAN_NOTES_END -->`,
  };
}

/**
 * Cross-cutting pages: Dependency-Map, Testing-Strategy, Security-and-Secrets, etc.
 * These aggregate information from multiple modules.
 */
export function buildCrossCuttingPrompt(context: PromptContext): BuiltPrompt {
  return {
    system: BASE_SYSTEM_PROMPT,
    user: `Generate the "${context.pageTitle}" cross-cutting wiki page.

Repository:
- Remote: ${context.repoRemote ?? 'unknown'}
- Commit: ${context.repoCommit ?? 'unknown'}
- Page name: ${context.pageName}

Source cards (${context.sourceCards.length} files):
${formatSourceCards(context.sourceCards)}

Documentation cards:
${formatDocCards(context.docCards ?? [])}

${existingContentBlock(context.existingContent)}

Generate a complete "${context.pageTitle}" cross-cutting wiki page that:
- Is grounded in source evidence across all modules
- References specific source paths for every material claim
- Includes relevant tables and summaries
- Does not duplicate information already on individual module pages`,
  };
}

// ── Public entry point ─────────────────────────────────────────────────────

/**
 * Build a prompt for the given page archetype and context.
 *
 * @param archetype - Page archetype ('foundation' | 'module' | 'cross-cutting')
 * @param context   - Assembled context for this page
 * @returns { system, user } prompt pair ready for an LLM provider
 */
export function buildPrompt(archetype: PageArchetype, context: PromptContext): BuiltPrompt {
  switch (archetype) {
    case 'architecture':
      return buildArchitecturePrompt(context);
    case 'foundation':
      return buildFoundationPrompt(context);
    case 'module':
      return buildModulePrompt(context);
    case 'cross-cutting':
      return buildCrossCuttingPrompt(context);
    default:
      return assertUnreachable(archetype);
  }
}
