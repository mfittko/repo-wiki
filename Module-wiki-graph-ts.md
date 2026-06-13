---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "f3abfc0fc6ecf916c2293708106a5018ea85180d"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `wiki-graph.ts`

## Purpose

This module provides functionality for constructing and querying a graph representation of wiki pages. It includes utilities to build an index of wiki graph nodes and edges, retrieve nodes by various criteria, and explore relationships between pages such as adjacency and edge types. The module is implemented in TypeScript and serves as a core source component for managing wiki graph data structures.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection**: Likely a type or interface related to selecting affected pages within the wiki graph.
- **buildWikiGraphIndex**: Function to build an index of the wiki graph, presumably creating nodes and edges from source data.
- **getAdjacentNodes**: Retrieves nodes adjacent to a given node, facilitating graph traversal.
- **getEdgesByType**: Returns edges filtered by their type, supporting edge-type-specific queries.
- **getIncomingEdges**: Retrieves edges directed towards a specified node.
- **getManagedPagePaths**: Returns paths of pages managed within the graph.
- **getNodeById**: Fetches a node by its unique identifier.
- **getNodesByKind**: Retrieves nodes filtered by their kind or category.
- **getNodesByPath**: Finds nodes based on their associated file or page path.
- **getOutgoingEdges**: Retrieves edges originating from a specified node.

## Dependencies and imports

- Imports from `./utils/fs.js`: likely utilities related to filesystem operations.
- Imports from `node:path`: Node.js built-in module for handling and transforming file paths.

## Related tests

No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- The exact structure and semantics of `AffectedWikiGraphPageSelection` are not detailed.
- There is no explicit documentation or examples illustrating how to use the exported functions.
- No information on error handling or performance characteristics.
- Absence of related test coverage or test references leaves the robustness of the module unverified.
- The source repository and commit SHA are unknown, limiting traceability.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
