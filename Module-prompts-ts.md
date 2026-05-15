---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "171111a1609e1e510e20bfa1989ecfcee1993eb2"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to building and managing prompts within the codebase. It includes utilities to construct various specialized prompts such as architecture, cross-cutting concerns, foundation, and module-specific prompts. The module also defines contexts and metadata structures that support prompt generation and usage.

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

These symbols represent the core API of the module, enabling construction of prompts tailored to different aspects of the system and providing contextual information for prompt generation.

## Dependencies and imports

- The source card indicates that `src/prompts.ts` has no imports, suggesting this module is self-contained or relies on ambient/global types or runtime.

## Related tests

- No documentation or source cards mention related test files or test coverage for this module.

## Known gaps or open questions

- There is no explicit documentation or comments describing the detailed behavior or usage of each function or type.
- The absence of imports raises questions about external dependencies or integration points.
- No related tests or usage examples are provided, limiting insight into practical application or validation.
- The repository and commit information are unknown, which restricts traceability and version context.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
