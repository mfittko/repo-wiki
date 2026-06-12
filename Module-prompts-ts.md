---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "144bad2d897ff76640a6ae71a662559850345164"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to building and managing prompts within the codebase. It appears to focus on constructing various specialized prompts such as architecture, cross-cutting concerns, foundation, and module-specific prompts. The module also defines contexts and metadata structures that support prompt generation and usage.

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

These symbols represent the core API of the module, enabling construction of different prompt types and providing contextual information for prompt generation.

## Dependencies and imports

- The source card notes that `src/prompts.ts` has no imports, indicating this module is self-contained and does not depend on external modules or libraries.

## Related tests

- No documentation or source cards mention related test files or test coverage for this module.

## Known gaps or open questions

- There is no explicit documentation or comments describing the detailed behavior or usage scenarios of the prompt-building functions.
- The relationships and intended usage of the context types (`DocCardContext`, `MigrationContext`, `ModelContext`) are not elaborated.
- No information is available about how these prompts integrate with other parts of the system or their runtime environment.
- Absence of related tests or examples leaves the module's practical application unclear.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
