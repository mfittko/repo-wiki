---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2a5afb6af319ea4b1fcdbebcdd868a271584028c"
page_state: "generated"
source_paths: ["src/search.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `search.ts`

## Purpose

This module provides functionality related to searching within the wiki or project content. It includes building and managing a search index, formatting search results, and performing search queries. The module is implemented in TypeScript and serves as a core source component for search-related features.

## Source file list

- `src/search.ts`

## Key symbols and entry points

- `buildSearchIndex` — Function to construct or update the search index.
- `defaultSearchDirForWiki` — Default directory path used for searching within the wiki.
- `formatSearchResults` — Utility to format raw search results into a user-friendly structure.
- `SEARCH_INDEX_VERSION` — Constant representing the version of the search index format.
- `searchIndex` — The current search index data structure.
- `SearchIndex` — Type or interface defining the structure of the search index.
- `SearchIndexEntry` — Type or interface representing an individual entry in the search index.
- `SearchResult` — Type or interface for the structure of a search result.
- `searchWiki` — Function to perform a search query against the wiki content.

## Dependencies and imports

- Local modules:
  - `./frontmatter.js` — Likely used for parsing or handling frontmatter metadata.
  - `./utils/fs.js` — Utilities related to filesystem operations.
- Node.js built-in modules:
  - `node:fs` — Filesystem access.
  - `node:path` — Path utilities.

## Related tests

No documentation or source cards indicate the presence of dedicated tests for this module at this time.

## Known gaps or open questions

- No explicit test coverage or test files are documented.
- The exact behavior and API details of the exported functions and types are not described beyond symbol names.
- The repository remote URL and commit SHA are unknown, limiting traceability.
- The module's integration with other parts of the system is not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
