---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "eda9d272e7c9de7e891622628d448f396d033b3f"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to building and managing prompts within the system. It includes utilities to construct various specialized prompts such as architecture, cross-cutting concerns, foundation, and module-specific prompts. The module also defines contexts and metadata structures that support prompt construction and usage.

## Source file list

- `src/prompts.ts`

## Key symbols and entry points

- **Functions:**
  - `buildArchitecturePrompt`
  - `buildCrossCuttingPrompt`
  - `buildFoundationPrompt`
  - `buildModulePrompt`
  - `buildPrompt`

- **Types and Interfaces:**
  - `BuiltPrompt`
  - `DocCardContext`
  - `MigrationContext`
  - `ModelContext`
  - `ModuleInfo`

These symbols represent the core API for creating and handling prompts, as well as the contextual information required during prompt construction.

## Dependencies and imports

- The source card indicates that `src/prompts.ts` does not import any external modules or dependencies.

## Related tests

- No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- There is no explicit documentation or test coverage information available.
- The exact behavior and implementation details of the prompt-building functions are not described here.
- The relationships and usage scenarios for the context types (`DocCardContext`, `MigrationContext`, `ModelContext`) and `ModuleInfo` are not detailed.
- The module's integration with other parts of the system is not specified.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
