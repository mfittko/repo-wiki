---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "171111a1609e1e510e20bfa1989ecfcee1993eb2"
page_state: "generated"
source_paths: ["src/compiler.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `compiler.ts`

## Purpose

The `compiler.ts` module is a core source component responsible for compiling and processing wiki content. It provides the API surface and configuration mechanisms necessary to transform source data into structured wiki pages. The module handles architectural decisions related to compilation and integrates with various subsystems such as context assembly, data modeling, documentation ingestion, and validation. It also supports runtime configuration via environment variables and exposes HTTP routes for managing wiki content.

## Source file list

- `src/compiler.ts`

## Key symbols and entry points

- **ArchDecision**: Represents architectural decisions made during the compilation process.
- **compileWiki**: The primary function to compile wiki content, orchestrating the transformation pipeline.
- **computeArchDecision**: Computes and determines architectural decisions that influence compilation behavior.

## Dependencies and imports

The module imports several internal components to fulfill its responsibilities:

- `./context-assembler.js` — likely for assembling contextual information during compilation.
- `./data-model-signals.js` — for managing data model signals and state.
- `./docs-ingestor.js` — to ingest documentation content.
- `./docs-validation.js` — to validate documentation correctness and consistency.
- `./frontmatter.js` — for handling frontmatter metadata in source files.

Additional imports (noted in the excerpt but not explicitly listed in the source card imports) include:

- `./llm-provider.js`
- `./page-ownership.js`
- `./utils/fs.js`

## Runtime hints

- The module behavior can be influenced by the environment variable `LLMWIKI_COMPILER_MODE`.
- It exposes an HTTP route to handle DELETE requests for `Architecture.md`, indicating dynamic content management capabilities.

## Related tests

No explicit test files or test-related documentation cards are listed for this module.

## Known gaps or open questions

- No documentation cards or detailed usage examples are currently available.
- The exact semantics and usage patterns of `ArchDecision` and `computeArchDecision` require further exploration.
- The role and integration details of the HTTP route for deleting `Architecture.md` are not fully described.
- The impact and configuration options of the `LLMWIKI_COMPILER_MODE` environment variable need clarification.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
