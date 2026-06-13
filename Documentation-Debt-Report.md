---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "1defe58385a113a4dfca789e393deecf0d6135a8"
compiled_at: "2026-06-13T08:30:37.578Z"
kind: "documentation_debt_report"
documentation_authority: "secondary"
claim_status: "review-needed"
confidence: "low"
source_paths: [".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md","docs/PLAN.md","docs/plans/agent-integration.md","docs/plans/ci-publishing.md","docs/plans/doc-validation.md","docs/plans/github-action.md","docs/plans/incremental-mode.md","docs/plans/karpathy-llm-wiki-alignment.md","docs/plans/llm-compiler.md","docs/plans/production-scanner.md","docs/plans/query-and-file-back.md","docs/plans/search-index.md","docs/plans/trust-hardening.md","docs/plans/wiki-graph.md","docs/plans/wiki-health.md","docs/WHY.md","README.md"]
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
  "validation_strictness": "standard",
  "fail_on_stale_docs": false,
  "fail_on_conflicting_docs": true
}
```

## Summary

- Documentation ingestion enabled: true
- Documentation files scanned: 24
- Claims extracted: 34
- Stale documents: 1
- Commands found in docs: 26
- Environment variable mentions: 29
- File path references: 76

## Documentation status table

| File | Status | Authority | Age days | Claims | Commands | Env vars |
|---|---|---:|---:|---:|---:|---:|
| `.github/agents/coordinator.agent.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `.github/agents/developer.agent.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `.github/agents/docs.agent.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `.github/agents/fixer.agent.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `.github/agents/quality.agent.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `.github/agents/review.agent.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `.github/copilot-review-instructions.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `.github/pull_request_template.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `docs/PLAN.md` | partially_validated | secondary | 0 | 10 | 11 | 1 |
| `docs/plans/agent-integration.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `docs/plans/ci-publishing.md` | partially_validated | secondary | 0 | 1 | 0 | 0 |
| `docs/plans/doc-validation.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `docs/plans/github-action.md` | partially_validated | secondary | 0 | 2 | 0 | 1 |
| `docs/plans/incremental-mode.md` | stale | secondary | 0 | 1 | 0 | 0 |
| `docs/plans/karpathy-llm-wiki-alignment.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `docs/plans/llm-compiler.md` | partially_validated | secondary | 0 | 2 | 0 | 8 |
| `docs/plans/production-scanner.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `docs/plans/query-and-file-back.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `docs/plans/search-index.md` | unvalidated | secondary | 0 | 1 | 0 | 0 |
| `docs/plans/trust-hardening.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `docs/plans/wiki-graph.md` | unvalidated | secondary | 0 | 3 | 0 | 0 |
| `docs/plans/wiki-health.md` | unvalidated | secondary | 0 | 0 | 0 | 0 |
| `docs/WHY.md` | partially_validated | secondary | 0 | 5 | 0 | 0 |
| `README.md` | partially_validated | secondary | 0 | 9 | 15 | 19 |

## Command validation

Commands extracted from documentation code blocks, validated against `package.json` scripts and CI workflow commands captured in the scan manifest.

- Validated: 10
- Missing (package script / Makefile / task-runner target): 0
- Unvalidated (source unknown): 11

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
| `npm install repo-wiki` | ❓ unvalidated | unknown |
| `npm install "./$tarball"` | ❓ unvalidated | unknown |
| `npx repo-wiki --help` | ❓ unvalidated | unknown |
| `npx repo-wiki run \` | ❓ unvalidated | unknown |
| `npm run build` | ✅ validated | CI workflow |
| `npm run lint:code` | ✅ validated | CI workflow |
| `npm run check` | ✅ validated | CI workflow |
| `npm run coverage` | ✅ validated | CI workflow |
| `npm run pack:check` | ✅ validated | CI workflow |
| `npm run changelog:ensure` | ✅ validated | package.json |

## File path validation

Repository file and directory references extracted from markdown links and inline code spans. Generated-output roots such as `dist/`, `coverage/`, and `.llmwiki/` are excluded from extraction.

- Valid: 38
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
| `docs/PLAN.md:227` | `package.json` | ✅ valid | `package.json` |
| `docs/PLAN.md:299` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:299` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:332` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:337` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:491` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:499` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:611` | `docs/plans/` | ✅ valid | `docs/plans` |
| `docs/PLAN.md:663` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:663` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:696` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:719` | `src/extractors.ts` | ✅ valid | `src/extractors.ts` |
| `docs/PLAN.md:773` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:773` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:779` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:885` | `docs/plans/` | ✅ valid | `docs/plans` |
| `docs/PLAN.md:889` | `docs/plans/production-scanner.md` | ✅ valid | `docs/plans/production-scanner.md` |
| `docs/PLAN.md:890` | `docs/plans/doc-validation.md` | ✅ valid | `docs/plans/doc-validation.md` |
| `docs/PLAN.md:891` | `docs/plans/wiki-graph.md` | ✅ valid | `docs/plans/wiki-graph.md` |
| `docs/PLAN.md:892` | `docs/plans/llm-compiler.md` | ✅ valid | `docs/plans/llm-compiler.md` |
| `docs/PLAN.md:893` | `docs/plans/incremental-mode.md` | ✅ valid | `docs/plans/incremental-mode.md` |
| `docs/PLAN.md:894` | `docs/plans/ci-publishing.md` | ✅ valid | `docs/plans/ci-publishing.md` |
| `docs/PLAN.md:895` | `docs/plans/agent-integration.md` | ✅ valid | `docs/plans/agent-integration.md` |
| `docs/PLAN.md:896` | `docs/plans/karpathy-llm-wiki-alignment.md` | ✅ valid | `docs/plans/karpathy-llm-wiki-alignment.md` |
| `docs/PLAN.md:897` | `docs/plans/wiki-health.md` | ✅ valid | `docs/plans/wiki-health.md` |
| `docs/PLAN.md:898` | `docs/plans/query-and-file-back.md` | ✅ valid | `docs/plans/query-and-file-back.md` |
| `docs/PLAN.md:899` | `docs/plans/search-index.md` | ✅ valid | `docs/plans/search-index.md` |
| `docs/PLAN.md:900` | `docs/plans/trust-hardening.md` | ✅ valid | `docs/plans/trust-hardening.md` |
| `docs/PLAN.md:901` | `docs/plans/github-action.md` | ✅ valid | `docs/plans/github-action.md` |
| `docs/PLAN.md:926` | `Index.md` | ❌ missing | not found |
| `docs/PLAN.md:926` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:955` | `Log.md` | ❌ missing | not found |
| `docs/PLAN.md:972` | `AGENTS.md` | ✅ valid | `AGENTS.md` |
| `docs/PLAN.md:972` | `AGENTS.repo-wiki.md` | ❌ missing | not found |
| `docs/PLAN.md:973` | `Agent-Context-Pack.md` | ❌ missing | not found |
| `docs/plans/agent-integration.md:62` | `AGENTS.md` | ✅ valid | `AGENTS.md` |
| `docs/plans/agent-integration.md:62` | `AGENTS.repo-wiki.md` | ❌ missing | not found |
| `docs/plans/agent-integration.md:63` | `Agent-Context-Pack.md` | ❌ missing | not found |
| `docs/plans/doc-validation.md:65` | `package.json` | ✅ valid | `package.json` |
| `docs/plans/karpathy-llm-wiki-alignment.md:51` | `Index.md` | ❌ missing | not found |
| `docs/plans/karpathy-llm-wiki-alignment.md:51` | `Log.md` | ❌ missing | not found |
| `docs/plans/karpathy-llm-wiki-alignment.md:52` | `Log.md` | ❌ missing | not found |
| `docs/plans/karpathy-llm-wiki-alignment.md:69` | `Index.md` | ❌ missing | not found |
| `docs/plans/query-and-file-back.md:57` | `Log.md` | ❌ missing | not found |
| `docs/plans/query-and-file-back.md:69` | `Log.md` | ❌ missing | not found |
| `docs/plans/trust-hardening.md:31` | `page-ownership.ts` | ❌ missing | not found |
| `docs/plans/trust-hardening.md:72` | `src/secret-patterns.ts` | ✅ valid | `src/secret-patterns.ts` |
| `docs/plans/wiki-graph.md:97` | `_Sidebar.md` | ❌ missing | not found |
| `docs/plans/wiki-graph.md:124` | `_Sidebar.md` | ❌ missing | not found |
| `docs/plans/wiki-graph.md:124` | `Index.md` | ❌ missing | not found |
| `docs/WHY.md:18` | `Index.md` | ❌ missing | not found |
| `docs/WHY.md:19` | `Log.md` | ❌ missing | not found |
| `docs/WHY.md:61` | `./PLAN.md` | ✅ valid | `docs/PLAN.md` |
| `README.md:5` | `docs/PLAN.md` | ✅ valid | `docs/PLAN.md` |
| `README.md:30` | `Documentation-Debt-Report.md` | ❌ missing | not found |
| `README.md:32` | `Architecture.md` | ❌ missing | not found |
| `README.md:53` | `package.json` | ✅ valid | `package.json` |
| `README.md:59` | `package.json` | ✅ valid | `package.json` |
| `README.md:59` | `README.md` | ✅ valid | `README.md` |
| `README.md:59` | `CHANGELOG.md` | ✅ valid | `CHANGELOG.md` |
| `README.md:59` | `docs/` | ✅ valid | `docs` |
| `README.md:59` | `prompts/` | ✅ valid | `prompts` |
| `README.md:59` | `skills/` | ✅ valid | `skills` |
| `README.md:135` | `src/config.ts` | ✅ valid | `src/config.ts` |
| `README.md:139` | `README.md` | ✅ valid | `README.md` |
| `README.md:155` | `Architecture.md` | ❌ missing | not found |
| `README.md:210` | `.github/workflows/wiki.yml` | ✅ valid | `.github/workflows/wiki.yml` |
| `README.md:254` | `docs/PLAN.md` | ✅ valid | `docs/PLAN.md` |
| `README.md:254` | `docs/plans/wiki-graph.md` | ✅ valid | `docs/plans/wiki-graph.md` |

