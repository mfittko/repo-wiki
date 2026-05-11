---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "3d197a3e565e4f3a6a053214eb093873fb70b90a"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to building and managing prompts, likely for use in a documentation or code generation context. It includes utilities to construct various specialized prompts such as architecture, cross-cutting concerns, foundation, and module-specific prompts. The module also defines several context and metadata types that support prompt construction and usage.

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

These symbols represent the core API of the module, with the `build*Prompt` functions serving as primary entry points for generating different categories of prompts. The context and metadata types provide structured information to support prompt generation and usage.

## Dependencies and imports

- The source card indicates that `src/prompts.ts` has no imports, suggesting this module is self-contained or relies on ambient/global types or values.

## Related tests

- No documentation cards or test references are provided for this module, so no related tests are currently known.

## Known gaps or open questions

- The exact behavior and usage scenarios of the prompt-building functions are not documented here.
- There is no information about how these prompts integrate with other parts of the system.
- No test coverage or example usage is provided, limiting insight into practical application.
- The source repository and commit SHA are unknown, which restricts traceability.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
