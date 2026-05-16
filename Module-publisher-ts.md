---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "349f357c41f2135ffba209e27c9fa6e032320e2e"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

This module provides functionality related to publishing content to GitHub Wikis. It includes configuration for different publish targets, policies for frontmatter handling, and utilities to rewrite internal wiki links. The main entry point is a function to publish wiki content, supporting environment-variable-driven configuration for remote repositories and Git user information.

## Source file list

- `src/publisher.ts`

## Key symbols and entry points

- `defaultFrontmatterPolicyForTarget` — Default policy for handling frontmatter metadata depending on the publish target.
- `PUBLISH_TARGETS` — Enumeration or collection of supported publish targets.
- `PublishTarget` — Type or interface representing a publish target.
- `publishWiki` — Primary function to publish wiki content according to specified options.
- `PublishWikiOptions` — Interface or type defining options for the `publishWiki` function.
- `rewriteInternalWikiLinks` — Utility function to adjust internal wiki links during publishing.

## Dependencies and imports

- Local modules:
  - `./frontmatter.js` — Likely handles frontmatter metadata processing.
  - `./utils/fs.js` — Filesystem utilities.
  - `./utils/git.js` — Git-related utilities.
- External modules:
  - `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs` — Mermaid diagram rendering library.
- Node.js built-in modules:
  - `fs` — Filesystem operations.
  - `os` — Operating system utilities.
  - `path` — Path utilities.

## Related tests

No documentation or source cards indicate the presence of related tests for this module.

## Known gaps or open questions

- No explicit test coverage or test files are documented.
- The exact behavior and configuration details of `publishWiki` and frontmatter policies are not described in detail.
- The environment variables `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, and `LLMWIKI_PUBLISH_REMOTE` suggest runtime configuration, but their usage specifics are not detailed here.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
