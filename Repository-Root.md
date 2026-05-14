---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "64636a87dfde6c5a3055391035a1bb4598fc5c10"
page_state: "generated"
source_paths: [".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-15T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level directory of the project repository. It contains a diverse set of files and directories that collectively define the source code, configuration, documentation, package metadata, testing infrastructure, and continuous integration setup for the project.

This module serves multiple roles including:

- **Source code and scripts**: Core CLI entry points and scripts such as `bin/repo-wiki.ts` and `scripts/update-changelog.mjs`.
- **Configuration**: Environment variable templates (`.env.example`), TypeScript build info (`.tsbuildinfo`), and project settings (`.pi/settings.json`).
- **Documentation**: Various Markdown files providing schema definitions, agent descriptions, changelogs, prompts, and skill documentation.
- **Package management**: `package.json` and `package-lock.json` files defining dependencies and package metadata.
- **Testing**: A comprehensive suite of test files covering CLI, compiler, context assembly, linting, dotenv handling, and more.
- **Infrastructure and CI**: Workflow definitions and deployment scripts located in test fixtures, supporting continuous integration and deployment.

This module is foundational for the project, providing the API surface, configuration, data models, ORM models, and documentation necessary for development, testing, and deployment.

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

- **`bin/repo-wiki.ts`**: CLI entry point script importing from `../src/cli.js`.
- **`scripts/update-changelog.mjs`**: Contains functions and constants such as `CATEGORY_ORDER`, `CHANGELOG_PATH`, `appendEntry`, and `emitOrWriteChangelog` for changelog management.
- **Test files**: Export various test utilities and assertions, e.g., `captureCli`, `assertAllPathsGrounded`, `createFixture`, and `restoreEnv`.
- **Configuration files**: `.env.example` defines environment variables like `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `LLMWIKI_COMPILER_MODE`, and `LLMWIKI_LLM_API_KEY`.
- **Documentation files**: `.llmwiki/schema.md` defines data models; `AGENTS.md` and `.pi/AGENTS.md` describe agents; `prompts/*.md` provide prompt templates.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules such as `../src/compiler.js`, `../src/llm-provider.js`, `../src/planner.js`, `../src/scanner.js`, `../src/linter.js`, `../src/docs-linter.js`, `../src/docs-validation.js`, `../src/context-assembler.js`, and utilities like `../src/utils/dotenv.js`.
- Test files also import Node.js standard modules: `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, `url`, and `util`.

## Related Tests

The module includes extensive test coverage with files targeting:

- CLI functionality (`test/cli.test.ts`)
- Compiler evaluation and behavior (`test/compiler-eval.test.ts`, `test/compiler.test.ts`)
- Context assembly (`test/context-assembler.test.ts`)
- Documentation linting and validation (`test/docs-linter.test.ts`)
- Environment variable handling (`test/dotenv.test.ts`)
- Extractors for Go, Rust, and utilities (`test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`)
- Frontmatter parsing (`test/frontmatter.test.ts`)
- Planning and initialization (`test/init-planner.test.ts`)
- Linter tests (`test/linter.test.ts`)
- LLM provider integration (`test/llm-provider.test.ts`)
- Page ownership logic (`test/page-ownership.test.ts`)
- Publishing workflows (`test/publisher.test.ts`)
- Repository analysis (`test/repository-analysis.test.ts`)
- Scanner functionality (`test/scanner.test.ts`)
- Changelog update logic (`test/update-changelog.test.ts`)
- Wiki patching (`test/wiki-patch.test.ts`)

Additionally, fixture repositories under `test/fixtures/compiler-e2e/` provide integration test scenarios for both basic node services and docs-only modules.

## Known Gaps or Open Questions

- The exact repository remote URL and commit SHA are unknown, limiting traceability.
- Some source files like `.tsbuildinfo` and `.pi/settings.json` have limited metadata on their runtime role or contents.
- The module includes a large number of test fixtures and integration tests whose detailed coverage and scope are not fully described here.
- The relationship between some documentation files (e.g., `.pi/AGENTS.md` vs `AGENTS.md`) and their usage context could be further clarified.
- The presence of environment variables in `.env.example` suggests runtime configuration dependencies that may require additional documentation or validation
