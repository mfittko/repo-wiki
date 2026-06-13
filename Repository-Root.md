---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "f3abfc0fc6ecf916c2293708106a5018ea85180d"
page_state: "generated"
source_paths: [".devloops",".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-15T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level directory of the project repository. It contains a diverse set of files and directories that collectively define the source code, documentation, configuration, package manifests, tests, continuous integration (CI) workflows, and infrastructure scripts. This module serves as the foundational layer for the entire project, providing essential resources such as environment configuration, build metadata, licensing, changelogs, and CLI entry points.

Key purposes include:

- **Source code and CLI entry points:** Core scripts and binaries such as `bin/repo-wiki.ts` and various JavaScript/TypeScript source files.
- **Configuration and environment management:** Files like `.env.example` and `.gitignore` manage environment variables and version control exclusions.
- **Documentation:** Markdown files including `README.md`, `CHANGELOG.md`, `AGENTS.md`, and prompt templates provide user and developer guidance.
- **Package management:** `package.json` and `package-lock.json` define dependencies and package metadata.
- **Testing:** A comprehensive suite of test files under `test/` ensures code quality and correctness.
- **CI and infrastructure:** Workflow definitions and deployment scripts under `test/fixtures` and `scripts/` support automation and deployment.

This module is critical for orchestrating the build, test, documentation, and deployment lifecycle of the repository.

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
- `test/extension.test.ts`
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

## Key Symbols and Entry Points

- **`bin/repo-wiki.ts`**: The main CLI entry point script importing from `../src/cli.js`.
- **`scripts/update-changelog.mjs`**: Contains functions and constants for changelog management such as `appendEntry`, `classifyPrimaryCategory`, and `deriveChangelogEntries`.
- **Test suites**: Various test files export test helpers and assertions, e.g., `captureCli`, `assertAllPathsGrounded`, `createFixture`.
- **Package manifests**: `package.json` and `package-lock.json` define dependencies and scripts for the repository.
- **Documentation files**: `README.md`, `CHANGELOG.md`, and prompt markdown files provide user-facing documentation and templates.

## Dependencies and Imports

- The CLI script `bin/repo-wiki.ts` imports from `../src/cli.js`.
- The changelog update script imports Node.js core modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules such as `../src/compiler.js`, `../src/llm-provider.js`, `../src/planner.js`, `../src/scanner.js`, `../src/utils/git.js`, and Node.js built-in modules like `assert/strict`, `fs`, `os`, `path`, `test`, and `url`.
- The module relies on environment variables for configuration, including `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `LLMWIKI_COMPILER_MODE`, `LLMWIKI_LLM_API_KEY`, `APP_MODE`, `LLMWIKI_LLM_BASE_URL`, `PORT`, `LLMWIKI_GIT_USER_NAME`, and `LLMWIKI_PUBLISH_REMOTE`.

## Related Tests

- CLI behavior and execution tested in `test/cli.test.ts`.
- Compiler functionality and evaluation tested in `test/compiler.test.ts` and `test/compiler-eval.test.ts`.
- Context assembly and page ownership logic tested in `test/context-assembler.test.ts` and `test/page-ownership.test.ts`.
- Documentation linting and validation tested in `test/docs-linter.test.ts`.
- Environment variable handling tested in `test/dotenv.test.ts`.
- Extractors for Go, Rust, and utilities tested in respective `test/extractors-*.test.ts` files.
- Integration and fixture-based tests under `test/fixtures/compiler-e2e/` simulate real repository scenarios.
- Additional tests cover linter, frontmatter, publisher, repository analysis, scanning, searching, and changelog updating.

## Known Gaps or Open Questions

- The exact repository remote URL and commit SHA are unknown, limiting traceability.
- No explicit documentation cards or detailed module-level documentation exist beyond source and prompt markdown files.
- The internal structure of `../src/cli.js` and other source modules is not detailed here, limiting understanding of core logic.
- Runtime environment assumptions and deployment details are implicit and may require further clarification.
- The role and integration of `.devloops` and `.tsbuildinfo` files are not fully described.
- The relationship between the various prompt markdown files and their usage in the system is not explicitly documented.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
