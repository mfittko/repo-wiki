---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2026-05-10T21:15:56.521Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module publisher.ts

## Purpose

This module provides functionality related to publishing wiki content, specifically targeting GitHub Wikis and other configured publish targets. It includes configuration for publish targets, policies for frontmatter handling, and the main publishing function that orchestrates the process of committing and pushing wiki content. The module is implemented in TypeScript and relies on environment variables for runtime configuration.

## Source file list

- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/src/publisher.ts)

## Key symbols and entry points

- `defaultFrontmatterPolicyForTarget` — Defines default policies for handling frontmatter metadata depending on the publish target.
- `PUBLISH_TARGETS` — A collection or enumeration of supported publish targets.
- `PublishTarget` — Type or interface representing a publish target configuration.
- `publishWiki` — The primary function to publish wiki content according to specified options.
- `PublishWikiOptions` — Interface/type defining options for the `publishWiki` function.

## Dependencies and imports

- Local modules:
  - `./frontmatter.js` — Handles frontmatter parsing and policies.
  - `./utils/fs.js` — Filesystem utilities.
  - `./utils/git.js` — Git-related utilities for committing and pushing changes.
- External modules:
  - `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs` — Mermaid library for diagram rendering.
- Node.js built-in modules:
  - `fs` — Filesystem operations.
  - `os` — Operating system utilities.
  - `path` — Path utilities.

## Related tests

- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/test/publisher.test.ts)

## Known gaps or open questions

- No explicit documentation cards or detailed usage examples are present in the source cards.
- The exact behavior and configuration details of `publishWiki` and how it interacts with environment variables like `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, and `LLMWIKI_PUBLISH_REMOTE` could be further elaborated.
- Integration details with Mermaid diagrams and how they affect publishing are not fully described.
- Additional context on how frontmatter policies influence publishing targets would improve understanding.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
