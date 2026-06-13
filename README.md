# repo-wiki

`repo-wiki` is a Node.js CLI and library that compiles a Git repository into a source-grounded wiki knowledge base for humans and coding agents.

It follows the LLM Wiki pattern described in `docs/PLAN.md`: scan the repository at a pinned commit, ingest markdown as secondary evidence, compile durable wiki pages, and lint the result before publishing. GitHub Wiki is the primary publication target today, and GitHub Pages is also supported.

## What it does

- scans repository files into source cards plus a manifest
- ingests markdown documentation into documentation cards
- validates documented commands, file paths, environment variables, and route/API claims
- plans and compiles local wiki pages under `.llmwiki/wiki/`
- builds a deterministic graph artifact under `.llmwiki/graph.json` for internal traversal and incremental mapping
- preserves `HUMAN_NOTES` and skips human-owned or unmanaged pages
- publishes the local wiki to either GitHub Wiki or GitHub Pages
- builds a deterministic offline search index under `.llmwiki/search/` and exposes `repo-wiki search`, `repo-wiki query`, `repo-wiki path`, and `repo-wiki explain`
- supports deterministic compilation and an LLM-assisted compilation path

## Current implementation scope

Today the package includes:

- a working CLI and library API
- bootstrap and incremental command flow (`incremental` is wired through the CLI, but scanning is still broad rather than diff-minimal)
- JavaScript/TypeScript AST-backed extraction for imports, symbols, exports, and route-adjacent surfaces
- regex/baseline extraction for Python, Go, Rust, and Ruby imports and symbols
- route detection for Express, Fastify, NestJS, Hono, Koa, tRPC, GraphQL, OpenAPI, and file-based route handlers
- migration/model detection for SQL-style migrations plus Prisma, TypeORM, Sequelize, and Mongoose-style model signals
- test-to-source mapping, package-script extraction, CI command extraction, dependency-edge analysis, and environment-variable collection
- documentation linting and a generated `Documentation-Debt-Report.md`
- GitHub Wiki and GitHub Pages publishing, including target-specific frontmatter handling
- LLM synthesis for module pages and `Architecture.md` behind a validated provider boundary

## Requirements

- Node.js 24+

## Installation

`@mfittko/repo-wiki` is published to the npm registry with each GitHub Release. After the first release, the supported downstream install path is:

```bash
npm install @mfittko/repo-wiki
```

For local verification or offline installs, you can also install from a tarball produced with `npm pack`:

```bash
tarball=$(npm pack | tail -n 1)
npm install "./$tarball"
```

After install, the runnable CLI is exposed through `dist/bin/repo-wiki.js` declared in `package.json#bin`:

```bash
npx repo-wiki --help
```

No clone or local build step is required for normal downstream consumption. The package guarantees the files listed in `package.json#files`, including `dist/`, `README.md`, `CHANGELOG.md`, `.llmwiki/schema.md`, `.llmwiki/config.json`, and the `docs/`, `prompts/`, and `skills/` trees. Local development from a source clone should use `npm install` instead (the `prepare` script runs the build).

## Use as a pi extension

