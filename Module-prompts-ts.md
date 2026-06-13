---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "104e3c23e782dbd282df6b81c63dfae18768b23f"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to building and managing prompts within the codebase. It appears to focus on constructing various specialized prompts such as architecture, cross-cutting concerns, foundation, and module-specific prompts. The module also defines contexts and metadata structures that support prompt generation and usage.

## Source file list

- `src/prompts.ts`

## Key symbols and entry points

- **Functions:**
  - `buildArchitecturePrompt`
  - `buildCrossCuttingPrompt`
  - `buildFoundationPrompt`
  - `buildModulePrompt`
  - `buildPrompt`

- **Types / Interfaces:**
  - `BuiltPrompt`
  - `DocCardContext`
  - `MigrationContext`
  - `ModelContext`
  - `ModuleInfo`

These symbols represent the core API of the module, with the `build*Prompt` functions likely serving as primary entry points for generating different categories of prompts. The context and info types provide structured data to support prompt construction and usage.

## Dependencies and imports

- The source card indicates that `src/prompts.ts` has no imports, suggesting this module is self-contained or relies on ambient/global types or values.

## Related tests

- No documentation cards or test files are listed for this module, so no explicit related tests are known from the provided data.

## Known gaps or open questions

- The exact behavior and implementation details of the prompt-building functions are not described here.
- There is no information about how these prompts are consumed or integrated into the larger system.
- The absence of related tests or documentation cards leaves open questions about usage examples and test coverage.
- The source repository and commit SHA are unknown, limiting traceability.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
