---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "104e3c23e782dbd282df6b81c63dfae18768b23f"
page_state: "generated"
source_paths: [".devloops",".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-15T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level directory of the project, encompassing a diverse set of files and directories that collectively define the source code, documentation, configuration, package manifests, tests, continuous integration (CI) workflows, and infrastructure scripts. This module serves as the foundational context for the entire repository, providing essential resources such as environment configuration examples (`.env.example`), build metadata (`.tsbuildinfo`), package management files (`package.json`, `package-lock.json`), documentation (`README.md`, `CHANGELOG.md`, `AGENTS.md`), source code entry points (`bin/repo-wiki.ts`), and a comprehensive suite of tests validating various aspects of the project.

The module supports multiple languages and file formats including Text, Markdown, TypeScript, JSON, JavaScript, and YAML, reflecting its multifaceted role in development, documentation, testing, and deployment. It also includes CI and infrastructure configurations, enabling automated workflows and deployment processes.

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

- **bin/repo-wiki.ts**: A TypeScript CLI entry point importing from `../src/cli.js`, likely responsible for command-line interactions with the repository wiki.
- **scripts/update-changelog.mjs**: JavaScript module managing changelog updates with exported symbols such as `appendEntry`, `classifyPrimaryCategory`, and `emitOrWriteChangelog`.
- **test/compiler.test.ts**: Contains key test symbols like `createPlan`, `buildArchPlan`, and `createLLMPlan`, indicating testing of compilation and planning logic.
- **test/cli.test.ts**: Provides CLI testing utilities such as `captureCli` and `captureCliResult`.
- **test/compiler-eval.test.ts**: Includes symbols for fixture setup and validation like `assertAllPathsGrounded` and `runFixturePipeline`.
- **test/docs-linter.test.ts**: Tests documentation linting and validation, with HTTP route handlers for health checks.
- **test/dotenv.test.ts**: Tests environment variable loading and restoration with `restoreEnv`.

## Dependencies and Imports

- The CLI entry point (`bin/repo-wiki.ts`) imports from `../src/cli.js`.
- The changelog update script (`scripts/update-changelog.mjs`) imports Node.js core modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules such as `../src/compiler.js`, `../src/linter.js`, `../src/llm-provider.js`, `../src/page-ownership.js`, `../src/context-assembler.js`, `../src/docs-ingestor.js`, `../src/docs-linter.js`, `../src/docs-validation.js`, `../src/scanner.js`, and utility modules like `../src/utils/dotenv.js`.
- Tests also rely on Node.js built-in modules including `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, `url`, and `util`.

## Related Tests

This module includes a comprehensive suite of tests covering:

- CLI functionality (`test/cli.test.ts`)
- Compiler evaluation and planning (`test/compiler-eval.test.ts`, `test/compiler.test.ts`)
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
- Running compiled tests (`test/run-compiled-tests.ts`)
- Scanning and searching (`test/scanner.test.ts`, `test/search.test.ts`)
- Changelog update validation (`test/update-changelog.test.ts`)
- Wiki graph functionality (`test/wiki-graph.test.ts`)

Additionally, fixture repositories under `test/fixtures/compiler-e2e/` provide end-to-end testing scenarios for both basic node services and docs-only modules.

## Known Gaps or Open Questions

- The exact functionality and internal structure of many source files (e.g., `.devloops`, `.pi/AGENTS.md`, `skills/repo-wiki-cli/SKILL.md`) are not detailed in the source cards.
- The role and contents of `.tsbuildinfo` and `.llmwiki/schema.md` are only briefly described, limiting understanding of build metadata and data models.
- The repository remote URL and commit SHA are unknown, which restricts traceability to the original source.
- The relationship between the repository root module and other modules or packages in the project is
