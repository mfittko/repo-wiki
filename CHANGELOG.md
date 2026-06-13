# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.4] - 2026-06-13

### Fixed
- Add `repository` field to `package.json` so npm provenance validation passes during publish.

## [0.2.3] - 2026-06-13

### Changed
- Switch npm publish to OIDC trusted publisher.
- Update build, CI, and release automation to support the change.

### Fixed
- Remove explicit `NODE_AUTH_TOKEN` from publish workflow so npm Trusted Publisher OIDC authentication works.

## [0.2.2] - 2026-06-13

### Changed
- Update build, CI, and release automation to support the change.

### Fixed
- Fix `package.json` bin path to use a relative path without leading `./`, preventing npm from stripping the CLI bin entry during publish.
- Fix npm bin path and bump to 0.2.2.

## [0.2.1] - 2026-06-13

### Changed
- Publish package as `@mfittko/repo-wiki` to resolve npm name-squatting conflict with `repowiki`
- Publish as @mfittko/repo-wiki.
- Update build, CI, and release automation to support the change.

## [0.2.0] - 2026-06-13

### Added
- Add GitHub Actions npm publish workflow and configure package for public npm release
- **Scanner analysis foundation** — new `src/extractors.ts` module with `extractImports`, `extractSymbols`, `extractExportedSymbols`, `extractEnvironmentVariables`, `extractRouteSurfaces`, and `detectRuntimeHints`; framework detection covers Express, Fastify, Hono, and Next.js route-handler files
- **Repository analysis** — `src/repository-analysis.ts` with `buildRepositoryAnalysis` (dependency graph, test-to-source mapping) and `extractPackageMetadata` (package name and scripts); integrated into the scanner manifest under an `analysis` key
- **TypeScript migration** — all files under `src/`, `test/`, and `bin/` converted from `.js` to `.ts`; `tsconfig.json` added with strict-off baseline configuration
- **GitHub Actions CI** — workflow with build, test, coverage (95 % line gate via `c8`), and `pack --dry-run` steps; CI targets Node 24
- **Agent instruction files** — coordinator, developer, quality, docs, review, and fixer agents added under `.github/agents/`
- **PR template and Copilot review instructions** — `.github/pull_request_template.md` and Copilot review configuration added
- **Changelog automation** — `scripts/update-changelog.mjs` with `npm run changelog:update` and `npm run changelog:release` commands
- **Compiler wiki pages** — dependency map, configuration, HTTP routes, and testing-strategy pages rendered from scanner analysis output
- Build scanner analysis foundation, TypeScript migration, and CI enforcement.
- Add repo guidance and simplify agent names.
- add issue task template and backlog note.
- Add AST-backed TypeScript/JavaScript symbol extraction in scanner.
- add Go source extraction support.
- Add deterministic migration and ORM/model detection with data-model wiki routing.
- Add deterministic Python source extraction support with docstring-safe parsing.
- Add affected-page graph inputs for incremental mode.
- Add deterministic Rust scanner extraction for imports, re-exports, and top-level items.
- Add deterministic Ruby source extraction with robust scope/heredoc handling.
- Add provenance-safe line-anchored GitHub citations for package scripts and CI commands with safe multiline backslash handling and command redaction.
- Add docs-debt strictness and markdown route/API validation with wildcard method matching, source evidence, and conservative path normalization.
- Add provenance frontmatter rendering for published wiki pages.
- Add navigation layout for GitHub Pages wiki export.
- Add ADR recency and supersession validation.
- Add copilot-cycle shortcut to coordinator agent.
- Add deterministic graph-health lint findings from `graph.json`.
- Add internal wiki graph traversal helpers.
- Add local offline search index and `repo-wiki search`.
- Phase 1 graph foundation: stabilize `.llmwiki/graph.json` contract and internal traversal surface.
- Add graph traversal convenience helpers.
- Add wiki-first query, path, and explain commands.

### Changed
- Node.js engine requirement raised to `>=24`; removed unsafe incremental cache from scanner
- CI switched to Node 24
- Update build, CI, and release automation to support the change.
- Clarify repository guidance and review workflow expectations.
- Expand automated test coverage for the updated behavior.
- Update the main repository implementation to match the pull request scope.
- map tests to source modules — E2E coverage gaps + Related tests in module pages.
- LLM provider boundary and prompt templates.
- validate documented commands against package.json and CI workflows.
- human section preservation and page ownership metadata.
- Honor scanner source excludes and suppress nested worktree/repo noise.
- Validate documented paths and environment variables.
- Polish GitHub Wiki publishing output and automation.
- Update roadmap for LLM Wiki publish targets and skills.
- structured wiki patch format and lint-gated acceptance.
- Enforce provenance linting and confidence/claim-status metadata for generated wiki pages.
- Wire LLM compiler mode into compileWiki (module archetype, phased rollout).
- LLM-enhance Architecture page with dedicated archetype, prompt, and per-archetype budget overrides.
- Omit temperature for GPT-5 chat compatibility.
- Tune architecture LLM timeout and reasoning.
- Tighten repo-local reading guidance.
- Gate Architecture.md regeneration and patch deterministic architecture sections.
- Emit a deterministic wiki graph skeleton to `.llmwiki/graph.json`.
- Enrich `.llmwiki/graph.json` with deterministic `page_state`, `wiki_link`, and `provenance` data.
- Use `.llmwiki/graph.json` for deterministic incremental affected-page selection with safe attribution fallback.
- Define artifact-based consumer contract for runnable downstream repo-wiki CLI.
- Publish repo-wiki to npm on release.

### Fixed
- Complete deterministic scanner coverage for NestJS, Koa, tRPC, GraphQL, and OpenAPI API surfaces (including GraphQL field-config resolver mapping).
- Fix Ruby quoted heredocs and inline end counting.
- Add explicit GitHub Pages publish target with destination-specific frontmatter defaults and remote-error redaction hardening.
- Apply plan review findings: 6 new plan docs, P5 drift fix, debt-report linter fixes.
- use html links in github-pages navigation.
- Gate `repo-wiki run` on docs/wiki lint errors and block publish on lint failures.
- address unresolved review comments from #108.

### Security
- Fix Ruby extractor heredoc and end-token edge cases.
- Implement deterministic compiler context assembly with token budgeting.
- Handle GPT-5 token params in OpenAI-compatible provider.
