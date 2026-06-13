---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "104e3c23e782dbd282df6b81c63dfae18768b23f"
page_state: "generated"
source_paths: ["src/frontmatter.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `frontmatter.ts`

## Purpose

This module provides utilities and types for handling frontmatter blocks in text files, typically used for metadata in markdown or similar documents. It includes functions to extract, parse, and apply policies to frontmatter content, as well as utilities to strip frontmatter from text. The module supports working with frontmatter policies and parsing simple YAML-like objects.

## Source file list

- `src/frontmatter.ts`

## Key symbols and entry points

- **applyFrontmatterPolicy**: Applies a given frontmatter policy to a frontmatter block.
- **extractFrontmatterBlock**: Extracts the frontmatter block from a text source.
- **FRONTMATTER_POLICIES**: A collection of predefined frontmatter policies.
- **FrontmatterBlock**: Type representing a frontmatter block.
- **FrontmatterPolicy**: Type defining a frontmatter policy.
- **isFrontmatterPolicy**: Type guard to check if an object is a frontmatter policy.
- **parseFrontmatterPolicy**: Parses a frontmatter policy from input.
- **parseSimpleYamlObject**: Parses a simple YAML-like object from text.
- **stripFrontmatter**: Removes the frontmatter block from a text source.

## Dependencies and imports

- Imports from `./secret-patterns.js` (details not specified in this module).

## Related tests

- No documentation or test cards were found for this module, so related tests are currently unknown.

## Known gaps or open questions

- The module does not have associated documentation or test cards, so the extent of test coverage and usage examples is unclear.
- The exact nature and structure of `FRONTMATTER_POLICIES` and how policies are defined or applied are not detailed here.
- The dependency on `./secret-patterns.js` is noted, but the role of this import in frontmatter processing is not described.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
