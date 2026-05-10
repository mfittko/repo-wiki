---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
page_state: "generated"
source_paths: ["src/extractors.ts"]
compiled_at: "2026-05-10T21:15:56.521Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---
# Module extractors.ts

## Purpose

This module provides a collection of extraction utilities implemented in TypeScript, designed to analyze and extract various symbols and metadata from source code. The functions focus on identifying runtime hints, environment variables, exported symbols, Go package information, imports, and different types of surfaces such as migration, model, and route surfaces. These extraction capabilities support source code analysis and transformation workflows.

## Source file list

- [src/extractors.ts](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/src/extractors.ts)

## Key symbols and entry points

- `detectRuntimeHints` — Detects runtime-specific hints within source code.
- `extractEnvironmentVariables` — Extracts environment variable definitions.
- `extractExportedSymbols` — Retrieves symbols exported from modules.
- `extractGoPackage` — Extracts Go package metadata.
- `extractImports` — Parses and extracts import statements.
- `extractMigrationSurfaces` — Identifies migration-related surfaces.
- `extractModelSurfaces` — Extracts model-related surfaces.
- `extractRouteSurfaces` — Extracts route-related surfaces.
- `extractSymbols` — General symbol extraction utility.

## Dependencies and imports

- **path** — Node.js path module, used for file path manipulations.
- **typescript** — TypeScript compiler API, used for parsing and analyzing TypeScript source code.

## Related tests

No explicit test files or test documentation cards are linked to this module in the current source data.

## Known gaps or open questions

- There is no documentation or test coverage information available for this module.
- The exact implementation details and usage contexts of the extraction functions are not described.
- Further refinement and documentation would be beneficial to clarify the role and integration of each extraction function.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
