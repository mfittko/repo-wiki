---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "3c7f4808701c06a5d3bcd8e1455221b272566b71"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

This module provides functionality related to publishing content to GitHub Wikis. It includes configuration for different publish targets, policies for frontmatter handling, and utilities to rewrite internal wiki links. The module supports environment-variable-driven configuration to customize publishing behavior, making it suitable for automated or CI-driven wiki publishing workflows.

## Source file list

- `src/publisher.ts`

## Key symbols and entry points

- **defaultFrontmatterPolicyForTarget**: Defines default policies for handling frontmatter metadata depending on the publish target.
- **PUBLISH_TARGETS**: A collection or enumeration of supported publish targets.
- **PublishTarget**: Type or interface representing a publish target configuration.
- **publishWiki**: Main function to execute the publishing process of a wiki.
- **PublishWikiOptions**: Options interface/type for configuring the `publishWiki` function.
- **rewriteInternalWikiLinks**: Utility function to adjust internal wiki links during publishing.

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

- No documentation cards or detailed usage examples are currently available.
- The exact behavior and configuration details of `defaultFrontmatterPolicyForTarget` and `PUBLISH_TARGETS` are not fully described.
- The interaction with environment variables such as `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, and `LLMWIKI_PUBLISH_REMOTE` suggests runtime configuration, but specifics on their usage and effects are not detailed.
- No information on error handling or edge cases during publishing is provided.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
