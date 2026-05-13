---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "73d2678ea962143138b0ea2c5c2afd3eb79dd847"
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

- **Configuration**: Environment variable examples (`.env.example`), ignore rules (`.gitignore`), and project settings (`.pi/settings.json`).
- **Documentation**: Core markdown files including README, changelog, license, agent descriptions, schema definitions, and prompt templates.
- **Source Code**: CLI entry point (`bin/repo-wiki.ts`), scripts for maintenance (`scripts/update-changelog.mjs`), and package manifests (`package.json`, `package-lock.json`).
- **Testing**: Comprehensive test coverage across CLI, compiler, context assembly, documentation linting, dotenv handling, extractors, frontmatter, planning, linter, LLM provider, page ownership, publishing, repository analysis, scanning, changelog updates, and wiki patching.
- **Build and Metadata**: TypeScript build info (`.tsbuildinfo`), TypeScript configuration (`tsconfig.json`), and skill documentation.

This module is critical for the overall project structure, providing the API surface, configuration, data models, ORM models, package management, and test infrastructure.

## Source File List

- `.env.example` — Environment variable configuration template.
- `.gitignore` — Git ignore rules.
- `.llmwiki/schema.md` — Data model schema documentation.
- `.pi/AGENTS.md` — Agent documentation.
- `.pi/settings.json` — Project settings in JSON.
- `.tsbuildinfo` — TypeScript incremental build information.
- `AGENTS.md` — Agent documentation.
- `CHANGELOG.md` — Project changelog.
- `LICENSE` — License text.
- `README.md` — Main project readme.
- `bin/repo-wiki.ts` — CLI entry point script.
- `package-lock.json` — Package lock file.
- `package.json` — Package manifest.
- `prompts/compiler.md` — Compiler prompt documentation.
- `prompts/lint.md` — Lint prompt documentation.
- `prompts/page-templates.md` — Page template prompts.
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

- **bin/repo-wiki.ts**: The main CLI entry point importing `../src/cli.js`.
- **scripts/update-changelog.mjs**: Exports functions such as `appendEntry`, `classifyPrimaryCategory`, `deriveChangelogEntries`, and `emitOrWriteChangelog` for changelog management.
- **test/cli.test.ts**: Provides CLI test utilities like `captureCli`, `captureCliResult`, and `execFileAsync`.
- **test/compiler.test.ts**: Exposes test helpers such as `createLLMPlan`, `createPlan`, and `writeFixture`.
- Various test files export fixtures and helpers for testing core components like extractors, linter, context assembler, and LLM provider.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import core source modules from `../src/` such as `compiler.js`, `linter.js`, `llm-provider.js`, `docs-linter.js`, `docs-validation.js`, `scanner.js`, `context-assembler.js`, and utility modules.
- Tests also import Node.js built-in modules like `assert/strict`, `fs/promises`, `os`, `path`, `test`, `url`, and `util`.

## Related Tests

The module includes extensive test coverage across multiple aspects:

- CLI functionality (`test/cli.test.ts`)
- Compiler and LLM plan creation (`test/compiler.test.ts`)
- Context assembly (`test/context-assembler.test.ts`)
- Documentation linting and validation (`test/docs-linter.test.ts`)
- Environment variable handling (`test/dotenv.test.ts`)
- Language-specific extractors (Go, Rust, utilities)
- Frontmatter parsing
- Initialization planning
- Linter and repository analysis
- Page ownership and publishing
- Wiki patching and changelog updates

These tests ensure the robustness of the repository root's configuration, source code, and documentation handling.

## Known Gaps or Open Questions

- The source repository URL and commit SHA are unknown, limiting traceability.
- Some documentation files (e.g., README.md) are only partially validated.
- The exact runtime behavior and integration of some scripts and CLI commands require further exploration.
- The `.tsbuildinfo` file is a build artifact with limited direct documentation.
- The role and structure of `.pi` directory files (`AGENTS.md`, `settings.json`) could be further clarified.
- The relationship between the root module and other submodules or packages in the repository is not detailed here.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
