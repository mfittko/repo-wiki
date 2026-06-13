---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "f5a973364c2a93ccbfa3b102d1da911a58e92021"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module: wiki-graph.ts

## Purpose

This module provides functionality for constructing and querying a graph representation of wiki pages. It includes utilities to build an index of wiki graph nodes and edges, retrieve nodes by various criteria, and explore relationships between pages such as adjacency and edge types. The module is designed to support operations on a managed set of wiki pages, facilitating navigation and analysis of their interconnections.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection** — Likely a type or interface representing a selection of wiki graph pages affected by some operation or criteria.
- **buildWikiGraphIndex** — Function to build an index structure representing the wiki graph.
- **getAdjacentNodes** — Retrieves nodes adjacent to a given node in the graph.
- **getEdgesByType** — Retrieves edges filtered by their type.
- **getIncomingEdges** — Retrieves edges directed into a specified node.
- **getManagedPagePaths** — Returns paths of pages managed within the wiki graph.
- **getNodeById** — Retrieves a node by its unique identifier.
- **getNodesByKind** — Retrieves nodes filtered by their kind or category.
- **getNodesByPath** — Retrieves nodes based on their associated file or page path.
- **getOutgoingEdges** — Retrieves edges directed out from a specified node.

## Dependencies and imports

- `./utils/fs.js` — Presumably provides filesystem utilities used for reading or managing wiki page files.
- `node:path` — Node.js built-in module for handling and transforming file paths.

## Related tests

No explicit test files or test-related documentation cards are listed for this module.

## Known gaps or open questions

- The exact structure and semantics of `AffectedWikiGraphPageSelection` are not detailed.
- There is no documentation or test coverage information available to clarify usage patterns or edge cases.
- The module's integration context within a larger system or how it interacts with other modules is not specified.
- The source repository and commit information are unknown, limiting traceability.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
