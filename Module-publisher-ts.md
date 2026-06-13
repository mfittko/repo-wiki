---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a33ab6cfdfb7a298ba26e23ddb762c00190f3ef2"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2024-06-05T00:00:00Z"
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

- **defaultFrontmatterPolicyForTarget**: Defines default policies for handling frontmatter metadata depending on the publishing target.
- **PUBLISH_TARGETS**: A collection or enumeration of supported publishing targets.
- **PublishTarget**: Type or interface representing a publishing target.
- **publishWiki**: Main function to publish wiki content according to specified options.
- **PublishWikiOptions**: Type or interface defining options for the `publishWiki` function.
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
- The module relies on environment variables (`GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, `LLMWIKI_PUBLISH_REMOTE`) for configuration, but the expected values and their effects are not documented here.
- No information on error handling or edge cases during publishing is provided.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
