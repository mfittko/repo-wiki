---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "db3dd5c6e2bdb430282661ff44b002d22af0bade"
page_state: "generated"
source_paths: ["src/frontmatter.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `frontmatter.ts`

## Purpose

This module provides utilities and types for handling frontmatter in source files. It includes functionality to extract, parse, apply policies to, and strip frontmatter blocks. The module defines policies and types related to frontmatter processing, enabling controlled manipulation and validation of frontmatter content.

## Source file list

- `src/frontmatter.ts`

## Key symbols and entry points

- **applyFrontmatterPolicy**: Applies a specified frontmatter policy to a frontmatter block.
- **extractFrontmatterBlock**: Extracts the frontmatter block from a given source text.
- **FRONTMATTER_POLICIES**: A collection of predefined frontmatter policies.
- **FrontmatterBlock**: Type representing a frontmatter block.
- **FrontmatterPolicy**: Type defining the structure of a frontmatter policy.
- **isFrontmatterPolicy**: Type guard to check if a value is a frontmatter policy.
- **parseFrontmatterPolicy**: Parses a frontmatter policy from input.
- **stripFrontmatter**: Removes the frontmatter block from a source text.

## Dependencies and imports

- Imports from `./secret-patterns.js` (details of imported entities are not specified in the source card).

## Related tests

No documentation or test files are listed for this module in the provided source cards.

## Known gaps or open questions

- No explicit documentation or test coverage is indicated.
- The exact nature and implementation details of the imported `./secret-patterns.js` module are not described.
- The specific frontmatter formats supported and the policies available in `FRONTMATTER_POLICIES` are not detailed here.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
