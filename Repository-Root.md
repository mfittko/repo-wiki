---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "171111a1609e1e510e20bfa1989ecfcee1993eb2"
page_state: "generated"
source_paths: [".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-15T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level directory of the project repository. It contains a diverse set of files and directories that collectively define the project's source code, configuration, documentation, package metadata, testing infrastructure, and continuous integration setup. This module serves as the foundational context for the entire repository, providing essential configuration files (e.g., `.env.example`, `.gitignore`, `package.json`), documentation (e.g., `README.md`, `CHANGELOG.md`, `AGENTS.md`), source entry points (e.g., `bin/repo-wiki.ts`), and test suites that validate the project's functionality and integration.

The module supports multiple concerns including API surface definition, CI workflows, configuration management, data modeling, ORM models, packaging, and documentation. It also includes scripts and prompts that assist in development and maintenance tasks such as changelog updates and linting.

## Source File List

- `.env.example` (configuration, environment variables)
- `.gitignore` (source control ignore rules)
- `.llmwiki/schema.md` (data model documentation)
- `.pi/AGENTS.md` (project-specific documentation)
- `.pi/settings.json` (configuration settings)
- `.tsbuildinfo` (TypeScript incremental build info)
- `AGENTS.md` (documentation)
- `CHANGELOG.md` (project changelog)
- `LICENSE` (license text)
- `README.md` (project overview and readme)
- `bin/repo-wiki.ts` (CLI entry point script)
- `package-lock.json` (package lock metadata)
- `package.json` (package manifest and metadata)
- `prompts/compiler.md` (compiler prompt documentation)
- `prompts/lint.md` (linting prompt documentation)
- `prompts/page-templates.md` (page template prompts)
- `scripts/update-changelog.mjs` (changelog update script)
- `skills/repo-wiki-cli/SKILL.md` (skill documentation)
- `test/cli.test.ts` (CLI tests)
- `test/compiler-eval.test.ts` (compiler evaluation tests)
- `test/compiler.test.ts` (compiler tests)
- `test/context-assembler.test.ts` (context assembler tests)
- `test/docs-linter.test.ts` (documentation linter tests)
- `test/dotenv.test.ts` (dotenv configuration tests)
- `test/extractors-go.test.ts` (Go extractor tests)
- `test/extractors-rust.test.ts` (Rust extractor tests)
- `test/extractors-utils.test.ts` (extractor utilities tests)
- `test/fixtures/compiler-e2e/basic-node-service/repo/.github/workflows/ci.yml` (CI workflow fixture)
- `test/fixtures/compiler-e2e/basic-node-service/repo/infra/deploy.js` (deployment infra fixture)
- `test/fixtures/compiler-e2e/basic-node-service/repo/package-lock.json` (fixture package lock)
- `test/fixtures/compiler-e2e/basic-node-service/repo/package.json` (fixture package manifest)
- `test/fixtures/compiler-e2e/basic-node-service/repo/packages/core/health.js` (fixture core health check)
- `test/fixtures/compiler-e2e/basic-node-service/repo/services/api/routes.js` (fixture API routes)
- `test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js` (fixture API server)
- `test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js` (fixture API server tests)
- `test/fixtures/compiler-e2e/docs-only-module-downgrade/repo/README.md` (docs-only fixture readme)
- `test/fixtures/compiler-e2e/docs-only-module-downgrade/repo/docs/operations.md` (docs-only fixture operations)
- `test/fixtures/compiler-e2e/docs-only-module-downgrade/repo/package.json` (docs-only fixture package manifest)
- `test/frontmatter.test.ts` (frontmatter parsing tests)
- `test/init-planner.test.ts` (initial planner tests)
- `test/linter.test.ts` (linter tests)
- `test/llm-provider.test.ts` (LLM provider tests)
- `test/page-ownership.test.ts` (page ownership tests)
- `test/publisher.test.ts` (publisher tests)
- `test/repository-analysis.test.ts` (repository analysis tests)
- `test/run-compiled-tests.ts` (test runner for compiled tests)
- `test/scanner.test.ts` (scanner tests)
- `test/update-changelog.test.ts` (changelog update tests)
- `test/wiki-patch.test.ts` (wiki patch tests)
- `tsconfig.json` (TypeScript configuration)

## Key Symbols and Entry Points

- `bin/repo-wiki.ts`: CLI entry point script importing `../src/cli.js`.
- `scripts/update-changelog.mjs`: Contains key functions and constants such as `CATEGORY_ORDER`, `CHANGELOG_PATH`, `appendEntry`, `classifyPrimaryCategory`, and `emitOrWriteChangelog` for managing changelog updates.
- Test files expose various test suites and helper functions, e.g., `captureCli`, `assertNoWallClockFields`, `createFixture`, `restoreEnv`.
- Source files include configuration and environment variable definitions, e.g., `.env.example` defines environment variables like `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `LLMWIKI_COMPILER_MODE`, and `LLMWIKI_LLM_API_KEY`.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js core modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules such as `../src/compiler.js`, `../src/llm-provider.js`, `../src/planner.js`, `../src/scanner.js`, `../src/linter.js`, `../src/docs-ingestor.js`, `../src/docs-linter.js`, `../src/docs-validation.js`, `../src/context-assembler.js`, `../src/utils/dotenv.js`, and `../src/page-ownership.js`.
- Test files also import Node.js built-in modules like `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, and `url`.

## Related Tests

The module includes extensive test coverage across multiple aspects:

- CLI functionality (`test/cli.test.ts`)
- Compiler behavior and evaluation (`test/compiler.test.ts`, `test/compiler-eval.test.ts`)
- Context assembly (`test/context-assembler.test.ts`)
- Documentation linting and validation (`test/docs-linter.test.ts`)
- Environment variable and dotenv handling (`test/dotenv.test.ts`)
- Extractor utilities for Go, Rust, and general utilities (`test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`)
- Frontmatter parsing (`test/frontmatter.test.ts`)
- Planning and initialization (`test/init-planner.test.ts`)
- Linter tests (`test/linter.test.ts`)
- LLM provider integration (`test/llm-provider.test.ts`)
- Page ownership and repository analysis (`test/page-ownership.test.ts`, `test/repository-analysis.test.ts`)
- Publishing and wiki patching (`test/publisher.test.ts`, `test/wiki-patch.test.ts`)
- Changelog update logic (`test/update-changelog.test.ts`)
- Scanner functionality (`test/sc
