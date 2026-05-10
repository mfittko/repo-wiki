---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
page_state: "generated"
source_paths: ["src/frontmatter.ts"]
compiled_at: "2026-05-10T21:15:56.521Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module frontmatter.ts

## Purpose

This module provides utilities and types for handling frontmatter blocks within text files. It includes functionality to extract frontmatter blocks, parse and apply frontmatter policies, and strip frontmatter sections from text. These capabilities support managing metadata commonly embedded in markdown and other text-based formats.

## Source file list

- [src/frontmatter.ts](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/src/frontmatter.ts)

## Key symbols and entry points

- **applyFrontmatterPolicy**: Applies a specified frontmatter policy to a frontmatter block.
- **extractFrontmatterBlock**: Extracts the frontmatter block from a given text input.
- **FRONTMATTER_POLICIES**: A collection of predefined frontmatter policies.
- **FrontmatterBlock**: Type representing a frontmatter block.
- **FrontmatterPolicy**: Type defining the structure of a frontmatter policy.
- **isFrontmatterPolicy**: Type guard to check if an object is a FrontmatterPolicy.
- **parseFrontmatterPolicy**: Parses a frontmatter policy from input.
- **stripFrontmatter**: Removes the frontmatter block from a text input.

## Dependencies and imports

- Imports from `./secret-patterns.js`, which likely provides pattern definitions or utilities used in frontmatter processing.

## Related tests

- [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/test/frontmatter.test.ts)

## Known gaps or open questions

- No explicit documentation cards or detailed usage examples are present in the source cards.
- The exact structure and extensibility of `FRONTMATTER_POLICIES` and how policies are defined or extended is not detailed here.
- The relationship and integration with `secret-patterns.js` is not elaborated.
- Further refinement and documentation could clarify usage scenarios and policy definitions.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
