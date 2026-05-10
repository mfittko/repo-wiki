---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
page_state: "generated"
source_paths: ["src/wiki-patch.ts"]
compiled_at: "2026-05-10T21:15:56.521Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---
# Module wiki-patch.ts

## Purpose

This module provides core functionality for parsing, validating, and synthesizing patches to GitHub Wiki pages. It defines types and error classes related to wiki patch operations and exposes functions to process wiki patch data. The module is implemented in TypeScript and imports utilities from local modules for language model interaction and secret pattern handling.

## Source file list

- [src/wiki-patch.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/src/wiki-patch.ts)

## Key symbols and entry points

- **parseWikiPatch**: Function to parse a wiki patch from a given input.
- **validateWikiPatch**: Function to validate the structure and content of a wiki patch.
- **synthesizeWikiPage**: Function to synthesize or generate a wiki page based on patch data and options.
- **WikiPatch**: Type representing the structure of a wiki patch.
- **WikiPatchError**: Error class for exceptions related to wiki patch processing.
- **WikiPatchFrontmatter**: Type describing the frontmatter metadata of a wiki patch.
- **WikiPatchIssue**: Type representing issues or problems found in a wiki patch.
- **SynthesizeOptions**: Options type for controlling the synthesis process.

## Dependencies and imports

- Imports from `./llm-provider.js`: likely for language model interactions or AI-driven processing.
- Imports from `./secret-patterns.js`: likely for handling or detecting secret patterns within wiki content.

## Related tests

- [test/wiki-patch.test.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/test/wiki-patch.test.ts)

## Known gaps or open questions

- No explicit documentation or usage examples are provided in the source cards.
- The exact behavior and implementation details of the synthesis and validation functions require review of the source code.
- Integration details with the imported modules (`llm-provider.js` and `secret-patterns.js`) are not detailed here.
- Further refinement and documentation could improve clarity on error handling and patch issue reporting.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
