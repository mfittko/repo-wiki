---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "575a1251f58ee2bfc04d8c2780711f70f08c2481"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-10T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and project workflow management within the repository. It includes configuration templates for issue tracking, pull requests, and changelog management, as well as detailed documentation for various automated agents that support development, quality assurance, documentation, and review processes.

The module's workflows automate key tasks such as changelog generation on merges and releases, CI pipeline execution, and wiki compilation and publishing. The agents documented here define roles and responsibilities for automated bots that coordinate tasks, fix issues, maintain quality, and assist developers, thereby streamlining project maintenance and collaboration.

## Source file list

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

## Key symbols and entry points

- **Issue Templates** (`.github/ISSUE_TEMPLATE/*.yml`): Define structured issue reporting formats for configuration, epics, and tasks.
- **Agents Documentation** (`.github/agents/*.agent.md`): Describe the purpose, expectations, and workflows of automated agents such as:
  - Coordinator Agent: Manages background coordination tasks.
  - Developer Agent: Supports engineering principles and development expectations.
  - Docs Agent: Handles documentation generation and maintenance.
  - Fixer Agent: Automates issue fixing and review workflows.
  - Quality Agent: Ensures code and process quality.
  - Review Agent: Manages pull request review processes.
- **Pull Request Template** (`.github/pull_request_template.md`): Standardizes pull request submissions with change summaries and acceptance criteria.
- **Copilot Review Instructions** (`.github/copilot-review-instructions.md`): Provides guidance for AI-assisted code reviews.
- **Skills Documentation** (`.github/skills/keep-a-changelog/SKILL.md`, `.github/skills/repo-wiki-navigation/SKILL.md`): Document best practices for changelog maintenance and wiki navigation.
- **Workflows** (`.github/workflows/*.yml`):
  - `changelog-on-merge.yml`: Automates changelog updates on merges, requiring `GH_TOKEN` environment variable.
  - `changelog-release.yml`: Manages changelog generation during releases.
  - `ci.yml`: Defines the continuous integration pipeline.
  - `wiki.yml`: Automates wiki compilation and publishing, using environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and imports

- The workflows depend on environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki publishing configuration.
- The module relies on GitHub Actions infrastructure for CI and automation.
- Agents and skills documentation imply integration with AI or bot frameworks for automation but do not specify external imports in the source files.

## Related tests

- No explicit test files or test workflows are included in this module.
- Testing of CI workflows and automation is likely integrated into the CI pipeline defined in `.github/workflows/ci.yml`.
- Validation of issue templates and pull request templates is implicit in repository usage.

## Known gaps or open questions

- The exact implementation details and runtime behavior of the agents are not fully described; the documentation files are marked as unvalidated.
- No direct references to testing or validation workflows for the automation agents or skills.
- The source repository and commit SHA are unknown, limiting traceability.
- The interaction between different agents and their orchestration in the CI pipeline is not explicitly documented.
- The security and permission scopes required for environment variables like `GH_TOKEN` are not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
