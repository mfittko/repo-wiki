---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "144bad2d897ff76640a6ae71a662559850345164"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module wiki-graph.ts

## Purpose

This module provides functionality for constructing and querying a graph representation of wiki pages. It includes utilities to build an index of wiki graph nodes and edges, retrieve nodes by various criteria, and explore relationships between pages such as adjacency and edge types. The module is designed to support management and analysis of wiki page structures.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection**: Likely a type or interface related to selecting affected pages within the wiki graph.
- **buildWikiGraphIndex**: Function to build an index of the wiki graph, presumably creating nodes and edges from source data.
- **getAdjacentNodes**: Retrieves nodes adjacent to a given node, supporting graph traversal.
- **getEdgesByType**: Filters edges by their type, enabling focused queries on relationships.
- **getIncomingEdges**: Retrieves edges directed towards a specific node.
- **getManagedPagePaths**: Returns paths of pages managed within the wiki graph.
- **getNodeById**: Fetches a node by its unique identifier.
- **getNodesByKind**: Retrieves nodes filtered by their kind or category.
- **getNodesByPath**: Finds nodes based on their associated file or page path.
- **getOutgoingEdges**: Retrieves edges originating from a specific node.

## Dependencies and imports

- Imports from `./utils/fs.js`: likely utilities for filesystem operations related to wiki page data.
- Imports from `node:path`: Node.js path utilities for handling file paths.

## Related tests

No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- The exact structure and semantics of `AffectedWikiGraphPageSelection` are not detailed.
- No explicit documentation or examples are provided for the usage of the exported functions.
- The module's integration with other parts of the system or how the graph data is sourced and updated is not described.
- Absence of related test information leaves the testing coverage and reliability unknown.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
