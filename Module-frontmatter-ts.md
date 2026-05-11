---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "3c7f4808701c06a5d3bcd8e1455221b272566b71"
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
- **isFrontmatterPolicy**: Type guard to check if a value is a frontmatter policy.
- **parseFrontmatterPolicy**: Parses a frontmatter policy from input.
- **stripFrontmatter**: Removes the frontmatter block from a source text.

## Dependencies and imports

- Imports from `./secret-patterns.js`

## Related tests

No documentation or test files are listed for this module. It is unknown if tests exist or where they might be located.

## Known gaps or open questions

- No explicit documentation or test coverage is provided.
- The exact nature and structure of `FRONTMATTER_POLICIES` and how policies are defined or used are not detailed beyond symbol names.
- The relationship and usage context of the imported `./secret-patterns.js` module are not described.
- The module's integration with other parts of the system or its usage scenarios remain unspecified.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
