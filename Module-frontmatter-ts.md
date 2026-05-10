---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2ce19fbe28dc7fd82aa053ba642325b8a9e91f02"
page_state: "generated"
source_paths: ["src/frontmatter.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `frontmatter.ts`

## Purpose

This module provides utilities and types for handling frontmatter in source files. It includes functionality to extract, parse, and apply policies to frontmatter blocks, as well as to strip frontmatter from content. The module is designed to support structured metadata embedded at the beginning of text files, commonly used in markdown and other markup languages.

## Source file list

- `src/frontmatter.ts`

## Key symbols and entry points

- **applyFrontmatterPolicy**: Applies a specified frontmatter policy to a frontmatter block.
- **extractFrontmatterBlock**: Extracts the frontmatter block from a given text input.
- **FRONTMATTER_POLICIES**: A collection of predefined frontmatter policies.
- **FrontmatterBlock**: Type representing a frontmatter block.
- **FrontmatterPolicy**: Type defining the structure of a frontmatter policy.
- **isFrontmatterPolicy**: Type guard to check if a value is a frontmatter policy.
- **parseFrontmatterPolicy**: Parses a frontmatter policy from input.
- **stripFrontmatter**: Removes the frontmatter block from a text input.

## Dependencies and imports

- This module does not import any external modules or dependencies.

## Related tests

- No documentation or test files are explicitly associated with this module in the provided source cards.

## Known gaps or open questions

- There is no explicit documentation or test coverage referenced for this module.
- The exact nature and structure of the frontmatter policies and their usage contexts are not detailed.
- The repository and commit information are unknown, limiting traceability.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
