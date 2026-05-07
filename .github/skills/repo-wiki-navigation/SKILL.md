---
name: repo-wiki-navigation
description: "Use when exploring, modifying, reviewing, or planning work in this repository. Read the generated local wiki first as an orientation aid, then verify implementation details against source code. Keywords: navigation, orientation, local wiki, repo wiki, codebase map, architecture, modules."
user-invocable: false
---

# repo-wiki Navigation

Use this skill before substantial exploration, implementation, or review work in this repository.

## Purpose

The generated local wiki in `.llmwiki/wiki/` is a navigation aid for coding agents and maintainers. It helps identify likely source areas, module groupings, dependencies, and verification commands quickly.

## Read First

1. `.llmwiki/wiki/Agent-Context-Pack.md`
2. `.llmwiki/wiki/Index.md`
3. `.llmwiki/wiki/Architecture.md`
4. `.llmwiki/wiki/Build-Test-and-Run.md`
5. Relevant `.llmwiki/wiki/Module-*.md` page for the task area

Useful cross-cutting pages:

- `.llmwiki/wiki/Dependency-Map.md`
- `.llmwiki/wiki/Testing-Strategy.md`
- `.llmwiki/wiki/Configuration-and-Environment.md`
- `.llmwiki/wiki/Security-and-Secrets.md`
- `.llmwiki/wiki/Documentation-Debt-Report.md`

## Authority Rule

The wiki is generated and may be stale. Use it for orientation only.

Source files, tests, configuration, and CI are authoritative. Verify any material claim against source before editing or reviewing behavior.

