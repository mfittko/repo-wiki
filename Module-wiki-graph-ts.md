---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "4876d92ad775fdaa882464db71be1c1ed241f47f"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `wiki-graph.ts`

## Purpose

This module provides functionality for constructing and querying a graph representation of wiki pages. It includes utilities to build an index of wiki graph nodes and edges, retrieve nodes by various criteria, and explore relationships between pages through their edges. The module is designed to support operations on wiki page graphs, such as identifying adjacent nodes, filtering edges by type, and managing page paths.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection** — Likely a type or interface related to selecting affected pages within the wiki graph.
- **buildWikiGraphIndex** — Function to build an index structure representing the wiki graph.
- **getAdjacentNodes** — Retrieves nodes adjacent to a given node in the graph.
- **getEdgesByType** — Filters and returns edges of a specific type.
- **getIncomingEdges** — Retrieves edges directed towards a specified node.
- **getManagedPagePaths** — Returns paths of pages managed within the graph.
- **getNodeById** — Retrieves a node by its unique identifier.
- **getNodesByKind** — Retrieves nodes filtered by their kind or category.
- **getNodesByPath** — Retrieves nodes based on their associated paths.
- **getOutgoingEdges** — Retrieves edges originating from a specified node.

## Dependencies and imports

- Imports from `./utils/fs.js` — likely utilities related to filesystem operations.
- Imports from `node:path` — Node.js built-in module for handling and transforming file paths.

## Related tests

No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- The exact structure and semantics of `AffectedWikiGraphPageSelection` are not detailed.
- There is no explicit documentation or test coverage information available.
- The module's integration context within a larger system or application is not described.
- Details on the types of edges and nodes (e.g., their schema or attributes) are not provided.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
