---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a3ed30252c9bfb054e0b54fe5e6c52f8f0b8d703"
page_state: "generated"
source_paths: ["src/compiler.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module: compiler.ts

## Purpose

The `compiler.ts` module is a core source component responsible for compiling the GitHub Wiki content. It provides the API surface and configuration mechanisms necessary to process and transform wiki pages. The module includes logic to compute architectural decisions and orchestrate the compilation workflow, integrating multiple subsystems such as context assembly, data modeling, documentation ingestion, and validation. It also supports runtime configuration via environment variables and exposes HTTP routes for operations like deleting architecture documentation.

## Source file list

- `src/compiler.ts`

## Key symbols and entry points

- **ArchDecision**: Represents architectural decisions computed or managed during the compilation process.
- **compileWiki**: The primary function or entry point that triggers the compilation of the wiki content.
- **computeArchDecision**: A function responsible for determining or computing architectural decisions as part of the compilation workflow.

## Dependencies and imports

The module imports several internal components to fulfill its responsibilities:

- `./context-assembler.js`: Likely involved in assembling contextual information needed during compilation.
- `./data-model-signals.js`: Handles data modeling signals or events.
- `./docs-ingestor.js`: Manages ingestion of documentation content.
- `./docs-validation.js`: Provides validation logic for documentation correctness.
- `./frontmatter.js`: Parses or manages frontmatter metadata in wiki pages.

Additional imports mentioned in the excerpt but not detailed in the source cards include:

- `./llm-provider.js`
- `./page-ownership.js`
- `./search.js`

## Related tests

No explicit test files or test-related documentation cards are listed for this module.

## Known gaps or open questions

- The exact behavior and implementation details of the key functions (`compileWiki`, `computeArchDecision`) are not described in the available metadata.
- No documentation cards or test references exist, indicating potential areas for adding usage examples, API documentation, and test coverage.
- The role and impact of the environment variable `LLMWIKI_COMPILER_MODE` on runtime behavior require further clarification.
- The HTTP route `DELETE Architecture.md` is noted but its full context and usage are not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
