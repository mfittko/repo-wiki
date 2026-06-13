---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "9897e5b449323bf6db3eac895995c3e384690a41"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to building and managing prompts, likely for use in documentation generation, code migration, or model-driven contexts. It defines various prompt builders such as `buildArchitecturePrompt`, `buildCrossCuttingPrompt`, `buildFoundationPrompt`, `buildModulePrompt`, and a more generic `buildPrompt`. These functions appear to facilitate the construction of structured prompts, possibly for AI or tooling workflows.

Additionally, the module exports several context and metadata types including `DocCardContext`, `MigrationContext`, `ModelContext`, and `ModuleInfo`, which suggest a role in managing contextual information during prompt construction or processing.

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

These symbols represent the main API surface of the module, with the `build*Prompt` functions serving as primary entry points for creating different categories of prompts.

## Dependencies and imports

- The source card notes that `src/prompts.ts` has no imports, indicating this module is self-contained and does not depend on external modules or libraries.

## Related tests

- No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- The exact nature and format of the prompts constructed by the `build*Prompt` functions are not detailed here.
- The roles and structures of the context types (`DocCardContext`, `MigrationContext`, `ModelContext`) and how they interact with prompt building are not described.
- There is no information on how this module integrates with other parts of the system or how the prompts are consumed.
- Absence of related tests or usage examples limits understanding of practical application and robustness.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
