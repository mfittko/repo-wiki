---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "1defe58385a113a4dfca789e393deecf0d6135a8"
page_state: "generated"
source_paths: ["src/wiki-graph.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `wiki-graph.ts`

## Purpose

This module provides functionality to build and query a graph representation of wiki pages. It includes utilities to index wiki pages, retrieve nodes and edges by various criteria, and navigate relationships between pages. The module is implemented in TypeScript and serves as a core source component for managing wiki graph data structures.

## Source file list

- `src/wiki-graph.ts`

## Key symbols and entry points

- **AffectedWikiGraphPageSelection** — Likely a type or interface related to selecting affected pages within the wiki graph.
- **buildWikiGraphIndex** — Function to construct an index of the wiki graph, presumably from source data.
- **getAdjacentNodes** — Retrieves nodes adjacent to a given node in the graph.
- **getEdgesByType** — Fetches edges filtered by their type.
- **getIncomingEdges** — Returns edges directed into a specified node.
- **getManagedPagePaths** — Retrieves paths of pages managed within the graph.
- **getNodeById** — Finds a node by its unique identifier.
- **getNodesByKind** — Retrieves nodes filtered by their kind or category.
- **getNodesByPath** — Finds nodes based on their associated path.
- **getOutgoingEdges** — Returns edges directed outward from a specified node.

## Dependencies and imports

- Imports from `./utils/fs.js` — likely utilities related to filesystem operations.
- Imports from `node:path` — Node.js built-in module for handling and transforming file paths.

## Related tests

No documentation or source cards indicate the presence of related test files or test cases for this module.

## Known gaps or open questions

- The exact nature and structure of `AffectedWikiGraphPageSelection` is not detailed.
- No explicit documentation or comments are available to clarify the internal workings or usage examples.
- Absence of related test information leaves coverage and reliability unverified.
- The repository remote URL and commit SHA are unknown, limiting traceability.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
