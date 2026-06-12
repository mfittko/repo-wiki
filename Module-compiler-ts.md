---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "7b125ae9a68ac15891f3248ef52c552b163fcda2"
page_state: "generated"
source_paths: ["src/compiler.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module: compiler.ts

## Purpose

The `compiler.ts` module is a core source component responsible for compiling the GitHub Wiki content. It provides the API surface and configuration mechanisms necessary to process and transform wiki pages. The module includes logic to compute architectural decisions and compile the wiki content, integrating multiple subsystems such as context assembly, data modeling, documentation ingestion, and validation. It also supports runtime configuration via environment variables and exposes HTTP routes for wiki page management.

## Source file list

- `src/compiler.ts`

## Key symbols and entry points

- **ArchDecision**: Represents architectural decisions computed during the compilation process.
- **compileWiki**: The main function to compile the wiki content, orchestrating various compilation steps.
- **computeArchDecision**: A function to compute and determine architectural decisions based on the wiki content and configuration.

## Dependencies and imports

The module imports several internal components to fulfill its responsibilities:

- `./context-assembler.js`: Likely used to assemble contextual information needed during compilation.
- `./data-model-signals.js`: Provides data modeling signals or reactive data structures.
- `./docs-ingestor.js`: Handles ingestion of documentation content.
- `./docs-validation.js`: Performs validation on documentation to ensure correctness.
- `./frontmatter.js`: Parses and manages frontmatter metadata in wiki pages.

Additional imports mentioned but not explicitly listed in the source card excerpt include:

- `./llm-provider.js`
- `./page-ownership.js`
- `./search.js`

## Runtime hints

- The module behavior can be influenced by the environment variable `LLMWIKI_COMPILER_MODE`.
- It exposes an HTTP route to handle DELETE requests for `Architecture.md` pages, indicating support for dynamic page management via HTTP.

## Related tests

No explicit test files or test-related documentation cards are listed for this module.

## Known gaps or open questions

- The exact semantics and usage of the `ArchDecision` type and how architectural decisions impact the compilation process are not detailed.
- The role and integration of the additional imports (`llm-provider.js`, `page-ownership.js`, `search.js`) are not fully described.
- No documentation or test cards are currently available, indicating potential areas for future documentation and test coverage improvements.
- The specifics of the HTTP route handler for deleting `Architecture.md` pages and its security or usage context remain unclear.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
