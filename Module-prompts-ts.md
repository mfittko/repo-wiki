---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "c5432024529f5133bed4df4fd18ec2b67d908b7e"
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

These symbols represent the main API surface of the module, with the `build*Prompt` functions likely serving as entry points for creating different prompt types. The context and info types provide structured data to support prompt construction and usage.

## Dependencies and imports

- The source card notes that `src/prompts.ts` has no imports, indicating this module is self-contained and does not depend on external modules or libraries.

## Related tests

- No documentation or source cards indicate the presence of related test files or test coverage for this module.

## Known gaps or open questions

- The exact behavior and implementation details of the prompt-building functions are not described here.
- There is no information about how these prompts are consumed or integrated into the larger system.
- The absence of related tests or documentation cards suggests that testing and usage documentation may be incomplete or located elsewhere.
- The repository and commit information are unknown, limiting traceability.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
