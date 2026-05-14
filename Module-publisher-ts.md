---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a507ef561fb391da37a72f94377f63339998865a"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

This module provides functionality related to publishing content to GitHub Wikis. It includes configuration for different publishing targets, policies for frontmatter handling, and utilities to rewrite internal wiki links. The main entry point is a function to publish wiki content, supporting environment-variable-driven configuration for remote repositories and Git user information.

## Source file list

- `src/publisher.ts`

## Key symbols and entry points

- `defaultFrontmatterPolicyForTarget` — Default policy for handling frontmatter metadata depending on the publish target.
- `PUBLISH_TARGETS` — Enumeration or collection of supported publishing targets.
- `PublishTarget` — Type or interface defining a publish target.
- `publishWiki` — Primary function to publish wiki content to a specified target.
- `PublishWikiOptions` — Options interface/type for configuring the `publishWiki` function.
- `rewriteInternalWikiLinks` — Utility function to adjust internal wiki links during publishing.

## Dependencies and imports

- Local modules:
  - `./frontmatter.js` — Likely handles frontmatter metadata parsing and policies.
  - `./utils/fs.js` — Filesystem utilities.
  - `./utils/git.js` — Git-related utilities.
- External modules:
  - `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs` — Mermaid diagram rendering library.
- Node.js built-in modules:
  - `fs` — Filesystem access.
  - `os` — Operating system utilities.
  - `path` — Path utilities.

## Related tests

No documentation or source cards indicate the presence of related tests for this module.

## Known gaps or open questions

- No explicit test coverage or test files are documented.
- The exact behavior and configuration details of `publishWiki` and frontmatter policies are not described in detail.
- The source repository and commit SHA are unknown, limiting traceability.
- The environment variables `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, and `LLMWIKI_PUBLISH_REMOTE` suggest runtime configuration but their exact usage and defaults are not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
