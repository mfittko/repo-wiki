---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "06a68a1856f28bfd2083ba36b00bf83a0754e19c"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to building and managing prompts, likely for use in documentation generation, code migration, or model-driven contexts. It includes utilities to construct various specialized prompts such as architecture, cross-cutting concerns, foundation, and module-specific prompts. The module also defines several context and information types that support prompt construction and usage.

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

These symbols represent the core API of the module, with the `build*Prompt` functions serving as primary entry points for generating different categories of prompts. The context and info types provide structured data to support prompt generation and processing.

## Dependencies and imports

- The module `src/prompts.ts` does not import any external modules or dependencies, indicating it is self-contained.

## Related tests

- No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- There is no explicit documentation or comments describing the detailed behavior or usage of the prompt-building functions and types.
- The absence of related test information leaves the testing coverage and reliability of this module unclear.
- The exact role and structure of the context types (`DocCardContext`, `MigrationContext`, `ModelContext`) and how they interact with prompt builders are not detailed.
- The repository and commit information are unknown, limiting traceability and version context.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