## Environment variable validation

Environment variable names extracted from documentation are validated against scanner-detected source usage and configured environment-variable names. Values are never copied into generated markdown.

- Validated: 29
- Unvalidated: 0

| Documentation file | Variable | Status |
|---|---|---|
| `docs/PLAN.md` | `LLMWIKI_PUBLISH_REMOTE` | ✅ validated |
| `docs/plans/github-action.md` | `GITHUB_TOKEN` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_LLM_API_KEY` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_COMPILER_MODE` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_LLM_BASE_URL` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_LLM_MODEL` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_LLM_SYSTEM_PROMPT` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_LLM_SYSTEM_PROMPT_FILE` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_LLM_TEMPERATURE` | ✅ validated |
| `docs/plans/llm-compiler.md` | `LLMWIKI_LLM_MAX_OUTPUT_TOKENS` | ✅ validated |
| `README.md` | `LLMWIKI_COMPILER_MODE` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_PROVIDER` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_BASE_URL` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_MODEL` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_API_KEY` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_SYSTEM_PROMPT` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_SYSTEM_PROMPT_FILE` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_TEMPERATURE` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_MAX_OUTPUT_TOKENS` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_TIMEOUT_MS` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_REASONING_EFFORT` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_RETRIES` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_VALIDATION_RETRIES` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_ARCHITECTURE_MODEL` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_ARCHITECTURE_MAX_OUTPUT_TOKENS` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_ARCHITECTURE_TIMEOUT_MS` | ✅ validated |
| `README.md` | `LLMWIKI_LLM_ARCHITECTURE_REASONING_EFFORT` | ✅ validated |
| `README.md` | `LLMWIKI_PUBLISH_REMOTE` | ✅ validated |
| `README.md` | `GITHUB_WIKI_REMOTE` | ✅ validated |

