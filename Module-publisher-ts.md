---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "ab4f4401735f73fb39983b8f7af41b5ed76b37f7"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

The `publisher.ts` module is a core source component responsible for managing the publishing process of GitHub Wikis. It provides configuration and runtime logic to handle publishing targets, policies for frontmatter in wiki pages, and utilities to rewrite internal wiki links. The module supports environment-variable-driven configuration to customize publishing behavior, making it adaptable to different GitHub Wiki remotes and user settings.

## Source file list

- `src/publisher.ts`

## Key symbols and entry points

- **defaultFrontmatterPolicyForTarget**: Defines default policies for frontmatter metadata depending on the publishing target.
- **PUBLISH_TARGETS**: A collection or enumeration of supported publishing targets.
- **PublishTarget**: Type or interface representing a publishing target configuration.
- **publishWiki**: The main function to execute the publishing process of the wiki content.
- **PublishWikiOptions**: Options interface/type to customize the behavior of `publishWiki`.
- **rewriteInternalWikiLinks**: Utility function to adjust internal wiki links during publishing to ensure correctness.

## Dependencies and imports

- Local modules:
  - `./frontmatter.js` — likely handles frontmatter metadata processing.
  - `./utils/fs.js` — filesystem utilities.
  - `./utils/git.js` — Git-related utilities.
- External libraries:
  - `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs` — Mermaid diagram rendering library.
- Node.js built-in modules:
  - `fs` — filesystem operations.
  - `os` — operating system utilities.
  - `path` — path utilities.

## Related tests

No explicit test files or test documentation cards are listed for this module.

## Known gaps or open questions

- No documentation cards or detailed usage examples are currently available.
- The exact behavior and configuration options of `publishWiki` and related policies are not documented here.
- The integration details with environment variables such as `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, and `LLMWIKI_PUBLISH_REMOTE` require further elaboration.
- Test coverage and validation status are unknown.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
