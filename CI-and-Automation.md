---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "253792a37296e0d106c4c2c79c48e57e4e30e395"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and project workflow management within the repository. It includes configuration templates for issue tracking, pull requests, and changelog management, as well as detailed documentation for various automated agents that support development, quality assurance, documentation, and review processes.

The module's workflows automate key repository tasks such as changelog generation on merges and releases, CI pipeline execution, and wiki compilation and publishing. The included agents define roles and responsibilities for coordinating background work, development, documentation, fixing issues, quality control, and code review, facilitating a structured and automated project lifecycle.

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

- **Issue Templates** (`config.yml`, `epic.yml`, `task.yml`): Define structured issue reporting formats to standardize and automate issue triage.
- **Agent Documentation** (`*.agent.md`): Describe the purpose, expectations, and workflows for automated agents managing coordination, development, documentation, fixing, quality, and review.
- **Pull Request Template** (`pull_request_template.md`): Standardizes pull request submissions to ensure clarity and completeness.
- **Copilot Review Instructions** (`copilot-review-instructions.md`): Guidance for AI-assisted code review processes.
- **Skills Documentation** (`keep-a-changelog/SKILL.md`, `repo-wiki-navigation/SKILL.md`): Define best practices and automated skills for changelog maintenance and wiki navigation.
- **Workflows** (`*.yml`):
  - `changelog-on-merge.yml`: Automates changelog updates triggered by merges, requiring `GH_TOKEN` environment variable.
  - `changelog-release.yml`: Automates changelog generation during releases.
  - `ci.yml`: Defines the continuous integration pipeline for automated testing and validation.
  - `wiki.yml`: Automates wiki compilation and publishing, controlled by environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- No explicit external imports are declared in the YAML workflows or Markdown documentation.
- Environment variables used:
  - `GH_TOKEN` for changelog-on-merge workflow authentication.
  - `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki workflow configuration.
- The module relies on GitHub Actions infrastructure and GitHub repository features such as issue templates, pull request templates, and GitHub Wiki.

## Related Tests

- No explicit test files or test workflows are included in this module.
- CI workflow (`ci.yml`) likely includes automated tests and validations as part of the continuous integration process, but specific test scripts or test cases are not detailed in the source files.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents described in Markdown files are not fully validated or linked to executable code.
- No direct references to test coverage or test results are present, leaving the extent of automated testing unclear.
- The source repository URL and commit SHA are unknown, limiting traceability.
- The interaction between the various agents and workflows, and how they integrate with external tools or services, is not explicitly documented.
- The environment setup and prerequisites for running the workflows and agents are not detailed beyond environment variables.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
