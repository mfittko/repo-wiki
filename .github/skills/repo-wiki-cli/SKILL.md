---
name: repo-wiki-cli
description: "Use when running this repository's repo-wiki CLI workflows: scanning, planning, compiling, linting, self-wiki regeneration, local wiki linting, and publishing the GitHub Wiki. Keywords: repo-wiki CLI, self:wiki, kb:bootstrap, lint:local, lint-docs, publish wiki, GitHub Wiki, .llmwiki."
user-invocable: false
---

# repo-wiki CLI Operations

Use this skill when operating the `repo-wiki` CLI in this repository or when publishing this repository's generated GitHub Wiki.

## Safety and authority

- Source, tests, CI, and configuration are authoritative. Generated wiki pages under `.llmwiki/wiki/` are derived artifacts.
- Prefer package scripts over raw `node dist/...` commands so the TypeScript build is current.
- Do not run `repo-wiki init` in this repository unless explicitly asked; it mutates `.llmwiki/config.json` and may create setup files.
- Command-specific `--help` is not currently a safe introspection pattern: some subcommands may execute with defaults instead of showing help. Use `npm run repo-wiki -- --help` for top-level help, or inspect `src/cli.ts` for exact options.
- `lint-docs` warnings are currently advisory in the scaffold. `lint:local` is the required local wiki gate before publishing.
- Publishing pushes to the GitHub Wiki repository. Only publish trusted local wiki output from a trusted branch/context.

## Common repository scripts

Run from the repository root:

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

Use this when source/docs changed and the local generated wiki should reflect the current checkout:

```bash
npm run self:wiki
npm run lint:local
```

Expected success signal from `lint:local`:

```json
{
  "errors": 0,
  "warnings": 0
}
```

If `lint:docs` reports warnings, inspect whether they are expected documentation-debt findings before treating them as blockers. Error-level findings should be fixed or explicitly escalated before publication.

## Publish this repository's GitHub Wiki

Use this workflow for the current repo:

```bash
npm run lint:local
LLMWIKI_PUBLISH_REMOTE=git@github.com:mfittko/repo-wiki.wiki.git npm run kb:publish
```

A successful publish returns JSON similar to:

```json
{
  "status": "published",
  "remote": "git@github.com:mfittko/repo-wiki.wiki.git",
  "branch": "master",
  "pages": 37
}
```

If the publish response is `skipped-no-remote`, rerun with `LLMWIKI_PUBLISH_REMOTE` or pass `--remote` directly to the CLI.

## External repository bootstrap pattern

For another repository, the equivalent public workflow is:

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

- If `kb:publish` skips with no remote, set `LLMWIKI_PUBLISH_REMOTE=git@github.com:mfittko/repo-wiki.wiki.git` for this repo.
- If `lint:local` fails, inspect the JSON `issues` array and fix generated wiki links, required pages, frontmatter, or secret-like content before publishing.
- If package scripts fail because `dist/` is stale or absent, run `npm run build` or the package script again; most scripts already build first.
- If local scans unexpectedly include `tmp/` worktrees or scratch directories, inspect source filtering configuration and scanner behavior before trusting the generated wiki.
