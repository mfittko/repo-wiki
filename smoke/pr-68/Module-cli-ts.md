---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
page_state: "generated"
source_paths: ["src/cli.ts"]
compiled_at: "2026-05-10T21:15:56.521Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module cli.ts

## Purpose

This module provides the command-line interface (CLI) entry point for the application. It exports the primary function `runCli` which orchestrates CLI operations. The source file imports several internal modules related to compilation, configuration, linting, frontmatter processing, initialization, planning, and publishing, indicating that it acts as a central coordinator for CLI-driven workflows.

## Source file list

- [src/cli.ts](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/src/cli.ts)

## Key symbols and entry points

- `runCli`: The main exported function intended to run the CLI logic.

## Dependencies and imports

The module imports the following internal modules, suggesting integration with various subsystems:

- `./compiler.js`
- `./config.js`
- `./docs-linter.js`
- `./frontmatter.js`
- `./init.js`
- `./linter.js`
- `./planner.js`
- `./publisher.js`

These dependencies indicate that the CLI module coordinates compilation, configuration management, documentation linting, frontmatter handling, initialization routines, linting, planning, and publishing processes.

## Related tests

- [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/test/cli.test.ts)

## Known gaps or open questions

- No detailed documentation or usage examples are currently available for `runCli`.
- The exact CLI commands, options, and their behaviors are not described in the source cards.
- Further refinement is needed to clarify how the imported modules interact within the CLI context.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
