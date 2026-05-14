---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "ab4f4401735f73fb39983b8f7af41b5ed76b37f7"
page_state: "generated"
source_paths: ["src/index.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `index.ts`

## Purpose

This module serves as a central entry point aggregating core functionalities related to page context assembly, prompt building, and request construction within the codebase. It exports key symbols that facilitate the processing and generation of prompts, the assembly of page contexts, and the application of frontmatter policies. The module consolidates these capabilities by importing and re-exporting from various internal components such as CLI handling, compilation, configuration, context assembly, and documentation linting.

## Source file list

- `src/index.ts`

## Key symbols and entry points

- `applyFrontmatterPolicy`
- `assembleAllPageContexts`
- `assemblePageContext`
- `AssemblePageContextInput` (type/interface)
- `buildCrossCuttingPrompt`
- `buildFoundationPrompt`
- `buildModulePrompt`
- `buildPrompt`
- `buildRequest`
- `BuildRequestOptions` (type/interface)

These symbols represent the primary API surface of the module, enabling consumers to assemble page contexts, build various types of prompts, and construct requests with configurable options.

## Dependencies and imports

The module imports from several internal modules, indicating its role as an integrator of multiple subsystems:

- `./cli.js`
- `./compiler.js`
- `./config.js`
- `./context-assembler.js`
- `./docs-linter.js`
- Additionally, it imports from `./frontmatter.js`, `./init.js`, and `./linter.js` (as indicated in the excerpt), suggesting involvement with initialization, frontmatter processing, and linting functionalities.

## Related tests

No explicit test files or test-related documentation cards are listed for this module. It is unclear if tests exist or are located elsewhere in the codebase.

## Known gaps or open questions

- The exact behavior and implementation details of the exported functions and types are not described here, as only symbol names and import relationships are available.
- There is no information on the module's runtime dependencies or side effects.
- The absence of documentation cards or test references limits insight into usage patterns and robustness.
- The source repository and commit SHA are unknown, which restricts traceability and versioning context.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
