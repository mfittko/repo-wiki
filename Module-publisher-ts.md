---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "f47907b8f64c2674438a61f152c6d5a09a19c523"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

This module provides functionality related to publishing content to GitHub Wikis. It includes configuration for different publishing targets, policies for frontmatter handling, and utilities to rewrite internal wiki links. The main entry point is a function to publish wiki content, supporting environment-variable-driven configuration for remote repositories and Git user information. The module is implemented in TypeScript and integrates with Git operations and file system utilities, as well as external libraries such as Mermaid for diagram rendering.

## Source file list

- `src/publisher.ts`

## Key symbols and entry points

- **defaultFrontmatterPolicyForTarget**: Defines default policies for handling frontmatter metadata depending on the publishing target.
- **PUBLISH_TARGETS**: A collection or enumeration of supported publishing targets.
- **PublishTarget**: Type or interface representing a publishing target configuration.
- **publishWiki**: The primary function to publish content to a GitHub Wiki, accepting options to customize behavior.
- **PublishWikiOptions**: Interface/type defining options for the `publishWiki` function.
- **rewriteInternalWikiLinks**: Utility function to adjust internal wiki links within content to match the target wiki structure.

## Dependencies and imports

- Local modules:
  - `./frontmatter.js` — likely for frontmatter parsing and policy management.
  - `./utils/fs.js` — file system utilities.
  - `./utils/git.js` — Git-related utilities.
- External libraries:
  - `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs` — Mermaid library for rendering diagrams.
- Node.js built-in modules:
  - `fs` — file system operations.
  - `os` — operating system utilities.
  - `path` — path manipulation utilities.

## Related tests

No documentation or source cards indicate the presence of related tests for this module.

## Known gaps or open questions

- No explicit test coverage or test files are documented for this module.
- The exact behavior and configuration details of `defaultFrontmatterPolicyForTarget` and `PUBLISH_TARGETS` are not described in detail.
- The environment variables `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, and `LLMWIKI_PUBLISH_REMOTE` are referenced as runtime hints but their usage and defaults are not fully documented here.
- No usage examples or higher-level documentation are currently available.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
