---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a507ef561fb391da37a72f94377f63339998865a"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and issue management within the repository. It includes configuration templates for issue tracking, pull request workflows, and automated changelog generation. The module also documents various specialized agents that support development, quality assurance, documentation, fixing, reviewing, and coordination tasks, facilitating a structured and automated development lifecycle.

Key aspects include:

- **Issue Templates**: YAML configurations for different issue types (`config.yml`, `epic.yml`, `task.yml`) to standardize issue reporting and tracking.
- **Agent Documentation**: Markdown files describing roles and responsibilities of agents such as coordinator, developer, docs, fixer, quality, and review agents, which automate and guide various project workflows.
- **Pull Request Template**: A Markdown template to ensure consistent and thorough pull request descriptions.
- **Copilot Review Instructions**: Guidance for AI-assisted code review processes.
- **Skills Documentation**: Instructions for maintaining changelogs and navigating the repository wiki.
- **CI Workflows**: YAML files defining automated workflows for continuous integration (`ci.yml`), changelog updates on merges and releases (`changelog-on-merge.yml`, `changelog-release.yml`), and wiki compilation and publishing (`wiki.yml`).

These components collectively enable automated background work, environment variable configuration, and enforce engineering principles and quality standards throughout the development process.

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

- **Issue Templates**: `config.yml`, `epic.yml`, `task.yml` define issue creation schemas.
- **Agents**: Markdown documents (`*.agent.md`) describe automated roles and workflows.
- **Pull Request Template**: `.github/pull_request_template.md` standardizes PR submissions.
- **CI Workflows**:
  - `ci.yml`: Main continuous integration pipeline.
  - `changelog-on-merge.yml`: Automates changelog updates on merges, requires `GH_TOKEN`.
  - `changelog-release.yml`: Handles changelog generation on releases.
  - `wiki.yml`: Automates wiki compilation and publishing, uses `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` environment variables.

## Dependencies and Imports

- The workflows depend on environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki publishing configuration.
- The module relies on GitHub Actions infrastructure for running CI and automation workflows.
- Agents and skills documentation imply dependencies on internal processes and possibly external tools for changelog management and wiki navigation.

## Related Tests

- No explicit test files or test workflows are included in this module.
- Testing is likely integrated within the CI workflows (`ci.yml`), but specific test scripts or configurations are not part of the provided source files.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents are documented but unvalidated, indicating potential need for verification.
- No direct references to test coverage or test automation scripts are present.
- The source repository and commit SHA are unknown, limiting traceability.
- The interaction between agents and workflows, and how they coordinate in practice, is not fully detailed.
- Environment variable usage hints at external secrets or configurations that are not documented here.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