`@mfittko/repo-wiki` also ships as a [pi-coding-agent](https://github.com/earendil-works/pi-coding-agent) extension. After installing the npm package, enable the extension and skill:

```bash
npm install @mfittko/repo-wiki
npx @mfittko/repo-wiki extension install
```

To install into the global pi agent directory instead of the current project:

```bash
npx @mfittko/repo-wiki extension install --global
```

If a previous shim or skill already exists at the target location, the installer refuses to overwrite it. Re-run with `--force` to replace:

```bash
npx @mfittko/repo-wiki extension install --force
```

Inside `pi`, run `/reload` to load the extension. You can then use the slash command and tools:

```
/repo_wiki scan --repo .
/repo_wiki compile --scan .llmwiki/run --plan .llmwiki/bootstrap-plan.json --wiki .llmwiki/wiki
/repo_wiki lint --wiki .llmwiki/wiki
```

Registered tools include:

- `repo_wiki_cli` – run raw CLI arguments
- `repo_wiki_scan`, `repo_wiki_plan`, `repo_wiki_compile`, `repo_wiki_lint`, `repo_wiki_publish`
- `repo_wiki_search`, `repo_wiki_query`, `repo_wiki_path`, `repo_wiki_explain`

The extension entrypoint is published as `@mfittko/repo-wiki/extension` and the skill is shipped in `skills/repo-wiki-cli/SKILL.md`.

## Quick start

Initialize a repository for repo-wiki:

```bash
npx repo-wiki init --repo . --write-agents
```

Run a full local bootstrap:

```bash
npx repo-wiki run \
  --mode bootstrap \
  --repo . \
  --scan .llmwiki/run \
  --plan .llmwiki/bootstrap-plan.json \
  --wiki .llmwiki/wiki
```

The default workflow writes:

- `.llmwiki/config.json`
- `.llmwiki/schema.md`
- `.llmwiki/run/manifest.json` and card artifacts
- `.llmwiki/wiki/*.md`
- `.llmwiki/graph.json`
- `.llmwiki/search/index.json`
- an optional agent pointer file when `--write-agents` is used

## Command surface

```text
repo-wiki init      Add .llmwiki config/schema files to a repository.
repo-wiki scan      Scan source files and markdown docs into cards and a manifest.
repo-wiki plan      Create a bootstrap or incremental wiki compilation plan.
repo-wiki lint-docs Validate ingested markdown documentation before compilation.
repo-wiki compile   Generate or update local wiki markdown pages.
repo-wiki lint      Validate generated wiki pages.
repo-wiki publish   Publish local wiki pages to GitHub Wiki or GitHub Pages.
repo-wiki search    Search local wiki pages through the built-in offline index.
repo-wiki query     Answer from local wiki/search/graph evidence.
repo-wiki path      Traverse `.llmwiki/graph.json` between two nodes or paths.
repo-wiki explain   Explain a page or graph node with local evidence.
repo-wiki run       Run scan -> plan -> lint-docs -> compile -> lint, optionally followed by publish.
```

`run` blocks compilation and publish when `lint-docs` reports error-level issues.

Search is fully local and page-first:

```bash
repo-wiki search "scanner" --wiki .llmwiki/wiki
repo-wiki search "architecture" --wiki .llmwiki/wiki --json
repo-wiki query "How does compile work?" --wiki .llmwiki/wiki --json
repo-wiki path Architecture.md src/compiler.ts --graph .llmwiki/graph.json --json
repo-wiki explain Module-compiler-ts.md --wiki .llmwiki/wiki --json
```

The built-in index is rebuilt deterministically from local wiki pages and stored at `.llmwiki/search/index.json`. Results include page identity, kind, snippet/summary, source paths, and lightweight internal-link graph context for routing follow-up investigation. `query` and `explain` are offline, extractive v1 surfaces: they assemble answers from ranked wiki pages plus graph provenance and include evidence references for material claims. `path` uses the persisted graph artifact for deterministic shortest-path traversal. Hosted synthesis, file-back, and runtime transports are deferred.

## Graph foundation (shipped in v1)

The compiler now emits `.llmwiki/graph.json` as a deterministic local artifact. Current v1 graph contract includes:

- node kinds: `page`, `source`, `documentation`, `module`
- edge kinds: `wiki_link`, `provenance`, `affects`, `owns`
- deterministic validation for duplicate node IDs, malformed IDs, dangling edge endpoints, and invalid edge target kinds

The graph is an additive internal foundation used by planner/linter/incremental helpers. `.llmwiki/wiki` remains the primary derived artifact and publication surface.

## Documentation authority model

Code at the pinned commit is authoritative. Tests, CI/configuration, and generated schemas are stronger evidence than markdown. Markdown docs are still ingested because they often contain intent, terminology, onboarding, and runbook context.

The default documentation config is loaded from `src/config.ts` and includes:

- `documentation.ingest=true`
- `authority="secondary"`
- include patterns for `README.md`, `docs/**/*.md`, `ADR/**/*.md`, and `.github/**/*.md`
- default lint behavior for stale docs, contradicted docs, broken file references, unvalidated env vars, and unvalidated route claims

`repo-wiki lint-docs` validates documented package scripts/commands, checks relative links and referenced repo paths, and compares route/API claims against scanner-extracted route surfaces when available.

## Deterministic and LLM compilation

The default compiler mode is deterministic.

LLM mode is also shipped:

- set `compiler.mode` to `llm` in `.llmwiki/config.json`, or
- export `LLMWIKI_COMPILER_MODE=llm`

In LLM mode:

- module pages and `Architecture.md` are synthesized through the provider boundary
- generated output must pass structured wiki-patch validation before it is written
- foundation and cross-cutting pages remain deterministic today
- the mock provider is still useful for tests and CI, while hosted mode uses the OpenAI-compatible provider

Useful environment variables include:

- `LLMWIKI_COMPILER_MODE`
- `LLMWIKI_LLM_PROVIDER`
- `LLMWIKI_LLM_BASE_URL`
- `LLMWIKI_LLM_MODEL`
- `LLMWIKI_LLM_API_KEY`
- `LLMWIKI_LLM_SYSTEM_PROMPT`
- `LLMWIKI_LLM_SYSTEM_PROMPT_FILE`
- `LLMWIKI_LLM_TEMPERATURE`
- `LLMWIKI_LLM_MAX_OUTPUT_TOKENS`
- `LLMWIKI_LLM_TIMEOUT_MS`
- `LLMWIKI_LLM_REASONING_EFFORT`
- `LLMWIKI_LLM_RETRIES`
- `LLMWIKI_LLM_VALIDATION_RETRIES`
- `LLMWIKI_LLM_ARCHITECTURE_MODEL`
- `LLMWIKI_LLM_ARCHITECTURE_MAX_OUTPUT_TOKENS`
- `LLMWIKI_LLM_ARCHITECTURE_TIMEOUT_MS`
- `LLMWIKI_LLM_ARCHITECTURE_REASONING_EFFORT`

## Publish targets

Publish to GitHub Wiki:

```bash
repo-wiki publish \
  --target github-wiki \
  --wiki .llmwiki/wiki \
  --remote https://github.com/OWNER/REPO.wiki.git
```

Publish to GitHub Pages:

```bash
repo-wiki publish \
  --target github-pages \
  --wiki .llmwiki/wiki \
  --remote https://github.com/OWNER/REPO.git \
  --branch gh-pages \
  --pages-path .
```

Notes:

- GitHub Wiki defaults to `frontmatter=provenance`
- GitHub Pages defaults to `frontmatter=preserve`
- `--frontmatter-policy` and `--frontmatter` are both accepted
- `--dry-run` reports target, branch/path, page count, and frontmatter policy without pushing
- `LLMWIKI_PUBLISH_REMOTE` is the primary publish remote env var; GitHub Wiki publishing also falls back to `GITHUB_WIKI_REMOTE`

The repository also ships `.github/workflows/wiki.yml`, which compiles on `main`, publishes the GitHub Wiki on `main`, publishes GitHub Pages automatically on pushes to `main`, and can also publish Pages on manual dispatch when `publish_pages=true`.

## Library API

```js
import {
  initProject,
  scanRepository,
  createBootstrapPlan,
  lintDocs,
  compileWiki,
  lintWiki,
  publishWiki
} from '@mfittko/repo-wiki';
```

Advanced exports also expose prompt-building, provider configuration, frontmatter policies, wiki-patch validation, and page-ownership helpers.

## Local development

```bash
npm install
npm run build
npm run lint:code
npm run check
npm run coverage
npm run pack:check
npm run self:wiki
npm run lint:docs
npm run lint:local
npm run changelog:ensure
```

Notes:

- `npm test` aliases `npm run check`
- tests run against built output in `dist/`
- `npm run coverage` enforces a 95% line-coverage gate on compiled source
- `npm run self:wiki` runs the package against this repository

## Current status and near-term gaps

The current package ships a working CLI, scanner, docs linting, deterministic compiler, LLM page synthesis path, wiki linting, publisher, and CI workflows.

Still planned rather than shipped are user-facing `doctor`, `diff`, backend graph adapters (for example Neo4j/SQLite), filed-back query pages, hosted answer synthesis, and runtime transport surfaces described in `docs/PLAN.md` and `docs/plans/wiki-graph.md`. The shipped search/query/path/explain surfaces are built-in local page-first commands; external adapters and richer file-back layers remain deferred.
