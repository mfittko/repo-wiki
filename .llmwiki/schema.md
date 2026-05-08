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

`page_state` is emitted for generated pages and may be `generated`, `mixed`, or `human-owned`. Pages marked `human-owned` are skipped by the compiler; generated pages with non-empty preserved HUMAN_NOTES are rewritten as `mixed`.

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
