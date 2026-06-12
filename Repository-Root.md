---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "7b125ae9a68ac15891f3248ef52c552b163fcda2"
page_state: "generated"
source_paths: [".devloops",".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts"]
compiled_at: "2024-06-10T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level directory structure and core configuration of the repository. It encompasses a diverse set of files and folders that collectively define the repository's source code, documentation, package manifests, continuous integration (CI) workflows, infrastructure scripts, and tests.

This module serves as the foundational layer for the repository's operation, including:

- **Source code and CLI entry points:** e.g., `bin/repo-wiki.ts` which imports core CLI logic.
- **Configuration and environment setup:** e.g., `.env.example` for environment variables, `.pi/settings.json` for project-specific settings, and `.gitignore` for version control exclusions.
- **Documentation and data models:** Markdown files such as `README.md`, `CHANGELOG.md`, `AGENTS.md`, and `.llmwiki/schema.md` provide human-readable documentation and data schema definitions.
- **Package management:** `package.json` and `package-lock.json` define dependencies and package metadata.
- **CI and infrastructure:** Workflow files and scripts under `test/fixtures` and `scripts/update-changelog.mjs` automate testing, deployment, and changelog generation.
- **Testing:** A comprehensive suite of tests in the `test/` directory validates compiler behavior, CLI functionality, documentation linting, and more.

This module is critical for bootstrapping, building, testing, and maintaining the repository as a whole.

## Source File List

- `.devloops`
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
- `test/search.test.ts`
- `test/update-changelog.test.ts`

## Key Symbols and Entry Points

- **bin/repo-wiki.ts**  
  Entry point script for the repository wiki CLI, importing core CLI logic from `../src/cli.js`.

- **scripts/update-changelog.mjs**  
  Contains functions and constants for automated changelog generation and update workflows, such as `appendEntry`, `classifyPrimaryCategory`, and `detectChangedAreas`.

- **test/compiler.test.ts**  
  Provides test symbols like `assertNoWallClockFields`, `buildArchManifest`, and `createPlan` to validate compiler functionality and API surface.

- **test/cli.test.ts**  
  Defines CLI test helpers such as `captureCli` and `execFileAsync` to test command-line interface behavior.

- **.env.example**  
  Template for environment variables including `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `LLMWIKI_COMPILER_MODE`, and `LLMWIKI_LLM_API_KEY`.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports `../src/cli.js` as the main CLI logic.
- `scripts/update-changelog.mjs` imports Node.js core modules: `child_process`, `fs/promises`, `path`, and `util`.
- Test files import various internal modules such as `../src/compiler.js`, `../src/llm-provider.js`, `../src/planner.js`, `../src/scanner.js`, `../src/linter.js`, and others.
- Tests also import Node.js built-in modules like `assert/strict`, `fs/promises`, `os`, `path`, `test`, and `url`.

## Related Tests

The module includes extensive test coverage across multiple aspects:

- **CLI tests:** `test/cli.test.ts` verifies CLI commands and output.
- **Compiler tests:** `test/compiler.test.ts`, `test/compiler-eval.test.ts` validate compilation logic and evaluation.
- **Context and planning:** `test/context-assembler.test.ts`, `test/init-planner.test.ts`.
- **Documentation linting and validation:** `test/docs-linter.test.ts`.
- **Environment and configuration:** `test/dotenv.test.ts`.
- **Extractor tests:** `test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`.
- **Repository analysis and scanning:** `test/repository-analysis.test.ts`, `test/scanner.test.ts`.
- **Page ownership and publishing:** `test/page-ownership.test.ts`, `test/publisher.test.ts`.
- **Changelog update tests:** `test/update-changelog.test.ts`.
- **Fixture-based end-to-end tests:** under `test/fixtures/compiler-e2e/`.

## Known Gaps or Open Questions

- The exact repository remote URL and commit SHA are unknown, limiting traceability.
- Some source files like `.devloops` and `.tsbuildinfo` have minimal metadata and unclear runtime roles.
- The module includes a large number of test fixtures and scripts whose detailed interactions and dependencies may require further exploration.
- The relationship between `.pi` directory files and the main repository logic is not fully documented.
- The role of some prompt markdown files (`prompts/compiler.md`, `prompts/lint.md`, `prompts/page-templates.md`) in the build or runtime process is not explicitly described.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
