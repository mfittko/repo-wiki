---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "4876d92ad775fdaa882464db71be1c1ed241f47f"
page_state: "generated"
source_paths: ["src/review-context.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `review-context.ts`

## Purpose

This module provides functionality related to constructing and managing review contexts for code changes. It includes types and functions to parse git diffs, extract changed file paths, and build structured bundles representing review contexts. These bundles can be formatted and used to facilitate code review processes by organizing diffs and related metadata.

## Source file list

- `src/review-context.ts`

## Key symbols and entry points

- **AdjacentFile**: Likely a type or interface representing a file adjacent to a diff or review context.
- **buildReviewContextBundle**: Function to assemble a comprehensive review context bundle from diff data.
- **DiffFile**: Type representing a file in a diff.
- **DiffHunk**: Type representing a hunk (a contiguous block of changes) within a diff file.
- **DiffHunkLine**: Type representing a single line within a diff hunk.
- **formatReviewContextBundle**: Function to format a review context bundle, possibly for display or export.
- **getChangedFilePaths**: Function to extract the list of changed file paths from a diff or repository state.
- **getGitDiff**: Function to retrieve git diff data, likely from the local repository.
- **parseGitDiff**: Function to parse raw git diff output into structured data.
- **RelatedWikiPage**: Possibly a type or utility related to linking review context data to wiki pages.

## Dependencies and imports

This module imports from several internal utilities and modules:

- `./extractors.js`
- `./frontmatter.js`
- `./language.js`
- `./utils/fs.js`
- `./utils/git.js`

Additionally, it imports from Node.js core modules such as `fs`. It also references modules related to wiki graph and query functionality (`./wiki-graph.js`, `./wiki-query.js`), indicating integration with wiki or documentation systems.

## Related tests

No explicit test files or test-related documentation cards are listed for this module. It is unclear if dedicated tests exist or are located elsewhere.

## Known gaps or open questions

- There is no documentation or comments provided in the source cards, so detailed behavior and usage patterns of the key functions and types are not fully clear.
- The relationship between review context bundles and wiki pages (via `RelatedWikiPage`) is not elaborated.
- The absence of related test information leaves the testing coverage and reliability of this module uncertain.
- The exact structure and format of the review context bundles and how they integrate with other systems remain to be clarified.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
