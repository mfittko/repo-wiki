---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "3d197a3e565e4f3a6a053214eb093873fb70b90a"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-10T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and repository management workflows within the project. It includes configuration templates for issue tracking, pull request management, and changelog maintenance, as well as detailed documentation for various automated agents that support development, quality assurance, documentation, and review processes.

The module's workflows automate key repository tasks such as changelog generation on merges and releases, CI pipeline execution, and wiki compilation and publishing. The included agents define roles and responsibilities for automated contributors that coordinate tasks, fix issues, ensure quality, and assist in documentation and code review.

Overall, this module aims to streamline development operations, enforce consistent project standards, and enhance collaboration through automation and well-defined processes.

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

- **Issue Templates** (`.github/ISSUE_TEMPLATE/*.yml`): Define structured issue reporting formats for configuration, epics, and tasks to standardize issue creation.
- **Agent Documentation** (`.github/agents/*.agent.md`): Describe the purpose, expectations, and workflows of automated agents such as coordinator, developer, docs, fixer, quality, and review agents.
- **Pull Request Template** (`.github/pull_request_template.md`): Provides a standardized template for pull request submissions including change summary, acceptance criteria, and definition of done.
- **Copilot Review Instructions** (`.github/copilot-review-instructions.md`): Guidance for AI-assisted code review processes.
- **Skills Documentation** (`.github/skills/keep-a-changelog/SKILL.md`, `.github/skills/repo-wiki-navigation/SKILL.md`): Document skills related to changelog maintenance and wiki navigation.
- **Workflows** (`.github/workflows/*.yml`):
  - `changelog-on-merge.yml`: Automates changelog updates triggered on merges, requires `GH_TOKEN` environment variable.
  - `changelog-release.yml`: Automates changelog generation for releases.
  - `ci.yml`: Defines the continuous integration pipeline.
  - `wiki.yml`: Automates wiki compilation and publishing, uses environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- No explicit external imports or dependencies are declared in the source files.
- Workflows rely on environment variables such as `GH_TOKEN`, `LLMWIKI_COMPILER_MODE`, and `LLMWIKI_PUBLISH_REMOTE` for authentication and configuration.
- The module assumes GitHub Actions environment for CI and automation execution.

## Related Tests

- No explicit test files or test workflows are included in this module.
- Testing of workflows and agents may be implicit through CI runs and pull request validations.
- Validation of issue templates and pull request templates occurs through GitHub UI and repository settings.

## Known Gaps or Open Questions

- The source documentation files are marked as unvalidated, indicating that the agent descriptions and instructions may require review or updates.
- No direct references to automated test suites or coverage reports are present; integration with testing frameworks is not detailed.
- The exact implementation details of the agents' automation (e.g., scripts or bots) are not included, only their documentation.
- The repository remote URL and commit SHA are unknown, limiting traceability to a specific codebase version.
- Further clarification on environment variable setup and secrets management for workflows would be beneficial.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
