---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a507ef561fb391da37a72f94377f63339998865a"
page_state: "generated"
source_paths: ["src/frontmatter.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `frontmatter.ts`

## Purpose

This module provides utilities and types for handling frontmatter blocks within source files. It includes functionality to extract, parse, apply policies to, and strip frontmatter content. The module is designed to work with frontmatter policies, enabling controlled processing of frontmatter metadata.

## Source file list

- `src/frontmatter.ts`

## Key symbols and entry points

- **applyFrontmatterPolicy**: Applies a specified frontmatter policy to a frontmatter block.
- **extractFrontmatterBlock**: Extracts the frontmatter block from a given source text.
- **FRONTMATTER_POLICIES**: A collection of predefined frontmatter policies.
- **FrontmatterBlock**: Type representing a frontmatter block.
- **FrontmatterPolicy**: Type defining the structure of a frontmatter policy.
- **isFrontmatterPolicy**: Type guard to check if an object is a frontmatter policy.
- **parseFrontmatterPolicy**: Parses a frontmatter policy from a given input.
- **stripFrontmatter**: Removes the frontmatter block from a source text.

## Dependencies and imports

- Imports from `./secret-patterns.js` (details of this dependency are not specified here).

## Related tests

No documentation or test files are explicitly linked to this module in the provided source cards.

## Known gaps or open questions

- No explicit documentation or test coverage is referenced.
- The exact nature and implementation details of `./secret-patterns.js` and how it integrates with frontmatter processing are not detailed.
- The module's usage context and examples are not provided, limiting understanding of practical application.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
