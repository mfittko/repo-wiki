---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "253792a37296e0d106c4c2c79c48e57e4e30e395"
page_state: "generated"
source_paths: ["src/compiler.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module: compiler.ts

## Purpose

This module provides the core functionality for compiling a wiki, as indicated by the primary exported symbol `compileWiki`. It is implemented in TypeScript and serves as a source-level configuration and compilation component within the system. The module is designed to operate with environment-based configuration, specifically influenced by the `LLMWIKI_COMPILER_MODE` environment variable, suggesting runtime mode control.

## Source file list

- `src/compiler.ts`

## Key symbols and entry points

- `compileWiki`: The main exported function or symbol responsible for compiling the wiki content. This is the primary entry point for consumers of this module.

## Dependencies and imports

The module imports several other internal modules, indicating its integration with various subsystems:

- `./context-assembler.js`
- `./data-model-signals.js`
- `./docs-ingestor.js`
- `./docs-validation.js`
- `./llm-provider.js`

Additional imports mentioned in the excerpt but not explicitly listed in the source cards include:

- `./page-ownership.js`
- `./utils/fs.js`
- `./wiki-patch.js`

These dependencies suggest that `compiler.ts` coordinates context assembly, data modeling, documentation ingestion and validation, language model provider integration, file system utilities, page ownership management, and wiki patching during the compilation process.

## Related tests

No documentation or source cards indicate the presence of related tests for this module at this time.

## Known gaps or open questions

- There is no explicit documentation or test coverage information available for this module.
- The exact behavior and modes controlled by the `LLMWIKI_COMPILER_MODE` environment variable are not detailed.
- The role of some imported modules (e.g., `page-ownership.js`, `wiki-patch.js`) in the compilation process is not fully described.
- Further exploration of the `compileWiki` function's implementation would be necessary to understand the compilation workflow and error handling.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