## Route/API claim validation

Route and API claims from documentation prose are validated against scanner-extracted route surfaces when available.

- Validated: 0
- Unvalidated: 0

- No route/API claims extracted from documentation.

## ADR validation

Conservative ADR detection uses deterministic path hints (`ADR/**`, `docs/adr/**`, `docs/adrs/**`) and explicit markers (e.g. `Status:`, `Superseded by:`, `Replaces:`, or ADR heading/title markers).

- ADR files detected: 0
- Superseded ADRs: 0
- Old ADRs missing status metadata: 0

- No ADR-like documentation files detected.

## Findings by category

### Stale

- `docs/plans/incremental-mode.md` - age 0 days, status stale

### Contradicted

- None detected.

### Unvalidated

- `docs/plans/search-index.md` - documentation claims have no validation signal.
- `docs/plans/wiki-graph.md` - documentation claims have no validation signal.
- `npx repo-wiki init --repo . --write-agents` - command source unknown.
- `npx repo-wiki run --mode bootstrap --repo . --wiki .llmwiki/wiki` - command source unknown.
- `npx repo-wiki publish --wiki .llmwiki/wiki --remote https://github.com/OWNER/REPO.wiki.git` - command source unknown.
- `npx repo-wiki publish --target github-wiki --wiki .llmwiki/wiki --remote https://github.com/OWNER/REPO.wiki.git` - command source unknown.
- `npx repo-wiki publish --target github-pages --wiki .llmwiki/wiki --branch gh-pages --pages-path .` - command source unknown.
- `npm install` - command source unknown.
- `npx repo-wiki publish --target github-pages --wiki .llmwiki/wiki --remote https://github.com/OWNER/repo-wiki.git --branch gh-pages --pages-path .` - command source unknown.
- `npm install repo-wiki` - command source unknown.
- `npm install "./$tarball"` - command source unknown.
- `npx repo-wiki --help` - command source unknown.
- `npx repo-wiki run \` - command source unknown.

### Broken-reference

- `docs/PLAN.md:19` references `Index.md` (missing).
- `docs/PLAN.md:20` references `Log.md` (missing).
- `docs/PLAN.md:39` references `Index.md` (missing).
- `docs/PLAN.md:39` references `Log.md` (missing).
- `docs/PLAN.md:299` references `Index.md` (missing).
- `docs/PLAN.md:299` references `Log.md` (missing).
- `docs/PLAN.md:332` references `Index.md` (missing).
- `docs/PLAN.md:337` references `Log.md` (missing).
- `docs/PLAN.md:491` references `Index.md` (missing).
- `docs/PLAN.md:499` references `Log.md` (missing).
- `docs/PLAN.md:663` references `Index.md` (missing).
- `docs/PLAN.md:663` references `Log.md` (missing).
- `docs/PLAN.md:696` references `Log.md` (missing).
- `docs/PLAN.md:773` references `Index.md` (missing).
- `docs/PLAN.md:773` references `Log.md` (missing).
- `docs/PLAN.md:779` references `Index.md` (missing).
- `docs/PLAN.md:926` references `Index.md` (missing).
- `docs/PLAN.md:926` references `Log.md` (missing).
- `docs/PLAN.md:955` references `Log.md` (missing).
- `docs/PLAN.md:972` references `AGENTS.repo-wiki.md` (missing).
- `docs/PLAN.md:973` references `Agent-Context-Pack.md` (missing).
- `docs/plans/agent-integration.md:62` references `AGENTS.repo-wiki.md` (missing).
- `docs/plans/agent-integration.md:63` references `Agent-Context-Pack.md` (missing).
- `docs/plans/karpathy-llm-wiki-alignment.md:51` references `Index.md` (missing).
- `docs/plans/karpathy-llm-wiki-alignment.md:51` references `Log.md` (missing).
- `docs/plans/karpathy-llm-wiki-alignment.md:52` references `Log.md` (missing).
- `docs/plans/karpathy-llm-wiki-alignment.md:69` references `Index.md` (missing).
- `docs/plans/query-and-file-back.md:57` references `Log.md` (missing).
- `docs/plans/query-and-file-back.md:69` references `Log.md` (missing).
- `docs/plans/trust-hardening.md:31` references `page-ownership.ts` (missing).
- `docs/plans/wiki-graph.md:97` references `_Sidebar.md` (missing).
- `docs/plans/wiki-graph.md:124` references `_Sidebar.md` (missing).
- `docs/plans/wiki-graph.md:124` references `Index.md` (missing).
- `docs/WHY.md:18` references `Index.md` (missing).
- `docs/WHY.md:19` references `Log.md` (missing).
- `README.md:30` references `Documentation-Debt-Report.md` (missing).
- `README.md:32` references `Architecture.md` (missing).
- `README.md:155` references `Architecture.md` (missing).

### ADR-specific

- None detected.

## Compiler policy

- Do not suppress documentation by default.
- Never treat docs as more authoritative than code at the pinned commit.
- Promote documentation-derived claims only when validated or clearly labeled.
- Include unvalidated operational claims in this report and in [Open Questions](Open-Questions.html).
- Fail publishing when project policy marks stale or contradicted docs as error-level.
