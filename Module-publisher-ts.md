---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "fcd0cab90b26fc622c67172972b85e39ed7ab703"
page_state: "generated"
source_paths: ["src/publisher.ts"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `publisher.ts`

## Purpose

The `publisher.ts` module is a core source component responsible for managing the publishing process of GitHub Wikis. It provides configuration and runtime logic to handle publishing targets, policies for frontmatter in wiki pages, and utilities to rewrite internal wiki links. The module supports environment-variable-driven configuration to customize publishing behavior, making it adaptable to different deployment environments.

## Source file list

- `src/publisher.ts`

## Key symbols and entry points

- **defaultFrontmatterPolicyForTarget**: Defines default policies for frontmatter metadata depending on the publishing target.
- **PUBLISH_TARGETS**: Enumerates or defines the possible publishing targets supported by the module.
- **PublishTarget**: Type or interface representing a publishing target.
- **publishWiki**: Main function to execute the publishing of a wiki, likely coordinating the process end-to-end.
- **PublishWikiOptions**: Options or configuration interface/type for the `publishWiki` function.
- **rewriteInternalWikiLinks**: Utility function to adjust internal wiki links, ensuring they are correct post-publishing.

## Dependencies and imports

The module imports several internal utilities and external libraries:

- Internal modules:
  - `./frontmatter.js` — likely for handling frontmatter metadata in wiki pages.
  - `./utils/fs.js` — filesystem utilities.
  - `./utils/git.js` — Git-related utilities for repository operations.

- External libraries:
  - `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs` — Mermaid library for diagram rendering, possibly used to process or generate diagrams within wiki content.

- Node.js built-in modules:
  - `fs` — filesystem operations.
  - `os` — operating system utilities.
  - `path` — path manipulation utilities.

## Related tests

No explicit test files or test documentation cards are listed for this module. It is unclear if tests exist or are maintained separately.

## Known gaps or open questions

- The exact nature and structure of `PUBLISH_TARGETS` and `PublishTarget` are not detailed here.
- No documentation or test cards are available, so usage examples, edge cases, and error handling are not documented.
- The interaction with environment variables such as `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, and `LLMWIKI_PUBLISH_REMOTE` is indicated but not elaborated.
- The role of Mermaid integration within the publishing workflow is not fully explained.
- The module's behavior in different runtime environments or CI/CD pipelines is not described.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
