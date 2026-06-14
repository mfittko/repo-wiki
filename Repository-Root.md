---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "b0953206f44fa44851f3fa8f9b52d7b620b0b262"
page_state: "generated"
source_paths: [".devloops",".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/attach-review-context.mjs","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts"]
compiled_at: "2024-06-15T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module encompasses the foundational files and configurations that define the structure, behavior, and metadata of the entire repository. It includes source code entry points, configuration files, documentation, package manifests, scripts for CI and infrastructure automation, and comprehensive test suites. This module serves as the central hub for:

- **Source code and CLI tooling:** Core scripts such as `bin/repo-wiki.ts` provide command-line interface functionality.
- **Configuration management:** Environment examples (`.env.example`), `.gitignore`, and scripts like `scripts/attach-review-context.mjs` manage environment variables and CI integration.
- **Documentation:** Multiple Markdown files (`README.md`, `CHANGELOG.md`, `AGENTS.md`, `.llmwiki/schema.md`, and prompt templates) document the repository’s data models, agents, changelog, and usage.
- **Package management:** `package.json` and `package-lock.json` define dependencies and package metadata.
- **Testing:** A broad suite of tests in the `test/` directory ensures correctness across CLI, compiler, linter, context assembly, and other subsystems.
- **CI and infrastructure:** Workflow definitions and deployment scripts under `test/fixtures/compiler-e2e/basic-node-service/repo/.github/workflows/ci.yml` and `infra/deploy.js` support continuous integration and deployment.

This module is critical for maintaining the repository’s API surface, configuration, data models, documentation, and operational infrastructure.

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

- **bin/repo-wiki.ts**: CLI entry point importing `../src/cli.js` to provide command-line interface functionality.
- **scripts/attach-review-context.mjs**: Script managing review context attachment, exporting symbols like `MARKER`, `execFileAsync`, `execGh`, `findExistingCommentId`, and `main`.
- **scripts/update-changelog.mjs**: Automates changelog updates with symbols such as `appendEntry`, `classifyPrimaryCategory`, and `deriveChangelogEntries`.
- **test/cli.test.ts**: Provides CLI testing utilities like `captureCli` and `captureCliResult`.
- **test/compiler.test.ts**: Contains test helpers and assertions for compiler behavior, including `assertNoWallClockFields`, `buildArchManifest`, and `createPlan`.
- **test/compiler-eval.test.ts**: Tests compiler evaluation with symbols like `assertAllPathsGrounded` and `runFixturePipeline`.
- **test/context-assembler.test.ts**: Tests context assembly with `createFixture`.
- **test/docs-linter.test.ts**: Tests documentation linting and validation.

## Dependencies and Imports

- **Node.js built-in modules**: `child_process`, `fs`, `fs/promises`, `path`, `url`, `util`, `assert/strict`, `os`, `test`.
- **Internal imports**:
  - `../src/cli.js` (used by `bin/repo-wiki.ts`)
  - `../src/compiler.js`, `../src/linter.js`, `../src/llm-provider.js`, `../src/page-ownership.js`, `../src/context-assembler.js`, `../src/docs-ingestor.js`, `../src/docs-linter.js`, `../src/docs-validation.js`, `../src/planner.js`, `../src/scanner.js`, `../src/utils/git.js` (used in various tests)
- **Environment variables**:
  - `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `LLMWIKI_COMPILER_MODE`, `LLMWIKI_LLM_API_KEY`, `LLMWIKI_LLM_PROVIDER`, `REPO_WIKI_MISSING_TEST_KEY`, `APP_MODE`, `LLMWIKI_LLM_BASE_URL`, `PORT`

## Related Tests

The module includes extensive test coverage across multiple aspects:

- CLI functionality (`test/cli.test.ts`)
- Compiler correctness and evaluation (`test/compiler.test.ts`, `test/compiler-eval.test.ts`)
- Context assembly (`test/context-assembler.test.ts`)
- Documentation linting and validation (`test/docs-linter.test.ts`)
- Environment variable handling (`test/dotenv.test.ts`)
- Extension and extractor tests (`test/extension.test.ts`, `test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`)
- Frontmatter parsing (`test/frontmatter.test.ts`)
- Initialization planning (`test/init-planner.test.ts`)
- Linter tests (`test/linter.test.ts`)
- LLM provider integration (`test/llm-provider.test.ts`)
- Page ownership logic (`test/page-ownership.test.ts`)
- Publishing workflows (`test/publisher.test.ts`)
- Repository analysis (`test/repository-analysis.test.ts`)
- Review context management (`test/review-context.test.ts`)
- Scanner functionality (`test/scanner.test.ts`)
- End-to-end fixture tests under `test/fixtures/compiler-e2e/`

## Known Gaps or Open Questions

- The repository remote
