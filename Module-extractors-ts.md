---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "edb41c2402583d52b198e0b02471275199a0fcb1"
page_state: "generated"
source_paths: ["src/extractors.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `extractors.ts`

## Purpose

This module provides a collection of functions designed to analyze and extract various elements from source code, primarily TypeScript and Go codebases. It focuses on identifying runtime hints, environment variables, exported symbols, package information, imports, and different "surface" abstractions such as migration, model, and route surfaces. These extraction utilities facilitate deeper introspection and processing of source code structures, likely to support tooling around code analysis, generation, or migration.

## Source file list

- `src/extractors.ts`

## Key symbols and entry points

- `detectRuntimeHints` — Identifies runtime-specific hints embedded in the source.
- `extractEnvironmentVariables` — Extracts environment variable definitions or usages.
- `extractExportedSymbols` — Retrieves symbols explicitly exported from the source.
- `extractGoPackage` — Extracts Go package information from source files.
- `extractImports` — Parses and extracts import statements.
- `extractMigrationSurfaces` — Extracts migration-related abstractions or metadata.
- `extractModelSurfaces` — Extracts model-related abstractions or metadata.
- `extractRouteSurfaces` — Extracts route-related abstractions or metadata.
- `extractSymbols` — General symbol extraction utility.

## Dependencies and imports

- Node.js `path` module — for file path manipulations.
- `typescript` — TypeScript compiler API used for parsing and analyzing TypeScript source code.

## Related tests

No documentation or test files are explicitly linked or referenced in the source cards for this module. It is unknown if dedicated tests exist for these extraction functions.

## Known gaps or open questions

- There is no explicit documentation or test coverage information available for this module.
- The exact nature and structure of the "surface" abstractions (migration, model, route) are not detailed.
- The integration context or consumers of these extraction functions are not described.
- The module appears to be source-grounded but lacks higher-level documentation or usage examples.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
