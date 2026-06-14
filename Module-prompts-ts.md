---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "4876d92ad775fdaa882464db71be1c1ed241f47f"
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

These symbols represent the core API of the module, with the `build*Prompt` functions likely serving as primary entry points for generating different categories of prompts. The context and info types provide structured data to support prompt construction and usage.

## Dependencies and imports

- The source card indicates that `src/prompts.ts` has no imports, suggesting this module is self-contained or relies on ambient/global types or runtime.

## Related tests

- No documentation or source cards mention related tests for this module. It is unknown if tests exist or where they might be located.

## Known gaps or open questions

- The exact behavior and implementation details of the prompt-building functions are not described here.
- There is no information on how these prompts are consumed or integrated into the larger system.
- The absence of imports raises questions about external dependencies or if this module is purely declarative.
- No test coverage or examples are documented, limiting insight into usage patterns or reliability.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
