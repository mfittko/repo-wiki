---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "91e712dcb91ba10ae83e41a917bf0d92fd2b7545"
page_state: "generated"
source_paths: ["src/compiler.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `compiler.ts`

## Purpose

The `compiler.ts` module is a core source component responsible for compiling GitHub Wiki content. It provides the API surface and configuration mechanisms necessary to process and transform wiki pages, including architectural decision records. The module supports runtime configuration via environment variables and exposes HTTP routes for managing wiki content, such as deleting architecture documentation pages.

## Source file list

- `src/compiler.ts`

## Key symbols and entry points

- **ArchDecision**: Represents architectural decision records within the wiki content.
- **compileWiki**: Main function to compile the entire wiki, orchestrating the processing of source documents.
- **computeArchDecision**: Function to compute or derive architectural decisions from source data.

## Dependencies and imports

The module imports several internal components to fulfill its responsibilities:

- `./context-assembler.js`
- `./data-model-signals.js`
- `./docs-ingestor.js`
- `./docs-validation.js`
- `./frontmatter.js`

These dependencies suggest the module integrates context assembly, data modeling, document ingestion, validation, and frontmatter parsing as part of the compilation process.

## Related tests

No explicit test files or test-related documentation cards are listed for this module.

## Known gaps or open questions

- No documentation cards or detailed usage examples are currently available.
- The exact behavior and configuration options controlled by the `LLMWIKI_COMPILER_MODE` environment variable are not described.
- The HTTP route for deleting `Architecture.md` pages is noted but lacks detailed documentation on usage or security considerations.
- The module's interaction with other components like `llm-provider.js`, `page-ownership.js`, and `search.js` is implied but not detailed in the source cards.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
