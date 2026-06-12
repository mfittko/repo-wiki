---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2f0f1d4621e326372c896cfd4888a22f68ec0f48"
page_state: "generated"
source_paths: ["src/frontmatter.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `frontmatter.ts`

## Purpose

This module provides utilities for handling frontmatter blocks within text files, typically used for metadata in markdown or similar documents. It includes functions and types to extract, parse, and apply policies to frontmatter content, supporting structured metadata processing. The module also defines policies and parsing strategies for frontmatter, including YAML-like simple object parsing and policy validation.

## Source file list

- `src/frontmatter.ts`

## Key symbols and entry points

- **applyFrontmatterPolicy**: Applies a defined frontmatter policy to a given frontmatter block.
- **extractFrontmatterBlock**: Extracts the frontmatter block from a text source.
- **FRONTMATTER_POLICIES**: A collection of predefined frontmatter policies.
- **FrontmatterBlock**: Type representing a frontmatter block.
- **FrontmatterPolicy**: Type defining a frontmatter policy.
- **isFrontmatterPolicy**: Type guard to check if an object is a frontmatter policy.
- **parseFrontmatterPolicy**: Parses a frontmatter policy from input.
- **parseSimpleYamlObject**: Parses a simple YAML-like object from text.
- **stripFrontmatter**: Removes the frontmatter block from a text source.

## Dependencies and imports

- Imports from `./secret-patterns.js` (details not specified in this module).

## Related tests

No documentation or test cards are currently associated with this module.

## Known gaps or open questions

- No explicit documentation or test coverage is linked, which may limit understanding of usage scenarios.
- The exact nature and structure of `FRONTMATTER_POLICIES` and how policies are defined or extended are not detailed here.
- The relationship and integration with `./secret-patterns.js` are not described, leaving some dependency context unclear.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
