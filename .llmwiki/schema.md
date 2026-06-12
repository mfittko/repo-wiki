# LLM Wiki Schema

This file defines how repository source code is compiled into wiki pages.

## Source of truth

The source repository at the pinned commit is authoritative. Generated wiki pages are derived artifacts.

## Required pages

```text
Home.md
_Sidebar.md
Index.md
Log.md
Agent-Context-Pack.md
Repository-Overview.md
Architecture.md
Build-Test-and-Run.md
Open-Questions.md
```

## Page policy

- Prefer updating existing pages over creating new pages.
- Keep pages concise enough for coding agents to read.
- Preserve marked human sections.
- Add uncertain claims to `Open-Questions.md`.
- Cite source paths for material claims.
- Do not copy secrets or private tokens.

## Human-maintained block

```md
<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
```

## Generated page frontmatter

```yaml
---
source_repo: "owner/repo"
source_commit: "abc123"
compiled_at: "2026-05-06T00:00:00.000Z"
page_state: "generated"
kind: "module"
source_paths:
  - "src/example.ts"
---
```

`page_state` is emitted for generated pages, including `_Sidebar.md`, and may be `generated`, `mixed`, or `human-owned`. Pages marked `human-owned` or `owned_by: "human"` are skipped by the compiler; generated pages with non-empty preserved HUMAN_NOTES are rewritten as `mixed`. Existing pages without repo-wiki ownership metadata are treated as unmanaged and are not overwritten or adopted by default; adoption must be explicit by adding generated frontmatter/ownership metadata.

## Graph artifact contract

`repo-wiki compile` also writes a deterministic graph artifact to `.llmwiki/graph.json`.

- `schema_version`: currently `1`
- node kinds: `page`, `source`, `documentation`, `module`
- edge kinds: `wiki_link`, `provenance`, `affects`, `owns`

The graph artifact is an internal contract for planner/linter/incremental traversal helpers. It is additive and does not replace `.llmwiki/wiki` as the primary generated documentation artifact.

## Citation, provenance, and confidence policy

Material claims (repository behavior, commands, APIs, architecture, configuration, dependencies, tests, data models, operations, and security posture) should include at least one provenance signal:

- non-empty frontmatter `source_paths` for generated pages;
- source path/code span snippets such as `` `src/example.ts` ``;
- commit-pinned GitHub source links produced by compiler helpers;
- documentation-card paths when explicitly labeled as secondary/unvalidated evidence.

Hub/navigation pages (`Home.md`, `_Sidebar.md`, `Index.md`, `Log.md`) are exempt from provenance requirements.

Generated pages may include conservative page-level confidence metadata:

- `high`: directly scanner-derived inventories/tables with cited source paths.
- `medium`: deterministic structural summaries derived from source cards/manifest.
- `low`: open questions, documentation debt, or explicitly unresolved claims.

## Lint gates

Error-level:

- missing required pages
- secret-like content
- invalid generated markdown
- missing source commit metadata
- broken required navigation links

Warning-level:

- orphan pages
- missing source paths
- stale source hashes
- duplicate concept pages
- excessive page size
