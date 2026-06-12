---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2f0f1d4621e326372c896cfd4888a22f68ec0f48"
compiled_at: "2026-06-12T23:11:33.082Z"
kind: "open_questions"
claim_status: "review-needed"
confidence: "low"
source_paths: [".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md","docs/PLAN.md","docs/plans/agent-integration.md","docs/plans/ci-publishing.md","docs/plans/doc-validation.md","docs/plans/github-action.md","docs/plans/incremental-mode.md","docs/plans/karpathy-llm-wiki-alignment.md","docs/plans/llm-compiler.md","docs/plans/production-scanner.md","docs/plans/query-and-file-back.md","docs/plans/search-index.md","docs/plans/trust-hardening.md","docs/plans/wiki-graph.md","docs/plans/wiki-health.md","docs/WHY.md","README.md"]
page_state: "generated"
---
# Open Questions

- What pages should be human-owned versus generated?
- Which source paths should be excluded from wiki compilation?
- Which modules require deeper AST-level extraction?
- Which package manager and CI commands should be treated as canonical?
- How should large files and generated files be summarized?
- What confidence threshold should block publishing?

## Documentation review queue

Documentation cards listed below are secondary evidence and require review. Do not promote these items as authoritative wiki claims until validated against source, tests, CI, config, or generated schemas.

- `.github/agents/coordinator.agent.md` - unvalidated status.
- `.github/agents/developer.agent.md` - unvalidated status.
- `.github/agents/docs.agent.md` - unvalidated status.
- `.github/agents/fixer.agent.md` - unvalidated status.
- `.github/agents/quality.agent.md` - unvalidated status.
- `.github/agents/review.agent.md` - unvalidated status.
- `.github/copilot-review-instructions.md` - unvalidated status.
- `.github/pull_request_template.md` - unvalidated status.
- `docs/PLAN.md` - claims need validation.
- `docs/plans/agent-integration.md` - unvalidated status.
- `docs/plans/ci-publishing.md` - claims need validation.
- `docs/plans/doc-validation.md` - unvalidated status.
- `docs/plans/github-action.md` - claims need validation.
- `docs/plans/incremental-mode.md` - claims need validation, stale (0 days old).
- `docs/plans/karpathy-llm-wiki-alignment.md` - unvalidated status.
- `docs/plans/llm-compiler.md` - claims need validation.
- `docs/plans/production-scanner.md` - unvalidated status.
- `docs/plans/query-and-file-back.md` - unvalidated status.
- `docs/plans/search-index.md` - unvalidated status.
- `docs/plans/trust-hardening.md` - unvalidated status.
- `docs/plans/wiki-graph.md` - unvalidated status.
- `docs/plans/wiki-health.md` - unvalidated status.
- `docs/WHY.md` - claims need validation.
- `README.md` - claims need validation.

## Bootstrap gaps

- This first-pass compiler uses repository structure, not an LLM synthesis pass.
- Existing human wiki reconciliation is not implemented yet.
- GitHub Wiki publishing is a placeholder.
