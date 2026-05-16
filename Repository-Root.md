---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "b1b3a9c5f3b8a59dd631cd206cda223760e1ba3a"
page_state: "generated"
source_paths: [".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-15T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level directory structure and core configuration of the project repository. It contains essential source files, documentation, package manifests, configuration files, scripts, and test fixtures that collectively define the repository's API surface, continuous integration (CI) setup, data models, documentation, infrastructure, ORM models, packaging, and testing framework.

This module serves as the foundation for the repository's build, test, and deployment processes, as well as the documentation and CLI tooling. It includes environment configuration templates, package metadata, changelogs, licensing, and README documentation to guide users and contributors.

## Source File List

- `.env.example` — Environment variable template for configuration (e.g., `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `LLMWIKI_COMPILER_MODE`, `LLMWIKI_LLM_API_KEY`).
- `.gitignore` — Git ignore rules for the repository.
- `.llmwiki/schema.md` — Documentation of the data model schema.
- `.pi/AGENTS.md` — Documentation related to agents.
- `.pi/settings.json` — JSON configuration settings.
- `.tsbuildinfo` — TypeScript incremental build information.
- `AGENTS.md` — Agents documentation.
- `CHANGELOG.md` — Project changelog.
- `LICENSE` — License text.
- `README.md` — Main project README.
- `bin/repo-wiki.ts` — CLI entry point script importing `../src/cli.js`.
- `package-lock.json` — NPM package lock file.
- `package.json` — NPM package manifest.
- `prompts/compiler.md` — Documentation for compiler prompts.
- `prompts/lint.md` — Documentation for linting prompts.
- `prompts/page-templates.md` — Documentation for page templates.
- `scripts/update-changelog.mjs` — Script to update changelog with symbols like `appendEntry`, `classifyPrimaryCategory`, and imports from Node.js core modules.
- `skills/repo-wiki-cli/SKILL.md` — CLI skill documentation.
- Various test files under `test/` and test fixtures under `test/fixtures/compiler-e2e/` covering CLI, compiler, context assembly, docs linting, dotenv, extractors, frontmatter, linter, LLM provider, page ownership, publisher, repository analysis, scanner, changelog updates, wiki graph, and wiki patching.

## Key Symbols and Entry Points

- `bin/repo-wiki.ts` — CLI bootstrap script importing the main CLI logic.
- `scripts/update-changelog.mjs` — Contains key functions for changelog management such as `appendEntry`, `classifyPrimaryCategory`, and `deriveChangelogEntries`.
- Test files export various test helpers and assertions, e.g., `captureCli`, `assertAllPathsGrounded`, `createFixture`, `restoreEnv`.
- The module exposes API surfaces related to compiler, linter, docs ingestion, and validation through test coverage and source files.

## Dependencies and Imports

- Node.js core modules such as `child_process`, `fs/promises`, `path`, `util` are used in scripts like `update-changelog.mjs`.
- TypeScript and JavaScript source files import internal modules from `../src/` such as `cli.js`, `compiler.js`, `llm-provider.js`, `planner.js`, `scanner.js`, `linter.js`, `page-ownership.js`, `docs-ingestor.js`, `docs-linter.js`, `docs-validation.js`, and utilities like `utils/git.js` and `utils/dotenv.js`.
- Test files import Node.js built-in modules for assertions, file system, OS, and testing utilities.

## Related Tests

- Comprehensive test coverage exists for CLI (`cli.test.ts`), compiler evaluation and behavior (`compiler-eval.test.ts`, `compiler.test.ts`), context assembly (`context-assembler.test.ts`), documentation linting (`docs-linter.test.ts`), dotenv environment handling (`dotenv.test.ts`), extractors for Go, Rust, and utilities, frontmatter parsing, initialization planning, linter behavior, LLM provider integration, page ownership, publishing, repository analysis, scanning, changelog updating, and wiki graph and patching.
- Test fixtures simulate real repository structures and workflows, including CI workflows, infrastructure deployment scripts, package manifests, API routes, and server implementations.

## Known Gaps or Open Questions

- The exact repository remote URL and commit SHA are unknown, limiting traceability.
- No explicit documentation cards exist beyond source and test files; additional high-level architectural documentation may be beneficial.
- Runtime environment variables and HTTP routes are hinted at in tests but not fully documented in source files.
- The role and integration of `.pi/` directory files and the `.llmwiki/schema.md` in the broader system could be further clarified.
- The module's interaction with ORM models and infra is implied but not explicitly detailed in the source cards.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
