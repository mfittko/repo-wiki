---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2ce19fbe28dc7fd82aa053ba642325b8a9e91f02"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

This module provides functionality related to publishing content to GitHub Wikis. It includes configuration for different publish targets, policies for frontmatter handling, and the main publishing function. The module is implemented in TypeScript and is designed to be used in environments where certain environment variables (e.g., `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`) control publishing behavior. It integrates with Git utilities and file system operations, and also imports the Mermaid diagramming library for potential content processing.

## Source file list

- `src/publisher.ts`

## Key symbols and entry points

- `defaultFrontmatterPolicyForTarget` — Default policy for handling frontmatter metadata depending on the publish target.
- `PUBLISH_TARGETS` — A collection or enumeration of supported publish targets.
- `PublishTarget` — Type or interface representing a publish target.
- `publishWiki` — The main function responsible for publishing content to a GitHub Wiki.
- `PublishWikiOptions` — Options interface/type for configuring the `publishWiki` function.

## Dependencies and imports

- Local modules:
  - `./frontmatter.js` — Likely handles frontmatter metadata parsing and policies.
  - `./utils/fs.js` — File system utilities.
  - `./utils/git.js` — Git-related utilities.
- External libraries:
  - `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs` — Mermaid diagramming library, presumably for rendering or processing diagrams in wiki content.
- Node.js built-in modules:
  - `fs` — File system operations.
  - `os` — Operating system utilities.
  - `path` — Path utilities.

## Related tests

No explicit test files or test documentation cards are listed for this module.

## Known gaps or open questions

- No documentation cards or detailed usage examples are available.
- The exact behavior and configuration of `defaultFrontmatterPolicyForTarget` and `PUBLISH_TARGETS` are not described in detail.
- The role of Mermaid integration within the publishing workflow is not fully explained.
- Environment variables such as `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, and `LLMWIKI_PUBLISH_REMOTE` are referenced but their expected values and effects are not documented here.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
