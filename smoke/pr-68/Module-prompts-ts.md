---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2026-05-10T21:15:56.521Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module prompts.ts

## Purpose

This module provides a set of functions and types dedicated to constructing and managing prompts. These prompts appear to be designed for use in contexts such as documentation generation, migration workflows, and modeling operations. The module includes specialized builders for different categories of prompts—cross-cutting concerns, foundational elements, and module-specific prompts—as well as a general prompt builder. Additionally, it defines several context and metadata types that support the creation and handling of these prompts.

## Source file list

- [src/prompts.ts](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/src/prompts.ts)

## Key symbols and entry points

- **Functions:**
  - `buildCrossCuttingPrompt` — Constructs prompts related to cross-cutting concerns.
  - `buildFoundationPrompt` — Builds prompts focused on foundational aspects.
  - `buildModulePrompt` — Creates prompts specific to modules.
  - `buildPrompt` — A general-purpose prompt builder function.

- **Types and Interfaces:**
  - `BuiltPrompt` — Represents a constructed prompt entity.
  - `DocCardContext` — Provides contextual information for documentation cards.
  - `MigrationContext` — Contains context relevant to migration processes.
  - `ModelContext` — Holds context for modeling operations.
  - `ModuleInfo` — Describes metadata about a module.
  - `PageArchetype` — Defines archetypes used for pages.

## Dependencies and imports

- The source file `src/prompts.ts` does not import any external modules or dependencies, indicating it is self-contained within the codebase.

## Related tests

- There are no explicit test files or test-related documentation cards linked to this module in the provided source cards.

## Known gaps or open questions

- Detailed documentation or usage examples for the exported functions and types are not provided.
- The specific mechanisms by which these prompts are consumed or integrated into larger workflows remain unspecified.
- No information is available regarding testing coverage or strategies related to this module.
- The relationships and interactions between the various context types and prompt builders could benefit from further clarification.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
