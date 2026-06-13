---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "f5a973364c2a93ccbfa3b102d1da911a58e92021"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to constructing and managing prompts, likely for use in documentation generation, code migration, or model-driven contexts. It includes utilities to build various categorized prompts such as architecture, cross-cutting concerns, foundation, and module-specific prompts. The module also defines several context and information types that support prompt construction and usage.

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

These symbols represent the core API of the module, with the `build*Prompt` functions serving as primary entry points for generating different types of prompts. The context and info types provide structured data to support prompt generation and related operations.

## Dependencies and imports

- The module `src/prompts.ts` does not import any external modules or dependencies, indicating it is self-contained or relies on ambient/global types or data.

## Related tests

- No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- There is no explicit documentation or comments describing the detailed behavior or intended usage of the prompt-building functions and context types.
- The absence of related test information leaves the coverage and reliability of the module unverified.
- The source repository and commit information are unknown, limiting traceability.
- The exact role of each context type (`DocCardContext`, `MigrationContext`, `ModelContext`) and how they interact with prompt builders is not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
