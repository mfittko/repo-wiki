---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "b0953206f44fa44851f3fa8f9b52d7b620b0b262"
page_state: "generated"
source_paths: ["src/review-context.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `review-context.ts`

## Purpose

This module provides functionality related to constructing and managing review contexts based on Git diffs and file changes. It includes types and functions to parse Git diffs, extract changed file paths, and build structured bundles of review context information. The module appears to be designed to support code review tooling or automated analysis by organizing diff data into manageable structures.

## Source file list

- `src/review-context.ts`

## Key symbols and entry points

- **Types and Interfaces:**
  - `AdjacentFile`
  - `DiffFile`
  - `DiffHunk`
  - `DiffHunkLine`
  - `RelatedWikiPage`

- **Functions:**
  - `buildReviewContextBundle` — Constructs a comprehensive review context bundle from diff data.
  - `formatReviewContextBundle` — Formats the review context bundle for output or further processing.
  - `getChangedFilePaths` — Retrieves the list of file paths changed in a Git diff.
  - `getGitDiff` — Obtains the raw Git diff data.
  - `parseGitDiff` — Parses raw Git diff text into structured diff objects.

## Dependencies and imports

The module imports several internal utilities and modules, as well as Node.js core modules:

- Internal modules:
  - `./extractors.js`
  - `./frontmatter.js`
  - `./language.js`
  - `./utils/fs.js`
  - `./utils/git.js`
  - `./wiki-graph.js`
  - `./wiki-query.js`

- Node.js core module:
  - `fs`

These dependencies suggest the module integrates file system operations, Git interactions, language processing, and wiki-related graph and query utilities to build its review context features.

## Related tests

No explicit test files or test-related documentation cards were identified for this module in the provided source cards or metadata.

## Known gaps or open questions

- There is no documentation or test coverage information available, which limits understanding of usage patterns and robustness.
- The exact structure and format of the review context bundle and how it integrates with other parts of the system are not detailed.
- The role of `RelatedWikiPage` and how wiki-related imports interact with the review context is not fully clear from the source card excerpt.
- The module’s error handling, performance characteristics, and configuration options are not described.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
