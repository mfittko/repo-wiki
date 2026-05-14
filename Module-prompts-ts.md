---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "fcd0cab90b26fc622c67172972b85e39ed7ab703"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to building and managing prompts within the codebase. It includes utilities to construct various specialized prompts such as architecture, cross-cutting concerns, foundation, and module-specific prompts. The module also defines context and metadata types that support prompt construction and usage.

## Source file list

- `src/prompts.ts`

## Key symbols and entry points

- **Functions:**
  - `buildArchitecturePrompt` — Constructs prompts related to architectural aspects.
  - `buildCrossCuttingPrompt` — Builds prompts addressing cross-cutting concerns.
  - `buildFoundationPrompt` — Creates prompts focused on foundational elements.
  - `buildModulePrompt` — Generates prompts specific to modules.
  - `buildPrompt` — A general-purpose prompt builder function.

- **Types and Interfaces:**
  - `BuiltPrompt` — Represents a constructed prompt object.
  - `DocCardContext` — Contextual information for documentation cards.
  - `MigrationContext` — Context related to migration processes.
  - `ModelContext` — Context for model-related prompt construction.
  - `ModuleInfo` — Metadata describing a module.

## Dependencies and imports

- The source card for `src/prompts.ts` indicates no imports, suggesting this module is self-contained or relies on ambient/global types and functions.

## Related tests

- No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- The module does not list any imports, which may imply it is either standalone or incomplete in terms of external dependencies.
- There is no explicit documentation or test coverage information available.
- The exact behavior and implementation details of the prompt-building functions are not described here.
- The relationships and usage scenarios for the context types (`DocCardContext`, `MigrationContext`, `ModelContext`) and `ModuleInfo` are not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
