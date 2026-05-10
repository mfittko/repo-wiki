---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
page_state: "generated"
source_paths: ["src/index.ts"]
compiled_at: "2026-05-10T21:15:56.521Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module index.ts

## Purpose

This module serves as the primary entry point aggregating core functionalities related to prompt building, page context assembly, and frontmatter policy application within the codebase. It consolidates key operations such as constructing various prompt types, assembling page contexts for documentation or processing, and applying frontmatter policies to content. The module is implemented in TypeScript and is foundational for orchestrating interactions between CLI, compiler, configuration, context assembly, and linting components.

## Source file list

- [src/index.ts](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/src/index.ts)

## Key symbols and entry points

- **Functions:**
  - `applyFrontmatterPolicy` — Applies policies to frontmatter metadata.
  - `assembleAllPageContexts` — Gathers and assembles contexts for all pages.
  - `assemblePageContext` — Assembles context for a single page.
  - `buildCrossCuttingPrompt` — Constructs prompts that span multiple concerns or modules.
  - `buildFoundationPrompt` — Builds foundational prompts used as base templates.
  - `buildModulePrompt` — Creates prompts specific to modules.
  - `buildPrompt` — General prompt builder function.
  - `buildRequest` — Constructs request objects for processing.
  
- **Types:**
  - `AssemblePageContextInput` — Input type for page context assembly.
  - `BuildRequestOptions` — Options type for building requests.

## Dependencies and imports

This module imports and integrates functionality from several internal modules:

- `./cli.js` — Command-line interface utilities.
- `./compiler.js` — Compilation-related logic.
- `./config.js` — Configuration management.
- `./context-assembler.js` — Logic for assembling page contexts.
- `./docs-linter.js` — Documentation linting utilities.
- Additionally imports (not explicitly listed in symbols but present in source): `./frontmatter.js`, `./init.js`, `./linter.js`.

## Related tests

No explicit test files or test-related documentation cards are referenced in the source metadata for this module. Further investigation into the repository's test directories or related modules may be necessary to identify relevant tests.

## Known gaps or open questions

- The module documentation does not specify detailed behavior or usage examples for the exported functions and types.
- There is no direct reference to testing coverage or test strategies for this module.
- The interaction details between the imported modules and how they contribute to the exported functions are not fully described.
- Further refinement and expansion of this page would benefit from source-level comments or additional documentation cards.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
