---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "349f357c41f2135ffba209e27c9fa6e032320e2e"
page_state: "generated"
source_paths: ["src/compiler.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `compiler.ts`

## Purpose

The `compiler.ts` module is a core source component responsible for compiling and processing wiki content. It provides functionality to compute architectural decisions and compile the wiki based on configuration and source inputs. The module exposes an API surface that supports environment-driven modes and HTTP route handling, indicating its role in both configuration and runtime compilation workflows.

## Source file list

- `src/compiler.ts`

## Key symbols and entry points

- **ArchDecision**: Represents architectural decisions computed or used during compilation.
- **compileWiki**: Main function to compile the wiki content, likely orchestrating the compilation process.
- **computeArchDecision**: Function to compute or derive architectural decisions relevant to the wiki compilation.

## Dependencies and imports

The module imports several internal components, indicating a tightly integrated compilation pipeline:

- `./context-assembler.js`
- `./data-model-signals.js`
- `./docs-ingestor.js`
- `./docs-validation.js`
- `./frontmatter.js`

Additional imports mentioned in the excerpt but not explicitly listed in the source card include:

- `./llm-provider.js`
- `./page-ownership.js`
- `./utils/fs.js`

These dependencies suggest the module interacts with context assembly, data modeling, documentation ingestion and validation, frontmatter parsing, and possibly language model providers and filesystem utilities.

## Related tests

No explicit test files or test-related documentation cards are listed for this module. The absence of related tests in the source cards indicates a potential area for future test coverage or documentation.

## Known gaps or open questions

- The exact behavior and implementation details of the exported functions and types are not documented.
- No documentation cards or usage examples are available to clarify the API usage.
- The environment variable `LLMWIKI_COMPILER_MODE` is referenced but its modes and effects are not described.
- The module handles an HTTP DELETE route for `Architecture.md` with an unknown handler context, suggesting some runtime HTTP interface that is not fully documented.
- The integration and role of the additional imports (`llm-provider.js`, `page-ownership.js`, `utils/fs.js`) are not fully clear from the available information.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
