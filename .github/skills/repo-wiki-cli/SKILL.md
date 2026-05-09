---
name: repo-wiki-cli
description: "Use when running repo-wiki CLI workflows in this repository or as a distributed plugin for external repositories: scanning, planning, compiling, linting, local wiki regeneration, and GitHub Wiki publishing. Keywords: repo-wiki CLI, npx repo-wiki, self:wiki, kb:bootstrap, lint:local, lint-docs, publish wiki, GitHub Wiki, .llmwiki."
user-invocable: false
---

# repo-wiki CLI Operations

Use this skill when operating the `repo-wiki` CLI for this repository or for an external repository that uses repo-wiki.

## Safety and authority

- Source, tests, CI, and configuration are authoritative. Generated wiki pages under `.llmwiki/wiki/` are derived artifacts.
- Prefer the installed/public CLI shape (`repo-wiki` or `npx repo-wiki`) in examples so this skill works both inside this repository and as a distributed plugin.
- Inside the repo-wiki source repository, package scripts are acceptable because they build the local TypeScript implementation first.
- Do not run `repo-wiki init` in an already configured repository unless explicitly asked; it mutates `.llmwiki/config.json` and may create setup files.
- Command-specific `--help` may execute defaults in older scaffold versions. Use top-level `repo-wiki --help`, `npx repo-wiki --help`, package README/docs, or source inspection for exact options.
- `lint-docs` warnings are currently advisory in the scaffold. `repo-wiki lint` / `npm run lint:local` is the required local wiki gate before publishing.
- Publishing pushes to the GitHub Wiki repository. Only publish trusted local wiki output from a trusted branch/context.

## Common commands

Portable CLI form for any repository:

```bash
npx repo-wiki run --mode bootstrap --repo . --scan .llmwiki/run --plan .llmwiki/bootstrap-plan.json --wiki .llmwiki/wiki
npx repo-wiki lint-docs --repo . --scan .llmwiki/run
npx repo-wiki lint --wiki .llmwiki/wiki --scan .llmwiki/run
npx repo-wiki publish --wiki .llmwiki/wiki --remote https://github.com/OWNER/REPO.wiki.git
```

Source-repository package scripts, useful while developing repo-wiki itself:

```bash
npm run build          # Compile TypeScript to dist/
npm run check          # Build and run compiled tests
npm run coverage       # Build and run coverage gate
npm run self:wiki      # Bootstrap/regenerate this repo's local .llmwiki/wiki
npm run lint:docs      # Validate ingested markdown documentation; warnings may be expected
npm run lint:local     # Validate generated local wiki; must pass before publish
npm run kb:publish     # Publish .llmwiki/wiki; requires LLMWIKI_PUBLISH_REMOTE or GITHUB_WIKI_REMOTE
```

## Regenerate the local wiki snapshot

Use this when source/docs changed and the local generated wiki should reflect the current checkout.

Portable form:

```bash
npx repo-wiki run --mode bootstrap --repo . --scan .llmwiki/run --plan .llmwiki/bootstrap-plan.json --wiki .llmwiki/wiki
npx repo-wiki lint --wiki .llmwiki/wiki --scan .llmwiki/run
```

Source-repository package-script form:

```bash
npm run self:wiki
npm run lint:local
```

Expected success signal from `repo-wiki lint` or `lint:local`:

```json
{
  "errors": 0,
  "warnings": 0
}
```

If `lint:docs` reports warnings, inspect whether they are expected documentation-debt findings before treating them as blockers. Error-level findings should be fixed or explicitly escalated before publication.

## Publish a GitHub Wiki

Always use the external GitHub Wiki remote form in instructions and examples:

```text
https://github.com/OWNER/REPO.wiki.git
```

For this repository, that is:

```text
https://github.com/mfittko/repo-wiki.wiki.git
```

Portable publish workflow:

```bash
npx repo-wiki lint --wiki .llmwiki/wiki --scan .llmwiki/run
npx repo-wiki publish --wiki .llmwiki/wiki --remote https://github.com/OWNER/REPO.wiki.git
```

Source-repository publish workflow while developing repo-wiki itself:

```bash
npm run lint:local
LLMWIKI_PUBLISH_REMOTE=https://github.com/mfittko/repo-wiki.wiki.git npm run kb:publish
```

A successful publish returns JSON similar to:

```json
{
  "status": "published",
  "remote": "https://github.com/OWNER/REPO.wiki.git",
  "branch": "master",
  "pages": 37
}
```

If the publish response is `skipped-no-remote`, rerun with `LLMWIKI_PUBLISH_REMOTE`, `GITHUB_WIKI_REMOTE`, or pass `--remote` directly to the CLI.

## External repository bootstrap pattern

For another repository, the public workflow is:

```bash
npx repo-wiki init --repo . --write-agents
npx repo-wiki run --mode bootstrap --repo . --wiki .llmwiki/wiki
npx repo-wiki publish --wiki .llmwiki/wiki --remote https://github.com/OWNER/REPO.wiki.git
```

Do not publish from untrusted pull requests. Prefer dry-run or local artifacts in CI unless publish credentials and event context are trusted.

## Artifact map

- `.llmwiki/run/` - scan artifacts, manifest, source cards, documentation cards.
- `.llmwiki/bootstrap-plan.json` - bootstrap page plan.
- `.llmwiki/incremental-plan.json` - incremental page plan.
- `.llmwiki/wiki/` - generated local GitHub Wiki markdown.
- `.llmwiki/schema.md` - schema and operating conventions for generated wiki maintenance.

## Troubleshooting

- If publish skips with no remote, set `LLMWIKI_PUBLISH_REMOTE=https://github.com/OWNER/REPO.wiki.git` or pass `--remote https://github.com/OWNER/REPO.wiki.git`.
- If `lint:local` or `repo-wiki lint` fails, inspect the JSON `issues` array and fix generated wiki links, required pages, frontmatter, or secret-like content before publishing.
- If package scripts fail because `dist/` is stale or absent, run `npm run build` or the package script again; most scripts already build first.
- If local scans unexpectedly include `tmp/` worktrees or scratch directories, inspect source filtering configuration and scanner behavior before trusting the generated wiki.
