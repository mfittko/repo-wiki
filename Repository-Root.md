---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a507ef561fb391da37a72f94377f63339998865a"
page_state: "generated"
source_paths: [".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-15T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level directory of the project, containing a diverse set of files that collectively define the source code, configuration, documentation, package metadata, testing infrastructure, and continuous integration setup. This module serves as the foundational layer for the repository's structure and operational workflows.

Key purposes include:

- **Source Code and CLI Entrypoints:** Contains source files such as `bin/repo-wiki.ts` which acts as a CLI entrypoint importing core logic from the source directory.
- **Configuration:** Environment configuration files like `.env.example` and `.pi/settings.json` provide runtime and build-time settings.
- **Documentation:** Multiple Markdown files (`README.md`, `CHANGELOG.md`, `AGENTS.md`, `.llmwiki/schema.md`, and prompt templates) document the project, its agents, changelog, and data models.
- **Package Management:** `package.json` and `package-lock.json` define the Node.js package manifest and dependencies.
- **Testing:** A comprehensive suite of test files in the `test/` directory cover CLI, compiler, linter, dotenv utilities, and integration fixtures.
- **CI and Infrastructure:** Workflow definitions and deployment scripts under test fixtures simulate CI pipelines and infrastructure deployment.
- **Build Artifacts:** Files like `.tsbuildinfo` support incremental TypeScript compilation.

This module is critical for orchestrating the build, test, documentation, and deployment lifecycle of the repository.

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

- **bin/repo-wiki.ts**  
  CLI entrypoint script importing core CLI logic from `../src/cli.js`.

- **scripts/update-changelog.mjs**  
  Contains functions and constants related to changelog management such as `appendEntry`, `classifyPrimaryCategory`, and `emitOrWriteChangelog`.

- **test/cli.test.ts**  
  Provides test utilities like `captureCli`, `captureCliResult`, and `execFileAsync` for CLI testing.

- **test/compiler.test.ts**  
  Exposes test symbols such as `buildArchManifest`, `createLLMPlan`, and `writeFixture` for compiler-related tests.

- **test/compiler-eval.test.ts**  
  Includes symbols like `assertAllPathsGrounded`, `initializeGitRepository`, and `runFixturePipeline` for evaluation of compiler behavior.

- **test/context-assembler.test.ts**  
  Defines `createFixture` for context assembly testing.

- **test/dotenv.test.ts**  
  Exposes `restoreEnv` for environment variable management tests.

## Dependencies and Imports

- **bin/repo-wiki.ts** imports `../src/cli.js` as its main dependency.
- **scripts/update-changelog.mjs** imports Node.js built-in modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules from `../src/` such as `compiler.js`, `llm-provider.js`, `linter.js`, `docs-linter.js`, `context-assembler.js`, and utilities like `dotenv.js`.
- Test files also import Node.js standard libraries including `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, `url`, and `util`.

## Related Tests

The module includes extensive test coverage across multiple aspects:

- CLI behavior (`test/cli.test.ts`)
- Compiler functionality and evaluation (`test/compiler.test.ts`, `test/compiler-eval.test.ts`)
- Context assembly (`test/context-assembler.test.ts`)
- Documentation linting and validation (`test/docs-linter.test.ts`)
- Environment variable handling (`test/dotenv.test.ts`)
- Extractors for Go, Rust, and utilities (`test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`)
- Frontmatter parsing (`test/frontmatter.test.ts`)
- Linter tests (`test/linter.test.ts`)
- LLM provider integration (`test/llm-provider.test.ts`)
- Page ownership and repository analysis (`test/page-ownership.test.ts`, `test/repository-analysis.test.ts`)
- Publisher and wiki patching (`test/publisher.test.ts`, `test/wiki-patch.test.ts`)
- Integration fixtures simulating real repository structures and CI workflows under `test/fixtures/compiler-e2e/`

## Known Gaps or Open Questions

- The exact source repository URL and commit SHA are not specified.
- The internal source directory (`src/`) is referenced but not included in this module, limiting insight into core implementation details.
- Some environment variables referenced in `.env.example` and tests (e.g., `LLMWIKI_LLM_API_KEY`, `GITHUB_TOKEN`) require external context for full understanding.
- The role and structure of `.pi/` directory files (`AGENTS.md`, `settings.json`) are not fully elaborated.
- The `.tsbuildinfo` file is a build artifact; its contents and usage are not detailed here.
- The relationship between the repository root
