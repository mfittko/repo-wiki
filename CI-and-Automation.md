---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "e8e50cf58d4fe0b1575ca9d2f73e98541cc2c545"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and documentation workflows within the repository. It includes configuration templates for issue tracking, pull request management, and automated changelog generation. The module also defines specialized GitHub agents to coordinate development, documentation, quality assurance, code fixing, and review processes. The workflows automate key repository maintenance tasks such as CI runs, changelog updates on merges and releases, and wiki compilation and publishing.

The module is designed to streamline development cycles, enforce quality standards, and maintain up-to-date documentation through automated processes and clearly defined agent roles.

## Source File List

- **Issue Templates (YAML):**
  - `.github/ISSUE_TEMPLATE/config.yml`
  - `.github/ISSUE_TEMPLATE/epic.yml`
  - `.github/ISSUE_TEMPLATE/task.yml`

- **Agent Documentation (Markdown):**
  - `.github/agents/coordinator.agent.md`
  - `.github/agents/developer.agent.md`
  - `.github/agents/docs.agent.md`
  - `.github/agents/fixer.agent.md`
  - `.github/agents/quality.agent.md`
  - `.github/agents/review.agent.md`

- **Guidance and Templates (Markdown):**
  - `.github/copilot-review-instructions.md`
  - `.github/pull_request_template.md`
  - `.github/skills/keep-a-changelog/SKILL.md`
  - `.github/skills/repo-wiki-navigation/SKILL.md`

- **CI and Automation Workflows (YAML):**
  - `.github/workflows/changelog-on-merge.yml`
  - `.github/workflows/changelog-release.yml`
  - `.github/workflows/ci.yml`
  - `.github/workflows/wiki.yml`

## Key Symbols and Entry Points

- **GitHub Agents:**
  - `coordinator.agent.md` — Coordinates workflow cycles and enforces constraints.
  - `developer.agent.md` — Defines developer expectations and engineering principles.
  - `docs.agent.md` — Manages documentation creation and updates.
  - `fixer.agent.md` — Handles automated fixes and review workflows.
  - `quality.agent.md` — Oversees quality assurance processes.
  - `review.agent.md` — Guides code review inputs and follow-up scopes.

- **Workflows:**
  - `ci.yml` — Runs continuous integration tasks on code changes.
  - `changelog-on-merge.yml` — Automates changelog updates upon merges, requiring `GH_TOKEN`.
  - `changelog-release.yml` — Manages changelog generation during releases.
  - `wiki.yml` — Automates wiki compilation and publishing, using environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

- **Templates:**
  - Issue templates (`config.yml`, `epic.yml`, `task.yml`) standardize issue reporting.
  - Pull request template (`pull_request_template.md`) guides contributors on change summaries and acceptance criteria.

## Dependencies and Imports

- The workflows rely on GitHub Actions environment variables such as:
  - `GH_TOKEN` for authentication in changelog updates.
  - `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki compilation and publishing control.

- No external imports or third-party dependencies are explicitly declared in the source files.

## Related Tests

- No explicit test files or test workflows are included in this module.
- Quality and review agents imply integration with code quality checks and review processes, which may be tested indirectly through CI workflows.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents are documented but unvalidated.
- No direct test coverage or validation status is indicated for the workflows or agents.
- The source repository and commit SHA are unspecified, limiting traceability.
- Further integration details with external systems or services (e.g., changelog tools, wiki publishing endpoints) are not described.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
