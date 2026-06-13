---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "06a68a1856f28bfd2083ba36b00bf83a0754e19c"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `wiki-graph.ts`

## Purpose

This module provides functionality for constructing and querying a graph representation of wiki pages. It includes utilities to build an index of wiki graph nodes and edges, retrieve nodes by various criteria, and explore relationships between pages such as adjacency and edge types. The module is designed to manage and analyze the structure of wiki content programmatically.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection** — Likely a type or interface related to selecting affected pages within the wiki graph.
- **buildWikiGraphIndex** — Function to build an index of the wiki graph, presumably creating nodes and edges from source data.
- **getAdjacentNodes** — Retrieves nodes adjacent to a given node, facilitating graph traversal.
- **getEdgesByType** — Returns edges filtered by their type, enabling focused queries on relationships.
- **getIncomingEdges** — Gets edges directed towards a specific node.
- **getManagedPagePaths** — Retrieves paths of pages managed within the graph.
- **getNodeById** — Finds a node by its unique identifier.
- **getNodesByKind** — Retrieves nodes filtered by their kind or category.
- **getNodesByPath** — Finds nodes based on their associated file or wiki path.
- **getOutgoingEdges** — Gets edges originating from a specific node.

## Dependencies and imports

- Imports from `./utils/fs.js` — likely utilities for filesystem operations related to wiki content.
- Imports from `node:path` — Node.js path utilities for handling file paths.

## Related tests

No documentation or source cards indicate the presence of related test files or test coverage for this module.

## Known gaps or open questions

- The exact structure and semantics of `AffectedWikiGraphPageSelection` are not detailed.
- There is no explicit documentation or examples illustrating how to use the graph-building and querying functions.
- Test coverage and validation of the module's functionality are not documented.
- The source repository and commit information are unknown, limiting traceability.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
