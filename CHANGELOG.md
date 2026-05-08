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

### Changed
- Node.js engine requirement raised to `>=24`; removed unsafe incremental cache from scanner
- CI switched to Node 24
- Update build, CI, and release automation to support the change.
- Clarify repository guidance and review workflow expectations.
- Expand automated test coverage for the updated behavior.
- Update the main repository implementation to match the pull request scope.
