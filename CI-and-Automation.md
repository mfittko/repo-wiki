---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "b0953206f44fa44851f3fa8f9b52d7b620b0b262"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/npm-publish.yml",".github/workflows/review-context.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides comprehensive continuous integration (CI) and automation infrastructure for the repository. It includes configuration files, workflow definitions, issue and pull request templates, and documentation for automated agents that support development, review, quality assurance, documentation, and release processes.

The module's primary goals are to:

- Automate build, test, and release workflows using GitHub Actions.
- Standardize issue and pull request templates to streamline project management.
- Define roles and responsibilities for automated agents that assist in code coordination, development, fixing, reviewing, quality control, and documentation.
- Support changelog management and npm package publishing through automated workflows.
- Facilitate wiki compilation and publishing via CI pipelines.
- Provide guidance and instructions for Copilot-assisted code review.

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
- `.github/workflows/review-context.yml`
- `.github/workflows/wiki.yml`

## Key Symbols and Entry Points

- **Issue Templates**:  
  - `config.yml`, `epic.yml`, `task.yml` define structured issue templates to guide contributors in reporting and tracking work.

- **Automated Agents Documentation**:  
  - `coordinator.agent.md` — outlines the coordinator agent's workflow and responsibilities.  
  - `developer.agent.md` — describes the developer agent's purpose and engineering principles.  
  - `docs.agent.md` — details the documentation agent's expectations and output.  
  - `fixer.agent.md` — explains the fixer agent's role and review workflow.  
  - `quality.agent.md` — covers the quality agent's purpose and output.  
  - `review.agent.md` — defines the review agent's scope and inputs.

- **Copilot Review Instructions**:  
  - `copilot-review-instructions.md` provides guidance for using GitHub Copilot in pull request reviews.

- **Pull Request Template**:  
  - `pull_request_template.md` standardizes the format for pull request submissions including change summary and acceptance criteria.

- **Skills Documentation**:  
  - `keep-a-changelog/SKILL.md` and `repo-wiki-navigation/SKILL.md` describe repository skills related to changelog maintenance and wiki navigation.

- **GitHub Actions Workflows**:  
  - `changelog-on-merge.yml` — automates changelog updates on merges, requires `GH_TOKEN`.  
  - `changelog-release.yml` — manages changelog generation for releases.  
  - `ci.yml` — main continuous integration workflow running tests and checks.  
  - `npm-publish.yml` — automates npm package publishing.  
  - `review-context.yml` — sets up review context, requires `GH_TOKEN`.  
  - `wiki.yml` — compiles and publishes the repository wiki, uses environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment and tokens such as `GH_TOKEN` for authentication and publishing.
- Wiki compilation workflow depends on environment variables controlling compiler mode and publishing destination.
- The module is self-contained within GitHub repository configuration and markdown documentation; no external code imports are indicated.

## Related Tests

- No explicit test files are included in this module.
- CI workflows likely include automated tests as part of their steps (`ci.yml`).
- Quality and review agents documentation imply integration with code quality checks and review processes.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the automated agents are documented but unvalidated.
- No direct references to test suites or coverage reports are present.
- The source repository URL and commit SHA are unknown, limiting traceability.
- The interaction between skills documentation and automation workflows could be further clarified.
- The extent of Copilot integration in review workflows is described but not validated.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
