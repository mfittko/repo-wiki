---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a81b22c39c9e23853e62bf5ce7ade491eda4c723"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

The `publisher.ts` module provides functionality related to publishing content to GitHub Wikis. It includes configuration and source code to manage publishing targets, policies for frontmatter handling, and utilities to rewrite internal wiki links. The module supports environment-variable-driven configuration for Git remotes and user identity, facilitating automated or scripted publishing workflows.

## Source file list

- `src/publisher.ts`

## Key symbols and entry points

- **defaultFrontmatterPolicyForTarget**: Defines default policies for handling frontmatter metadata based on the publishing target.
- **PUBLISH_TARGETS**: A collection or enumeration of supported publishing targets.
- **PublishTarget**: Type or interface representing a publishing target.
- **publishWiki**: Main function to publish content to a GitHub Wiki, likely accepting options and handling the publishing process.
- **PublishWikiOptions**: Type or interface defining options for the `publishWiki` function.
- **rewriteInternalWikiLinks**: Utility function to adjust internal wiki links within content, ensuring correct linking after publishing.

## Dependencies and imports

- Local modules:
  - `./frontmatter.js`
  - `./utils/fs.js`
  - `./utils/git.js`
- External modules:
  - `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs` (Mermaid diagram rendering)
- Node.js built-in modules:
  - `fs`
  - `os`
  - `path`

## Related tests

No explicit test files or test-related documentation cards are listed for this module.

## Known gaps or open questions

- No documentation cards or detailed usage examples are available, limiting insight into the exact API usage and behavior.
- The source repository and commit SHA are unknown, which restricts traceability.
- The environment variables `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, and `LLMWIKI_PUBLISH_REMOTE` are referenced as runtime hints but their exact roles and defaults are not documented here.
- No information on error handling, logging, or integration with other modules is provided.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
