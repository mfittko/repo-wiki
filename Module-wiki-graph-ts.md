---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "c5432024529f5133bed4df4fd18ec2b67d908b7e"
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

- **AffectedWikiGraphPageSelection**: Likely a type or interface related to selecting affected pages within the wiki graph.
- **buildWikiGraphIndex**: Function to build an index representing the wiki graph structure.
- **getAdjacentNodes**: Retrieves nodes adjacent to a given node in the graph.
- **getEdgesByType**: Fetches edges filtered by their type.
- **getIncomingEdges**: Retrieves edges directed towards a specific node.
- **getManagedPagePaths**: Returns paths of pages managed within the wiki graph.
- **getNodeById**: Finds a node by its unique identifier.
- **getNodesByKind**: Retrieves nodes filtered by their kind or category.
- **getNodesByPath**: Finds nodes based on their associated file or page path.
- **getOutgoingEdges**: Retrieves edges originating from a specific node.

## Dependencies and imports

- Imports from `./utils/fs.js`: likely utilities related to filesystem operations.
- Imports from `node:path`: Node.js core module for handling and transforming file paths.

## Related tests

No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- No explicit documentation or comments are available to clarify the detailed behavior or data structures used.
- The exact nature and structure of `AffectedWikiGraphPageSelection` and other types are not described.
- No information on error handling, performance considerations, or integration with other modules.
- Absence of related test coverage or examples limits understanding of usage scenarios.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
