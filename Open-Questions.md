---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "8aa93c6e99a61f3c2d7a6b527fc351443c0d7c1c"
compiled_at: "2026-05-10T06:11:31.845Z"
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
