---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a3ed30252c9bfb054e0b54fe5e6c52f8f0b8d703"
page_state: "generated"
source_paths: ["src/frontmatter.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `frontmatter.ts`

## Purpose

This module provides utilities and types for handling frontmatter blocks within text files. It includes functionality to extract, parse, and apply policies to frontmatter content, supporting structured metadata processing typically found at the beginning of markdown or similar documents.

## Source file list

- `src/frontmatter.ts`

## Key symbols and entry points

- **applyFrontmatterPolicy**: Applies a specified frontmatter policy to a given frontmatter block.
- **extractFrontmatterBlock**: Extracts the frontmatter block from a text input.
- **FRONTMATTER_POLICIES**: A collection of predefined frontmatter policies.
- **FrontmatterBlock**: Type representing a frontmatter block.
- **FrontmatterPolicy**: Type defining the structure of a frontmatter policy.
- **isFrontmatterPolicy**: Type guard to check if an object is a frontmatter policy.
- **parseFrontmatterPolicy**: Parses a frontmatter policy from input data.
- **parseSimpleYamlObject**: Parses a simple YAML object from a string.
- **stripFrontmatter**: Removes the frontmatter block from a text input.

## Dependencies and imports

- Imports from `./secret-patterns.js`

## Related tests

No documentation or test cards were found for this module. It is unknown if there are dedicated tests for the frontmatter utilities.

## Known gaps or open questions

- The module documentation and test coverage are not present or linked, leaving the extent of testing and usage examples unclear.
- The exact nature and definitions of the frontmatter policies and their application contexts are not detailed here.
- The relationship and interaction with `./secret-patterns.js` are not elaborated beyond the import statement.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
