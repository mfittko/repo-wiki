---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a33ab6cfdfb7a298ba26e23ddb762c00190f3ef2"
page_state: "generated"
source_paths: [".devloops",".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler-eval.test.ts"]
compiled_at: "2024-06-10T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Repository Root Module

## Purpose

The Repository Root module represents the top-level directory of the project repository. It contains a diverse set of files and directories that collectively define the source code, documentation, configuration, package manifests, tests, continuous integration (CI) workflows, and infrastructure scripts. This module serves as the foundational context for the entire project, providing essential metadata, build and runtime configurations, API surface definitions, and tooling entry points.

Key purposes include:

- **Source Code and CLI Entry:** Contains source scripts such as `bin/repo-wiki.ts` which acts as a CLI entry point importing core logic from the source directory.
- **Configuration and Environment:** Holds environment example files (`.env.example`), ignore rules (`.gitignore`), and build metadata (`.tsbuildinfo`).
- **Documentation:** Includes multiple Markdown files for project documentation, changelogs, agent descriptions, and prompt templates.
- **Package Management:** Contains `package.json` and `package-lock.json` for Node.js package management and dependency locking.
- **CI and Infrastructure:** Includes CI workflow definitions and infrastructure deployment scripts under test fixtures.
- **Testing:** Hosts a comprehensive suite of tests covering CLI, compiler, context assembly, documentation linting, dotenv utilities, extractors, and more.
- **Data Models and API Surface:** Documentation and schema files define data models and API surfaces relevant to the repository.

This module is critical for understanding the overall structure, configuration, and operational aspects of the repository.

## Source File List

- `.devloops`
- `.env.example`
- `.gitignore`
- `.llmwiki/schema.md`
- `.pi/AGENTS.md`
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
- `test/wiki-graph.test.ts`

## Key Symbols and Entry Points

- **bin/repo-wiki.ts**: CLI entry point script importing core CLI logic from `../src/cli.js`.
- **scripts/update-changelog.mjs**: Contains functions and constants related to changelog management such as `appendEntry`, `classifyPrimaryCategory`, and `detectChangedAreas`.
- **test/compiler.test.ts**: Defines key test symbols like `assertNoWallClockFields`, `buildArchManifest`, and `createPlan` for compiler validation.
- **test/cli.test.ts**: Provides CLI testing utilities including `captureCli` and `execFileAsync`.
- **test/compiler-eval.test.ts**: Includes symbols for fixture setup and evaluation such as `assertAllPathsGrounded` and `runFixturePipeline`.

## Dependencies and Imports

- `bin/repo-wiki.ts` imports from `../src/cli.js`.
- `scripts/update-changelog.mjs` imports Node.js core modules: `child_process`, `fs/promises`, `path`, and `util`.
- Various test files import core source modules such as `../src/compiler.js`, `../src/llm-provider.js`, `../src/planner.js`, `../src/scanner.js`, `../src/linter.js`, `../src/page-ownership.js`, and utility modules.
- Test files also import Node.js built-in modules like `assert/strict`, `child_process`, `fs/promises`, `os`, `path`, `test`, `url`, and `util`.

## Related Tests

The module includes an extensive test suite covering multiple aspects:

- CLI functionality (`test/cli.test.ts`)
- Compiler behavior and evaluation (`test/compiler.test.ts`, `test/compiler-eval.test.ts`)
- Context assembly (`test/context-assembler.test.ts`)
- Documentation linting and validation (`test/docs-linter.test.ts`)
- Environment variable handling (`test/dotenv.test.ts`)
- Extractors for Go, Rust, and utilities (`test/extractors-go.test.ts`, `test/extractors-rust.test.ts`, `test/extractors-utils.test.ts`)
- Frontmatter parsing (`test/frontmatter.test.ts`)
- Planning and initialization (`test/init-planner.test.ts`)
- Linter tests (`test/linter.test.ts`)
- LLM provider integration (`test/llm-provider.test.ts`)
- Page ownership and publishing (`test/page-ownership.test.ts`, `test/publisher.test.ts`)
- Repository analysis and scanning (`test/repository-analysis.test.ts`, `test/scanner.test.ts`)
- Search functionality (`test/search.test.ts`)
- Changelog update automation (`test/update-changelog.test.ts`)
- Wiki graph structure (`test/wiki-graph.test.ts`)

Additionally, fixture repositories under `test/fixtures/compiler-e2e/` provide end-to-end testing scenarios for compiler and documentation workflows.

## Known Gaps or Open Questions

- The exact source repository URL and commit SHA are unknown and should be updated for accurate provenance.
- The module references source files in `../src/` (e.g., `../src/cli.js`) which are not included in this root module listing; their relationship and boundaries could be clarified.
- Some environment variables are hinted in `.env.example` and test files but detailed documentation on their usage and impact is limited.
- The role and integration of `.devloops` and `.tsbuildinfo` files are not fully described beyond their category and hints.
- The module contains a large number of test files and fixtures; a higher-level overview or mapping of test coverage areas
