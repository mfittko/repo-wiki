---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2f0f1d4621e326372c896cfd4888a22f68ec0f48"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module wiki-graph.ts

## Purpose

This module provides functionality for constructing and querying a graph representation of wiki pages. It includes utilities to build an index of wiki graph nodes and edges, retrieve nodes by various criteria, and explore relationships between pages through their edges. The module is designed to support operations on a managed set of wiki pages, facilitating navigation and analysis of their interconnections.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection**: Likely a type or interface representing a selection of wiki graph pages affected by some criteria.
- **buildWikiGraphIndex**: Function to build an index of the wiki graph, presumably creating nodes and edges from source data.
- **getAdjacentNodes**: Retrieves nodes adjacent to a given node, useful for graph traversal.
- **getEdgesByType**: Returns edges filtered by their type, enabling focused queries on specific relationships.
- **getIncomingEdges**: Gets edges directed towards a specified node.
- **getManagedPagePaths**: Retrieves paths of pages managed within the wiki graph.
- **getNodeById**: Finds a node in the graph by its unique identifier.
- **getNodesByKind**: Retrieves nodes filtered by their kind or category.
- **getNodesByPath**: Finds nodes based on their associated file or page path.
- **getOutgoingEdges**: Gets edges originating from a specified node.

## Dependencies and imports

- `./utils/fs.js`: A local utility module, likely providing filesystem-related functions.
- `node:path`: Node.js built-in module for handling and transforming file paths.

## Related tests

No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- The exact structure and semantics of `AffectedWikiGraphPageSelection` are not detailed.
- There is no explicit documentation or test coverage information available.
- The module's integration context within a larger system or how it interacts with other modules is not specified.
- The nature of the graph data (e.g., what kinds of nodes and edges exist) is not fully described.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
