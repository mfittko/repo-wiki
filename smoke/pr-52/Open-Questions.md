---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "57f31fb6202a15b1b0598d7ae36a693c21359721"
compiled_at: "2026-05-09T23:55:11.595Z"
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
