---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "4876d92ad775fdaa882464db71be1c1ed241f47f"
page_state: "generated"
source_paths: ["src/index.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `index.ts`

## Purpose

This module serves as the main entry point for the source code located in `src/index.ts`. It consolidates and exports core functionalities related to page context assembly, prompt building, and request construction. The module integrates multiple components such as CLI handling, compilation, configuration, context assembly, and documentation linting to provide a cohesive interface for building and managing prompts and page contexts within the application.

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

These symbols represent the primary API surface of the module, facilitating operations such as applying frontmatter policies, assembling page contexts, and constructing various types of prompts and requests.

## Dependencies and imports

The module imports functionality from several internal modules, indicating its role as an integrator:

- `./cli.js`
- `./compiler.js`
- `./config.js`
- `./context-assembler.js`
- `./docs-linter.js`
- Additionally, it references other modules such as `./frontmatter.js`, `./init.js`, and `./linter.js` as part of its broader import graph.

These dependencies suggest the module coordinates between command-line interface logic, compilation processes, configuration management, context assembly, and documentation linting.

## Related tests

No explicit test files or test-related documentation cards are listed for this module. It is unclear if tests exist or are located elsewhere in the repository.

## Known gaps or open questions

- The module's documentation does not specify detailed behavior or usage examples for the exported functions and types.
- There is no direct information about test coverage or testing strategies related to this module.
- The exact role of some imported modules (e.g., `./frontmatter.js`, `./init.js`, `./linter.js`) in the context of this module is not fully detailed.
- The repository remote URL and commit SHA are unspecified, limiting traceability.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
