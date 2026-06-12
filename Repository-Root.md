---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a3ed30252c9bfb054e0b54fe5e6c52f8f0b8d703"
page_state: "generated"
source_paths: [".devloops",".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-10T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level directory of the project repository. It contains a diverse set of files and directories that collectively define the source code, documentation, configuration, package manifests, tests, continuous integration (CI) workflows, and infrastructure scripts. This module serves as the foundational structure for the entire project, organizing essential resources and enabling development, testing, packaging, and deployment workflows.

Key purposes include:

- **Source code and CLI entry points:** Contains executable scripts such as `bin/repo-wiki.ts` and source configuration files.
- **Documentation:** Includes markdown files like `README.md`, `CHANGELOG.md`, `AGENTS.md`, and prompt templates that document project usage, changelogs, and agent definitions.
- **Configuration and environment:** Holds environment example files (`.env.example`), `.gitignore`, and build metadata (`.tsbuildinfo`).
- **Package management:** Contains `package.json` and `package-lock.json` for Node.js package management.
- **CI and infrastructure:** Includes CI workflow definitions and deployment scripts under test fixtures.
- **Testing:** Provides a comprehensive suite of tests covering CLI, compiler, context assembly, documentation linting, dotenv utilities, and more, ensuring code quality and correctness.

This module is critical for maintaining the overall project structure, enabling development workflows, and supporting automation and testing.

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

- **bin/repo-wiki.ts**: CLI entry point script importing core CLI logic.
- **scripts/update-changelog.mjs**: Script managing changelog updates with symbols like `appendEntry`, `classifyPrimaryCategory`, and `detectChangedAreas`.
- **test/cli.test.ts**: Provides CLI testing utilities such as `captureCli` and `captureCliResult`.
- **test/compiler.test.ts**: Contains test symbols like `assertNoWallClockFields`, `buildArchManifest`, and `createPlan` for compiler validation.
- **test/compiler-eval.test.ts**: Includes fixtures and utilities for evaluating compiler behavior.
- **test/context-assembler.test.ts**: Exposes `createFixture` for context assembly testing.
- **test/docs-linter.test.ts**: Tests documentation linting and validation.
- **test/dotenv.test.ts**: Tests environment variable loading and restoration.
- **prompts/**: Markdown files defining prompt templates for compiler, linting, and page generation.
- **skills/repo-wiki-cli/SKILL.md**: Documentation for CLI skill usage.

## Dependencies and Imports

- Node.js built-in modules such as `child_process`, `fs/promises`, `path`, `util`, `assert/strict`, `os`, `test`, and `url` are used across scripts and tests.
- Internal imports within the source code include modules like `../src/cli.js`, `../src/compiler.js`, `../src/llm-provider.js`, `../src/planner.js`, `../src/scanner.js`, `../src/utils/git.js`, `../src/linter.js`, `../src/page-ownership.js`, `../src/docs-ingestor.js`, `../src/docs-linter.js`, `../src/docs-validation.js`, and `../src/context-assembler.js`.
- Package management is handled via `package.json` and `package-lock.json`.
- Environment variables are referenced in `.env.example` and tested in `test/dotenv.test.ts`.

## Related Tests

The module includes extensive test coverage across multiple aspects:

- **CLI tests:** `test/cli.test.ts`
- **Compiler tests:** `test/compiler.test.ts`, `test/compiler-eval.test.ts`
- **Context assembly:** `test/context-assembler.test.ts`
- **Documentation linting:** `test/docs-linter.test.ts`
- **Environment variable handling:** `test/dotenv.test.ts`
- **Extractors for Go, Rust, and utilities:** `test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`
- **Frontmatter, linter, LLM provider, page ownership, publisher, repository analysis, scanning, searching, changelog updating, and wiki graph tests:** Various test files under `test/`

Additionally, fixture repositories under `test/fixtures/compiler-e2e/` provide end-to-end testing scenarios for both basic node services and docs-only modules.

## Known Gaps or Open Questions

- The source repository URL and commit SHA are unknown, limiting traceability to a specific codebase version.
- No explicit documentation cards or detailed module-level documentation exist beyond README and markdown files.
- The exact runtime environment and usage context for some scripts (e.g., `.tsbuildinfo` background work) are not fully described.
- The role and integration of `.devloops` and `.pi/AGENTS.md` files are not explicitly detailed.
- Some environment variables referenced in `.env.example` and tests may require further explanation for proper configuration.
- The relationship between the test fixtures and the main source code
