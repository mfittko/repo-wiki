---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "253792a37296e0d106c4c2c79c48e57e4e30e395"
page_state: "generated"
source_paths: [".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler.test.ts"]
compiled_at: "2024-06-10T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

This module represents the root of the repository and contains foundational configuration, documentation, source code entry points, package manifests, and test suites. It serves as the central hub for:

- **Configuration**: Environment variable examples and settings files (`.env.example`, `.pi/settings.json`).
- **Documentation**: Core documentation and schema definitions (`README.md`, `CHANGELOG.md`, `AGENTS.md`, `.llmwiki/schema.md`, prompts documentation).
- **Source Code**: CLI entry point and scripts (`bin/repo-wiki.ts`, `scripts/update-changelog.mjs`).
- **Package Management**: Package manifests and lock files (`package.json`, `package-lock.json`).
- **Testing**: Comprehensive test suites covering CLI, compiler, context assembly, linting, dotenv handling, extractors, and more (`test/*.test.ts`).
- **Build Metadata**: TypeScript build info (`.tsbuildinfo`).

This module is critical for the overall operation, configuration, packaging, and validation of the repository.

## Source File List

- `.env.example` — Environment variable configuration example.
- `.gitignore` — Git ignore rules.
- `.llmwiki/schema.md` — Data model schema documentation.
- `.pi/AGENTS.md` — Agents documentation.
- `.pi/settings.json` — JSON configuration settings.
- `.tsbuildinfo` — TypeScript incremental build metadata.
- `AGENTS.md` — Agents documentation.
- `CHANGELOG.md` — Change log for the project.
- `LICENSE` — License text.
- `README.md` — Main readme and introductory documentation.
- `bin/repo-wiki.ts` — CLI entry point script.
- `package-lock.json` — NPM package lock file.
- `package.json` — NPM package manifest.
- `prompts/compiler.md` — Compiler prompt documentation.
- `prompts/lint.md` — Lint prompt documentation.
- `prompts/page-templates.md` — Page templates prompt documentation.
- `scripts/update-changelog.mjs` — Script to update changelog entries.
- `skills/repo-wiki-cli/SKILL.md` — CLI skill documentation.
- `test/cli.test.ts` — CLI tests.
- `test/compiler.test.ts` — Compiler tests.
- `test/context-assembler.test.ts` — Context assembler tests.
- `test/docs-linter.test.ts` — Documentation linter tests.
- `test/dotenv.test.ts` — Environment variable handling tests.
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

- **bin/repo-wiki.ts**: The main CLI entry point importing from `../src/cli.js`.
- **scripts/update-changelog.mjs**: Exports functions such as `appendEntry`, `classifyPrimaryCategory`, `deriveChangelogEntries`, and `emitOrWriteChangelog` for changelog management.
- **test/cli.test.ts**: Defines CLI test helpers like `captureCli`, `cliPath`, and `execFileAsync`.
- **test/compiler.test.ts**: Provides test utilities like `createLLMPlan`, `createPlan`, and `writeFixture`.
- Various test files export test fixtures and helpers for validating different components of the repository.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js core modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules from `../src/` such as `compiler.js`, `linter.js`, `llm-provider.js`, `page-ownership.js`, `docs-ingestor.js`, `docs-linter.js`, `docs-validation.js`, `scanner.js`, `extractors.js`, and utilities.
- Test files also import Node.js built-in modules like `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, and `url`.

## Related Tests

The module includes extensive test coverage across multiple aspects:

- CLI functionality (`test/cli.test.ts`)
- Compiler and plan creation (`test/compiler.test.ts`)
- Context assembly (`test/context-assembler.test.ts`)
- Documentation linting and validation (`test/docs-linter.test.ts`)
- Environment variable handling (`test/dotenv.test.ts`)
- Language-specific extractors (`test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`)
- Frontmatter parsing (`test/frontmatter.test.ts`)
- Initialization planning (`test/init-planner.test.ts`)
- Linting (`test/linter.test.ts`)
- LLM provider integration (`test/llm-provider.test.ts`)
- Page ownership logic (`test/page-ownership.test.ts`)
- Publishing workflows (`test/publisher.test.ts`)
- Repository analysis (`test/repository-analysis.test.ts`)
- Scanner functionality (`test/scanner.test.ts`)
- Changelog update logic (`test/update-changelog.test.ts`)
- Wiki patching (`test/wiki-patch.test.ts`)

## Known Gaps or Open Questions

- The source repository URL and commit SHA are unknown, limiting traceability.
- Some documentation (e.g., `README.md`) is only partially validated.
- The exact runtime environment and usage context for some scripts and tests (e.g., environment variables in `.env.example`) require further clarification.
- The relationship and integration details between the CLI, compiler, and LLM components could be elaborated.
- The `.tsbuildinfo` file is included but its role in build optimization is not detailed here.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
