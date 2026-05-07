# Agent Instructions

This repository sketches a tool that compiles repository source code into a GitHub Wiki knowledge base.

Before editing implementation details, read:

1. `docs/PLAN.md`
2. `.llmwiki/schema.md`
3. `src/cli.ts`
4. `src/scanner.ts`
5. `src/compiler.ts`

Source code is authoritative. Generated wiki pages are derived artifacts.

For repository orientation, use the generated local wiki as a navigation aid before diving into source:

1. `.llmwiki/wiki/Agent-Context-Pack.md`
2. `.llmwiki/wiki/Index.md`
3. `.llmwiki/wiki/Architecture.md`
4. Relevant `.llmwiki/wiki/Module-*.md` pages

The local wiki is not authoritative; verify material claims against source, tests, configuration, and CI.

Repository-maintained skills live under `.github/skills/`. Pi-specific skill locations should be symlinks to `.github/skills/`, not duplicate skill copies.

When running repository commands or automation:

- Prefer single commands where practical. If the logic is too involved for one command, write a temporary `.mjs` script under `tmp/` instead of building up fragile shell sequences.

When adding new capabilities:

- Keep scanner behavior deterministic where possible.
- Prefer small, composable modules under `src/`.
- Add tests for file traversal, manifest generation, planning, and linting.
- Preserve human-maintained wiki sections when implementing update logic.
- Do not copy secrets, `.env` values, or private tokens into generated markdown.
- Treat LLM output as an untrusted patch that must pass lint before publishing.
