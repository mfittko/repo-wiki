---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "4876d92ad775fdaa882464db71be1c1ed241f47f"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

The `publisher.ts` module provides core functionality for publishing content to GitHub Wikis. It includes configuration and source code to manage publishing targets, rewrite internal wiki links, and handle frontmatter policies. The module supports environment-variable-driven configuration to customize publishing behavior, making it suitable for automated or CI-driven wiki publishing workflows.

## Source file list

- `src/publisher.ts`

## Key symbols and entry points

- **defaultFrontmatterPolicyForTarget**: Defines default policies for frontmatter handling based on the publishing target.
- **PUBLISH_TARGETS**: A collection of supported publishing targets.
- **PublishTarget**: Type or interface representing a publishing target.
- **publishWiki**: Main function to execute the publishing process to a wiki.
- **PublishWikiOptions**: Options interface/type for configuring the `publishWiki` function.
- **rewriteInternalWikiLinks**: Utility to rewrite internal links within wiki content to ensure consistency after publishing.

## Dependencies and imports

- Local modules:
  - `./frontmatter.js` — likely handles frontmatter parsing and policies.
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

- The repository remote URL and commit SHA are unknown, limiting traceability.
- No documentation or test cards are available, so usage examples and test coverage are unclear.
- The exact behavior and configuration details of environment variables (`GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, `LLMWIKI_PUBLISH_REMOTE`) require further exploration.
- The interaction with Mermaid diagrams suggests rendering or embedding capabilities, but details are not documented here.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
