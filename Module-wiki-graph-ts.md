---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a81b22c39c9e23853e62bf5ce7ade491eda4c723"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `wiki-graph.ts`

## Purpose

This module provides functionality for constructing and querying a graph representation of wiki pages. It includes utilities to build an index of wiki graph nodes and edges, retrieve nodes by various criteria, and explore relationships between pages through their edges. The module is designed to support operations such as selecting affected pages, managing page paths, and filtering edges by type, facilitating structured navigation and analysis of wiki content.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection** — Likely a type or interface representing a selection of wiki graph pages affected by some criteria.
- **buildWikiGraphIndex** — Function to build an index of the wiki graph, presumably creating a structured representation of nodes and edges.
- **getAdjacentNodes** — Retrieves nodes adjacent to a given node, useful for graph traversal.
- **getEdgesByType** — Filters and returns edges of a specific type.
- **getIncomingEdges** — Retrieves edges directed towards a specified node.
- **getManagedPagePaths** — Returns paths of pages managed within the wiki graph.
- **getNodeById** — Fetches a node by its unique identifier.
- **getNodesByKind** — Retrieves nodes filtered by their kind or category.
- **getNodesByPath** — Finds nodes based on their associated path.
- **getOutgoingEdges** — Retrieves edges originating from a specified node.

## Dependencies and imports

- `./utils/fs.js` — A local utility module, likely providing filesystem-related functions.
- `node:path` — Node.js built-in module for handling and transforming file paths.

## Related tests

No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- The exact structure and semantics of `AffectedWikiGraphPageSelection` and other types are not detailed.
- There is no explicit documentation or examples illustrating how to use the exported functions.
- No information on error handling, performance considerations, or integration with other modules.
- Absence of related test coverage or test references leaves the robustness of the module unverified.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
