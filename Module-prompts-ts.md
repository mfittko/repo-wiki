---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a33ab6cfdfb7a298ba26e23ddb762c00190f3ef2"
page_state: "generated"
source_paths: ["src/prompts.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `prompts.ts`

## Purpose

This module provides a collection of functions and types related to building and managing prompts within the system. It appears to focus on constructing various categorized prompts such as architecture, cross-cutting concerns, foundation, and module-specific prompts. The module also defines contexts and metadata structures that support prompt generation and usage.

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

These symbols represent the core API for constructing prompts and managing contextual information related to documentation cards, migrations, models, and module metadata.

## Dependencies and imports

- The source card notes that `src/prompts.ts` has no imports, indicating this module is self-contained and does not depend on external modules or libraries.

## Related tests

- No documentation cards or test files are listed for this module, so no explicit related tests are known from the provided data.

## Known gaps or open questions

- The exact implementation details and usage scenarios for each prompt-building function are not described.
- There is no information on how these prompts integrate with other parts of the system or how the contexts (`DocCardContext`, `MigrationContext`, etc.) are populated and used.
- Absence of related tests or documentation cards leaves the testing coverage and usage examples unclear.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
