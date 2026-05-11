---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "3d197a3e565e4f3a6a053214eb093873fb70b90a"
page_state: "generated"
source_paths: [".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler.test.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

This module represents the root of the repository and contains the foundational files and configurations essential for the project. It includes source code entry points, configuration files, documentation, package manifests, and test suites. The files serve multiple roles such as defining the API surface, configuring environment and build settings, modeling data and ORM schemas, providing documentation and readme content, and supporting testing and packaging workflows.

Key purposes include:

- **Configuration**: Environment variables and settings are defined in `.env.example` and `.pi/settings.json`.
- **Source Code Entry**: The CLI entry point is implemented in `bin/repo-wiki.ts`, which imports core CLI logic.
- **Documentation**: Multiple Markdown files provide schema definitions, agent descriptions, changelogs, prompts, and skill documentation.
- **Package Management**: `package.json` and `package-lock.json` manage dependencies and package metadata.
- **Testing**: A comprehensive suite of TypeScript test files cover CLI, compiler, context assembly, linting, dotenv handling, extractors, frontmatter, planning, and repository analysis.
- **Build and Runtime Metadata**: `.tsbuildinfo` supports incremental TypeScript builds.
- **Scripts**: The `scripts/update-changelog.mjs` script automates changelog updates.

## Source File List

- `.env.example` (Text) — Environment variable configuration template.
- `.gitignore` (Text) — Git ignore rules.
- `.llmwiki/schema.md` (Markdown) — Data model schema documentation.
- `.pi/AGENTS.md` (Markdown) — Agent documentation.
- `.pi/settings.json` (JSON) — Project settings.
- `.tsbuildinfo` (Text) — TypeScript incremental build info.
- `AGENTS.md` (Markdown) — Agent documentation.
- `CHANGELOG.md` (Markdown) — Project changelog.
- `LICENSE` (Text) — License text.
- `README.md` (Markdown) — Project readme and overview.
- `bin/repo-wiki.ts` (TypeScript) — CLI entry point importing core CLI logic.
- `package-lock.json` (JSON) — Package lockfile.
- `package.json` (JSON) — Package manifest.
- `prompts/compiler.md` (Markdown) — Compiler prompt documentation.
- `prompts/lint.md` (Markdown) — Lint prompt documentation.
- `prompts/page-templates.md` (Markdown) — Page template prompts.
- `scripts/update-changelog.mjs` (JavaScript) — Changelog update automation script.
- `skills/repo-wiki-cli/SKILL.md` (Markdown) — CLI skill documentation.
- `test/cli.test.ts` (TypeScript) — CLI tests.
- `test/compiler.test.ts` (TypeScript) — Compiler tests.
- `test/context-assembler.test.ts` (TypeScript) — Context assembler tests.
- `test/docs-linter.test.ts` (TypeScript) — Documentation linter tests.
- `test/dotenv.test.ts` (TypeScript) — Environment variable handling tests.
- `test/extractors-go.test.ts` (TypeScript) — Go extractor tests.
- `test/extractors-rust.test.ts` (TypeScript) — Rust extractor tests.
- `test/extractors-utils.test.ts` (TypeScript) — Extractor utilities tests.
- `test/frontmatter.test.ts` (TypeScript) — Frontmatter parsing tests.
- `test/init-planner.test.ts` (TypeScript) — Initialization planner tests.
- `test/linter.test.ts` (TypeScript) — Linter tests.
- `test/llm-provider.test.ts` (TypeScript) — LLM provider tests.
- `test/page-ownership.test.ts` (TypeScript) — Page ownership tests.
- `test/publisher.test.ts` (TypeScript) — Publisher tests.
- `test/repository-analysis.test.ts` (TypeScript) — Repository analysis tests.
- `test/run-compiled-tests.ts` (TypeScript) — Test runner for compiled tests.
- `test/scanner.test.ts` (TypeScript) — Scanner tests.
- `test/update-changelog.test.ts` (TypeScript) — Changelog update tests.
- `test/wiki-patch.test.ts` (TypeScript) — Wiki patch tests.
- `tsconfig.json` (JSON) — TypeScript compiler configuration.

## Key Symbols and Entry Points

- `bin/repo-wiki.ts` — Main CLI entry point importing `../src/cli.js`.
- `scripts/update-changelog.mjs` — Exports functions such as `appendEntry`, `classifyPrimaryCategory`, `deriveChangelogEntries`, and `emitOrWriteChangelog` for changelog management.
- Test files export various test helpers and fixtures, e.g., `createLLMPlan`, `captureCli`, `restoreEnv`, and `goSource`.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports core CLI logic from `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import internal modules such as `../src/compiler.js`, `../src/linter.js`, `../src/llm-provider.js`, `../src/page-ownership.js`, `../src/docs-ingestor.js`, `../src/docs-linter.js`, `../src/docs-validation.js`, `../src/scanner.js`, `../src/utils/dotenv.js`, and `../src/extractors.js`.
- Tests also import Node.js built-in modules like `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, and `url`.

## Related Tests

The module includes extensive test coverage across multiple aspects:

- CLI functionality (`test/cli.test.ts`)
- Compiler and plan creation (`test/compiler.test.ts`)
- Context assembly (`test/context-assembler.test.ts`)
- Documentation linting and validation (`test/docs-linter.test.ts`)
- Environment variable handling (`test/dotenv.test.ts`)
- Language-specific extractors (Go, Rust) (`test/extractors-go.test.ts`, `test/extractors-rust.test.ts`)
- Frontmatter parsing (`test/frontmatter.test.ts`)
- Initialization planning (`test/init-planner.test.ts`)
- Linter functionality (`test/linter.test.ts`)
- LLM provider integration (`test/llm-provider.test.ts`)
- Page ownership logic (`test/page-ownership.test.ts`)
- Publishing workflows (`test/publisher.test.ts`)
- Repository analysis (`test/repository-analysis.test.ts`)
- Scanner functionality (`test/scanner.test.ts`)
- Changelog update automation (`test/update-changelog.test.ts`)
- Wiki patching (`test/wiki-patch.test.ts`)

## Known Gaps or Open Questions

- The exact repository remote URL and commit SHA are not specified.
- The compiled timestamp is not provided.
- The internal source files under `src/` are referenced but not included in this module listing.
- Some environment variables referenced in `.env.example` and tests (e.g., `LLMWIKI_LLM_API_KEY`, `GITHUB_TOKEN`) require external setup and are not documented here.
- The role and structure of `.tsbuildinfo` as a build artifact is noted but not detailed.
- The relationship between the `.pi/` directory and the rest of the project is not fully explained.
- The README is partially validated, indicating some documentation claims may need further verification.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
