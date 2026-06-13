---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "104e3c23e782dbd282df6b81c63dfae18768b23f"
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

- **defaultFrontmatterPolicyForTarget**: Defines default policies for handling frontmatter metadata based on the publishing target.
- **PUBLISH_TARGETS**: A collection or enumeration of supported publishing targets.
- **PublishTarget**: Type or interface representing a publishing target.
- **publishWiki**: Main function to publish content to a GitHub Wiki, likely the primary entry point for external usage.
- **PublishWikiOptions**: Options interface/type for configuring the behavior of `publishWiki`.
- **rewriteInternalWikiLinks**: Utility function to adjust internal wiki links, ensuring they are correctly formatted or redirected during publishing.

## Dependencies and imports

- Local modules:
  - `./frontmatter.js` — likely for frontmatter metadata handling.
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

- No documentation cards or detailed usage examples are currently available.
- The exact behavior and configuration details of `publishWiki` and related policies are not documented here.
- The source repository and commit SHA are unknown, limiting traceability.
- No information on test coverage or integration with other modules is provided.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
