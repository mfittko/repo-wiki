---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "f5a973364c2a93ccbfa3b102d1da911a58e92021"
page_state: "generated"
source_paths: ["src/compiler.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module: compiler.ts

## Purpose

The `compiler.ts` module is a core source component responsible for compiling the GitHub Wiki content. It provides the API surface and configuration logic necessary to process and transform wiki pages, including architectural decision records. The module supports runtime configuration via environment variables and exposes HTTP routes for managing wiki content, such as deleting architecture documentation pages.

## Source file list

- `src/compiler.ts`

## Key symbols and entry points

- **ArchDecision**: Represents architectural decision records within the wiki content.
- **compileWiki**: Main function to compile the entire wiki, orchestrating the processing of source documents.
- **computeArchDecision**: Function to compute or derive architectural decisions from the source data.

## Dependencies and imports

The module imports several internal components to fulfill its responsibilities:

- `./context-assembler.js`
- `./data-model-signals.js`
- `./docs-ingestor.js`
- `./docs-validation.js`
- `./frontmatter.js`
- Additional imports inferred from the excerpt (not explicitly listed in source cards but present in source): `./llm-provider.js`, `./page-ownership.js`, `./search.js`

These dependencies provide context assembly, data modeling, document ingestion and validation, frontmatter parsing, language model integration, page ownership management, and search capabilities.

## Related tests

No explicit test files or test-related documentation cards are listed for this module.

## Known gaps or open questions

- The module's runtime behavior is influenced by the environment variable `LLMWIKI_COMPILER_MODE`, but details on the modes and their effects are not documented here.
- The HTTP route `DELETE Architecture.md` is registered with an unknown handler context (`pages`), but further details on its implementation or usage are not provided.
- No documentation cards or test coverage information is available, indicating potential areas for future documentation and testing improvements.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
