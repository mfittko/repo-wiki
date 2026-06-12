---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2a5afb6af319ea4b1fcdbebcdd868a271584028c"
page_state: "generated"
source_paths: ["src/index.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `index.ts`

## Purpose

This module serves as the main entry point for the source code located in `src/index.ts`. It consolidates and exports core functionalities related to page context assembly, prompt building, request construction, and frontmatter policy application. The module integrates multiple internal components to provide a cohesive API surface for building and managing prompts, assembling page contexts, and applying policies within the system.

## Source file list

- `src/index.ts`

## Key symbols and entry points

The module exports and defines the following key symbols:

- `applyFrontmatterPolicy` — Function to apply policies to frontmatter data.
- `assembleAllPageContexts` — Function to assemble contexts for all pages.
- `assemblePageContext` — Function to assemble context for a single page.
- `AssemblePageContextInput` — Type defining the input structure for assembling page context.
- `buildCrossCuttingPrompt` — Function to build prompts that cut across multiple concerns.
- `buildFoundationPrompt` — Function to build foundational prompts.
- `buildModulePrompt` — Function to build prompts specific to modules.
- `buildPrompt` — General function to build prompts.
- `buildRequest` — Function to build request objects.
- `BuildRequestOptions` — Type defining options for building requests.

## Dependencies and imports

The module imports several internal modules to compose its functionality:

- `./cli.js`
- `./compiler.js`
- `./config.js`
- `./context-assembler.js`
- `./docs-linter.js`
- `./frontmatter.js`
- `./init.js`
- `./linter.js`

These dependencies indicate the module's role in integrating CLI operations, compilation, configuration, context assembly, documentation linting, frontmatter processing, initialization, and linting.

## Related tests

No explicit test files or test-related documentation cards are listed for this module. It is unclear from the current source metadata whether dedicated tests exist for the exported functions and types.

## Known gaps or open questions

- The absence of documentation cards or test references leaves open questions about the module's test coverage and detailed usage examples.
- The exact behavior and implementation details of the exported functions and types require consulting the source code directly.
- The integration points with the imported modules and how they contribute to the exported API are not fully detailed in the metadata.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
