---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "3d197a3e565e4f3a6a053214eb093873fb70b90a"
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

- Imports from `./secret-patterns.js` for internal pattern matching or secret handling related to frontmatter processing.

## Related tests

No explicit test files or test-related documentation are listed for this module.

## Known gaps or open questions

- No documentation cards or test references are available, indicating potential gaps in usage examples or test coverage.
- The source repository and commit information are unknown, limiting traceability.
- The exact nature and structure of `FRONTMATTER_POLICIES` and how policies are defined or applied are not detailed here.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
