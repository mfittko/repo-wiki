---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "3c7f4808701c06a5d3bcd8e1455221b272566b71"
page_state: "generated"
source_paths: ["src/index.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `index.ts`

## Purpose

This module serves as the central entry point for the source code located in `src/index.ts`. It consolidates and exports key functions, types, and utilities related to assembling page contexts, building prompts, and applying policies within the system. The module orchestrates core operations such as frontmatter policy application, context assembly, and prompt construction, making it foundational for higher-level workflows.

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

These symbols represent the primary API surface of the module, enabling consumers to assemble page contexts and build various types of prompts and requests.

## Dependencies and imports

The module imports functionality from several internal modules, indicating its role as an integrator of multiple subsystems:

- `./cli.js`
- `./compiler.js`
- `./config.js`
- `./context-assembler.js`
- `./docs-linter.js`
- Additionally, it references imports from `./frontmatter.js`, `./init.js`, and `./linter.js` as indicated in the source excerpt.

These dependencies suggest the module interacts with command-line interfaces, compilation processes, configuration management, context assembly logic, and documentation linting.

## Related tests

No explicit test files or test-related documentation cards are associated with this module in the provided source information.

## Known gaps or open questions

- The exact behavior and implementation details of the exported functions and types are not described here.
- There is no information on test coverage or related test suites.
- The repository remote URL and commit SHA are unknown, limiting traceability.
- The module's interaction with other parts of the system beyond the imported modules is not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
