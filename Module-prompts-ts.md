---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "f47907b8f64c2674438a61f152c6d5a09a19c523"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to building and managing prompts within the system. It includes utilities to construct various specialized prompts such as cross-cutting, foundation, and module-specific prompts. The module also defines several context and metadata types that support prompt construction and usage.

## Source file list

- `src/prompts.ts`

## Key symbols and entry points

- **Functions:**
  - `buildCrossCuttingPrompt` — Constructs prompts that address cross-cutting concerns.
  - `buildFoundationPrompt` — Builds foundational prompts likely used as base templates.
  - `buildModulePrompt` — Creates prompts specific to a given module.
  - `buildPrompt` — A general prompt builder function.

- **Types and Interfaces:**
  - `BuiltPrompt` — Represents a constructed prompt object.
  - `DocCardContext` — Contextual information related to documentation cards.
  - `MigrationContext` — Context used during migration processes.
  - `ModelContext` — Context related to the model state or environment.
  - `ModuleInfo` — Metadata describing a module.
  - `PageArchetype` — Defines archetypes or templates for pages.

## Dependencies and imports

- The source card indicates that `src/prompts.ts` does not import any external modules or dependencies.

## Related tests

- No documentation or source cards indicate the presence of related test files or test suites for this module.

## Known gaps or open questions

- There is no explicit documentation or comments describing the detailed behavior or usage scenarios of the exported functions and types.
- The absence of related tests or test references leaves the coverage and reliability of this module unclear.
- The source repository and commit information are unknown, limiting traceability.
- The exact relationships and interactions between the various context types and prompt builders are not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
