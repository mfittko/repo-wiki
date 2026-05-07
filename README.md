# repo-wiki

A Node.js CLI and library for compiling any GitHub repository into a GitHub Wiki knowledge base for humans and coding agents.

The package is dual-role:

1. Use it on any existing repository.
2. Use it to maintain this repository's own wiki.

It follows an LLM Wiki pattern: pinned source input, source cards, documentation cards, a compiled wiki, and lint gates that keep the wiki navigable, source-grounded, and safe.

## Install or run with npx

```bash
npx repo-wiki init --repo . --write-agents
npx repo-wiki run --mode bootstrap --repo . --wiki .llmwiki/wiki
```

## Local development

```bash
npm install
npm run build
npm test
npm run check
npm run coverage
npm run changelog:ensure
npm run self:wiki
npm run lint:docs
npm run lint:local
```

The local CLI and package verification flow runs against compiled output in `dist/`. `npm test`, `npm run check`, and `npm run coverage` all require a successful TypeScript build before tests run. CI enforces a 95% line coverage gate on compiled source coverage. Changelog maintenance is automated with `scripts/update-changelog.mjs`: merged PR title/body metadata plus changed files feed `Unreleased` on `main`, and a release workflow rotates `Unreleased` into versioned sections.

## Commands

```text
repo-wiki init      Add .llmwiki config/schema files to a repository.
repo-wiki scan      Scan source files and markdown docs into cards and manifest files.
repo-wiki plan      Create a bootstrap or incremental wiki compilation plan.
repo-wiki lint-docs Validate ingested markdown documentation before compilation.
repo-wiki compile   Generate or update local wiki markdown pages.
repo-wiki lint      Validate generated wiki pages.
repo-wiki publish   Push local wiki pages to OWNER/REPO.wiki.git.
repo-wiki run       Run scan -> plan -> lint-docs -> compile -> lint, optionally followed by publish.
```

## Documentation ingestion policy

Markdown documentation is ingested by default, but it is secondary evidence. Code at the pinned commit is authoritative; tests, CI, config, schemas, and migrations have higher authority than markdown.

Documentation is useful for intent, terminology, onboarding, runbooks, and ADR rationale. It can also be stale. The package therefore creates documentation cards and runs `repo-wiki lint-docs` before compilation.

Configuration:

```json
{
  "documentation": {
    "ingest": true,
    "authority": "secondary",
    "include": ["README.md", "docs/**/*.md", "ADR/**/*.md", ".github/**/*.md"],
    "exclude": ["CHANGELOG.md", "docs/archive/**", "docs/old/**"],
    "stale_after_days": 180,
    "require_code_validation": true,
    "allow_unvalidated_context": true,
    "preserve_original_claims": false,
    "fail_on_stale_docs": false,
    "fail_on_conflicting_docs": true
  }
}
```

Generated wikis include `Documentation-Debt-Report.md`, which summarizes stale docs, unvalidated claims, commands mentioned in markdown, environment variables mentioned in markdown, and contradiction-review candidates.

## Publish to GitHub Wiki

```bash
repo-wiki publish \
  --wiki .llmwiki/wiki \
  --remote https://github.com/OWNER/REPO.wiki.git
```

or:

```bash
LLMWIKI_PUBLISH_REMOTE=https://github.com/OWNER/REPO.wiki.git npm run kb:publish
```

Use a dedicated token or GitHub App credentials in CI. Do not publish generated wiki changes from untrusted pull requests.

## Package API

```js
import {
  initProject,
  scanRepository,
  createBootstrapPlan,
  lintDocs,
  compileWiki,
  lintWiki,
  publishWiki
} from 'repo-wiki';
```

## Current status

This is a complete implementation scaffold, not a production-grade semantic compiler. It includes a working CLI, deterministic scanner, documentation ingestor, documentation linter, planner, wiki compiler, wiki linter, publisher, tests, prompts, configuration, and GitHub Actions workflow. The LLM synthesis layer and deep language-specific validators are intentionally left as the next implementation stage.
