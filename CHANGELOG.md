# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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

### Fixed
- Complete deterministic scanner coverage for NestJS, Koa, tRPC, GraphQL, and OpenAPI API surfaces (including GraphQL field-config resolver mapping).
- Fix Ruby quoted heredocs and inline end counting.
- Add explicit GitHub Pages publish target with destination-specific frontmatter defaults and remote-error redaction hardening.
- Apply plan review findings: 6 new plan docs, P5 drift fix, debt-report linter fixes.
- use html links in github-pages navigation.

### Security
- Fix Ruby extractor heredoc and end-token edge cases.
- Implement deterministic compiler context assembly with token budgeting.
- Handle GPT-5 token params in OpenAI-compatible provider.
