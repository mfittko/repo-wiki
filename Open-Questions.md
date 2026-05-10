---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "b8cbf96e1f992a8d3818f45b712ece4f64b11535"
compiled_at: "2026-05-10T16:00:12.208Z"
kind: "open_questions"
page_state: "generated"
---
# Open Questions

- What pages should be human-owned versus generated?
- Which source paths should be excluded from wiki compilation?
- Which modules require deeper AST-level extraction?
- Which package manager and CI commands should be treated as canonical?
- How should large files and generated files be summarized?
- What confidence threshold should block publishing?

## Bootstrap gaps

- This first-pass compiler uses repository structure, not an LLM synthesis pass.
- Existing human wiki reconciliation is not implemented yet.
- GitHub Wiki publishing is a placeholder.
