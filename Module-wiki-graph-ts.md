---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a3ed30252c9bfb054e0b54fe5e6c52f8f0b8d703"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module wiki-graph.ts

## Purpose

This module provides functionality for constructing and querying a graph representation of wiki pages. It includes utilities to build an index of wiki graph nodes and edges, retrieve nodes by various criteria, and explore relationships between pages through their edges. The module is implemented in TypeScript and serves as a core source component for managing wiki page graph data.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection**: Likely a type or interface related to selecting affected pages within the wiki graph.
- **buildWikiGraphIndex**: Function to build an index structure representing the wiki graph.
- **getAdjacentNodes**: Retrieves nodes adjacent to a given node in the graph.
- **getEdgesByType**: Fetches edges filtered by their type.
- **getIncomingEdges**: Retrieves edges directed towards a specific node.
- **getManagedPagePaths**: Returns paths of pages managed within the graph.
- **getNodeById**: Finds a node by its unique identifier.
- **getNodesByKind**: Retrieves nodes filtered by their kind or category.
- **getNodesByPath**: Finds nodes based on their associated file or page path.
- **getOutgoingEdges**: Retrieves edges originating from a specific node.

## Dependencies and imports

- Imports from `./utils/fs.js`: likely utilities related to filesystem operations.
- Imports from `node:path`: Node.js built-in module for handling and transforming file paths.

## Related tests

No explicit test files or test-related documentation are indicated for this module.

## Known gaps or open questions

- No documentation cards or comments are present to clarify the detailed behavior or usage examples of the exported symbols.
- The exact structure and semantics of the graph nodes and edges are not described.
- The role and definition of `AffectedWikiGraphPageSelection` remain unclear without further context.
- No information on integration with other modules or how this graph data is consumed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
