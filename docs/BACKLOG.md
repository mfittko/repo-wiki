# repo-wiki Backlog Planning Notes

GitHub Issues are the execution backlog for this repository. This file is a planning bridge that translates `docs/WHY.md` and the Karpathy LLM Wiki alignment work in `docs/PLAN.md` into issue-sized epics and task drafts. When work is accepted, create or update GitHub Issues and keep this file as a high-level map rather than a parallel tracker.

## Existing open issues this work should connect to

- #2 - Incremental maintenance and safe publishing
- #3 - LLM compiler and source-grounded wiki synthesis
- #5 - Agent integration and query workflows
- #18 - Documentation validation and debt reporting
- #19 - Wiki knowledge graph and navigation
- #20 - CI publishing and release workflow
- #35 - Structured wiki patch format and lint-gated acceptance
- #37 - Citation, confidence, and contradiction enforcement for generated pages
- #39 - Validate documented file paths and environment variables
- #40 - Documentation debt report strictness and route-claim validation
- #46 - Honor source excludes and ignore nested worktree noise during scan

## Priority roadmap

### P0: Trust, correctness, and safety hardening

Make the current scaffold match its stated trust model before expanding LLM synthesis.

- Make `repo-wiki run` fail or stop before publish when `lint-docs` returns error-level issues.
- Honor configured `source.exclude` and future `source.include` rules during scans.
- Hash every file, including skipped large or binary files.
- Redact secret-like strings before writing manifests, documentation cards, page contexts, logs, or generated pages.
- Sanitize remotes and URLs before displaying or writing them.
- Delete stale generated wiki pages during publish while preserving unmanaged and human-owned pages.
- Add JSON schema validation for `.llmwiki/config.json`.
- Make lint severity fully config-driven.

### P1: Karpathy pattern completeness

Make `repo-wiki` a faithful software-repository version of the LLM Wiki pattern.

- Treat `Index.md` and `Log.md` as first-class, parseable operating surfaces.
- Append deterministic log entries for ingest, compile, lint, query, file-back, and publish operations.
- Add wiki health linting for orphan pages, stale pages, missing cross-references, and recurring unpageified concepts.
- Add page frontmatter suitable for Obsidian, Dataview, GitHub Wiki navigation, and future search.
- Add graph metadata that can power navigation and incremental maintenance.
- Publish this repository's generated GitHub Wiki as the canonical demo.

### P2: LLM compiler and structured patch acceptance

Turn the deterministic compiler into a semantic compiler without weakening source authority.

- Wire `compiler.mode=llm` into `compileWiki` using the provider boundary and prompt templates.
- Use assembled page contexts with explicit budgets and omitted-context reporting.
- Require structured patches from hosted LLMs instead of accepting free-form markdown.
- Validate patch shape, page ownership, source paths, citations, and lint gates before writing.
- Preserve human notes byte-for-byte across deterministic and LLM modes.
- Add retry/failure behavior for invalid provider output.
- Add citation, confidence, contradiction, and open-question metadata to generated pages.

### P3: Query, search, and file-back workflows

Make the generated wiki useful after initial compilation.

- Implement `repo-wiki search` over wiki pages, source cards, and documentation cards.
- Implement `repo-wiki query` with source-cited answers and explicit confidence.
- Support a `--file-back` mode that creates or updates investigation/topic pages.
- Add local search adapters, starting with a simple built-in index and optionally supporting qmd or MCP later.
- Ensure query answers never treat stale or contradicted docs as authoritative.
- Log query and file-back events in `Log.md`.

### P4: Real incremental maintenance

Keep the wiki current at low cost after merges.

- Persist previous compiled commit and manifest metadata.
- Compute changed files from `base..head`.
- Rescan changed files and required graph neighbors.
- Use affected-page graph data to update only relevant pages.
- Regenerate global pages only when relevant source or graph inputs change.
- Handle deleted and renamed files/modules by updating index, links, and stale generated pages.
- Add PR-oriented `repo-wiki diff` output for review before publish.

