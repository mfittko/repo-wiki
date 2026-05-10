---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
page_state: "generated"
source_paths: ["docs/PLAN.md","docs/WHY.md","docs/plans/agent-integration.md","docs/plans/ci-publishing.md","docs/plans/doc-validation.md","docs/plans/incremental-mode.md","docs/plans/llm-compiler.md","docs/plans/production-scanner.md","docs/plans/wiki-graph.md"]
claim_status: "review-needed"
confidence: "low"
compiled_at: "2026-05-10T21:15:56.521Z"
kind: "module"
---

# Documentation Module

## Purpose

This module consolidates the core Markdown documentation files that articulate the design rationale, implementation plans, and architectural vision of the repo-wiki project. These documents serve as secondary evidence describing the intended system behavior, product goals, and planned features rather than authoritative or current runtime specifications.

The documentation references inspiration from Andrej Karpathy's LLM Wiki concept, emphasizing a wiki as a persistent, compounding artifact layered on immutable raw sources. It includes high-level vision statements, motivation for maintaining a wiki, and detailed plans for subsystems such as agent integration, continuous integration and publishing, documentation validation, incremental mode, LLM compilation, production scanning, and a plugin-based wiki knowledge graph.

Users should treat these documents as conceptual guidance and planning artifacts. Operational details, current implementation status, and runtime behavior must be validated against source code, automated tests, CI workflows, runtime configurations, or schema definitions elsewhere in the repository.

## Source Files

- [docs/PLAN.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/docs/PLAN.md)  
  Provides the overall implementation plan, product vision, and project goals.

- [docs/WHY.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/docs/WHY.md)  
  Explains the motivation behind the repo-wiki project and the rationale for maintaining a wiki instead of relying solely on search or retrieval-augmented generation.

- [docs/plans/agent-integration.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/docs/plans/agent-integration.md)  
  Details the planned architecture and summary for integrating agents into the system.

- [docs/plans/ci-publishing.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/docs/plans/ci-publishing.md)  
  Describes continuous integration and publishing workflows, including background work considerations.

- [docs/plans/doc-validation.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/docs/plans/doc-validation.md)  
  Outlines plans for validating the correctness and consistency of documentation.

- [docs/plans/incremental-mode.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/docs/plans/incremental-mode.md)  
  Discusses the incremental mode feature and its architecture; this document is marked as stale and may require review.

- [docs/plans/llm-compiler.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/docs/plans/llm-compiler.md)  
  Covers the design of the LLM compiler, emphasizing a provider-agnostic boundary compatible with OpenAI-style chat completions.

- [docs/plans/production-scanner.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/docs/plans/production-scanner.md)  
  Summarizes the production scanner epic and its architectural considerations.

- [docs/plans/wiki-graph.md](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/docs/plans/wiki-graph.md)  
  Describes the planned plugin-based knowledge graph system for modeling relationships between wiki pages, source modules, documentation topics, and ownership.

## Key Symbols and Entry Points

This module contains only Markdown documentation files and thus defines no executable symbols, functions, classes, or code entry points. Its value lies in providing conceptual, architectural, and planning information for the repo-wiki system.

## Dependencies and Imports

There are no code dependencies or imports within this documentation module. While the documents reference concepts and components implemented elsewhere in the repository, they do not themselves import or depend on any code modules.

## Related Tests

No direct automated tests are associated with this documentation module. Validation of the claims, plans, and architectural descriptions contained herein requires cross-referencing with source code tests, continuous integration workflows, runtime configurations, and schema definitions located in other parts of the repository.

## Known Gaps or Open Questions

- The documentation files have varying validation statuses, including partially validated, unvalidated, and stale, indicating some plans may be outdated, incomplete, or require further review.
- Operational behavior and current implementation details must be verified against authoritative sources such as source code, tests, and CI pipelines.
- The incremental mode plan is marked as stale, suggesting it may need updating or reconsideration.
- There is no explicit mechanism described for synchronizing these documentation plans with actual code changes or runtime state.
- The documentation does not specify automated validation or enforcement mechanisms to ensure consistency between plans and implementation.

---

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
