---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "f5a973364c2a93ccbfa3b102d1da911a58e92021"
page_state: "generated"
source_paths: [".devloops",".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-15T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level directory structure and core configuration of the repository. It contains essential source files, configuration manifests, documentation, scripts, and test fixtures that collectively define the repository's API surface, continuous integration (CI) setup, data models, documentation, infrastructure, ORM models, packaging, and testing framework.

This module is foundational for the repository's operation, providing:

- Core configuration files such as `.env.example` for environment variables and `.gitignore` for version control exclusions.
- Documentation files including `README.md`, `CHANGELOG.md`, and various markdown guides under `prompts/` and `.pi/`.
- Source scripts and binaries, notably the CLI entry point `bin/repo-wiki.ts` and changelog update script `scripts/update-changelog.mjs`.
- Package manifests (`package.json`, `package-lock.json`) that define dependencies and package metadata.
- Test suites and fixtures covering CLI, compiler, linter, dotenv, and other components to ensure code quality and correctness.
- Infrastructure and CI configuration files embedded within test fixtures to simulate real-world deployment and integration scenarios.

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

- **bin/repo-wiki.ts**: CLI entry point importing `../src/cli.js`, likely the main executable script for repository wiki operations.
- **scripts/update-changelog.mjs**: Contains functions and constants such as `appendEntry`, `classifyPrimaryCategory`, and `emitOrWriteChangelog` to automate changelog updates.
- **test/compiler.test.ts**: Defines key test symbols like `assertNoWallClockFields`, `buildArchManifest`, and `createPlan` that validate compiler behavior and API surface.
- **test/cli.test.ts**: Provides CLI testing utilities such as `captureCli` and `execFileAsync`.
- **test/compiler-eval.test.ts**: Includes symbols for fixture setup and validation like `assertAllPathsGrounded` and `runFixturePipeline`.
- **test/docs-linter.test.ts**: Tests documentation linting and validation, with HTTP route handlers for health checks.
- **test/dotenv.test.ts**: Tests environment variable loading and restoration with `restoreEnv`.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules such as `../src/compiler.js`, `../src/linter.js`, `../src/llm-provider.js`, `../src/page-ownership.js`, `../src/context-assembler.js`, `../src/docs-ingestor.js`, `../src/docs-linter.js`, `../src/docs-validation.js`, `../src/scanner.js`, and utility modules like `../src/utils/dotenv.js`.
- Test files also import Node.js standard libraries: `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, `url`, and `util`.

## Related Tests

The module includes extensive test coverage across multiple aspects:

- CLI functionality (`test/cli.test.ts`)
- Compiler evaluation and correctness (`test/compiler-eval.test.ts`, `test/compiler.test.ts`)
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
- Scanner and search functionality (`test/scanner.test.ts`, `test/search.test.ts`)
- Changelog update automation (`test/update-changelog.test.ts`)
- End-to-end fixture tests simulating real repository structures and CI workflows (`test/fixtures/compiler-e2e/*`)

## Known Gaps or Open Questions

- The exact repository remote URL and commit SHA are unknown, limiting traceability.
- Source files reference imports from `../src/` which are outside this module's root scope; the full source code for these dependencies is not included here.
- No explicit documentation cards or detailed API documentation are present within this module beyond markdown guides and README files.
- The role and structure of `.devloops` and `.tsbuildinfo` files are not fully described; their operational context is inferred but not explicitly documented.
- The `.env.example` file lists environment variables but does not provide detailed descriptions or usage instructions.
- Some test files indicate HTTP routes and environment variables for runtime
