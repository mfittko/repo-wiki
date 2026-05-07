# Agent Instructions

This repository sketches a tool that compiles repository source code into a GitHub Wiki knowledge base.

Before editing implementation details, read:

1. `docs/PLAN.md`
2. `.llmwiki/schema.md`
3. `src/cli.js`
4. `src/scanner.js`
5. `src/compiler.js`

Source code is authoritative. Generated wiki pages are derived artifacts.

When adding new capabilities:

- Keep scanner behavior deterministic where possible.
- Prefer small, composable modules under `src/`.
- Add tests for file traversal, manifest generation, planning, and linting.
- Preserve human-maintained wiki sections when implementing update logic.
- Do not copy secrets, `.env` values, or private tokens into generated markdown.
- Treat LLM output as an untrusted patch that must pass lint before publishing.
