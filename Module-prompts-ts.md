---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "575a1251f58ee2bfc04d8c2780711f70f08c2481"
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
  - `buildPrompt` — A general-purpose prompt builder function.

- **Types and Interfaces:**
  - `BuiltPrompt` — Represents a constructed prompt object.
  - `DocCardContext` — Contextual information for documentation cards.
  - `MigrationContext` — Context related to migration processes.
  - `ModelContext` — Context for model-related prompt construction.
  - `ModuleInfo` — Metadata describing a module.

## Dependencies and imports

- The source card indicates that `src/prompts.ts` does not import any external modules or dependencies.

## Related tests

- No documentation or source cards indicate the presence of related test files or test suites for this module.

## Known gaps or open questions

- There is no explicit documentation or test coverage information available.
- The exact internal implementation details and usage scenarios of the prompt-building functions are not described.
- The relationships and interactions between the various context types (`DocCardContext`, `MigrationContext`, `ModelContext`) and prompt builders are not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
