---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "91e712dcb91ba10ae83e41a917bf0d92fd2b7545"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `wiki-graph.ts`

## Purpose

This module provides functionality to build and query a graph representation of wiki pages. It includes utilities to index wiki pages, retrieve nodes and edges by various criteria, and navigate relationships between pages. The module is designed to support operations on a structured graph of wiki content, facilitating management and analysis of wiki page connections.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection**: Likely a type or interface representing a selection of wiki graph pages affected by some operation.
- **buildWikiGraphIndex**: Function to construct an index of the wiki graph, presumably building the core data structure representing pages and their relationships.
- **getAdjacentNodes**: Retrieves nodes adjacent to a given node, supporting graph traversal.
- **getEdgesByType**: Returns edges filtered by their type, enabling focused queries on specific relationships.
- **getIncomingEdges**: Retrieves edges directed towards a specified node.
- **getManagedPagePaths**: Returns paths of pages managed within the graph, possibly filtering or listing pages under management.
- **getNodeById**: Fetches a node in the graph by its unique identifier.
- **getNodesByKind**: Retrieves nodes filtered by their kind or category.
- **getNodesByPath**: Finds nodes based on their associated file or wiki path.
- **getOutgoingEdges**: Retrieves edges originating from a specified node.

## Dependencies and imports

- `./utils/fs.js`: A local utility module, likely providing filesystem-related functions.
- `node:path`: Node.js built-in module for handling and transforming file paths.

## Related tests

No explicit test files or test-related documentation are indicated in the source cards or module metadata.

## Known gaps or open questions

- The exact structure and semantics of `AffectedWikiGraphPageSelection` are not detailed.
- There is no documentation or test coverage information available to clarify usage patterns or verify correctness.
- The module's integration context within a larger system or wiki platform is not described.
- Details on the graph data structure (e.g., node and edge schemas) and how indexing is performed are not provided.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
