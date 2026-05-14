---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "eda9d272e7c9de7e891622628d448f396d033b3f"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and documentation workflows within the repository. It includes configuration templates for issue tracking, pull request management, and automated changelog generation. The module also defines specialized agent roles to coordinate development, documentation, quality assurance, and review processes, facilitating a structured and automated development lifecycle.

Key aspects include:

- **Issue and Pull Request Templates:** YAML configurations for issue types (config, epic, task) and a markdown pull request template to standardize contributions.
- **Agent Documentation:** Markdown files describing the responsibilities and workflows of various agents such as coordinator, developer, docs, fixer, quality, and review agents, which automate and guide different aspects of the development and review process.
- **CI Workflows:** YAML workflow definitions for running CI pipelines, automating changelog updates on merges and releases, and managing wiki content compilation and publishing.
- **Skills Documentation:** Guides on maintaining changelogs and navigating the repository wiki to support consistent documentation practices.
- **Copilot Review Instructions:** Guidance for AI-assisted code review processes.

Together, these components enable automated quality control, documentation upkeep, and streamlined collaboration.

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

- **Issue Templates:** `.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/epic.yml`, `.github/ISSUE_TEMPLATE/task.yml` — define issue types and metadata.
- **Pull Request Template:** `.github/pull_request_template.md` — standardizes PR descriptions and acceptance criteria.
- **Agent Roles:** Markdown files under `.github/agents/` describe automated roles and their workflows:
  - `coordinator.agent.md` — manages overall coordination and background workflows.
  - `developer.agent.md` — outlines developer expectations and engineering principles.
  - `docs.agent.md` — focuses on documentation generation and maintenance.
  - `fixer.agent.md` — handles bug fixes and review workflows.
  - `quality.agent.md` — ensures code quality and output standards.
  - `review.agent.md` — manages review inputs and follow-up scopes.
- **Copilot Review Instructions:** `.github/copilot-review-instructions.md` — AI-assisted review guidance.
- **Skills Documentation:** `.github/skills/keep-a-changelog/SKILL.md`, `.github/skills/repo-wiki-navigation/SKILL.md` — best practices for changelog maintenance and wiki navigation.
- **CI Workflows:**
  - `.github/workflows/ci.yml` — main continuous integration pipeline.
  - `.github/workflows/changelog-on-merge.yml` — automates changelog updates on merges.
  - `.github/workflows/changelog-release.yml` — manages changelog during releases.
  - `.github/workflows/wiki.yml` — automates wiki compilation and publishing.

## Dependencies and Imports

- The workflows rely on environment variables such as:
  - `GH_TOKEN` for changelog automation workflows.
  - `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki compilation and publishing.
- The module depends on GitHub Actions infrastructure for CI and automation.
- Agent roles and skills documentation assume integration with repository management and review processes.
- No explicit external code imports are defined within the YAML or Markdown source files.

## Related Tests

- No explicit test files or test workflows are included in this module.
- CI workflows likely include automated checks and validations as part of their pipelines.
- Agent roles and instructions imply review and quality assurance steps embedded in the development lifecycle.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents are described in documentation but not validated or linked to executable code.
- No direct linkage to test suites or coverage reports is provided.
- The source repository and commit SHA are unspecified, limiting traceability.
- The degree of automation integration with external tools or services beyond GitHub Actions is not detailed.
- Validation status of documentation files is unconfirmed, indicating potential for updates or corrections.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
