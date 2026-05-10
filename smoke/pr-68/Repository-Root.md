---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
page_state: "generated"
source_paths: [".env",".env.example",".gitignore",".llmwiki/bootstrap-plan.json",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md"]
compiled_at: "2026-05-10T21:15:56.521Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root

## Purpose

The Repository Root module encompasses the foundational files and directories that define the entire project structure and configuration. It includes environment configuration files for runtime behavior, source code entry points such as CLI bootstrap scripts, package metadata for dependency and version management, documentation covering agents, prompts, and schema definitions, as well as comprehensive test suites validating various components. This module collectively provides the API surface, configuration settings, data and ORM models, documentation, and testing infrastructure necessary to build, run, and maintain the repository's software.

## Source file list

- [.env](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/.env) — Environment variables for runtime configuration including API keys and bot tokens.
- [.env.example](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/.env.example) — Example environment variables for setup reference.
- [.gitignore](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/.gitignore) — Git ignore rules to exclude files from version control.
- [.llmwiki/bootstrap-plan.json](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/.llmwiki/bootstrap-plan.json) — JSON configuration plan for bootstrapping LLMWiki components.
- [.llmwiki/schema.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/.llmwiki/schema.md) — Markdown documentation describing the data model schema.
- [.pi/AGENTS.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/.pi/AGENTS.md) — Documentation for agents used in the project.
- [.pi/settings.json](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/.pi/settings.json) — JSON configuration settings for project components.
- [.tsbuildinfo](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/.tsbuildinfo) — TypeScript incremental build information file.
- [AGENTS.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/AGENTS.md) — Agents documentation.
- [CHANGELOG.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/CHANGELOG.md) — Project changelog documenting version history.
- [LICENSE](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/LICENSE) — License information for the project.
- [README.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/README.md) — Main project readme with installation and usage instructions.
- [bin/repo-wiki.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/bin/repo-wiki.ts) — CLI entry point script importing core CLI logic.
- [package-lock.json](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/package-lock.json) — NPM package lock file ensuring consistent dependency versions.
- [package.json](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/package.json) — NPM package manifest defining dependencies and scripts.
- [prompts/compiler.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/prompts/compiler.md) — Documentation for compiler-related prompts.
- [prompts/lint.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/prompts/lint.md) — Documentation for linting prompts.
- [prompts/page-templates.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/prompts/page-templates.md) — Documentation for page template prompts.
- [scripts/update-changelog.mjs](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/scripts/update-changelog.mjs) — Script automating changelog updates with categorized commit entries.
- [skills/repo-wiki-cli/SKILL.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/skills/repo-wiki-cli/SKILL.md) — Documentation for the repo-wiki CLI skill.
- [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/cli.test.ts) — Tests validating CLI functionality.
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/compiler.test.ts) — Tests for compiler and related components.
- [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/context-assembler.test.ts) — Tests for context assembly logic.
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/docs-linter.test.ts) — Tests for documentation linting and validation.
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/dotenv.test.ts) — Tests for environment variable loading.
- [test/extractors-go.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/extractors-go.test.ts) — Tests for Go language extractors.
- [test/extractors-rust.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/extractors-rust.test.ts) — Tests for Rust language extractors.
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/extractors-utils.test.ts) — Tests for extractor utility functions.
- [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/frontmatter.test.ts) — Tests for frontmatter parsing.
- [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/init-planner.test.ts) — Tests for initialization planning logic.
- [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/linter.test.ts) — Tests for linting logic.
- [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/llm-provider.test.ts) — Tests for LLM provider integration.
- [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/page-ownership.test.ts) — Tests for page ownership features.
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/publisher.test.ts) — Tests for publishing functionality.
- [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/repository-analysis.test.ts) — Tests for repository analysis.
- [test/run-compiled-tests.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/run-compiled-tests.ts) — Script to run compiled tests.
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/scanner.test.ts) — Tests for scanning logic.
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/update-changelog.test.ts) — Tests for changelog update script.
- [test/wiki-patch.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/wiki-patch.test.ts) — Tests for wiki patching.
- [tsconfig.json](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/tsconfig.json) — TypeScript compiler configuration.

## Key symbols and entry points

- `bin/repo-wiki.ts` — CLI bootstrap script that imports and runs the core CLI logic from `../src/cli.js`.
- `scripts/update-changelog.mjs` — Exports functions such as `appendEntry`, `classifyPrimaryCategory`, and `deriveChangelogEntries` to automate changelog maintenance by categorizing commits.
- Test files export various test suites and helpers including `captureCli` (CLI tests), `createLLMPlan` (compiler tests), and `createFixture` (context assembler tests) to validate core functionality.
- Environment variables defined in `.env` and `.env.example` configure runtime behavior, including keys like `LLMWIKI_COMPILER_MODE`, `LLMWIKI_LLM_API_KEY`, and `TELEGRAM_BOT_TOKEN`.

## Dependencies and imports

- `bin/repo-wiki.ts` imports the main CLI logic from `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js built-in modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import core source modules such as `../src/compiler.js`, `../src/linter.js`, `../src/llm-provider.js`, `../src/page-ownership.js`, and others to perform comprehensive testing.
- Package metadata files (`package.json`, `package-lock.json`) define external dependencies, scripts, and lock versions for reproducible builds.

## Related tests

- CLI functionality is tested in `test/cli.test.ts`.
- Compiler and linter components are tested in `test/compiler.test.ts` and `test/linter.test.ts`.
- Documentation linting and validation are covered in `test/docs-linter.test.ts`.
- Environment variable loading and handling are tested in `test/dotenv.test.ts`.
- Language-specific extractors have dedicated tests in `test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, and `test/extractors-utils.test.ts`.
- Context assembly, page ownership, publishing, repository analysis, and wiki patching each have their own test suites.
- Changelog update automation is validated in `test/update-changelog.test.ts`.

## Known gaps or open questions

- The `.tsbuildinfo` file is a TypeScript build artifact; its contents and usage are not documented here.
- The precise runtime behavior and integration details of environment variables such as `LLMWIKI_COMPILER_MODE` and `TELEGRAM_BOT_TOKEN` require further elaboration.
- The role and structure of `.llmwiki/bootstrap-plan.json` and `.llmwiki/schema.md` within the overall system architecture could be expanded for clarity.
- Some documentation files, including prompts and skills, contain domain-specific knowledge that may need deeper exploration for full understanding.
- The relationship and interaction between the CLI skill (`skills/repo-wiki-cli/SKILL.md`) and the main CLI entry point script is not fully detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
