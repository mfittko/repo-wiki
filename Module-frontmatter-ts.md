---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2a5afb6af319ea4b1fcdbebcdd868a271584028c"
page_state: "generated"
source_paths: ["src/frontmatter.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `frontmatter.ts`

## Purpose

This module provides utilities and types for handling frontmatter in text files, particularly focusing on parsing, extracting, and applying policies to frontmatter blocks. It includes functionality to parse frontmatter content, strip frontmatter from documents, and manage frontmatter policies that govern how frontmatter is processed.

## Source file list

- `src/frontmatter.ts`

## Key symbols and entry points

- **applyFrontmatterPolicy**: Applies a specified frontmatter policy to a frontmatter block.
- **extractFrontmatterBlock**: Extracts the frontmatter block from a text document.
- **FRONTMATTER_POLICIES**: A collection of predefined frontmatter policies.
- **FrontmatterBlock**: Type representing a frontmatter block extracted from a document.
- **FrontmatterPolicy**: Type defining the structure and behavior of a frontmatter policy.
- **isFrontmatterPolicy**: Type guard to check if an object conforms to the FrontmatterPolicy interface.
- **parseFrontmatterPolicy**: Parses a frontmatter policy from a given input.
- **parseSimpleYamlObject**: Parses a simple YAML object, likely used for frontmatter content.
- **stripFrontmatter**: Removes the frontmatter block from a document, returning the content without frontmatter.

## Dependencies and imports

- Imports from `./secret-patterns.js` (details of this dependency are not specified here).

## Related tests

- No documentation or test cards are currently available for this module.

## Known gaps or open questions

- There is no explicit documentation or test coverage information available.
- The exact nature and implementation details of the imported `./secret-patterns.js` module are not described.
- The module's integration context or usage examples are not provided, limiting understanding of practical applications.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
