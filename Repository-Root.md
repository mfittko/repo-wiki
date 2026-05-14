---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "db3dd5c6e2bdb430282661ff44b002d22af0bade"
page_state: "generated"
source_paths: [".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-15T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level directory of the project repository. It contains a diverse set of files and directories that collectively define the source code, configuration, documentation, package metadata, testing infrastructure, and continuous integration setup for the project.

This module serves multiple roles including:

- **Source code and scripts**: Core CLI entry points and scripts such as `bin/repo-wiki.ts` and `scripts/update-changelog.mjs`.
- **Configuration**: Environment variable templates (`.env.example`), TypeScript build info (`.tsbuildinfo`), and JSON settings (`.pi/settings.json`).
- **Documentation**: Markdown files documenting agents, changelogs, prompts, and skills (`AGENTS.md`, `CHANGELOG.md`, `prompts/*.md`, `skills/repo-wiki-cli/SKILL.md`).
- **Package management**: `package.json` and `package-lock.json` files defining dependencies and package metadata.
- **Testing**: A comprehensive suite of tests covering CLI, compiler, linter, dotenv utilities, and more, located under the `test/` directory and its fixtures.
- **Infrastructure and CI**: Workflow definitions and deployment scripts under test fixtures, supporting continuous integration and deployment.

The module is foundational for the project, providing the API surface, configuration, data models, ORM models, and documentation necessary for development, testing, and deployment.

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
- `test/update-changelog.test.ts`
- `test/wiki-patch.test.ts`
- `tsconfig.json`

## Key Symbols and Entry Points

- **bin/repo-wiki.ts**: CLI entry point importing from `../src/cli.js`.
- **scripts/update-changelog.mjs**: Contains functions and constants such as `CATEGORY_ORDER`, `CHANGELOG_PATH`, `appendEntry`, and `emitOrWriteChangelog` for changelog management.
- **test/cli.test.ts**: Test utilities like `captureCli`, `captureCliResult`, and `execFileAsync` for CLI testing.
- **test/compiler-eval.test.ts**: Functions for fixture setup and validation such as `assertAllPathsGrounded`, `initializeGitRepository`, and `runFixturePipeline`.
- **test/compiler.test.ts**: Symbols like `createLLMPlan`, `createPlan`, and `defaultLLMManifest` for compiler testing.
- **test/context-assembler.test.ts**: `createFixture` for context assembly testing.
- **test/dotenv.test.ts**: `restoreEnv` utility for environment variable testing.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js core modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules such as `../src/compiler.js`, `../src/linter.js`, `../src/llm-provider.js`, `../src/page-ownership.js`, `../src/context-assembler.js`, `../src/docs-linter.js`, `../src/docs-validation.js`, `../src/scanner.js`, and utility modules like `../src/utils/dotenv.js`.
- Test files also import Node.js built-in modules like `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, `url`, and `util`.

## Related Tests

The module includes extensive test coverage with tests targeting:

- CLI functionality (`test/cli.test.ts`)
- Compiler evaluation and correctness (`test/compiler-eval.test.ts`, `test/compiler.test.ts`)
- Context assembly (`test/context-assembler.test.ts`)
- Documentation linting and validation (`test/docs-linter.test.ts`)
- Environment variable handling (`test/dotenv.test.ts`)
- Extractors for Go, Rust, and utilities (`test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`)
- Frontmatter parsing (`test/frontmatter.test.ts`)
- Initialization planning (`test/init-planner.test.ts`)
- Linter behavior (`test/linter.test.ts`)
- LLM provider integration (`test/llm-provider.test.ts`)
- Page ownership logic (`test/page-ownership.test.ts`)
- Publishing workflows (`test/publisher.test.ts`)
- Repository analysis (`test/repository-analysis.test.ts`)
- Scanner functionality (`test/scanner.test.ts`)
- Changelog updates (`test/update-changelog.test.ts`)
- Wiki patching (`test/wiki-patch.test.ts`)
- End-to-end fixture tests under `test/fixtures/compiler-e2e/`

## Known Gaps or Open Questions

- The source repository URL and commit SHA are unknown, limiting traceability.
- Some source files like `.tsbuildinfo` and `.env.example` have runtime hints but no detailed documentation on their usage.
- The exact role and structure of `.pi/` directory files (`AGENTS.md`, `settings.json`) are not fully described.
- The relationship between the source files and the compiled output (e.g., `dist/` directory) is implied but not explicitly
