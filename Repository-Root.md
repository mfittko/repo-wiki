---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2ce19fbe28dc7fd82aa053ba642325b8a9e91f02"
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
- **Source Code Entry**: The CLI entry point is implemented in `bin/repo-wiki.ts`.
- **Documentation**: Various markdown files provide schema definitions, agent descriptions, changelogs, prompts, and skill documentation.
- **Package Management**: `package.json` and `package-lock.json` manage dependencies and package metadata.
- **Testing**: A comprehensive suite of TypeScript test files under `test/` validate different components and features.
- **Build and Compilation**: Files like `.tsbuildinfo` and `tsconfig.json` support TypeScript compilation and incremental builds.
- **Scripts**: Utility scripts such as `scripts/update-changelog.mjs` automate changelog maintenance.

## Source File List

- `.env.example` (Text, configuration)
- `.gitignore` (Text)
- `.llmwiki/schema.md` (Markdown, data model documentation)
- `.pi/AGENTS.md` (Markdown, documentation)
- `.pi/settings.json` (JSON, configuration)
- `.tsbuildinfo` (Text, build info)
- `AGENTS.md` (Markdown, documentation)
- `CHANGELOG.md` (Markdown, documentation)
- `LICENSE` (Text, license)
- `README.md` (Markdown, documentation and readme)
- `bin/repo-wiki.ts` (TypeScript, CLI entry point)
- `package-lock.json` (JSON, package lock)
- `package.json` (JSON, package manifest)
- `prompts/compiler.md` (Markdown, documentation)
- `prompts/lint.md` (Markdown, documentation)
- `prompts/page-templates.md` (Markdown, documentation)
- `scripts/update-changelog.mjs` (JavaScript, changelog update script)
- `skills/repo-wiki-cli/SKILL.md` (Markdown, skill documentation)
- `test/cli.test.ts` (TypeScript, CLI tests)
- `test/compiler.test.ts` (TypeScript, compiler tests)
- `test/context-assembler.test.ts` (TypeScript, context assembler tests)
- `test/docs-linter.test.ts` (TypeScript, docs linter tests)
- `test/dotenv.test.ts` (TypeScript, dotenv tests)
- `test/extractors-go.test.ts` (TypeScript, Go extractor tests)
- `test/extractors-rust.test.ts` (TypeScript, Rust extractor tests)
- `test/extractors-utils.test.ts` (TypeScript, extractor utilities tests)
- `test/frontmatter.test.ts` (TypeScript, frontmatter tests)
- `test/init-planner.test.ts` (TypeScript, init planner tests)
- `test/linter.test.ts` (TypeScript, linter tests)
- `test/llm-provider.test.ts` (TypeScript, LLM provider tests)
- `test/page-ownership.test.ts` (TypeScript, page ownership tests)
- `test/publisher.test.ts` (TypeScript, publisher tests)
- `test/repository-analysis.test.ts` (TypeScript, repository analysis tests)
- `test/run-compiled-tests.ts` (TypeScript, test runner)
- `test/scanner.test.ts` (TypeScript, scanner tests)
- `test/update-changelog.test.ts` (TypeScript, changelog update tests)
- `test/wiki-patch.test.ts` (TypeScript, wiki patch tests)
- `tsconfig.json` (JSON, TypeScript configuration)

## Key Symbols and Entry Points

- **CLI Entry**: `bin/repo-wiki.ts` imports `../src/cli.js` and serves as the command-line interface entry point.
- **Changelog Script**: `scripts/update-changelog.mjs` exports multiple functions such as `appendEntry`, `classifyPrimaryCategory`, and `deriveChangelogEntries` to automate changelog updates.
- **Test Utilities and Suites**: Various test files export test helpers and suites, e.g., `test/compiler.test.ts` exports `createLLMPlan`, `createPlan`, and `writeFixture`.
- **Environment Variables**: `.env.example` defines key environment variables like `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `LLMWIKI_COMPILER_MODE`, and `LLMWIKI_LLM_API_KEY` used across the system.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js core modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules from `../src/` such as `compiler.js`, `linter.js`, `llm-provider.js`, `page-ownership.js`, `docs-ingestor.js`, `docs-linter.js`, `docs-validation.js`, `scanner.js`, `extractors.js`, and utilities.
- Test files also import Node.js built-in modules like `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, and `url`.

## Related Tests

The module includes a comprehensive test suite covering:

- CLI functionality (`test/cli.test.ts`)
- Compiler and plan creation (`test/compiler.test.ts`)
- Context assembly (`test/context-assembler.test.ts`)
- Documentation linting and validation (`test/docs-linter.test.ts`)
- Environment variable handling (`test/dotenv.test.ts`)
- Language-specific extractors (Go, Rust, utilities)
- Frontmatter parsing
- Initialization planning
- Linter behavior
- LLM provider integration
- Page ownership logic
- Publishing workflows
- Repository analysis
- Scanner functionality
- Changelog update automation
- Wiki patching

These tests ensure the robustness of the repository root's source code, configuration, and documentation handling.

## Known Gaps or Open Questions

- The exact internal structure and exports of `../src/cli.js` and other `../src/` modules are not detailed here.
- The runtime behavior and integration of environment variables require further runtime context.
- Some documentation files are marked as partially validated, indicating potential areas for further verification.
- The role and usage of `.tsbuildinfo` in build optimization is implied but not explicitly documented.
- The relationship between the `.pi` directory files and the main source or configuration is not fully explained.
- The test coverage and effectiveness of some test files could be further analyzed for completeness.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
