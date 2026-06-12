---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2f0f1d4621e326372c896cfd4888a22f68ec0f48"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to building and managing prompts, likely for use in documentation generation, code migration, or model-driven contexts. It includes utilities to construct various specialized prompts such as architecture, cross-cutting concerns, foundation, and module-specific prompts. The module appears to serve as a core source component for prompt construction and contextual information handling.

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

These symbols represent the main API surface of the module, with the `build*Prompt` functions likely serving as entry points for generating different categories of prompts. The context types suggest structured data passed to or returned from these functions.

## Dependencies and imports

- The source card metadata indicates that `src/prompts.ts` has **no imports**, suggesting this module is self-contained or relies on ambient/global types or runtime.

## Related tests

- No documentation cards or test files are listed for this module, so no explicit test coverage or related test modules are known from the provided data.

## Known gaps or open questions

- The exact behavior and implementation details of the prompt-building functions are not described here.
- There is no information on how these prompts are consumed or integrated into larger workflows.
- The absence of imports raises questions about external dependencies or runtime environment assumptions.
- No test coverage or usage examples are provided, limiting insight into practical application or robustness.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
