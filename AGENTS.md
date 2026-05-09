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

Repository-maintained cross-platform skills can live under `skills/` when they are intended to ship with or describe repo-wiki itself. Integration-specific skill roots such as `.github/skills/` and `.pi/skills/` may also contain integration-only skills, but any shared repo-wiki skill there should be a symlink to the canonical `skills/` directory, not a duplicate copy.

GitHub Issues are the execution backlog for this repository. Use milestones, labels, and issue templates for tracking work; do not create or maintain a separate local backlog file unless a task explicitly requires it. When handing an issue to Copilot, assign `copilot-swe-agent` directly rather than `copilot`.

When running repository commands or automation:

- Treat user wording as authoritative. If the user asks a question about whether an action should be taken (for example, “Would you land this?”, “Can we merge?”, “Should we push?”), answer the question and wait for explicit imperative confirmation before taking action.
- Before any state-changing action, ask for and receive explicit confirmation unless the user's latest message is already a clear imperative instruction naming that action. State-changing actions include local file edits, generated file updates, dependency changes, commits, pushes, merges, rebases, branch deletion, publishing, assigning issues, changing labels or milestones, closing or resolving issues/PR threads, submitting PR reviews, triggering workflows, installing packages, or any command that mutates repository, filesystem, GitHub, CI, package, or publication state.
- Questions, preferences, future-tense statements, or implied approval are not confirmation. Confirmation must be an imperative instruction naming the action, such as “edit AGENTS.md”, “commit it”, “push to main”, “merge PR #12”, “assign issue #50”, or “resolve the threads”.
- Prefer single commands where practical. If the logic is too involved for one command, write a temporary `.mjs` script under `tmp/` instead of building up fragile shell sequences.
- For GitHub issue/PR descriptions and comments, prefer `--body-file` / `-F` or stdin via `-F -` over inline shell strings. Use heredocs or temp files for multi-line content and avoid interpolating untrusted text directly into shell commands.
- When a PR verdict is requested for a pull request not opened by the active GitHub user (`<self>`), submit a formal GitHub review: use Approve when the verdict is merge-ready, or Request Changes when the verdict includes must-fix findings. Do not leave only a plain PR comment for these verdicts.

When adding new capabilities:

- Keep scanner behavior deterministic where possible.
- Prefer small, composable modules under `src/`.
- Add tests for file traversal, manifest generation, planning, and linting.
- Preserve human-maintained wiki sections when implementing update logic.
- Do not copy secrets, `.env` values, or private tokens into generated markdown.
- Treat LLM output as an untrusted patch that must pass lint before publishing.
