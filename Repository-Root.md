---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "9897e5b449323bf6db3eac895995c3e384690a41"
page_state: "generated"
source_paths: [".devloops",".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-15T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

This module represents the root of the repository and contains the foundational files and configurations that define the project structure, build, testing, documentation, and continuous integration workflows. It includes source code entry points, package manifests, environment configuration examples, documentation, changelogs, license, and scripts essential for repository maintenance and operation.

The module serves multiple roles:

- **Source**: Core scripts and configuration files that drive the repository's CLI, build, and update processes.
- **Configuration**: Environment variable templates and build metadata files.
- **Documentation**: Markdown files describing agents, prompts, changelogs, and usage instructions.
- **Package Management**: `package.json` and `package-lock.json` files managing dependencies and package metadata.
- **Testing**: A comprehensive suite of tests covering CLI, compiler, context assembly, documentation linting, dotenv handling, extractors, and repository analysis.
- **Continuous Integration and Infrastructure**: Workflow definitions and deployment scripts within test fixtures to simulate real-world CI and infra scenarios.

## Source File List

- `.devloops`
- `.env.example`
- `.gitignore`
- `.llmwiki/schema.md`
- `.pi/AGENTS.md`
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
- **test/compiler.test.ts**: Defines key test symbols like `assertNoWallClockFields`, `buildArchManifest`, and `createPlan` that validate the compiler and API surface.
- **test/cli.test.ts**: Provides CLI testing utilities including `captureCli` and `execFileAsync`.
- **test/compiler-eval.test.ts**: Includes fixtures and assertions for compiler evaluation and frontmatter parsing.
- **test/docs-linter.test.ts**: Tests documentation linting and validation with HTTP route handlers.
- **test/dotenv.test.ts**: Tests environment variable loading and restoration.
- Various test files provide coverage for extractors, context assembly, linter, page ownership, publisher, repository analysis, scanning, searching, and wiki graph functionality.

## Dependencies and Imports

- Node.js built-in modules such as `child_process`, `fs/promises`, `path`, `util`, `assert/strict`, `os`, `test`, and `url` are used across scripts and tests.
- Internal imports from `../src/` directory for core logic including CLI, compiler, linter, LLM provider, page ownership, docs ingestor, docs linter, docs validation, context assembler, and utils.
- The package manifests (`package.json` and `package-lock.json`) manage external dependencies required by the repository.

## Related Tests

This module includes extensive test coverage to ensure correctness and stability:

- CLI tests (`test/cli.test.ts`)
- Compiler and evaluation tests (`test/compiler.test.ts`, `test/compiler-eval.test.ts`)
- Context assembler tests (`test/context-assembler.test.ts`)
- Documentation linter and validation tests (`test/docs-linter.test.ts`)
- Environment variable handling tests (`test/dotenv.test.ts`)
- Extractor tests for Go, Rust, and utilities (`test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`)
- Frontmatter, linter, LLM provider, page ownership, publisher, repository analysis, scanning, searching, changelog update, and wiki graph tests.

Additionally, fixture repositories under `test/fixtures/compiler-e2e/` simulate real-world repository structures and CI workflows for end-to-end testing.

## Known Gaps or Open Questions

- The exact repository remote URL and commit SHA are unknown, limiting traceability to a specific source version.
- No explicit documentation cards exist for this module beyond the source markdown files.
- Some source files like `.devloops` and `.tsbuildinfo` have minimal metadata and unclear runtime roles.
- The relationship and integration details between the CLI, compiler, and LLM provider components could be further elaborated.
- The environment variables listed in `.env.example` suggest external dependencies (e.g., GitHub tokens, LLM API keys) that require secure management and documentation.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