### P5: Production scanner and framework plugins

Increase repository coverage and confidence.

- Add TypeScript/JavaScript AST extraction for exports, imports, route handlers, config, and framework surfaces.
- Detect Express, Fastify, NestJS, Next.js, Hono, Koa, tRPC, GraphQL, and OpenAPI surfaces.
- Add Python support for Django, FastAPI, Flask, pytest, pyproject, and common config conventions.
- Add Go support for modules, HTTP routes, packages, tests, and common framework patterns.
- Add Rust support for Cargo, Axum, Actix, Rocket, tests, and feature flags.
- Add Ruby/Rails and PHP/Laravel extraction where useful.
- Improve test-to-source mapping across languages.
- Extract database migrations and ORM models across Prisma, TypeORM, Sequelize, Rails, Django, SQLAlchemy, and raw SQL.

### P6: Adoption, CI, and developer experience

Make the tool easy and safe to adopt.

- Add a reusable GitHub Action.
- Add `repo-wiki doctor` for readiness and configuration diagnostics.
- Add `repo-wiki init --profile` templates for Node, Python, Go, Rust, Rails, and monorepos.
- Add `--dry-run` and machine-readable JSON output to every command that mutates state.
- Publish example generated wikis for representative repositories.
- Document safe token setup and wiki publishing permissions.
- Add package smoke tests for `npx repo-wiki` against packed output.

## Recommended new or expanded issues

### Trust hardening for generated wiki artifacts

Parent: new epic or attach to #2, #3, #18, and #20.

Acceptance criteria:

- Error-level docs lint failures can block run/publish according to config.
- Scan output respects configured source exclusions.
- Every source card has a stable hash or an explicit hash failure reason.
- No scan artifact or generated page contains known secret-like patterns from fixtures.
- Publisher removes stale generated pages without touching unmanaged or human-owned pages.

Suggested verification:

- `npm test`
- `npm run check`
- `npm run coverage`
- End-to-end fixture: `init -> scan -> plan -> lint-docs -> compile -> lint -> publish --dry-run`

### First-class parseable `Index.md` and `Log.md`

Parent: #19 and #5.

Acceptance criteria:

- Agents can read `Index.md` first to route to relevant pages.
- `grep '^## \[' Log.md | tail -5` returns the latest operations.
- Re-running compilation with the same inputs does not create noisy index/log churn.

### Wiki health linting

Parent: #19, #18, and #37.

Acceptance criteria:

- Health findings are deterministic under the same wiki and manifest inputs.
- Config controls warning vs error severity.
- Lint output can be consumed by CI and by an agent proposing repair patches.

### Query and file-back workflow

Parent: #5 and #3.

Acceptance criteria:

- Query answers cite source paths for material claims.
- Filed-back pages include provenance, query text, source paths, and page state.
- The feature works in deterministic/mock mode for tests.

### Local search and optional qmd/MCP integration

Parent: #5 and #19.

Acceptance criteria:

- `repo-wiki search "query"` returns ranked wiki pages and evidence paths.
- Search can run without external services.
- Optional provider integrations do not change core scan/compile behavior.

### Self-wiki flagship demo

Parent: #20 and #5.

Acceptance criteria:

- Public users can inspect a real generated wiki for this repo.
- README links to `Agent-Context-Pack`, `Architecture`, `Build-Test-and-Run`, `Documentation-Debt-Report`, and `Index` when available.
- Publish flow is dry-run safe and credential safe.

### `repo-wiki doctor`

Parent: adoption / new issue.

Acceptance criteria:

- `repo-wiki doctor --repo .` is useful before first `run`.
- It never requires hosted LLM credentials.
- It gives clear next steps when the generated wiki would be low quality or unsafe to publish.

### Reusable GitHub Action

Parent: #20 or new adoption epic.

Acceptance criteria:

- A consumer repo can add repo-wiki with a short workflow snippet.
- The action works without publish credentials.
- Publishing requires explicit credentials and safe event context.
