---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "349f357c41f2135ffba209e27c9fa6e032320e2e"
page_state: "generated"
source_paths: [".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-15T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level directory structure and core configuration of the project repository. It contains essential source files, documentation, package manifests, configuration files, scripts, and test suites that collectively define the project's API surface, continuous integration (CI) setup, data models, infrastructure, and packaging.

This module serves as the foundation for the repository's build, test, and deployment processes, as well as the documentation and CLI tooling. It includes environment configuration, package management, changelog maintenance, and various prompt templates for documentation generation and linting.

## Source File List

- `.env.example` — Environment variable configuration template.
- `.gitignore` — Git ignore rules.
- `.llmwiki/schema.md` — Data model schema documentation.
- `.pi/AGENTS.md` — Documentation for agents.
- `.pi/settings.json` — Project settings in JSON format.
- `.tsbuildinfo` — TypeScript incremental build information.
- `AGENTS.md` — Agents documentation.
- `CHANGELOG.md` — Project changelog.
- `LICENSE` — License text.
- `README.md` — Project readme and overview.
- `bin/repo-wiki.ts` — CLI entry point script importing core CLI logic.
- `package-lock.json` — Package lock file for dependencies.
- `package.json` — Package manifest and metadata.
- `prompts/compiler.md` — Documentation for compiler prompts.
- `prompts/lint.md` — Documentation for linting prompts.
- `prompts/page-templates.md` — Documentation for page templates.
- `scripts/update-changelog.mjs` — Script to update changelog entries.
- `skills/repo-wiki-cli/SKILL.md` — Documentation for CLI skills.
- `test/cli.test.ts` — CLI tests.
- `test/compiler-eval.test.ts` — Compiler evaluation tests.
- `test/compiler.test.ts` — Compiler tests covering API surface and configuration.
- `test/context-assembler.test.ts` — Context assembler tests.
- `test/docs-linter.test.ts` — Documentation linter tests.
- `test/dotenv.test.ts` — Environment variable handling tests.
- Additional test fixture files under `test/fixtures/` for end-to-end scenarios.

## Key Symbols and Entry Points

- `bin/repo-wiki.ts` — Main CLI bootstrap script importing `../src/cli.js`.
- `scripts/update-changelog.mjs` — Exports functions such as `appendEntry`, `classifyPrimaryCategory`, and `emitOrWriteChangelog` for changelog automation.
- Test files export various test helpers and assertions, e.g., `captureCli`, `assertNoWallClockFields`, `createFixture`.
- Environment variables defined in `.env.example` include `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `LLMWIKI_COMPILER_MODE`, and `LLMWIKI_LLM_API_KEY`.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports core CLI logic from `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules such as `../src/compiler.js`, `../src/llm-provider.js`, `../src/planner.js`, `../src/scanner.js`, and utilities like `../src/utils/git.js`.
- Tests also rely on Node.js built-in modules like `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, `url`, and `util`.

## Related Tests

- CLI functionality tested in `test/cli.test.ts`.
- Compiler behavior and API surface tested in `test/compiler.test.ts` and `test/compiler-eval.test.ts`.
- Context assembly logic tested in `test/context-assembler.test.ts`.
- Documentation linting and validation tested in `test/docs-linter.test.ts`.
- Environment variable handling tested in `test/dotenv.test.ts`.
- Additional tests cover frontmatter parsing, linter behavior, repository analysis, and changelog updates.

## Known Gaps or Open Questions

- The exact repository remote URL and commit SHA are unknown and should be updated for accurate source tracking.
- No explicit documentation cards exist for this module beyond source and test files.
- Some source files like `.tsbuildinfo` and `.pi/settings.json` have limited descriptive metadata.
- The role and integration of some prompt markdown files and skills documentation could be further detailed.
- Runtime environment variable usage hints are present but could be expanded with usage examples.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
