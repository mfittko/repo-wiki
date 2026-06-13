---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "f5a973364c2a93ccbfa3b102d1da911a58e92021"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/npm-publish.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides comprehensive continuous integration (CI) and automation infrastructure for the repository. It includes configuration files, workflow definitions, issue and pull request templates, and documentation agents that collectively support automated testing, changelog management, publishing, and wiki compilation.

The module's workflows automate key repository lifecycle events such as:

- Running CI pipelines on code changes (`.github/workflows/ci.yml`)
- Managing changelog updates on merges and releases (`changelog-on-merge.yml`, `changelog-release.yml`)
- Publishing npm packages (`npm-publish.yml`)
- Compiling and publishing the project wiki (`wiki.yml`)

Additionally, the module defines GitHub issue templates (`config.yml`, `epic.yml`, `task.yml`) and pull request templates to standardize contribution processes.

The included agent documentation files describe roles and responsibilities for automated agents that assist with coordination, development, documentation, fixing, quality assurance, and review tasks, enabling a structured automation ecosystem.

Skills documentation guides contributors on changelog maintenance and wiki navigation, supporting best practices in repository management.

## Source File List

- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/ISSUE_TEMPLATE/epic.yml`
- `.github/ISSUE_TEMPLATE/task.yml`
- `.github/agents/coordinator.agent.md`
- `.github/agents/developer.agent.md`
- `.github/agents/docs.agent.md`
- `.github/agents/fixer.agent.md`
- `.github/agents/quality.agent.md`
- `.github/agents/review.agent.md`
- `.github/copilot-review-instructions.md`
- `.github/pull_request_template.md`
- `.github/skills/keep-a-changelog/SKILL.md`
- `.github/skills/repo-wiki-navigation/SKILL.md`
- `.github/workflows/changelog-on-merge.yml`
- `.github/workflows/changelog-release.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/npm-publish.yml`
- `.github/workflows/wiki.yml`

## Key Symbols and Entry Points

- **Workflows:**
  - `ci.yml` — Main continuous integration pipeline.
  - `changelog-on-merge.yml` — Automates changelog updates on merges, requires `GH_TOKEN`.
  - `changelog-release.yml` — Handles changelog updates on releases.
  - `npm-publish.yml` — Automates npm package publishing.
  - `wiki.yml` — Automates wiki compilation and publishing, uses environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

- **Issue Templates:**
  - `config.yml` — Configuration for issue templates.
  - `epic.yml` — Template for epic issues.
  - `task.yml` — Template for task issues.

- **Agents Documentation:**
  - `coordinator.agent.md` — Describes the coordinator agent's workflow and responsibilities.
  - `developer.agent.md` — Details the developer agent's purpose and engineering principles.
  - `docs.agent.md` — Explains the documentation agent's expectations and output.
  - `fixer.agent.md` — Covers the fixer agent's review workflow.
  - `quality.agent.md` — Defines the quality agent's purpose and output.
  - `review.agent.md` — Outlines the review agent's inputs and scope.

- **Contribution Guidance:**
  - `copilot-review-instructions.md` — Guidance for Copilot-assisted pull request reviews.
  - `pull_request_template.md` — Standard pull request template with change summary and acceptance criteria.

- **Skills Documentation:**
  - `keep-a-changelog/SKILL.md` — Best practices for maintaining changelogs.
  - `repo-wiki-navigation/SKILL.md` — Guidance on navigating the repository wiki.

## Dependencies and Imports

This module primarily consists of YAML and Markdown configuration and documentation files. It does not explicitly import external code modules but depends on GitHub Actions infrastructure and environment variables for workflow execution:

- `GH_TOKEN` — Required for changelog-on-merge workflow to authenticate GitHub API requests.
- `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` — Used by the wiki compilation workflow to control build and publishing behavior.

No other external dependencies or imports are declared within the source files.

## Related Tests

No explicit test files or test workflows are included in this module. Testing of CI workflows and automation is likely integrated into the broader repository CI pipelines or managed externally.

## Known Gaps or Open Questions

- The agent documentation files are marked as unvalidated, indicating that their content may require review or updates to ensure accuracy.
- No direct test coverage or validation workflows for the CI and automation configurations are present within this module.
- The source repository URL and commit SHA are unknown, limiting traceability.
- The exact runtime environment and secrets management for workflows (beyond the noted environment variables) are not detailed.
- Further integration details between agents and workflows are not explicitly documented.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
