---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a81b22c39c9e23853e62bf5ce7ade491eda4c723"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to building and managing prompts, likely for use in documentation generation, code migration, or model-driven contexts. It defines utilities to construct various specialized prompts such as architecture, cross-cutting concerns, foundation, and module-specific prompts. The module also includes context types and metadata structures that support prompt construction and usage.

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

These symbols represent the core API of the module, enabling the creation of different prompt types and providing contextual information necessary for their construction and application.

## Dependencies and imports

- The source card indicates that `src/prompts.ts` has no imports, suggesting this module is self-contained or relies on ambient/global types or external injection.

## Related tests

- No documentation cards or test references are provided for this module, so no related tests are currently documented.

## Known gaps or open questions

- The exact behavior and implementation details of the prompt-building functions are not described here.
- There is no information on how these prompts are consumed or integrated into larger workflows.
- Absence of related tests or usage examples limits understanding of practical application.
- The source repository and commit information are unknown, which restricts traceability.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
