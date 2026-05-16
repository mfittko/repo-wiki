---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "c5432024529f5133bed4df4fd18ec2b67d908b7e"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and documentation workflows within the repository. It includes configuration templates for issue tracking, pull requests, and changelog management, as well as detailed documentation for various automated agents that support development, quality assurance, documentation, fixing, reviewing, and coordination tasks.

The module's workflows automate key processes such as changelog generation on merges and releases, CI pipeline execution, and wiki compilation and publishing. The agents documented here define roles and responsibilities for automated contributors that assist in maintaining code quality, documentation accuracy, and review processes.

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
- **Agent Documentation** (`*.agent.md`): Describe the purpose, expectations, and workflows of automated agents such as:
  - Coordinator Agent: Manages background workflows and coordination.
  - Developer Agent: Focuses on engineering principles and development tasks.
  - Docs Agent: Handles documentation generation and maintenance.
  - Fixer Agent: Automates bug fixes and code corrections.
  - Quality Agent: Ensures code quality and testing standards.
  - Review Agent: Supports code review processes.
- **Pull Request Template** (`pull_request_template.md`): Standardizes pull request descriptions including change summaries, acceptance criteria, and definitions of done.
- **Copilot Review Instructions** (`copilot-review-instructions.md`): Provides guidance for AI-assisted pull request reviews.
- **Skills Documentation** (`keep-a-changelog/SKILL.md`, `repo-wiki-navigation/SKILL.md`): Document best practices for changelog maintenance and wiki navigation.
- **Workflows** (`*.yml`):
  - `changelog-on-merge.yml`: Automates changelog updates on merges, requiring `GH_TOKEN` environment variable.
  - `changelog-release.yml`: Manages changelog generation during releases.
  - `ci.yml`: Defines the continuous integration pipeline.
  - `wiki.yml`: Automates wiki compilation and publishing, using environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki publishing configuration.
- The module relies on GitHub Actions infrastructure for background execution of CI and automation tasks.
- No external imports or third-party dependencies are explicitly declared in the source files.

## Related Tests

- No explicit test files or test suites are included in this module.
- Quality and review agents imply integration with code quality checks and review processes, which may be tested indirectly through CI workflows.
- The changelog and wiki workflows likely depend on successful execution of GitHub Actions jobs, which can be monitored via GitHub's workflow run history.

## Known Gaps or Open Questions

- The source documentation files are marked as "unvalidated," indicating that the agent descriptions and instructions may require review or updates.
- No direct references to testing frameworks or test automation scripts are present, suggesting a potential area for enhancement.
- The exact implementation details of the agents' automation logic are not included; only their documentation is provided.
- The repository remote URL and commit SHA are unknown, limiting traceability to a specific source version.
- Further clarification on environment variable usage and secrets management for workflows would improve security and usability documentation.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
