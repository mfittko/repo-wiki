---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "b53c0639ff3f1e1d616403ddd6e297456e7a5c27"
compiled_at: "2026-05-09T23:16:22.618Z"
kind: "documentation_debt_report"
documentation_authority: "secondary"
page_state: "generated"
---
# Documentation Debt Report

Markdown documentation is ingested as secondary evidence. It is useful for intent, terminology, onboarding, and architectural rationale, but material claims should be validated against code, tests, configuration, generated schemas, or CI before the wiki presents them as current behavior.

## Configuration

```json
{
  "ingest": true,
  "authority": "secondary",
  "include": [
    "README.md",
    "docs/**/*.md",
    "ADR/**/*.md",
    ".github/**/*.md"
  ],
  "exclude": [
    "CHANGELOG.md",
    "docs/archive/**",
    "docs/old/**"
  ],
  "stale_after_days": 180,
  "require_code_validation": true,
  "allow_unvalidated_context": true,
  "preserve_original_claims": false,
  "fail_on_stale_docs": false,
  "fail_on_conflicting_docs": true
}
```

## Summary

- Documentation ingestion enabled: true
- Documentation files scanned: 18
- Claims extracted: 24
- Stale documents: 1
- Commands found in docs: 22
- Environment variable mentions: 12
- File path references: 56

## Documentation status table

| File | Status | Authority | Age days | Claims | Commands | Env vars |
|---|---|---:|---:|---:|---:|---:|
| `.github/agents/coordinator.agent.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `.github/agents/developer.agent.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `.github/agents/docs.agent.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `.github/agents/fixer.agent.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `.github/agents/quality.agent.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `.github/agents/review.agent.md` | unvalidated | secondary | 0 | 0 | 0 | 1 |
| `.github/copilot-review-instructions.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `.github/pull_request_template.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `docs/PLAN.md` | partially_validated | secondary | 0 | 9 | 11 | 2 |
| `docs/plans/agent-integration.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `docs/plans/ci-publishing.md` | partially_validated | secondary | 0 | 1 | 0 | 0 |
| `docs/plans/doc-validation.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `docs/plans/incremental-mode.md` | stale | secondary | 0 | 1 | 0 | 0 |
| `docs/plans/llm-compiler.md` | partially_validated | secondary | 0 | 2 | 0 | 8 |
| `docs/plans/production-scanner.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `docs/plans/wiki-graph.md` | unvalidated | secondary | 0 | 1 | 0 | 0 |
| `docs/WHY.md` | partially_validated | secondary | 0 | 5 | 0 | 0 |
| `README.md` | partially_validated | secondary | 0 | 5 | 11 | 1 |

## Command validation

Commands extracted from documentation code blocks, validated against `package.json` scripts and CI workflow commands captured in the scan manifest.

- Validated: 9
- Missing (script not in package.json): 0
- Unvalidated (source unknown): 7

| Command | Status | Source |
|---|---|---|
| `npm run self:wiki` | ✅ validated | package.json |
| `npm run kb:publish` | ✅ validated | package.json |
| `npx repo-wiki init --repo . --write-agents` | ❓ unvalidated | unknown |
| `npx repo-wiki run --mode bootstrap --repo . --wiki .llmwiki/wiki` | ❓ unvalidated | unknown |
| `npx repo-wiki publish --wiki .llmwiki/wiki --remote https://github.com/OWNER/REPO.wiki.git` | ❓ unvalidated | unknown |
| `npx repo-wiki publish --target github-wiki --wiki .llmwiki/wiki --remote https://github.com/OWNER/REPO.wiki.git` | ❓ unvalidated | unknown |
| `npx repo-wiki publish --target github-pages --wiki .llmwiki/wiki --branch gh-pages --pages-path .` | ❓ unvalidated | unknown |
| `npm install` | ❓ unvalidated | unknown |
| `npm run lint:docs` | ✅ validated | package.json |
| `npm run lint:local` | ✅ validated | package.json |
| `npx repo-wiki publish --target github-pages --wiki .llmwiki/wiki --remote https://github.com/OWNER/repo-wiki.git --branch gh-pages --pages-path .` | ❓ unvalidated | unknown |
| `npm run build` | ✅ validated | CI workflow |
| `npm test` | ✅ validated | package.json |
| `npm run check` | ✅ validated | CI workflow |
| `npm run coverage` | ✅ validated | CI workflow |
| `npm run changelog:ensure` | ✅ validated | package.json |

## File path validation

Repository file and directory references extracted from markdown links and inline code spans. Generated-output roots such as `dist/`, `coverage/`, and `.llmwiki/` are excluded from extraction.

- Valid: 18
- Missing: 38

