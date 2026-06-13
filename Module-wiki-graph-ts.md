---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a33ab6cfdfb7a298ba26e23ddb762c00190f3ef2"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module wiki-graph.ts

## Purpose

This module provides functionality for constructing and querying a graph representation of wiki pages. It includes utilities to build an index of wiki graph nodes and edges, retrieve nodes by various criteria, and explore relationships such as adjacency and edge types. The module is implemented in TypeScript and serves as a core source component for managing wiki graph data structures.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection** — Likely a type or interface related to selecting affected pages within the wiki graph.
- **buildWikiGraphIndex** — Function to build an index of the wiki graph, presumably creating nodes and edges from source data.
- **getAdjacentNodes** — Retrieves nodes adjacent to a given node in the graph.
- **getEdgesByType** — Returns edges filtered by their type.
- **getIncomingEdges** — Retrieves edges directed into a specified node.
- **getManagedPagePaths** — Returns paths of pages managed within the wiki graph.
- **getNodeById** — Fetches a node by its unique identifier.
- **getNodesByKind** — Retrieves nodes filtered by their kind or category.
- **getNodesByPath** — Finds nodes based on their associated file or resource path.
- **getOutgoingEdges** — Retrieves edges directed outward from a specified node.

## Dependencies and imports

- Imports from `./utils/fs.js` — likely utilities for filesystem operations.
- Imports from `node:path` — Node.js path module for handling file paths.

## Related tests

No documentation or source cards indicate the presence of related tests for this module.

## Known gaps or open questions

- No explicit documentation or test coverage is provided.
- The exact structure and semantics of the graph nodes and edges are not detailed.
- The role and definition of `AffectedWikiGraphPageSelection` are not fully clear.
- The module's integration context within the larger system is not described.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
