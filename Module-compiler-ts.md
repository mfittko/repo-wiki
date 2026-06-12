---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "edb41c2402583d52b198e0b02471275199a0fcb1"
page_state: "generated"
source_paths: ["src/compiler.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `compiler.ts`

## Purpose

The `compiler.ts` module is a core source component responsible for compiling and managing the architecture decisions and wiki content within the system. It provides API surface and configuration capabilities related to the compilation process of the wiki, including decision computation and wiki compilation workflows. The module operates with runtime hints such as environment variables and HTTP routes, indicating its role in dynamic configuration and serving content.

## Source file list

- `src/compiler.ts`

## Key symbols and entry points

- **ArchDecision**: Represents architectural decisions within the compilation context.
- **compileWiki**: Main function or entry point to compile the wiki content.
- **computeArchDecision**: Function to compute or derive architectural decisions during compilation.

## Dependencies and imports

The module imports several internal components, indicating its integration with various subsystems:

- `./context-assembler.js`
- `./data-model-signals.js`
- `./docs-ingestor.js`
- `./docs-validation.js`
- `./frontmatter.js`
- (also imports from `./llm-provider.js`, `./page-ownership.js`, `./search.js` as indicated in the excerpt)

These dependencies suggest the module interacts with context assembly, data modeling, documentation ingestion and validation, frontmatter processing, language model providers, page ownership logic, and search functionalities.

## Related tests

No explicit test files or test documentation cards are listed for this module at this time.

## Known gaps or open questions

- No documentation cards or detailed usage examples are currently available.
- The exact behavior and implementation details of the exported symbols are not described in the source cards.
- The HTTP route `DELETE Architecture.md` is mentioned but its full context and usage remain unclear.
- Environment variable `LLMWIKI_COMPILER_MODE` is referenced, but its modes and effects are not documented here.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
