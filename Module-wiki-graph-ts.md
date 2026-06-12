---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2a5afb6af319ea4b1fcdbebcdd868a271584028c"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module wiki-graph.ts

## Purpose

This module provides functionality for constructing and querying a graph representation of wiki pages. It includes utilities to build an index of wiki graph nodes and edges, retrieve nodes by various criteria, and explore relationships between pages through their edges. The module is designed to support operations such as selecting affected pages, managing page paths, and navigating adjacency in the wiki graph.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection**: Likely a type or interface related to selecting pages affected in the wiki graph.
- **buildWikiGraphIndex**: Function to build an index structure representing the wiki graph.
- **getAdjacentNodes**: Retrieves nodes adjacent to a given node in the graph.
- **getEdgesByType**: Fetches edges filtered by their type.
- **getIncomingEdges**: Retrieves edges directed towards a specific node.
- **getManagedPagePaths**: Returns paths of pages managed within the graph.
- **getNodeById**: Finds a node by its unique identifier.
- **getNodesByKind**: Retrieves nodes filtered by their kind or category.
- **getNodesByPath**: Finds nodes based on their associated path.
- **getOutgoingEdges**: Retrieves edges originating from a specific node.

## Dependencies and imports

- Imports from `./utils/fs.js`: likely utilities related to filesystem operations.
- Imports from `node:path`: Node.js core module for handling and transforming file paths.

## Related tests

No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- The exact structure and semantics of `AffectedWikiGraphPageSelection` are not detailed.
- There is no explicit documentation or examples illustrating usage patterns.
- No test coverage or test references are provided, so the robustness and correctness of the module are not verifiable from the current data.
- The repository remote URL and commit SHA are unknown, limiting traceability.
- The module's integration context within a larger system or application is not described.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
