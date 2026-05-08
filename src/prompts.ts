/**
 * Prompt template structure for LLM-backed wiki synthesis.
 *
 * Three page archetypes map to distinct templates:
 *   - foundation   : repo-wide pages (Home, Architecture, Build-Test-and-Run, …)
 *   - module       : per-module pages derived from grouped source cards
 *   - cross-cutting: shared-concern pages (Dependency-Map, Testing-Strategy, …)
 */

export type PageArchetype = 'foundation' | 'module' | 'cross-cutting';

// ── Context shapes ─────────────────────────────────────────────────────────

export interface SourceCardContext {
  path: string;
  category: string;
  language: string;
  symbols?: string[];
  imports?: string[];
  reasons?: string[];
}

export interface DocCardContext {
  path: string;
  status: string;
  claims?: string[];
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
- Produce valid GitHub-flavored Markdown.
- Include a YAML frontmatter block with at minimum: source_commit, compiled_at, kind, source_paths.
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
      return parts.join('\n');
    })
    .join('\n');
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
 * Foundation pages: Home, Architecture, Build-Test-and-Run, Agent-Context-Pack, etc.
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

Generate a complete module wiki page with the following sections:
- Purpose (grounded in source cards, not speculation)
- Source file list
- Key symbols and entry points
- Dependencies and imports
- Related tests
- Known gaps or open questions
- Human notes block (<!-- HUMAN_NOTES_START --> … <!-- HUMAN_NOTES_END -->)`,
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
