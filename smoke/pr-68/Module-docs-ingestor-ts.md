---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
page_state: "generated"
source_paths: ["src/docs-ingestor.ts"]
compiled_at: "2026-05-10T21:15:56.521Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module docs-ingestor.ts

## Purpose

This module provides functionality for ingesting and classifying documentation related to CI workflow commands. It includes utilities to extract commands and their sources from documentation files, classify documented commands, and create structured documentation cards. The module serves as a source-level component for processing and organizing CI command documentation within the codebase.

## Source file list

- [src/docs-ingestor.ts](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/src/docs-ingestor.ts)

## Key symbols and entry points

- **CiWorkflowCommandSource** — Represents a source of CI workflow commands.
- **classifyDocumentedCommands** — Function to classify commands extracted from documentation.
- **CommandClassification** — Type or interface describing classification results.
- **CommandSource** — Represents a source entity for commands.
- **CommandStatus** — Enum or type indicating the status of commands.
- **createDocumentationCard** — Factory function to create structured documentation cards.
- **DocumentedFilePath** — Type representing file paths of documented sources.
- **extractCiCommands** — Extracts CI commands from documentation.
- **extractCiCommandSources** — Extracts sources of CI commands.
- **extractDocumentationClaims** — Extracts claims made in documentation about commands.

## Dependencies and imports

- Imports from local module: `./docs-validation.js`
- Node.js built-in modules: `fs` (file system), `path` (path utilities)

## Related tests

No explicit test files or test-related documentation cards are indicated for this module in the current source cards.

## Known gaps or open questions

- The module does not currently have associated documentation cards or detailed usage examples.
- Testing strategy and coverage for the extraction and classification functions are not specified.
- The relationship and integration with other documentation or CI workflow modules could be further clarified.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
