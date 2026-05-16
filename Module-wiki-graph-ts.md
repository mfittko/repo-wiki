---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "b1b3a9c5f3b8a59dd631cd206cda223760e1ba3a"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `wiki-graph.ts`

## Purpose

This module provides functionality for constructing and querying a graph representation of wiki pages. It includes utilities to build an index of wiki graph nodes and edges, retrieve nodes by various criteria, and explore relationships between pages through their edges. The module is designed to support operations such as selecting affected pages, managing page paths, and navigating adjacency in the wiki graph.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection**  
  Likely a type or interface representing a selection of wiki pages affected in some context.

- **buildWikiGraphIndex**  
  Function to build an index of the wiki graph, presumably creating a structured representation of nodes and edges.

- **getAdjacentNodes**  
  Retrieves nodes adjacent to a given node, facilitating graph traversal.

- **getEdgesByType**  
  Returns edges filtered by their type, allowing focused queries on specific relationships.

- **getIncomingEdges**  
  Retrieves edges directed towards a specified node.

- **getManagedPagePaths**  
  Returns paths of pages managed within the wiki graph.

- **getNodeById**  
  Fetches a node by its unique identifier.

- **getNodesByKind**  
  Retrieves nodes filtered by their kind or category.

- **getNodesByPath**  
  Finds nodes based on their associated file or wiki path.

- **getOutgoingEdges**  
  Retrieves edges originating from a specified node.

## Dependencies and imports

- `./utils/fs.js`  
  Presumably a local utility module for filesystem operations.

- `node:path`  
  Node.js built-in module for handling and transforming file paths.

## Related tests

No explicit test files or test-related documentation are indicated in the source cards or module metadata.

## Known gaps or open questions

- The module documentation and source cards do not specify detailed behavior or data structures for the graph nodes and edges.
- There is no information on how the graph is persisted or updated over time.
- The absence of related tests or usage examples limits understanding of practical application scenarios.
- The exact nature and structure of `AffectedWikiGraphPageSelection` and other types are not described.
- No information on error handling or performance considerations.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
