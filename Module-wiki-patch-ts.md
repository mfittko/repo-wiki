---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "144bad2d897ff76640a6ae71a662559850345164"
page_state: "generated"
source_paths: ["src/wiki-patch.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module wiki-patch.ts

## Purpose

This module provides functionality for parsing, validating, and synthesizing patches to wiki pages. It defines types and functions to handle wiki patch data structures, including error handling and frontmatter processing. The module is implemented in TypeScript and serves as a source component for managing wiki content updates programmatically.

## Source file list

- `src/wiki-patch.ts`

## Key symbols and entry points

- **parseWikiPatch**: Function to parse a wiki patch from a given input.
- **validateWikiPatch**: Function to validate the structure and content of a wiki patch.
- **synthesizeWikiPage**: Function to synthesize a complete wiki page from patch data and options.
- **WikiPatch**: Type representing the structure of a wiki patch.
- **WikiPatchError**: Error class for handling wiki patch related errors.
- **WikiPatchFrontmatter**: Type representing the frontmatter metadata of a wiki patch.
- **WikiPatchIssue**: Type representing issues found during patch validation.
- **SynthesizeOptions**: Type defining options for the synthesis process.

## Dependencies and imports

- Imports from `./llm-provider.js`: likely related to language model or AI provider utilities.
- Imports from `./secret-patterns.js`: likely related to pattern matching or secret detection utilities.

## Related tests

No explicit test files or test-related documentation cards are listed for this module.

## Known gaps or open questions

- No documentation cards or test coverage information is available.
- The exact behavior and usage scenarios of the synthesis and validation functions are not detailed.
- The relationship and integration with the imported modules (`llm-provider.js` and `secret-patterns.js`) are not fully described.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
