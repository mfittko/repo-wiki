---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "144bad2d897ff76640a6ae71a662559850345164"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

This module provides functionality related to publishing content to GitHub Wikis. It includes configuration and source code to manage publishing targets, policies for frontmatter handling, and utilities to rewrite internal wiki links. The module supports environment-variable-driven configuration to customize publishing behavior.

## Source file list

- `src/publisher.ts`

## Key symbols and entry points

- **defaultFrontmatterPolicyForTarget**: Defines the default policy for handling frontmatter metadata based on the publishing target.
- **PUBLISH_TARGETS**: A collection or enumeration of supported publishing targets.
- **PublishTarget**: Type or interface representing a publishing target.
- **publishWiki**: Main function to execute the publishing process of a wiki.
- **PublishWikiOptions**: Options interface/type for configuring the `publishWiki` function.
- **rewriteInternalWikiLinks**: Utility function to adjust internal wiki links during publishing.

## Dependencies and imports

- Local modules:
  - `./frontmatter.js`
  - `./utils/fs.js`
  - `./utils/git.js`
- External modules:
  - Mermaid diagram library from CDN: `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs`
- Node.js built-in modules:
  - `fs`
  - `os`
  - `path`

## Related tests

No explicit test files or test-related documentation cards are listed for this module.

## Known gaps or open questions

- No documentation cards or detailed usage examples are currently available.
- The exact behavior and configuration details of `defaultFrontmatterPolicyForTarget` and `PUBLISH_TARGETS` are not described in the source cards.
- The module relies on environment variables (`GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, `LLMWIKI_PUBLISH_REMOTE`) for runtime configuration, but their expected values and effects are not documented here.
- Testing coverage and integration with other modules remain unspecified.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
