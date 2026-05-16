---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "c5432024529f5133bed4df4fd18ec2b67d908b7e"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

This module provides functionality related to publishing content to GitHub Wikis. It includes configuration and source code to manage publishing targets, policies for frontmatter handling, and utilities to rewrite internal wiki links. The module supports environment-variable-driven configuration to customize publishing behavior, such as specifying Git remotes and user information.

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
  - `./frontmatter.js` — likely handles frontmatter metadata processing.
  - `./utils/fs.js` — filesystem utilities.
  - `./utils/git.js` — Git-related utilities.
- External modules:
  - `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs` — Mermaid diagram rendering library.
- Node.js built-in modules:
  - `fs`
  - `os`
  - `path`

## Related tests

No explicit test files or test-related documentation cards are listed for this module.

## Known gaps or open questions

- The exact behavior and implementation details of the publishing process (`publishWiki`) are not documented here.
- No test coverage or examples are provided in the source cards.
- The interaction with environment variables (`GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, `LLMWIKI_PUBLISH_REMOTE`) is noted but not elaborated.
- The role of Mermaid integration in the publishing workflow is unclear from the available information.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
