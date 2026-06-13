---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a81b22c39c9e23853e62bf5ce7ade491eda4c723"
page_state: "generated"
source_paths: ["src/wiki-patch.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module wiki-patch.ts

## Purpose

This module provides functionality for parsing, validating, and synthesizing wiki patches. It defines types and functions to handle wiki patch data structures, including error handling and frontmatter processing. The module is implemented in TypeScript and serves as a source component for managing wiki page modifications programmatically.

## Source file list

- `src/wiki-patch.ts`

## Key symbols and entry points

- **parseWikiPatch**: Function to parse a wiki patch from a given input.
- **validateWikiPatch**: Function to validate the structure and content of a wiki patch.
- **synthesizeWikiPage**: Function to synthesize a complete wiki page from patch data.
- **WikiPatch**: Type representing the structure of a wiki patch.
- **WikiPatchError**: Error class for handling wiki patch related errors.
- **WikiPatchFrontmatter**: Type describing the frontmatter metadata of a wiki patch.
- **WikiPatchIssue**: Type representing issues found during patch validation.
- **SynthesizeOptions**: Options type for controlling the synthesis process.

## Dependencies and imports

- Imports from `./llm-provider.js`
- Imports from `./secret-patterns.js`

## Related tests

No documentation or test files are listed for this module in the source cards.

## Known gaps or open questions

- There are no documented tests or example usage provided in the source cards.
- The exact behavior and implementation details of the key functions are not described beyond their names and types.
- The relationship between the imported modules and their role in this module is not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
