---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "e8e50cf58d4fe0b1575ca9d2f73e98541cc2c545"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

The `publisher.ts` module is a TypeScript source module focused on the configuration and implementation of publishing workflows for GitHub Wikis. It provides functionality to manage publishing targets, policies for frontmatter in wiki pages, and utilities to rewrite internal wiki links. The module is designed to facilitate automated or environment-driven publishing of wiki content, leveraging Git operations and file system utilities.

## Source file list

- `src/publisher.ts`

## Key symbols and entry points

- **defaultFrontmatterPolicyForTarget**: Defines default policies for frontmatter metadata depending on the publishing target.
- **PUBLISH_TARGETS**: A collection or enumeration of supported publishing targets.
- **PublishTarget**: Type or interface representing a publishing target.
- **publishWiki**: Main function to execute the publishing process of a wiki.
- **PublishWikiOptions**: Options interface/type for configuring the `publishWiki` function.
- **rewriteInternalWikiLinks**: Utility function to adjust internal wiki links within content to match the target wiki structure.

## Dependencies and imports

- Local modules:
  - `./frontmatter.js` — likely handles frontmatter metadata processing.
  - `./utils/fs.js` — file system utilities.
  - `./utils/git.js` — Git-related utilities.
- External modules:
  - `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs` — Mermaid diagram rendering library.
- Node.js built-in modules:
  - `fs` — file system operations.
  - `os` — operating system utilities.
  - `path` — path utilities.

## Related tests

No explicit test files or test-related documentation cards are listed for this module.

## Known gaps or open questions

- No documentation cards or detailed usage examples are available, limiting insight into the exact usage patterns or integration points.
- The source repository and commit SHA are unknown, which restricts traceability.
- Environment variables such as `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, and `LLMWIKI_PUBLISH_REMOTE` are referenced as runtime hints but their exact roles and expected values are not documented here.
- The interaction with Mermaid diagrams suggests some rendering or processing of diagrams in wiki content, but details are not provided.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
