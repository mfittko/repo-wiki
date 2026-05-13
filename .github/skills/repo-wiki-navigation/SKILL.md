---
name: repo-wiki-navigation
description: "Use when exploring, modifying, reviewing, or planning work in this repository. Read the generated local wiki first as an orientation aid, then verify implementation details against source code. Keywords: navigation, orientation, local wiki, repo wiki, codebase map, architecture, modules."
user-invocable: false
---

# repo-wiki Navigation

Use this skill before substantial exploration, implementation, or review work in this repository, but keep orientation reads intentionally narrow.

## Purpose

The generated local wiki in `.llmwiki/wiki/` is a navigation aid for coding agents and maintainers. It helps identify likely source areas, module groupings, dependencies, and verification commands quickly.

## Read First

Start with the smallest useful orientation slice, not the full wiki set.

1. Read exactly one high-signal entry page first:
   - `.llmwiki/wiki/Agent-Context-Pack.md`, or
   - `.llmwiki/wiki/Index.md`, or
   - `.llmwiki/wiki/Architecture.md`
2. Read the single most relevant `.llmwiki/wiki/Module-*.md` page for the task area only if needed.
3. Read `.llmwiki/wiki/Build-Test-and-Run.md` only when verification or command surface is part of the task.
4. Read cross-cutting pages only when the task specifically touches those concerns.

Useful cross-cutting pages when needed:

- `.llmwiki/wiki/Dependency-Map.md`
- `.llmwiki/wiki/Testing-Strategy.md`
- `.llmwiki/wiki/Configuration-and-Environment.md`
- `.llmwiki/wiki/Security-and-Secrets.md`
- `.llmwiki/wiki/Documentation-Debt-Report.md`

## Authority Rule

The wiki is generated and may be stale. Use it for orientation only.

After orientation, do not preload broad source context by default. Start from the issue, diff, failing test, or named file; then use targeted source reads and narrow line ranges. Source files, tests, configuration, and CI are authoritative. Verify any material claim against source before editing or reviewing behavior.

