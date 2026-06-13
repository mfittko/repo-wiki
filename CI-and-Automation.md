---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a81b22c39c9e23853e62bf5ce7ade491eda4c723"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/npm-publish.yml",".github/workflows/wiki.yml"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive set of continuous integration (CI) workflows, automation agents, issue and pull request templates, and documentation skills to streamline and standardize development, review, and release processes within the repository. It integrates configuration files, GitHub Actions workflows, and agent documentation to enable automated changelog generation, npm publishing, wiki compilation, and quality assurance.

Key aspects include:

- **Issue and Pull Request Templates:** YAML templates for issue types (config, epic, task) and a markdown pull request template to guide contributors in providing structured and consistent information.
- **Automation Agents:** Markdown documentation describing specialized agents such as coordinator, developer, docs, fixer, quality, and review agents, each with defined purposes and workflows to support background work, code quality, documentation, and review processes.
- **CI Workflows:** YAML configurations for automated changelog updates on merges and releases, continuous integration testing, npm package publishing, and wiki compilation and publishing. These workflows utilize environment variables for authentication and configuration.
- **Documentation Skills:** Markdown skill guides for maintaining changelogs and navigating the repository wiki, supporting contributor onboarding and documentation quality.
- **Copilot Review Instructions:** Guidance for AI-assisted pull request reviews to enhance code quality and consistency.

Together, these components form an integrated CI and automation framework that supports efficient project management, code quality, and documentation maintenance.

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

- **Issue Templates:** `config.yml`, `epic.yml`, `task.yml` define structured issue creation.
- **Pull Request Template:** `pull_request_template.md` guides PR submissions.
- **Agents:** Markdown files (`*.agent.md`) document roles and workflows for automation agents:
  - `coordinator.agent.md` — manages workflow coordination.
  - `developer.agent.md` — outlines developer expectations and principles.
  - `docs.agent.md` — focuses on documentation generation and maintenance.
  - `fixer.agent.md` — handles bug fixes and review workflows.
  - `quality.agent.md` — ensures code quality standards.
  - `review.agent.md` — manages review processes and inputs.
- **Copilot Review Instructions:** `copilot-review-instructions.md` provides AI review guidance.
- **Skills:** `keep-a-changelog/SKILL.md` and `repo-wiki-navigation/SKILL.md` offer documentation best practices.
- **CI Workflows:**
  - `changelog-on-merge.yml` — automates changelog updates on merges, requires `GH_TOKEN`.
  - `changelog-release.yml` — manages changelog during releases.
  - `ci.yml` — runs continuous integration tests.
  - `npm-publish.yml` — automates npm publishing, requires `NODE_AUTH_TOKEN`.
  - `wiki.yml` — compiles and publishes the wiki, uses `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment variables for authentication and configuration:
  - `GH_TOKEN` for changelog updates.
  - `NODE_AUTH_TOKEN` for npm publishing.
  - `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki compilation and publishing.
- The module relies on GitHub Actions infrastructure and standard YAML/Markdown syntax.
- No explicit external imports or dependencies are declared within the source files.

## Related Tests

- No explicit test files or test suites are included in this module.
- CI workflows (`ci.yml`) likely include automated tests as part of the integration process, but specific test scripts or test cases are not detailed in the source files.

## Known Gaps or Open Questions

- The documentation agent files are marked as unvalidated, indicating potential need for review or updates.
- No direct references to test implementations or coverage details are present.
- The exact mechanisms and implementations of the agents (e.g., how they are triggered or integrated) are not detailed beyond their markdown documentation.
- The source commit and repository remote are placeholders and should be updated to reflect actual values.
- Further validation of environment variable usage and secrets management in workflows may be required.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
