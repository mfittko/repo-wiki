---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "144bad2d897ff76640a6ae71a662559850345164"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-05T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and documentation workflows within the repository. It includes configuration templates for issue tracking, pull requests, and changelog management, as well as detailed documentation for various automated agents that support development, quality assurance, documentation, fixing, reviewing, and coordination tasks.

The module's workflows automate key processes such as changelog generation on merges and releases, CI pipeline execution, and wiki compilation and publishing. It leverages GitHub Actions workflows configured with environment variables to enable secure and flexible automation.

The included agents define roles and responsibilities for automated bots that assist in maintaining code quality, documentation accuracy, and review processes, thereby streamlining collaboration and reducing manual overhead.

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
- **Agents Documentation** (`*.agent.md`): Describe the purpose, expectations, and workflows of automated agents such as:
  - Coordinator Agent: Manages workflow shortcuts and constraints.
  - Developer Agent: Supports engineering principles and development tasks.
  - Docs Agent: Maintains documentation quality and output.
  - Fixer Agent: Automates fixes and review workflows.
  - Quality Agent: Ensures code quality and output standards.
  - Review Agent: Handles review inputs and follow-up scopes.
- **Copilot Review Instructions**: Guidance for AI-assisted pull request reviews.
- **Pull Request Template**: Standardizes PR descriptions, acceptance criteria, and definitions of done.
- **Skills Documentation**: Guides for changelog maintenance and repository wiki navigation.
- **Workflows**:
  - `changelog-on-merge.yml`: Automates changelog updates on merges, requiring `GH_TOKEN`.
  - `changelog-release.yml`: Manages changelog generation during releases.
  - `ci.yml`: Defines the continuous integration pipeline.
  - `wiki.yml`: Automates wiki compilation and publishing, using environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki automation configuration.
- The module relies on GitHub's native CI/CD infrastructure and GitHub Actions runners.
- No external code imports are explicitly defined in the source YAML or Markdown files.

## Related Tests

- No explicit test files or test suites are included within this module.
- Testing is implicitly supported through CI workflows (`ci.yml`) which likely run validation and build steps.
- The changelog and wiki workflows suggest automated verification of documentation and release processes.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents are documented but unvalidated, indicating potential need for verification.
- The source repository and commit SHA are unspecified, limiting traceability.
- No direct references to unit or integration tests for the workflows or agents are present.
- The interaction between agents and workflows, and their orchestration in the CI pipeline, could benefit from further elaboration.
- Security considerations for environment variables and token usage are not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