| Documentation location | Reference | Status | Resolved path |
|---|---|---|---|
| `.github/agents/coordinator.agent.md:13` | `docs/plans/` | ✅ valid | `docs/plans` |
| `.github/agents/review.agent.md:20` | `docs/plans/` | ✅ valid | `docs/plans` |
| `.github/copilot-review-instructions.md:5` | `docs/PLAN.md` | ✅ valid | `docs/PLAN.md` |
| `docs/PLAN.md:19` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:20` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:39` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:39` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:63` | `OWNER/REPO.wiki.git` | ❌ missing | not found |
| `docs/PLAN.md:227` | `package.json` | ✅ valid | `package.json` |
| `docs/PLAN.md:298` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:298` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:329` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:334` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:487` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:495` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:605` | `docs/plans/` | ✅ valid | `docs/plans` |
| `docs/PLAN.md:657` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:657` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:689` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:752` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:752` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:758` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:847` | `docs/plans/` | ✅ valid | `docs/plans` |
| `docs/PLAN.md:851` | `docs/plans/production-scanner.md` | ✅ valid | `docs/plans/production-scanner.md` |
| `docs/PLAN.md:852` | `docs/plans/doc-validation.md` | ✅ valid | `docs/plans/doc-validation.md` |
| `docs/PLAN.md:853` | `docs/plans/wiki-graph.md` | ✅ valid | `docs/plans/wiki-graph.md` |
| `docs/PLAN.md:854` | `docs/plans/llm-compiler.md` | ✅ valid | `docs/plans/llm-compiler.md` |
| `docs/PLAN.md:855` | `docs/plans/incremental-mode.md` | ✅ valid | `docs/plans/incremental-mode.md` |
| `docs/PLAN.md:856` | `docs/plans/ci-publishing.md` | ✅ valid | `docs/plans/ci-publishing.md` |
| `docs/PLAN.md:857` | `docs/plans/agent-integration.md` | ✅ valid | `docs/plans/agent-integration.md` |
| `docs/PLAN.md:861` | `docs/plans/karpathy-llm-wiki-alignment.md` | ❌ missing | not found |
| `docs/PLAN.md:862` | `docs/plans/wiki-health.md` | ❌ missing | not found |
| `docs/PLAN.md:863` | `docs/plans/query-and-file-back.md` | ❌ missing | not found |
| `docs/PLAN.md:864` | `docs/plans/search-index.md` | ❌ missing | not found |
| `docs/PLAN.md:865` | `docs/plans/trust-hardening.md` | ❌ missing | not found |
| `docs/PLAN.md:866` | `docs/plans/github-action.md` | ❌ missing | not found |
| `docs/PLAN.md:891` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:891` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:920` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:934` | `AGENTS.md` | ✅ valid | `AGENTS.md` |
| `docs/PLAN.md:934` | `AGENTS.repo-wiki.md` | ❌ missing | not found |
| `docs/PLAN.md:935` | `Agent-Context-Pack.md` | ❌ missing | not found |
| `docs/plans/agent-integration.md:62` | `AGENTS.md` | ✅ valid | `AGENTS.md` |
| `docs/plans/agent-integration.md:62` | `AGENTS.repo-wiki.md` | ❌ missing | not found |
| `docs/plans/agent-integration.md:63` | `Agent-Context-Pack.md` | ❌ missing | not found |
| `docs/plans/doc-validation.md:65` | `package.json` | ✅ valid | `package.json` |
| `docs/plans/wiki-graph.md:81` | `_Sidebar.md` | ❌ missing | not found |
| `docs/plans/wiki-graph.md:108` | `_Sidebar.md` | ❌ missing | not found |
| `docs/plans/wiki-graph.md:108` | `Index.md` | ❌ missing | not found |
| `docs/WHY.md:18` | `Index.md` | ❌ missing | not found |
| `docs/WHY.md:19` | `Log.md` | ❌ missing | not found |
| `docs/WHY.md:42` | `OWNER/REPO.wiki.git` | ❌ missing | not found |
| `docs/WHY.md:61` | `./PLAN.md` | ✅ valid | `docs/PLAN.md` |
| `README.md:33` | `scripts/update-changelog.mjs` | ✅ valid | `scripts/update-changelog.mjs` |
| `README.md:73` | `Documentation-Debt-Report.md` | ❌ missing | not found |
| `README.md:118` | `pages_path=smoke/pr-N` | ❌ missing | not found |

## Environment variable validation

Environment variable names extracted from documentation are validated against scanner-detected source usage and configured environment-variable names. Values are never copied into generated markdown.

- Validated: 10
- Unvalidated: 2

| Documentation file | Variable | Status |
|---|---|---|
| `.github/agents/review.agent.md` | `CHANGES_REQUESTED` | ❓ unvalidated |
| `docs/PLAN.md` | `HUMAN_NOTES` | ❓ unvalidated |
| `docs/PLAN.md` | `LLMWIKI_PUBLISH_REMOTE` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_LLM_API_KEY` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_COMPILER_MODE` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_LLM_BASE_URL` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_LLM_MODEL` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_LLM_SYSTEM_PROMPT` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_LLM_SYSTEM_PROMPT_FILE` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_LLM_TEMPERATURE` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_LLM_MAX_OUTPUT_TOKENS` | ✅ validated |
| `README.md` | `LLMWIKI_PUBLISH_REMOTE` | ✅ validated |

## Stale documentation candidates

- `docs/plans/incremental-mode.md` - age 0 days, status stale

## Contradiction-review candidates

- None detected.

## Compiler policy

- Do not suppress documentation by default.
- Never treat docs as more authoritative than code at the pinned commit.
- Promote documentation-derived claims only when validated or clearly labeled.
- Include unvalidated operational claims in this report and in [Open Questions](Open-Questions).
- Fail publishing when project policy marks stale or contradicted docs as error-level.
