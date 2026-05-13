# Agent Instructions

This repository sketches a tool that compiles repository source code into a GitHub Wiki knowledge base.

Before editing implementation details, read:

1. `docs/PLAN.md`
2. `.llmwiki/schema.md`
3. only the task-relevant source files

Use `src/cli.ts`, `src/scanner.ts`, and `src/compiler.ts` as default anchor files only when the task touches CLI flow, repository scanning, compilation/report rendering, or when the relevant ownership is still unclear after a targeted read.

Source code is authoritative. Generated wiki pages are derived artifacts.

For repository orientation, use the generated local wiki as a navigation aid before diving into source, but keep the read surface minimal:

1. start with the single most relevant of `.llmwiki/wiki/Agent-Context-Pack.md`, `.llmwiki/wiki/Index.md`, or `.llmwiki/wiki/Architecture.md`
2. then read only the relevant `.llmwiki/wiki/Module-*.md` page or cross-cutting page for the task area if needed

Do not preload broad source context by default. Prefer targeted reads, narrow line ranges, and task-local files first. The local wiki is not authoritative; verify material claims against source, tests, configuration, and CI.

Repository-maintained cross-platform skills can live under `skills/` when they are intended to ship with or describe repo-wiki itself. Integration-specific skill roots such as `.github/skills/` and `.pi/skills/` may also contain integration-only skills, but any shared repo-wiki skill there should be a symlink to the canonical `skills/` directory, not a duplicate copy.

GitHub Issues are the execution backlog for this repository. Use milestones, labels, and issue templates for tracking work; do not create or maintain a separate local backlog file unless a task explicitly requires it. When handing an issue to Copilot, assign `copilot-swe-agent` directly rather than `copilot`.

When running repository commands or automation:

- Treat user wording as authoritative. If the user asks a question about whether an action should be taken (for example, “Would you land this?”, “Can we merge?”, “Should we push?”), answer the question and wait for explicit imperative confirmation before taking action.
- Before any state-changing action, ask for and receive explicit confirmation unless the user's latest message is already a clear imperative instruction naming that action. State-changing actions include local file edits, generated file updates, dependency changes, commits, pushes, merges, rebases, branch deletion, publishing, assigning issues, changing labels or milestones, closing or resolving issues/PR threads, submitting PR reviews, triggering workflows, installing packages, or any command that mutates repository, filesystem, GitHub, CI, package, or publication state.
- Questions, preferences, future-tense statements, or implied approval are not confirmation. Confirmation is valid when it is either an imperative instruction naming the action, such as “edit AGENTS.md”, “commit it”, “push to main”, “merge PR #12”, “assign issue #50”, or “resolve the threads”, or a direct response to a confirmation request using “go ahead”, “yes”, or “confirmed”. The bare response “ok” is not confirmation.
- Prefer single commands where practical. If the logic is too involved for one command, write a temporary `.mjs` script under `tmp/` instead of building up fragile shell sequences.
- For GitHub issue/PR descriptions and comments, prefer `--body-file` / `-F` or stdin via `-F -` over inline shell strings. Use heredocs or temp files for multi-line content and avoid interpolating untrusted text directly into shell commands.
- When a PR verdict is requested, first summarize pending inline comments, proposed resolution status, and the intended verdict text, then ask for confirmation before submitting the review so the user can correct wording or the verdict. For a pull request not opened by the active GitHub user (`<self>`), submit the confirmed verdict as a formal GitHub review: use Approve when the verdict is merge-ready, or Request Changes when the verdict includes must-fix findings. Do not leave only a plain PR comment for these verdicts.

When adding new capabilities:

- Keep scanner behavior deterministic where possible.
- Prefer small, composable modules under `src/`.
- Add tests for file traversal, manifest generation, planning, and linting.
- Preserve human-maintained wiki sections when implementing update logic.
- Do not copy secrets, `.env` values, or private tokens into generated markdown.
- Treat LLM output as an untrusted patch that must pass lint before publishing.
