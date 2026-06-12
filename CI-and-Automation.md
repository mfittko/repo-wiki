---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "7b125ae9a68ac15891f3248ef52c552b163fcda2"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-10T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and documentation workflows within the repository. It includes configuration templates for issue tracking, pull requests, and changelog management, as well as detailed agent documentation describing roles and responsibilities for automated and human-assisted workflows. The module supports automated changelog generation on merges and releases, CI pipeline execution, and wiki compilation and publishing automation.

Key goals include:

- Standardizing issue and pull request templates to streamline project management and collaboration.
- Defining agent roles (coordinator, developer, docs, fixer, quality, review) to clarify automation and review responsibilities.
- Automating changelog updates triggered by merges and releases to maintain accurate project history.
- Running CI workflows to validate code changes and maintain quality.
- Automating wiki compilation and publishing with environment-configurable workflows.
- Providing skills documentation to support changelog maintenance and wiki navigation.

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
- `.github/workflows/wiki.yml`

## Key Symbols and Entry Points

- **Issue Templates**: `.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/epic.yml`, `.github/ISSUE_TEMPLATE/task.yml` — YAML configurations defining issue creation templates.
- **Agent Documentation**: Markdown files under `.github/agents/` describing automated agents' purposes, expectations, workflows, and outputs.
- **Pull Request Template**: `.github/pull_request_template.md` — standardized PR description format.
- **Copilot Review Instructions**: `.github/copilot-review-instructions.md` — guidance for AI-assisted code review.
- **Skills Documentation**: `.github/skills/keep-a-changelog/SKILL.md` and `.github/skills/repo-wiki-navigation/SKILL.md` — instructions for maintaining changelogs and navigating the repository wiki.
- **CI Workflows**:
  - `.github/workflows/changelog-on-merge.yml` — triggers changelog updates on merges, requires `GH_TOKEN`.
  - `.github/workflows/changelog-release.yml` — automates changelog generation on releases.
  - `.github/workflows/ci.yml` — main continuous integration pipeline.
  - `.github/workflows/wiki.yml` — automates wiki compilation and publishing, configurable via `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- The workflows depend on environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki publishing configuration.
- The module relies on GitHub Actions infrastructure for CI and automation.
- Agent documentation implies integration with automated bots or AI agents for code coordination, review, fixing, and documentation tasks.
- No explicit external code imports are defined in the YAML or Markdown source files.

## Related Tests

- No explicit test files or test workflows are included in this module.
- CI workflows (`.github/workflows/ci.yml`) likely include validation steps, but specific test scripts or test suites are not detailed in the source files.
- Testing of changelog automation and wiki publishing is presumably integrated into the CI pipelines but not separately documented.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents described in Markdown are not specified beyond their documented roles.
- No direct linkage to test suites or coverage reports is provided.
- The source repository and commit SHA are unknown, limiting traceability.
- The degree of automation and manual intervention in the workflows is not fully detailed.
- The security and permission scopes required for environment variables like `GH_TOKEN` are not documented.
- The interaction between the various agents and workflows could benefit from further elaboration or diagrams.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
