---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a81b22c39c9e23853e62bf5ce7ade491eda4c723"
page_state: "generated"
source_paths: ["src/frontmatter.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `frontmatter.ts`

## Purpose

This module provides utilities for handling frontmatter blocks within text files, typically used for metadata in markdown or similar documents. It includes functions and types to extract, parse, and apply policies to frontmatter content, supporting structured metadata processing. The module also defines policies and parsing strategies for frontmatter, including YAML-like structures.

## Source file list

- `src/frontmatter.ts`

## Key symbols and entry points

- **applyFrontmatterPolicy**: Applies a specified frontmatter policy to a given frontmatter block.
- **extractFrontmatterBlock**: Extracts the frontmatter block from a text input.
- **FRONTMATTER_POLICIES**: A collection of predefined frontmatter policies.
- **FrontmatterBlock**: Type representing a frontmatter block.
- **FrontmatterPolicy**: Type defining the interface for frontmatter policies.
- **isFrontmatterPolicy**: Type guard to check if an object is a FrontmatterPolicy.
- **parseFrontmatterPolicy**: Parses a frontmatter policy from input.
- **parseSimpleYamlObject**: Parses a simple YAML object from frontmatter content.
- **stripFrontmatter**: Removes the frontmatter block from a text input.

## Dependencies and imports

- Imports from `./secret-patterns.js` (details not specified in this module).

## Related tests

No documentation or test cards were found for this module. It is unknown if there are dedicated tests for the frontmatter utilities.

## Known gaps or open questions

- The exact nature and implementation details of the imported `./secret-patterns.js` are not described here.
- No explicit documentation or test coverage information is available.
- The module's handling of complex YAML or other frontmatter formats beyond "simple" YAML objects is not detailed.
- The policies available in `FRONTMATTER_POLICIES` and their specific behaviors are not enumerated in this summary.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
