---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "db3dd5c6e2bdb430282661ff44b002d22af0bade"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

This module provides functionality related to publishing content to GitHub Wikis. It includes configuration and source code to manage publishing targets, policies for frontmatter handling, and utilities to rewrite internal wiki links. The module supports environment-variable-driven configuration for Git remotes and user identity, facilitating automated or scripted publishing workflows.

## Source file list

- `src/publisher.ts`

## Key symbols and entry points

- **defaultFrontmatterPolicyForTarget**: Defines the default policy for handling frontmatter metadata based on the publishing target.
- **PUBLISH_TARGETS**: A collection or enumeration of supported publishing targets.
- **PublishTarget**: Type or interface representing a publishing target.
- **publishWiki**: Main function to publish content to a GitHub Wiki, likely handling the orchestration of commits and pushes.
- **PublishWikiOptions**: Options interface/type for configuring the behavior of `publishWiki`.
- **rewriteInternalWikiLinks**: Utility function to adjust internal links within wiki content to match the target wiki structure.

## Dependencies and imports

- Local modules:
  - `./frontmatter.js` — likely for frontmatter parsing and policy management.
  - `./utils/fs.js` — filesystem utilities.
  - `./utils/git.js` — Git interaction utilities.
- External modules:
  - `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs` — Mermaid diagram rendering library.
- Node.js built-in modules:
  - `fs`
  - `os`
  - `path`

## Related tests

No explicit test files or test-related documentation cards are listed for this module.

## Known gaps or open questions

- No documentation cards or detailed usage examples are available, limiting insight into the exact usage patterns.
- The environment variables `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, and `LLMWIKI_PUBLISH_REMOTE` suggest runtime configuration, but their exact expected values and effects are not documented here.
- The interaction with Mermaid diagrams implies some content processing or rendering, but the scope and integration details are unclear.
- No information on error handling, logging, or publishing feedback mechanisms.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
