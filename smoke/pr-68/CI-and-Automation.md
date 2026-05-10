---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2026-05-10T21:15:56.521Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation

## Purpose

This module provides the continuous integration (CI) and automation framework for the repository. It includes structured issue and pull request templates to standardize contribution workflows, detailed documentation of specialized agents that automate or assist with development, documentation, quality assurance, and review tasks, as well as GitHub Actions workflows that implement CI pipelines, changelog management, and wiki compilation and publishing.

The components work together to enforce quality, maintain documentation consistency, and streamline project management through automated background processes and configuration-driven workflows.

## Source files

- [.github/ISSUE_TEMPLATE/config.yml](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/ISSUE_TEMPLATE/config.yml)
- [.github/ISSUE_TEMPLATE/epic.yml](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/ISSUE_TEMPLATE/epic.yml)
- [.github/ISSUE_TEMPLATE/task.yml](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/ISSUE_TEMPLATE/task.yml)
- [.github/agents/coordinator.agent.md](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/agents/coordinator.agent.md)
- [.github/agents/developer.agent.md](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/agents/developer.agent.md)
- [.github/agents/docs.agent.md](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/agents/docs.agent.md)
- [.github/agents/fixer.agent.md](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/agents/fixer.agent.md)
- [.github/agents/quality.agent.md](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/agents/quality.agent.md)
- [.github/agents/review.agent.md](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/agents/review.agent.md)
- [.github/copilot-review-instructions.md](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/copilot-review-instructions.md)
- [.github/pull_request_template.md](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/pull_request_template.md)
- [.github/skills/keep-a-changelog/SKILL.md](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/skills/keep-a-changelog/SKILL.md)
- [.github/skills/repo-wiki-navigation/SKILL.md](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/skills/repo-wiki-navigation/SKILL.md)
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/workflows/changelog-on-merge.yml)
- [.github/workflows/changelog-release.yml](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/workflows/changelog-release.yml)
- [.github/workflows/ci.yml](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/workflows/ci.yml)
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/8c1e39723b5b71eec355f57e4c50b77f3c4d9787/.github/workflows/wiki.yml)

## Key symbols and entry points

- **Issue Templates**: `.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/epic.yml`, `.github/ISSUE_TEMPLATE/task.yml` define structured templates to guide issue creation and classification.
- **Pull Request Template**: `.github/pull_request_template.md` standardizes pull request descriptions, acceptance criteria, and definition of done.
- **Agent Documentation**: Markdown files under `.github/agents/` describe the roles, responsibilities, and workflows of automated agents managing coordination, development, documentation, fixing, quality assurance, and review processes.
- **Skills Guides**: `.github/skills/keep-a-changelog/SKILL.md` and `.github/skills/repo-wiki-navigation/SKILL.md` provide procedural knowledge for maintaining changelogs and navigating the repository wiki.
- **GitHub Actions Workflows**:
  - `.github/workflows/ci.yml`: Runs continuous integration tests and checks.
  - `.github/workflows/changelog-on-merge.yml`: Automates changelog updates on merges, requiring the `GH_TOKEN` environment variable.
  - `.github/workflows/changelog-release.yml`: Manages changelog generation for releases.
  - `.github/workflows/wiki.yml`: Automates wiki compilation and publishing, using environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and imports

- The workflows rely on GitHub Actions environment variables:
  - `GH_TOKEN` for authentication in changelog update workflows.
  - `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for configuring wiki compilation and publishing.
- Agent markdown files describe conceptual dependencies and coordination among agents, such as the coordinator agent managing background work.
- No explicit code imports or external libraries are referenced; the module is primarily configuration and documentation-driven.

## Related tests

- The `ci.yml` workflow likely includes automated tests and checks, although specific test scripts or suites are not detailed within this module.
- Quality and review agents imply processes involving automated or manual testing and code review steps.
- No explicit test files are included in this module; testing strategies may be documented or implemented elsewhere in the repository.

## Known gaps or open questions

- The exact runtime behavior and implementation details of the agents are described only in markdown documentation; no executable code is included.
- The scope and coverage of tests triggered by the CI workflow are not detailed here.
- The interaction and orchestration between agents and workflows could be further elaborated.
- Environment variable usage suggests external secrets or configuration not included in the source files.
- The documentation files are marked as unvalidated, indicating potential need for review or updates to ensure accuracy and completeness.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
