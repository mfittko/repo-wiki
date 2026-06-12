---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "91e712dcb91ba10ae83e41a917bf0d92fd2b7545"
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
  - `buildArchitecturePrompt` — Constructs prompts related to system architecture.
  - `buildCrossCuttingPrompt` — Builds prompts addressing cross-cutting concerns.
  - `buildFoundationPrompt` — Creates foundational prompts for base-level operations.
  - `buildModulePrompt` — Generates prompts specific to individual modules.
  - `buildPrompt` — A general prompt builder function.

- **Types and Interfaces:**
  - `BuiltPrompt` — Represents a constructed prompt object.
  - `DocCardContext` — Contextual information for documentation cards.
  - `MigrationContext` — Context used during migration-related prompt building.
  - `ModelContext` — Context related to the data or domain model.
  - `ModuleInfo` — Metadata describing a module.

## Dependencies and imports

- The source card indicates that `src/prompts.ts` does not import any external modules or dependencies.

## Related tests

- No documentation or source cards indicate the presence of related test files or test suites for this module.

## Known gaps or open questions

- There is no explicit documentation or test coverage information available.
- The exact behavior and implementation details of the prompt-building functions are not described beyond their names and symbol presence.
- The relationships and usage scenarios for the context types (`DocCardContext`, `MigrationContext`, `ModelContext`) are not detailed.
- The module's integration with other parts of the system is not specified.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
