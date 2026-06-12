---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "edb41c2402583d52b198e0b02471275199a0fcb1"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module: wiki-graph.ts

## Purpose

This module provides functionality for constructing and querying a graph representation of wiki pages. It includes utilities to build an index of wiki graph nodes and edges, retrieve nodes by various criteria, and explore relationships between pages through their edges. The module is designed to support operations on wiki page graphs, such as identifying adjacent nodes, filtering edges by type, and managing page paths.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection** — Likely a type or interface related to selecting affected pages within the wiki graph.
- **buildWikiGraphIndex** — Function to build an index structure representing the wiki graph.
- **getAdjacentNodes** — Retrieves nodes adjacent to a given node.
- **getEdgesByType** — Filters edges in the graph by their type.
- **getIncomingEdges** — Retrieves edges directed towards a specific node.
- **getManagedPagePaths** — Returns paths of pages managed within the graph.
- **getNodeById** — Finds a node by its unique identifier.
- **getNodesByKind** — Retrieves nodes filtered by their kind or category.
- **getNodesByPath** — Finds nodes based on their associated path.
- **getOutgoingEdges** — Retrieves edges originating from a specific node.

## Dependencies and imports

- Imports from `./utils/fs.js` — likely for filesystem operations related to wiki page data.
- Imports from `node:path` — Node.js path utilities for handling file system paths.

## Related tests

No documentation or source cards indicate the presence of related test files or test suites for this module.

## Known gaps or open questions

- The exact structure and semantics of `AffectedWikiGraphPageSelection` are not detailed.
- There is no explicit documentation or examples illustrating how to use the graph-building and querying functions.
- No information on performance characteristics or scalability of the graph index.
- Absence of related test coverage or test references leaves the robustness of the module unverified.
- The source repository and commit SHA are unknown, limiting traceability.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
