---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "1defe58385a113a4dfca789e393deecf0d6135a8"
page_state: "generated"
source_paths: [".devloops",".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-15T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level directory of the project, encompassing a diverse set of files and directories that collectively define the source code, documentation, configuration, testing, continuous integration, and infrastructure aspects of the repository. This module serves as the foundational context for the entire project, containing critical manifests, environment configurations, source scripts, documentation, and test fixtures.

Key purposes include:

- **Source Code and Scripts**: Core executable scripts and source files such as `bin/repo-wiki.ts` and `scripts/update-changelog.mjs` that implement CLI tools and automation.
- **Configuration and Environment**: Files like `.env.example` and `.gitignore` that manage environment variables and version control exclusions.
- **Documentation**: Multiple Markdown files (`README.md`, `CHANGELOG.md`, `AGENTS.md`, `.llmwiki/schema.md`, and prompt templates) that provide project documentation, data models, and usage instructions.
- **Package Management**: `package.json` and `package-lock.json` files that define dependencies and package metadata.
- **Testing**: A comprehensive suite of TypeScript test files under `test/` and test fixtures under `test/fixtures/` that validate various components and features of the repository.
- **Continuous Integration and Infrastructure**: CI workflow files and infrastructure scripts located in test fixtures and root-level files supporting automated builds and deployments.

This module is essential for understanding the overall structure, configuration, and operational tooling of the repository.

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

- **CLI Entrypoint**: `bin/repo-wiki.ts` — TypeScript script importing `../src/cli.js` to provide command-line interface functionality.
- **Changelog Automation**: `scripts/update-changelog.mjs` — JavaScript module exporting functions such as `appendEntry`, `classifyPrimaryCategory`, and `emitOrWriteChangelog` to automate changelog updates.
- **Test Suites**: Multiple test files under `test/` implementing tests for CLI, compiler, context assembly, docs linting, dotenv handling, extractors, frontmatter, linter, LLM provider, page ownership, publisher, repository analysis, scanning, searching, changelog updates, and wiki graph.
- **Documentation and Data Models**: Markdown files like `.llmwiki/schema.md` defining data models, and prompt templates under `prompts/` for compiler, linting, and page templates.
- **Skill Documentation**: `skills/repo-wiki-cli/SKILL.md` describing CLI skill capabilities.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js core modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules such as `../src/compiler.js`, `../src/linter.js`, `../src/llm-provider.js`, `../src/page-ownership.js`, `../src/context-assembler.js`, `../src/docs-ingestor.js`, `../src/docs-linter.js`, `../src/docs-validation.js`, `../src/scanner.js`, `../src/utils/dotenv.js`, and Node.js built-in modules like `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, `url`, and `util`.

## Related Tests

The module includes extensive testing coverage with tests targeting:

- CLI functionality (`test/cli.test.ts`)
- Compiler evaluation and behavior (`test/compiler-eval.test.ts`, `test/compiler.test.ts`)
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
- Running compiled tests (`test/run-compiled-tests.ts`)
- Scanning and searching (`test/scanner.test.ts`, `test/search.test.ts`)
- Changelog update automation (`test/update-changelog.test.ts`)
- Wiki graph functionality (`test/wiki-graph.test.ts`)

Additionally, test fixtures under `test/fixtures/compiler-e2e/` provide end-to-end scenarios for compiler and documentation modules.

## Known Gaps or Open Questions

- **Source Repository and Commit**: The source repository URL and commit SHA are unknown, limiting traceability to a specific codebase version.
- **Internal Source Modules**: Several imports reference `../
