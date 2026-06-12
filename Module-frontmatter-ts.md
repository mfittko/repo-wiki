---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "144bad2d897ff76640a6ae71a662559850345164"
page_state: "generated"
source_paths: ["src/frontmatter.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `frontmatter.ts`

## Purpose

This module provides utilities and types for handling frontmatter in text files, particularly focusing on parsing, extracting, and applying policies to frontmatter blocks. It includes functionality to identify and manipulate frontmatter sections, parse simple YAML objects within frontmatter, and enforce or apply frontmatter policies.

## Source file list

- `src/frontmatter.ts`

## Key symbols and entry points

- **applyFrontmatterPolicy**: Function to apply a given frontmatter policy to a frontmatter block.
- **extractFrontmatterBlock**: Function to extract the frontmatter block from a text source.
- **FRONTMATTER_POLICIES**: Presumably a collection or registry of predefined frontmatter policies.
- **FrontmatterBlock**: Type representing a frontmatter block.
- **FrontmatterPolicy**: Type defining the structure of a frontmatter policy.
- **isFrontmatterPolicy**: Type guard or predicate function to check if an object is a frontmatter policy.
- **parseFrontmatterPolicy**: Function to parse a frontmatter policy from a given input.
- **parseSimpleYamlObject**: Function to parse a simple YAML object, likely used within frontmatter.
- **stripFrontmatter**: Function to remove frontmatter from a text source.

## Dependencies and imports

- Imports from `./secret-patterns.js` (details of this dependency are not provided here, but it likely contains patterns or utilities related to secret detection or pattern matching used in frontmatter processing).

## Related tests

- No documentation or test cards were found for this module. It is unknown if there are dedicated tests for `frontmatter.ts`.

## Known gaps or open questions

- The exact nature and contents of `FRONTMATTER_POLICIES` are not detailed.
- No explicit documentation or test coverage information is available.
- The relationship and usage context of `./secret-patterns.js` in this module is not fully described.
- The module's handling of complex YAML frontmatter or edge cases is not specified.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
