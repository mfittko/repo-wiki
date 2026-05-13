---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "73d2678ea962143138b0ea2c5c2afd3eb79dd847"
page_state: "generated"
source_paths: ["src/frontmatter.ts"]
compiled_at: "2024-06-05T00:00:00Z"
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
- **extractFrontmatterBlock**: Extracts the frontmatter block from a source text.
- **FRONTMATTER_POLICIES**: A collection of predefined frontmatter policies.
- **FrontmatterBlock**: Type representing a frontmatter block.
- **FrontmatterPolicy**: Type defining the structure of a frontmatter policy.
- **isFrontmatterPolicy**: Type guard to check if an object is a frontmatter policy.
- **parseFrontmatterPolicy**: Parses a frontmatter policy from a given input.
- **stripFrontmatter**: Removes the frontmatter block from a source text.

## Dependencies and imports

- Imports from `./secret-patterns.js` (details of imported entities are not specified in the source card).

## Related tests

No documentation or test files are listed for this module in the provided source cards.

## Known gaps or open questions

- The exact nature and implementation details of the imported `./secret-patterns.js` module are not described.
- No explicit test coverage or documentation is available, which may limit understanding of edge cases or usage examples.
- The module's integration context or how it interacts with other parts of the system is not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
