---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "104e3c23e782dbd282df6b81c63dfae18768b23f"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module wiki-graph.ts

## Purpose

This module provides functionality for constructing and querying a graph representation of wiki pages. It includes utilities to build an index of wiki graph nodes and edges, retrieve nodes by various criteria, and explore relationships between pages such as adjacency and edge types. The module is designed to manage and analyze the structure of wiki content programmatically.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection**: Likely a type or interface related to selecting pages affected in the wiki graph.
- **buildWikiGraphIndex**: Function to build an index of the wiki graph, presumably creating nodes and edges from source data.
- **getAdjacentNodes**: Retrieves nodes adjacent to a given node in the graph.
- **getEdgesByType**: Returns edges filtered by their type.
- **getIncomingEdges**: Retrieves edges directed towards a specific node.
- **getManagedPagePaths**: Returns paths of pages managed within the wiki graph.
- **getNodeById**: Fetches a node by its unique identifier.
- **getNodesByKind**: Retrieves nodes filtered by their kind or category.
- **getNodesByPath**: Finds nodes based on their associated file or page path.
- **getOutgoingEdges**: Retrieves edges originating from a specific node.

## Dependencies and imports

- `./utils/fs.js`: A local utility module, likely providing filesystem-related functions.
- `node:path`: Node.js built-in module for handling and transforming file paths.

## Related tests

No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- The exact structure and semantics of the graph nodes and edges are not detailed.
- There is no information on how the graph data is persisted or updated.
- No explicit documentation or examples are provided to illustrate usage.
- The role and definition of `AffectedWikiGraphPageSelection` remain unclear.
- Absence of related test coverage or test references leaves the module's robustness unverified.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
