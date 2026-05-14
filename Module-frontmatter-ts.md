---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "eda9d272e7c9de7e891622628d448f396d033b3f"
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

- Imports from `./secret-patterns.js`

## Related tests

No documentation or test files are explicitly linked to this module in the provided source cards.

## Known gaps or open questions

- No explicit documentation or test coverage is referenced.
- The exact nature and structure of `FRONTMATTER_POLICIES` and how policies are defined or used are not detailed beyond symbol names.
- The relationship and usage context of `secret-patterns.js` in frontmatter processing is not described.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
