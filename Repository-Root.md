---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "176374fc6ec27cb41eb2b6ed9e5833b68ee7778a"
page_state: "generated"
source_paths: [".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler.test.ts"]
compiled_at: "2024-06-10T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level directory structure and core configuration of the project. It contains essential source files, documentation, package manifests, scripts, and tests that collectively define the project's API surface, configuration, data models, ORM models, and documentation. This module serves as the foundation for building, testing, and maintaining the repository, providing environment configuration, package metadata, CLI entry points, changelog management, and prompt templates.

Key purposes include:

- Defining environment variables and configuration via `.env.example` and `.pi/settings.json`.
- Managing package metadata and dependencies through `package.json` and `package-lock.json`.
- Providing documentation and schema definitions in Markdown files such as `README.md`, `CHANGELOG.md`, `.llmwiki/schema.md`, and agent descriptions.
- Implementing CLI entry points and scripts (`bin/repo-wiki.ts`, `scripts/update-changelog.mjs`) for repository operations.
- Supporting testing infrastructure with a comprehensive suite of TypeScript test files under the `test/` directory.
- Including prompt templates for compiler, linting, and page generation workflows.
- Maintaining source control and build artifacts with `.gitignore` and `.tsbuildinfo`.

## Source File List

- `.env.example` — Environment variable configuration template.
- `.gitignore` — Git ignore rules.
- `.llmwiki/schema.md` — Data model schema documentation.
- `.pi/AGENTS.md` — Agent documentation.
- `.pi/settings.json` — Project settings in JSON format.
- `.tsbuildinfo` — TypeScript incremental build information.
- `AGENTS.md` — Additional agent documentation.
- `CHANGELOG.md` — Project changelog.
- `LICENSE` — License text.
- `README.md` — Main project readme and overview.
- `bin/repo-wiki.ts` — CLI entry point script.
- `package-lock.json` — Package lock file for dependencies.
- `package.json` — Package manifest and metadata.
- `prompts/compiler.md` — Compiler prompt templates.
- `prompts/lint.md` — Linting prompt templates.
- `prompts/page-templates.md` — Page template prompts.
- `scripts/update-changelog.mjs` — Script to update changelog entries.
- `skills/repo-wiki-cli/SKILL.md` — CLI skill documentation.
- `test/cli.test.ts` — CLI tests.
- `test/compiler.test.ts` — Compiler tests.
- `test/context-assembler.test.ts` — Context assembler tests.
- `test/docs-linter.test.ts` — Documentation linter tests.
- `test/dotenv.test.ts` — Environment variable tests.
- `test/extractors-go.test.ts` — Go extractor tests.
- `test/extractors-rust.test.ts` — Rust extractor tests.
- `test/extractors-utils.test.ts` — Extractor utilities tests.
- `test/frontmatter.test.ts` — Frontmatter parsing tests.
- `test/init-planner.test.ts` — Initialization planner tests.
- `test/linter.test.ts` — Linter tests.
- `test/llm-provider.test.ts` — LLM provider tests.
- `test/page-ownership.test.ts` — Page ownership tests.
- `test/publisher.test.ts` — Publisher tests.
- `test/repository-analysis.test.ts` — Repository analysis tests.
- `test/run-compiled-tests.ts` — Test runner for compiled tests.
- `test/scanner.test.ts` — Scanner tests.
- `test/update-changelog.test.ts` — Changelog update tests.
- `test/wiki-patch.test.ts` — Wiki patch tests.
- `tsconfig.json` — TypeScript configuration.

## Key Symbols and Entry Points

- `bin/repo-wiki.ts` — Main CLI entry point importing `../src/cli.js`.
- `scripts/update-changelog.mjs` — Exports functions such as `appendEntry`, `classifyPrimaryCategory`, `deriveChangelogEntries`, and `emitOrWriteChangelog` for changelog management.
- Test files export various test helpers and fixtures, e.g., `createLLMPlan`, `captureCli`, `restoreEnv`.
- Environment variables defined in `.env.example` include `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `LLMWIKI_COMPILER_MODE`, and `LLMWIKI_LLM_API_KEY`.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js core modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules such as `../src/compiler.js`, `../src/linter.js`, `../src/llm-provider.js`, and Node.js built-in modules like `assert/strict`, `fs/promises`, `os`, `path`, and `test`.
- The module depends on Node.js environment and TypeScript tooling as indicated by `.tsbuildinfo` and `tsconfig.json`.

## Related Tests

The module includes a comprehensive test suite covering:

- CLI functionality (`test/cli.test.ts`)
- Compiler logic (`test/compiler.test.ts`)
- Context assembly (`test/context-assembler.test.ts`)
- Documentation linting and validation (`test/docs-linter.test.ts`)
- Environment variable handling (`test/dotenv.test.ts`)
- Language-specific extractors (`test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`)
- Frontmatter parsing (`test/frontmatter.test.ts`)
- Initialization planning (`test/init-planner.test.ts`)
- Linter functionality (`test/linter.test.ts`)
- LLM provider integration (`test/llm-provider.test.ts`)
- Page ownership logic (`test/page-ownership.test.ts`)
- Publishing workflows (`test/publisher.test.ts`)
- Repository analysis (`test/repository-analysis.test.ts`)
- Scanner functionality (`test/scanner.test.ts`)
- Changelog update process (`test/update-changelog.test.ts`)
- Wiki patching (`test/wiki-patch.test.ts`)

These tests ensure the module's API surface, configuration, and source code behave as expected.

## Known Gaps or Open Questions

- The exact repository remote URL and commit SHA are unknown, limiting traceability.
- Some documentation files are only partially validated (e.g., `README.md`).
- The runtime environment assumptions and external dependencies (e.g., LLM API keys) require proper configuration for full functionality.
- The role and integration of `.pi` directory files (`AGENTS.md`, `settings.json`) could be further clarified.
- The relationship between source files and compiled output (e.g., `dist/` directory) is implied but not detailed here.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
