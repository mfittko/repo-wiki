---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
page_state: "generated"
source_paths: ["src/context-assembler.ts"]
compiled_at: "2026-05-10T21:15:56.521Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module context-assembler.ts

## Purpose

This module provides functionality to assemble and manage page contexts within the application. It exports functions and types related to constructing comprehensive page context objects, including assembling all page contexts or individual page contexts. Additionally, it includes utilities for handling sensitive information by redacting secret-like text within contexts.

## Source file list

- [src/context-assembler.ts](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/src/context-assembler.ts)

## Key symbols and entry points

- **assembleAllPageContexts**: Function to assemble context data for all pages.
- **assemblePageContext**: Function to assemble context data for a single page.
- **AssemblePageContextInput**: Input type/interface for assembling a page context.
- **PageContext**: Type representing the structure of a page context.
- **PageContextBudget**: Type related to budgeting or constraints within a page context.
- **PageContextPage**: Type representing individual page data within a context.
- **PageContextType**: Enum or type defining possible page context types.
- **redactSecretLikeText**: Utility function to redact text that appears to contain secrets or sensitive information.

## Dependencies and imports

- This module does not import any external modules or dependencies, indicating it is self-contained within the source code.

## Related tests

- [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/test/context-assembler.test.ts)

## Known gaps or open questions

- No explicit documentation cards or detailed descriptions are available for the exported symbols, which may limit understanding of their internal logic and usage.
- The exact nature and structure of the page contexts and budgets are not detailed here.
- Further refinement and documentation could improve clarity on how secret redaction is performed and under what conditions.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
