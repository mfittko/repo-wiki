---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2a5afb6af319ea4b1fcdbebcdd868a271584028c"
page_state: "generated"
source_paths: ["src/docs-ingestor.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `docs-ingestor.ts`

## Purpose

This module provides functionality for ingesting and processing documentation related to CI workflow commands. It includes utilities to extract, classify, and create structured representations of documented commands from source files. The module supports the analysis and validation of documentation claims, facilitating the generation of documentation cards that summarize command information.

## Source file list

- `src/docs-ingestor.ts`

## Key symbols and entry points

- **CiWorkflowCommandSource**: Represents a source of CI workflow commands.
- **classifyDocumentedCommands**: Function to classify commands based on their documentation status.
- **CommandClassification**: Enum or type defining possible classifications of commands.
- **CommandSource**: Represents the origin or source context of a command.
- **CommandStatus**: Enum or type indicating the status of a command.
- **createDocumentationCard**: Function to create a structured documentation card for a command.
- **DocumentedFilePath**: Type or interface representing file paths of documented sources.
- **extractCiCommands**: Function to extract CI commands from source files.
- **extractCiCommandSources**: Function to extract sources of CI commands.
- **extractDocumentationClaims**: Function to extract claims made in documentation about commands.

## Dependencies and imports

- Imports from local module:
  - `./docs-validation.js`
- Node.js built-in modules:
  - `node:fs` (filesystem operations)
  - `node:path` (path utilities)

## Related tests

No explicit test files or test-related symbols are indicated in the source cards for this module.

## Known gaps or open questions

- There is no documentation or test coverage information provided for this module.
- The exact behavior and implementation details of the key functions and types are not described beyond their names and general purpose.
- The relationship between extracted documentation claims and validation logic in `./docs-validation.js` is not detailed.
- No example usage or integration context is provided.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
