---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "9897e5b449323bf6db3eac895995c3e384690a41"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/npm-publish.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive set of continuous integration (CI) workflows, automation agents, issue and pull request templates, and documentation skills designed to streamline and standardize development, review, and release processes within the repository. It integrates configuration files, GitHub Actions workflows, and agent documentation to support automated changelog generation, code quality checks, publishing, and wiki maintenance.

Key goals include:

- Automating changelog updates on merges and releases.
- Running CI pipelines to validate code changes.
- Publishing npm packages automatically.
- Maintaining and publishing the project wiki.
- Defining issue and pull request templates to standardize contributions.
- Documenting specialized agents that coordinate development, review, fixing, quality assurance, and documentation tasks.
- Providing skills documentation to support changelog management and wiki navigation.
- Offering guidance for Copilot-assisted pull request reviews.

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

- **GitHub Actions workflows:**
  - `changelog-on-merge.yml`: Automates changelog updates triggered on merge events, requires `GH_TOKEN`.
  - `changelog-release.yml`: Handles changelog generation during release processes.
  - `ci.yml`: Runs continuous integration pipelines to validate code.
  - `npm-publish.yml`: Automates npm package publishing.
  - `wiki.yml`: Manages wiki compilation and publishing, uses environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

- **Issue Templates:**
  - `config.yml`, `epic.yml`, `task.yml`: Define structured issue templates to guide contributors.

- **Agents Documentation:**
  - `coordinator.agent.md`: Describes the coordinator agent responsible for workflow orchestration.
  - `developer.agent.md`: Details the developer agent’s purpose and engineering principles.
  - `docs.agent.md`: Covers the documentation agent’s role and output expectations.
  - `fixer.agent.md`: Explains the fixer agent’s responsibilities and review workflow.
  - `quality.agent.md`: Defines the quality agent’s purpose and output.
  - `review.agent.md`: Outlines the review agent’s scope and inputs.

- **Pull Request Template:**
  - `pull_request_template.md`: Standardizes pull request descriptions with change summary, acceptance criteria, and definition of done.

- **Skills Documentation:**
  - `keep-a-changelog/SKILL.md`: Guides on maintaining changelogs.
  - `repo-wiki-navigation/SKILL.md`: Provides instructions for navigating the repository wiki.

- **Copilot Review Instructions:**
  - `copilot-review-instructions.md`: Offers guidance for AI-assisted pull request reviews.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment variables such as `GH_TOKEN` for authentication and publishing.
- Wiki workflow requires `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` environment variables for controlling compilation and publishing modes.
- No external imports or dependencies are explicitly declared in the source files.
- The module integrates tightly with GitHub’s native CI/CD and issue management features.

## Related Tests

- No explicit test files or test suites are included in this module.
- Validation of workflows and templates likely occurs through GitHub Actions runtime and repository usage.
- Agent documentation implies operational roles but does not include automated tests within this module.

## Known Gaps or Open Questions

- The source files are marked as unvalidated documentation; the accuracy and completeness of agent roles and workflows may require further verification.
- No explicit versioning or changelog for the module itself is provided.
- The interaction between agents and workflows is described but not demonstrated with example runs or logs.
- Testing strategies and coverage for the CI workflows and automation agents are not documented.
- The repository remote URL and commit SHA are unknown, limiting traceability.
- Further details on environment variable setup and secrets management for workflows are not included.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
