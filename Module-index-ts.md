---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "349f357c41f2135ffba209e27c9fa6e032320e2e"
page_state: "generated"
source_paths: ["src/index.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `index.ts`

## Purpose

This module serves as the primary entry point for the source code located in `src/index.ts`. It consolidates and exports core functionalities related to page context assembly, prompt building, request construction, and frontmatter policy application. The module integrates multiple internal components to provide a cohesive API surface for building and managing prompts, assembling page contexts, and applying policies within the system.

## Source file list

- `src/index.ts`

## Key symbols and entry points

- **Functions and Methods:**
  - `applyFrontmatterPolicy`
  - `assembleAllPageContexts`
  - `assemblePageContext`
  - `buildCrossCuttingPrompt`
  - `buildFoundationPrompt`
  - `buildModulePrompt`
  - `buildPrompt`
  - `buildRequest`

- **Types and Interfaces:**
  - `AssemblePageContextInput`
  - `BuildRequestOptions`

These symbols represent the main API surface exported by the module, enabling users to assemble page contexts, build various types of prompts, apply frontmatter policies, and construct requests with configurable options.

## Dependencies and imports

The module imports from several internal modules, indicating its role as an aggregator and coordinator of functionality:

- `./cli.js`
- `./compiler.js`
- `./config.js`
- `./context-assembler.js`
- `./docs-linter.js`
- `./frontmatter.js`
- `./init.js`
- `./linter.js`

These dependencies suggest that `index.ts` ties together command-line interface utilities, compilation logic, configuration management, context assembly, documentation linting, frontmatter handling, initialization routines, and linting capabilities.

## Related tests

No explicit test files or test-related documentation cards are listed for this module. It is unclear from the current source cards whether dedicated tests exist for the exported symbols in `index.ts`.

## Known gaps or open questions

- The absence of documentation cards or test references leaves open questions about the coverage and usage examples for the exported functions and types.
- The exact behavior and implementation details of the key symbols are not described here, requiring consultation of the source code for deeper understanding.
- The source repository remote URL and commit SHA are unspecified, limiting traceability to a specific codebase version.
- The module appears to be a central integration point, but the scope and boundaries relative to other modules are not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
