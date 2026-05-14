---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "64636a87dfde6c5a3055391035a1bb4598fc5c10"
page_state: "generated"
source_paths: ["src/frontmatter.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `frontmatter.ts`

## Purpose

This module provides utilities and types for handling frontmatter in source files. It includes functionality to extract, parse, apply policies to, and strip frontmatter blocks. The module is designed to work with frontmatter policies, enabling controlled processing of frontmatter content.

## Source file list

- `src/frontmatter.ts`

## Key symbols and entry points

- **applyFrontmatterPolicy**: Applies a specified frontmatter policy to frontmatter content.
- **extractFrontmatterBlock**: Extracts the frontmatter block from a source text.
- **FRONTMATTER_POLICIES**: A collection or registry of predefined frontmatter policies.
- **FrontmatterBlock**: Type representing a frontmatter block.
- **FrontmatterPolicy**: Type defining the structure of a frontmatter policy.
- **isFrontmatterPolicy**: Type guard to check if a value conforms to the FrontmatterPolicy type.
- **parseFrontmatterPolicy**: Parses a frontmatter policy from a given input.
- **stripFrontmatter**: Removes the frontmatter block from a source text.

## Dependencies and imports

- Imports from `./secret-patterns.js` (likely providing regex patterns or utilities related to secret or sensitive data handling within frontmatter).

## Related tests

- No explicit test files or test documentation cards are listed for this module.

## Known gaps or open questions

- The module does not have associated documentation cards or test references, indicating potential gaps in documentation and test coverage.
- The exact nature and structure of `FRONTMATTER_POLICIES` and how policies are defined or used are not detailed here.
- The relationship and integration with `./secret-patterns.js` are not elaborated, leaving some uncertainty about the scope of secret pattern handling within frontmatter processing.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
