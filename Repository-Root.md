---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "e8e50cf58d4fe0b1575ca9d2f73e98541cc2c545"
page_state: "generated"
source_paths: [".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-15T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level structure and configuration of the entire project repository. It contains essential configuration files, documentation, source code entry points, package manifests, and test fixtures that collectively define the repository's setup, build, testing, and continuous integration processes.

This module includes environment configuration templates (`.env.example`), ignore rules (`.gitignore`), build metadata (`.tsbuildinfo`), and package management files (`package.json`, `package-lock.json`). It also holds documentation files such as `README.md`, `CHANGELOG.md`, and various markdown files describing agents, prompts, and skills relevant to the repository.

Source code entry points like `bin/repo-wiki.ts` and scripts such as `scripts/update-changelog.mjs` provide CLI tooling and automation capabilities. The module is heavily tested with a comprehensive suite of TypeScript test files covering CLI, compiler, context assembly, linting, dotenv handling, and more.

The module supports multiple categories including source, docs, package, test, CI, and infrastructure, and uses a variety of languages such as Text, Markdown, JSON, TypeScript, JavaScript, and YAML. It serves as the foundational layer for the repository's API surface, configuration, data models, ORM models, packaging, documentation, infrastructure, and testing.

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

- **scripts/update-changelog.mjs**  
  Exports functions such as `appendEntry`, `classifyPrimaryCategory`, `deriveChangelogEntries`, and `emitOrWriteChangelog` to automate changelog updates.

- **bin/repo-wiki.ts**  
  CLI entry point importing `../src/cli.js` to provide command-line interface functionality.

- **test/compiler.test.ts**  
  Contains key test symbols like `assertNoWallClockFields`, `buildArchManifest`, `createLLMPlan`, and others that validate the compiler and API surface.

- **test/cli.test.ts**  
  Provides CLI testing utilities such as `captureCli` and `captureCliResult`.

- Various test files export fixtures and helpers for testing compiler evaluation, context assembly, linting, dotenv environment handling, and repository analysis.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js core modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import internal modules such as `../src/compiler.js`, `../src/llm-provider.js`, `../src/planner.js`, `../src/scanner.js`, `../src/linter.js`, `../src/page-ownership.js`, `../src/docs-ingestor.js`, `../src/docs-linter.js`, `../src/docs-validation.js`, `../src/utils/dotenv.js`, and others.
- Test files also import Node.js built-in modules like `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, `url`, and `util`.

## Related Tests

The module includes extensive test coverage with files dedicated to:

- CLI functionality (`test/cli.test.ts`)
- Compiler evaluation and behavior (`test/compiler-eval.test.ts`, `test/compiler.test.ts`)
- Context assembly (`test/context-assembler.test.ts`)
- Documentation linting and validation (`test/docs-linter.test.ts`)
- Environment variable handling (`test/dotenv.test.ts`)
- Extractors for Go, Rust, and utilities (`test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`)
- Frontmatter parsing (`test/frontmatter.test.ts`)
- Initialization planning (`test/init-planner.test.ts`)
- Linter tests (`test/linter.test.ts`)
- LLM provider integration (`test/llm-provider.test.ts`)
- Page ownership logic (`test/page-ownership.test.ts`)
- Publishing workflows (`test/publisher.test.ts`)
- Repository analysis (`test/repository-analysis.test.ts`)
- Scanner functionality (`test/scanner.test.ts`)
- Changelog update automation (`test/update-changelog.test.ts`)
- Wiki patching (`test/wiki-patch.test.ts`)

Additionally, there are fixture repositories under `test/fixtures/compiler-e2e/` used for end-to-end testing of compiler and documentation downgrade scenarios.

## Known Gaps or Open Questions

- The source repository remote URL and commit SHA are unknown, limiting traceability to a specific repository state.
- No explicit documentation cards or detailed module-level documentation exist beyond the included markdown files.
- The exact runtime environment and usage context for some scripts and CLI tools are not fully described.
- Some environment variables referenced in `.env.example` and tests (e.g., `GITHUB_REPOSITORY`, `LLMWIKI_LLM_API_KEY`) imply external dependencies or integrations that are not detailed here.
- The role and structure of `.pi/` directory files and `.llmwiki/schema.md` in the overall system architecture
