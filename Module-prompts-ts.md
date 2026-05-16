---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "349f357c41f2135ffba209e27c9fa6e032320e2e"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to building and managing prompts, likely for use in documentation generation, code migration, or model-driven contexts. It defines various prompt-building utilities such as `buildArchitecturePrompt`, `buildCrossCuttingPrompt`, `buildFoundationPrompt`, `buildModulePrompt`, and a more generic `buildPrompt`. The module also exports several context and metadata types including `DocCardContext`, `MigrationContext`, `ModelContext`, and `ModuleInfo`, as well as a `BuiltPrompt` type representing the constructed prompt entities.

The module appears to serve as a foundational source component for constructing structured prompts that may be used in automated documentation, code analysis, or AI-assisted code generation workflows.

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

These symbols represent the main API surface of the module, with the `build*Prompt` functions likely serving as specialized prompt constructors for different architectural or modular concerns.

## Dependencies and imports

- The source card metadata indicates that `src/prompts.ts` has **no imports**, suggesting this module is self-contained and does not depend on external modules or libraries.

## Related tests

- No documentation cards or test files are listed for this module, so no explicit test coverage or related test modules are known from the provided data.

## Known gaps or open questions

- The exact implementation details and usage scenarios of the prompt-building functions are not described here.
- There is no information on how these prompts integrate with other parts of the system or how the context types (`DocCardContext`, `MigrationContext`, etc.) are populated or consumed.
- Absence of related tests or documentation cards leaves open questions about validation, usage examples, and runtime behavior.
- The source repository and commit SHA are unknown, limiting traceability and versioning context.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
