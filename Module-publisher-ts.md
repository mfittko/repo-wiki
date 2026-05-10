---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "253792a37296e0d106c4c2c79c48e57e4e30e395"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

This module provides functionality related to publishing content to GitHub Wikis. It includes configuration and source code to manage publishing targets, policies for frontmatter handling, and the main publishing workflow. The module is designed to interact with Git repositories and environment variables to automate the publishing process of wiki content.

## Source file list

- `src/publisher.ts`

## Key symbols and entry points

- **defaultFrontmatterPolicyForTarget**: Defines the default policy for handling frontmatter metadata based on the publishing target.
- **PUBLISH_TARGETS**: A collection or enumeration of supported publishing targets.
- **PublishTarget**: Type or interface representing a publishing target.
- **publishWiki**: The primary function to execute the publishing of wiki content.
- **PublishWikiOptions**: Options interface/type for configuring the `publishWiki` function.

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

No documentation or test cards were found for this module, so related tests are currently unknown or not documented.

## Known gaps or open questions

- No explicit documentation or test coverage is provided in the source cards.
- The exact behavior and configuration details of `defaultFrontmatterPolicyForTarget` and `PUBLISH_TARGETS` are not described in detail.
- The environment variables `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, and `LLMWIKI_PUBLISH_REMOTE` are referenced as runtime hints but their usage and expected values are not fully documented.
- Further exploration of the source code is needed to clarify the publishing workflow and error handling.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
