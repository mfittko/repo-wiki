---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "7b125ae9a68ac15891f3248ef52c552b163fcda2"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `wiki-graph.ts`

## Purpose

This module provides functionality for constructing and querying a graph representation of wiki pages. It includes utilities to build an index of wiki graph nodes and edges, retrieve nodes by various criteria, and explore relationships between pages such as adjacency and edge types. The module is designed to support management and analysis of wiki page structures.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection**: Likely a type or interface related to selecting affected pages within the wiki graph.
- **buildWikiGraphIndex**: Function to build an index of the wiki graph, presumably creating nodes and edges from source data.
- **getAdjacentNodes**: Retrieves nodes adjacent to a given node, supporting graph traversal.
- **getEdgesByType**: Returns edges filtered by their type, enabling focused queries on relationships.
- **getIncomingEdges**: Retrieves edges directed towards a specified node.
- **getManagedPagePaths**: Returns paths of pages managed within the wiki graph.
- **getNodeById**: Fetches a node by its unique identifier.
- **getNodesByKind**: Retrieves nodes filtered by their kind or category.
- **getNodesByPath**: Finds nodes based on their associated file or resource path.
- **getOutgoingEdges**: Retrieves edges originating from a specified node.

## Dependencies and imports

- Imports from `./utils/fs.js`: likely utilities related to filesystem operations.
- Imports from `node:path`: Node.js core module for handling and transforming file paths.

## Related tests

No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- The exact structure and semantics of `AffectedWikiGraphPageSelection` are not detailed.
- There is no explicit documentation or examples illustrating usage patterns.
- No test coverage or test references are provided, so the robustness and correctness of the module are not verifiable from the current data.
- The source repository and commit SHA are unknown, limiting traceability.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
