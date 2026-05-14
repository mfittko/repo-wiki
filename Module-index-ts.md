---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "db3dd5c6e2bdb430282661ff44b002d22af0bade"
page_state: "generated"
source_paths: ["src/index.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `index.ts`

## Purpose

This module serves as the central entry point for the source code located in `src/index.ts`. It aggregates and exposes key functions, types, and utilities related to assembling page contexts, building prompts, and applying policies within the system. The module consolidates core logic for prompt construction and context assembly, facilitating the orchestration of various components such as CLI, compiler, configuration, context assembly, and linting.

## Source file list

- `src/index.ts`

## Key symbols and entry points

- **Functions:**
  - `applyFrontmatterPolicy`
  - `assembleAllPageContexts`
  - `assemblePageContext`
  - `buildCrossCuttingPrompt`
  - `buildFoundationPrompt`
  - `buildModulePrompt`
  - `buildPrompt`
  - `buildRequest`

- **Types:**
  - `AssemblePageContextInput`
  - `BuildRequestOptions`

These symbols represent the primary API surface of the module, enabling the construction and management of page contexts and prompt generation workflows.

## Dependencies and imports

The module imports functionality from several internal modules, indicating its role as an integrator of various subsystems:

- `./cli.js`
- `./compiler.js`
- `./config.js`
- `./context-assembler.js`
- `./docs-linter.js`
- Additionally, it imports from `./frontmatter.js`, `./init.js`, and `./linter.js` as indicated by the excerpt, though these are not explicitly listed in the source cards.

These dependencies suggest the module coordinates CLI interactions, compilation processes, configuration management, context assembly, and documentation linting.

## Related tests

No documentation or source cards indicate the presence of related test files or test suites directly associated with this module.

## Known gaps or open questions

- The exact behavior and implementation details of the exported functions and types are not described here, limiting deeper understanding without consulting the source code.
- There is no information about test coverage or quality assurance related to this module.
- The repository remote URL and commit SHA are unknown, which restricts traceability and versioning context.
- The role of some imported modules (e.g., `./frontmatter.js`, `./init.js`, `./linter.js`) is inferred but not explicitly documented.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
