---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "1defe58385a113a4dfca789e393deecf0d6135a8"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

The `publisher.ts` module provides core functionality for publishing content to GitHub Wikis. It includes configuration and source code to manage publishing targets, policies for frontmatter handling, and utilities to rewrite internal wiki links. The module supports environment-variable-driven configuration to customize publishing behavior, making it suitable for automated or CI-driven wiki publishing workflows.

## Source file list

- `src/publisher.ts`

## Key symbols and entry points

- **defaultFrontmatterPolicyForTarget**: Defines default policies for handling frontmatter metadata depending on the publishing target.
- **PUBLISH_TARGETS**: A collection or enumeration of supported publishing targets.
- **PublishTarget**: Type or interface representing a publishing target configuration.
- **publishWiki**: Main function to execute the publishing process of a wiki, likely handling synchronization and content updates.
- **PublishWikiOptions**: Options interface/type for configuring the behavior of `publishWiki`.
- **rewriteInternalWikiLinks**: Utility function to adjust internal links within wiki content to ensure they remain valid after publishing.

## Dependencies and imports

- Local modules:
  - `./frontmatter.js` — likely for frontmatter metadata parsing and policies.
  - `./utils/fs.js` — filesystem utilities.
  - `./utils/git.js` — Git-related utilities for repository operations.
- External modules:
  - `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs` — Mermaid diagram rendering library.
- Node.js built-in modules:
  - `fs` — filesystem access.
  - `os` — operating system utilities.
  - `path` — path manipulation utilities.

## Related tests

No explicit test files or test-related documentation cards are listed for this module.

## Known gaps or open questions

- No documentation cards or detailed usage examples are available, limiting insight into the exact usage patterns.
- The source repository and commit SHA are unknown, which restricts traceability.
- The environment variables `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, and `LLMWIKI_PUBLISH_REMOTE` are referenced as runtime hints but their exact roles and expected values are not documented here.
- No information on error handling, logging, or integration with other modules is provided.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
