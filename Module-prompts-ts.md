---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "b1b3a9c5f3b8a59dd631cd206cda223760e1ba3a"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to building and managing prompts, likely for use in documentation generation, migration assistance, or model-driven workflows. It defines various prompt builders such as `buildArchitecturePrompt`, `buildCrossCuttingPrompt`, `buildFoundationPrompt`, and `buildModulePrompt`, as well as a generic `buildPrompt` function. The module also exports several context and metadata types including `DocCardContext`, `MigrationContext`, `ModelContext`, and `ModuleInfo`. These components collectively support the construction and handling of structured prompts within the system.

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

These symbols represent the main API surface of the module, with prompt builder functions serving as entry points for creating different categories of prompts, and context types providing structured data for prompt construction and usage.

## Dependencies and imports

- The module `src/prompts.ts` does not import any external modules or dependencies, indicating it is self-contained or relies on ambient/global types and definitions.

## Related tests

- No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- There is no explicit documentation or comments describing the detailed behavior or intended usage scenarios of the prompt builder functions and context types.
- The absence of related test references leaves the testing coverage and reliability of this module unclear.
- The source repository and commit information are unknown, limiting traceability and version context.
- The exact nature of the prompts (e.g., for AI models, documentation generation, or other purposes) is not explicitly stated in the source card excerpt.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
