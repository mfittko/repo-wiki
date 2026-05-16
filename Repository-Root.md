---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "c5432024529f5133bed4df4fd18ec2b67d908b7e"
page_state: "generated"
source_paths: [".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-15T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

This module represents the root directory of the repository, encompassing a broad collection of files that define the project's configuration, source code entry points, documentation, package manifests, continuous integration (CI) workflows, infrastructure scripts, and tests. It serves as the foundational layer for the repository's structure and operational setup.

Key purposes include:

- **Configuration**: Environment variable templates (`.env.example`), project settings (`.pi/settings.json`), and ignore rules (`.gitignore`).
- **Source Code Entry Points**: The CLI bootstrap script (`bin/repo-wiki.ts`) and JavaScript/TypeScript source files.
- **Documentation**: Core documentation files such as `README.md`, `CHANGELOG.md`, `AGENTS.md`, and prompt templates.
- **Package Management**: `package.json` and `package-lock.json` for dependency and package manifest management.
- **CI and Infrastructure**: Workflow definitions and deployment scripts located in test fixtures and infra directories.
- **Testing**: A comprehensive suite of tests covering CLI, compiler, context assembly, linting, dotenv utilities, extractors, and repository analysis.

This module is critical for the repository's API surface, CI pipeline, configuration management, data modeling, ORM models, packaging, documentation, infrastructure, and testing.

## Source File List

- `.env.example`
- `.gitignore`
- `.llmwiki/schema.md`
- `.pi/AGENTS.md`
- `.pi/settings.json`
- `.tsbuildinfo`
- `AGENTS.md`
- `CHANGELOG.md`
- `LICENSE`
- `README.md`
- `bin/repo-wiki.ts`
- `package-lock.json`
- `package.json`
- `prompts/compiler.md`
- `prompts/lint.md`
- `prompts/page-templates.md`
- `scripts/update-changelog.mjs`
- `skills/repo-wiki-cli/SKILL.md`
- `test/cli.test.ts`
- `test/compiler-eval.test.ts`
- `test/compiler.test.ts`
- `test/context-assembler.test.ts`
- `test/docs-linter.test.ts`
- `test/dotenv.test.ts`
- `test/extractors-go.test.ts`
- `test/extractors-rust.test.ts`
- `test/extractors-utils.test.ts`
- `test/fixtures/compiler-e2e/basic-node-service/repo/.github/workflows/ci.yml`
- `test/fixtures/compiler-e2e/basic-node-service/repo/infra/deploy.js`
- `test/fixtures/compiler-e2e/basic-node-service/repo/package-lock.json`
- `test/fixtures/compiler-e2e/basic-node-service/repo/package.json`
- `test/fixtures/compiler-e2e/basic-node-service/repo/packages/core/health.js`
- `test/fixtures/compiler-e2e/basic-node-service/repo/services/api/routes.js`
- `test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js`
- `test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js`
- `test/fixtures/compiler-e2e/docs-only-module-downgrade/repo/README.md`
- `test/fixtures/compiler-e2e/docs-only-module-downgrade/repo/docs/operations.md`
- `test/fixtures/compiler-e2e/docs-only-module-downgrade/repo/package.json`
- `test/frontmatter.test.ts`
- `test/init-planner.test.ts`
- `test/linter.test.ts`
- `test/llm-provider.test.ts`
- `test/page-ownership.test.ts`
- `test/publisher.test.ts`
- `test/repository-analysis.test.ts`
- `test/run-compiled-tests.ts`
- `test/scanner.test.ts`
- `test/search.test.ts`
- `test/update-changelog.test.ts`
- `test/wiki-graph.test.ts`

## Key Symbols and Entry Points

- **bin/repo-wiki.ts**: The main CLI entry point script importing from `../src/cli.js`.
- **scripts/update-changelog.mjs**: Contains functions and constants for changelog management such as `appendEntry`, `classifyPrimaryCategory`, and `emitOrWriteChangelog`.
- **test/compiler.test.ts**: Exposes test symbols like `assertNoWallClockFields`, `buildArchManifest`, and `createLLMPlan` that validate the compiler API surface and configuration.
- **test/cli.test.ts**: Provides CLI testing utilities including `captureCli` and `execFileAsync`.
- **test/compiler-eval.test.ts**: Includes symbols for fixture setup and evaluation such as `assertAllPathsGrounded` and `runFixturePipeline`.
- **test/context-assembler.test.ts**: Defines `createFixture` for context assembly testing.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules from `../src/` such as `compiler.js`, `llm-provider.js`, `planner.js`, `scanner.js`, `linter.js`, `docs-ingestor.js`, `docs-linter.js`, `docs-validation.js`, `page-ownership.js`, and utilities like `dotenv.js`.
- Test files also import Node.js standard libraries including `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, `url`, and `util`.

## Related Tests

The module includes extensive test coverage across multiple aspects:

- CLI functionality (`test/cli.test.ts`)
- Compiler evaluation and API surface (`test/compiler-eval.test.ts`, `test/compiler.test.ts`)
- Context assembly (`test/context-assembler.test.ts`)
- Documentation linting and validation (`test/docs-linter.test.ts`)
- Environment variable handling (`test/dotenv.test.ts`)
- Extractors for Go, Rust, and utilities (`test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`)
- Frontmatter parsing (`test/frontmatter.test.ts`)
- Initialization planning (`test/init-planner.test.ts`)
- Linter tests (`test/linter.test.ts`)
- LLM provider integration (`test/llm-provider.test.ts`)
- Page ownership logic (`test/page-ownership.test.ts`)
- Publishing workflows (`test/publisher.test.ts`)
- Repository analysis (`test/repository-analysis.test.ts`)
- Scanner and search functionality (`test/scanner.test.ts`, `test/search.test.ts`)
- Changelog update automation (`test/update-changelog.test.ts`)
- Wiki graph structure (`test/wiki-graph.test.ts`)

Additionally, fixture repositories under `test/fixtures/compiler-e2e/` provide integration test scenarios for both basic node services and docs-only modules.

## Known Gaps or Open Questions

- The exact repository remote URL and commit SHA are unknown, limiting traceability.
- No explicit documentation cards or detailed module-level documentation exist beyond source file README and markdown files.
- The `.tsbuildinfo` file is noted as background work but its role in build optimization or incremental compilation is not detailed.
- The relationship and integration between the `.pi` directory files and the main source code are not fully described.
- The runtime environment variables referenced in `.env.example` and tests suggest external dependencies and configuration that require further elaboration for full context.
- The module spans multiple categories and languages, indicating a complex structure that may benefit from further modularization
