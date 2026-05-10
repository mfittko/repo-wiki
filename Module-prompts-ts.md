---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2ce19fbe28dc7fd82aa053ba642325b8a9e91f02"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to constructing and managing prompts within the system. It includes utilities to build various specialized prompts such as cross-cutting, foundation, and module-specific prompts. The module also defines several context and metadata types that support prompt construction and documentation generation workflows.

## Source file list

- `src/prompts.ts`

## Key symbols and entry points

- **Functions:**
  - `buildCrossCuttingPrompt` — Constructs prompts that address cross-cutting concerns.
  - `buildFoundationPrompt` — Builds foundational prompts likely used as base templates.
  - `buildModulePrompt` — Creates prompts specific to individual modules.
  - `buildPrompt` — A general prompt builder function.

- **Types and Interfaces:**
  - `BuiltPrompt` — Represents a constructed prompt object.
  - `DocCardContext` — Contextual information for documentation cards.
  - `MigrationContext` — Context related to migration processes.
  - `ModelContext` — Context for model-related operations.
  - `ModuleInfo` — Metadata describing a module.
  - `PageArchetype` — Defines archetypes for pages, possibly influencing prompt structure.

## Dependencies and imports

- The source card indicates that `src/prompts.ts` does not import any external modules or dependencies.

## Related tests

- No test files or test-related documentation cards are listed for this module.

## Known gaps or open questions

- There is no explicit documentation or comments describing the detailed behavior or usage scenarios of the prompt-building functions.
- The relationships and intended usage patterns between the various context types (`DocCardContext`, `MigrationContext`, `ModelContext`) are not detailed.
- No information is available about how these prompts integrate with other parts of the system or how they are consumed.
- Absence of related tests or examples leaves the module's practical application unclear.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
