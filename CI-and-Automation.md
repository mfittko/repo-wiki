---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2ce19fbe28dc7fd82aa053ba642325b8a9e91f02"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-10T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and project workflow management within the repository. It includes configuration templates for issue tracking, pull request workflows, and automated changelog generation, alongside detailed documentation for various automated agents that support development, quality assurance, documentation, and review processes.

The module's core objective is to streamline and standardize the development lifecycle by leveraging GitHub Actions workflows and agent-driven automation. It supports background work such as changelog updates on merges, release changelogs, CI pipeline execution, and wiki compilation and publishing. The included agents define roles and responsibilities for coordinating tasks, developing code, fixing issues, ensuring quality, reviewing contributions, and maintaining documentation.

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

- **Issue Templates** (`config.yml`, `epic.yml`, `task.yml`): Define structured issue reporting formats to standardize bug reports, feature epics, and tasks.
- **Agents Documentation** (`*.agent.md`): Describe the purpose, expectations, and workflows of automated agents responsible for coordination, development, documentation, fixing, quality assurance, and review.
- **Pull Request Template** (`pull_request_template.md`): Provides a standardized format for pull request submissions including change summaries, acceptance criteria, and definition of done.
- **Copilot Review Instructions** (`copilot-review-instructions.md`): Guidance for AI-assisted code review processes.
- **Skills Documentation** (`keep-a-changelog/SKILL.md`, `repo-wiki-navigation/SKILL.md`): Define best practices and skills for changelog maintenance and wiki navigation.
- **Workflows** (`*.yml`):
  - `changelog-on-merge.yml`: Automates changelog updates triggered on merges, requiring `GH_TOKEN` environment variable.
  - `changelog-release.yml`: Manages changelog generation during release processes.
  - `ci.yml`: Defines the continuous integration pipeline for automated testing and validation.
  - `wiki.yml`: Automates wiki compilation and publishing, controlled by environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` / `LLMWIKI_PUBLISH_REMOTE` for wiki publishing control.
- No external imports or third-party dependencies are explicitly declared in the source files.
- The module relies on GitHub's native CI/CD infrastructure and GitHub Actions runners.

## Related Tests

- No explicit test files or test suites are included within this module.
- CI workflows (`ci.yml`) likely include automated testing steps, but specific test scripts or test code are not part of this module's source files.
- Testing is implicitly supported through the CI pipeline automation.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents described in the markdown documentation are not fully validated.
- No direct linkage to test coverage or test results is provided.
- The source repository URL and commit SHA are unknown, limiting traceability.
- The module does not include explicit error handling or fallback mechanisms in the workflows.
- Further validation is needed to confirm environment variable configurations and secrets management for secure operation.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
