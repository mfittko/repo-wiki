---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "4876d92ad775fdaa882464db71be1c1ed241f47f"
page_state: "generated"
source_paths: [".devloops",".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/attach-review-context.mjs","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts"]
compiled_at: "2024-06-15T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module encompasses the foundational files and configurations that define the structure, behavior, and metadata of the entire repository. It includes source code entry points, configuration files, documentation, package manifests, scripts for CI and changelog management, and a comprehensive suite of tests. This module serves as the central hub for orchestrating repository-wide operations such as compilation, testing, continuous integration, and documentation generation.

Key purposes grounded in source files include:

- **Source and Configuration Management:** Core source files like `bin/repo-wiki.ts` and scripts under `scripts/` provide CLI entry points and automation for changelog updates and review context attachment. Configuration files such as `.env.example`, `.gitignore`, and `.tsbuildinfo` manage environment variables, ignore rules, and TypeScript build metadata respectively.

- **Documentation and Data Models:** Markdown files including `README.md`, `CHANGELOG.md`, `AGENTS.md`, and schema definitions under `.llmwiki/schema.md` document the repository’s agents, data models, and usage instructions.

- **Package and Dependency Management:** `package.json` and `package-lock.json` define the package manifest and locked dependencies, essential for consistent builds and deployments.

- **Testing and Validation:** A broad array of test files under `test/` validate CLI behavior, compiler functionality, context assembly, linting, and integration with various extractors and providers, ensuring robustness and correctness.

- **Continuous Integration and Infrastructure:** CI workflows and infrastructure scripts located in test fixtures and `scripts/` support automated testing and deployment pipelines.

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
- `scripts/attach-review-context.mjs`
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
- `test/review-context.test.ts`
- `test/run-compiled-tests.ts`
- `test/scanner.test.ts`

## Key Symbols and Entry Points

- **bin/repo-wiki.ts:** CLI entry point importing core CLI logic from `../src/cli.js`.
- **scripts/attach-review-context.mjs:** Script managing review context attachment with symbols like `MARKER`, `execFileAsync`, and `main`.
- **scripts/update-changelog.mjs:** Changelog update automation with symbols such as `appendEntry`, `classifyPrimaryCategory`, and `emitOrWriteChangelog`.
- **test/cli.test.ts:** Test utilities including `captureCli`, `captureCliResult`, and `execFileAsync`.
- **test/compiler.test.ts:** Core compiler test functions like `assertNoWallClockFields`, `buildArchManifest`, and `createPlan`.
- **test/compiler-eval.test.ts:** Functions for fixture preparation and evaluation such as `assertAllPathsGrounded` and `runFixturePipeline`.
- **test/context-assembler.test.ts:** `createFixture` for context assembly testing.

## Dependencies and Imports

- **Node.js built-in modules:** `child_process`, `fs`, `fs/promises`, `path`, `url`, `util`, `assert/strict`, `os`, `test`.
- **Internal imports:** 
  - `../src/cli.js` (used by `bin/repo-wiki.ts`)
  - `../src/compiler.js`, `../src/linter.js`, `../src/llm-provider.js`, `../src/page-ownership.js`, `../src/context-assembler.js`, `../src/docs-ingestor.js`, `../src/docs-linter.js`, `../src/docs-validation.js`, `../src/planner.js`, `../src/scanner.js`, `../src/utils/git.js` (used in various test files)
- **Runtime environment variables:** `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `LLMWIKI_COMPILER_MODE`, `LLMWIKI_LLM_API_KEY`, `LLMWIKI_LLM_PROVIDER`, `REPO_WIKI_MISSING_TEST_KEY`, `APP_MODE`, `LLMWIKI_LLM_BASE_URL`, `PORT`.

## Related Tests

The module includes extensive testing coverage across multiple aspects:

- CLI behavior and result capturing (`test/cli.test.ts`)
- Compiler evaluation and plan creation (`test/compiler-eval.test.ts`, `test/compiler.test.ts`)
- Context assembly (`test/context-assembler.test.ts`)
- Documentation linting and validation (`test/docs-linter.test.ts`)
- Environment variable handling (`test/dotenv.test.ts`)
- Extension and extractor tests for Go, Rust, and utilities (`test/extension.test.ts`, `test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`)
- Frontmatter parsing and page ownership (`test/frontmatter.test.ts`, `test/page-ownership.test.ts`)
- Repository analysis and review context (`test/repository-analysis.test.ts`, `test/review-context.test.ts`)
- Publisher and scanning tests (`test/publisher.test.ts`, `test/scanner.test.ts`)
- Integration and fixture-based end-to-end tests under `test/fixtures/compiler-e2e/`

## Known Gaps or Open Questions

- **Source repository and commit information:** The source repository remote URL and commit SHA are unknown, limiting traceability.
- **Runtime environment specifics:** While environment variables are documented, their exact usage contexts and required values are not fully detailed.
-
