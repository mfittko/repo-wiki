---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "91e712dcb91ba10ae83e41a917bf0d92fd2b7545"
page_state: "generated"
source_paths: [".devloops",".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts"]
compiled_at: "2024-06-10T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level structure and configuration of the entire repository. It encompasses a diverse set of files and directories that collectively define the source code, documentation, package manifests, continuous integration (CI) workflows, infrastructure scripts, and tests. This module serves as the foundational layer for the repository's build, test, deployment, and documentation processes.

Key purposes grounded in source files include:

- **Source and Configuration Management:** Core configuration files such as `.env.example`, `.pi/settings.json`, `.gitignore`, and `.tsbuildinfo` provide environment setup, ignore rules, and build metadata.
- **Documentation:** Multiple Markdown files (`README.md`, `CHANGELOG.md`, `AGENTS.md`, `.llmwiki/schema.md`, and prompt templates) document the repository's purpose, changelog, agent definitions, data models, and usage instructions.
- **Package Management:** `package.json` and `package-lock.json` define the Node.js package dependencies and manifest.
- **CI and Infrastructure:** CI workflows and infrastructure scripts under test fixtures and `scripts/update-changelog.mjs` automate testing, changelog updates, and deployment.
- **Source Code Entry Points:** The CLI entry point `bin/repo-wiki.ts` and related source scripts provide executable interfaces.
- **Testing:** A comprehensive suite of tests in the `test/` directory validates compiler behavior, CLI functionality, documentation linting, and repository analysis.

This module is essential for orchestrating the repository's lifecycle from development through deployment, ensuring consistency, automation, and maintainability.

## Source File List

- `.devloops`
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

## Key Symbols and Entry Points

- **`bin/repo-wiki.ts`**: CLI entry point importing `../src/cli.js`, likely the main executable interface for repository wiki operations.
- **`scripts/update-changelog.mjs`**: Contains key functions such as `appendEntry`, `classifyPrimaryCategory`, `deriveChangelogEntries`, and `emitOrWriteChangelog` to automate changelog generation and updates.
- **Test suites**: Various test files export symbols for testing CLI (`captureCli`, `captureCliResult`), compiler behavior (`assertNoWallClockFields`, `buildArchManifest`), context assembly (`createFixture`), and more.
- **Prompts and documentation templates**: Markdown files under `prompts/` provide templates and guidelines for compiler, linting, and page generation prompts.
- **Configuration files**: `.env.example` defines environment variables like `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `LLMWIKI_COMPILER_MODE`, and `LLMWIKI_LLM_API_KEY` used at runtime.

## Dependencies and Imports

- The CLI entry point imports `../src/cli.js`.
- The changelog update script imports Node.js core modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules such as `../src/compiler.js`, `../src/llm-provider.js`, `../src/planner.js`, `../src/scanner.js`, `../src/linter.js`, `../src/page-ownership.js`, and `../src/docs-linter.js`.
- Tests also import Node.js built-in modules like `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, `url`, and `util`.
- Package manifests (`package.json`, `package-lock.json`) define external dependencies but are not detailed here.

## Related Tests

The module includes extensive test coverage across multiple aspects:

- **CLI tests** (`test/cli.test.ts`): Validate command-line interface behavior.
- **Compiler tests** (`test/compiler.test.ts`, `test/compiler-eval.test.ts`): Verify compilation logic and evaluation.
- **Context assembly** (`test/context-assembler.test.ts`): Test context creation utilities.
- **Documentation linting** (`test/docs-linter.test.ts`): Ensure documentation quality and correctness.
- **Dotenv handling** (`test/dotenv.test.ts`): Test environment variable loading.
- **Extractors** (`test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`): Validate code extraction utilities.
- **Frontmatter, linter, LLM provider, page ownership, publisher, repository analysis, scanner, search, and changelog update tests**: Cover various repository features and workflows.
- **Fixture-based end-to-end tests**: Simulate real repository scenarios with fixtures under `test/fixtures/compiler-e2e/`.

## Known Gaps or Open Questions

- The exact internal implementation details of the CLI and core source modules (`../src/cli.js` and others) are not included here, limiting deeper understanding of runtime behavior.
- The repository remote URL and commit SHA are unknown, which restricts traceability to a specific source version.
- Some environment variables and runtime hints are noted but their full impact on module behavior is not fully documented.
- The role and integration of `.devloops` and `.tsbuildinfo
