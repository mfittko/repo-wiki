---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "73d2678ea962143138b0ea2c5c2afd3eb79dd847"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and documentation workflows within the repository. It includes configuration templates for issue tracking, pull requests, and changelog management, as well as a set of specialized agents designed to automate and coordinate development, documentation, quality assurance, and review processes.

The module's workflows automate key repository maintenance tasks such as changelog generation on merges and releases, CI pipeline execution, and wiki compilation and publishing. The agents documented here serve as autonomous components that handle specific responsibilities like coordinating tasks, fixing issues, reviewing code, and maintaining documentation quality.

Together, these components enable streamlined project management, consistent documentation standards, and automated quality control, supporting efficient and reliable software development practices.

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

- **Agents**:  
  - `coordinator.agent.md`: Defines the coordinator agent responsible for background task orchestration.  
  - `developer.agent.md`: Describes the developer agent's role and engineering principles.  
  - `docs.agent.md`: Details the documentation agent's purpose and expected outputs.  
  - `fixer.agent.md`: Outlines the fixer agent's responsibilities and review workflow.  
  - `quality.agent.md`: Covers the quality agent's purpose and output expectations.  
  - `review.agent.md`: Specifies the review agent's inputs and scope for follow-up reviews.

- **Workflows**:  
  - `changelog-on-merge.yml`: Automates changelog updates triggered on merges, requiring `GH_TOKEN` environment variable.  
  - `changelog-release.yml`: Manages changelog generation during release events.  
  - `ci.yml`: Defines the continuous integration pipeline for automated testing and validation.  
  - `wiki.yml`: Automates wiki compilation and publishing, utilizing environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

- **Templates and Instructions**:  
  - Issue templates (`config.yml`, `epic.yml`, `task.yml`) standardize issue reporting.  
  - `pull_request_template.md` guides contributors on pull request content and acceptance criteria.  
  - `copilot-review-instructions.md` provides guidance for AI-assisted code review.

- **Skills**:  
  - `keep-a-changelog/SKILL.md`: Best practices for maintaining changelogs.  
  - `repo-wiki-navigation/SKILL.md`: Guidance on navigating and structuring the repository wiki.

## Dependencies and Imports

- The module primarily consists of YAML and Markdown files configuring GitHub workflows and documentation agents.  
- Environment variables used in workflows include:  
  - `GH_TOKEN` for authentication in changelog-on-merge workflow.  
  - `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki compilation and publishing control.  
- No external code imports are specified within the source files; the module relies on GitHub Actions and repository conventions.

## Related Tests

- No explicit test files or test workflows are included in this module.  
- CI workflows (`ci.yml`) likely include automated tests, but details are not specified in the source excerpts.  
- Quality and review agents imply integration with code quality checks and review processes, which may be tested indirectly through CI.

## Known Gaps or Open Questions

- The documentation agent files are marked as unvalidated, indicating potential need for review or updates.  
- Specific implementation details of the agents' automation logic are not included; only their purpose and expectations are documented.  
- The exact nature of the CI pipeline steps and test coverage is not detailed in the available source files.  
- Integration points with external services or tools beyond GitHub Actions and environment variables are not described.  
- The role and configuration of the skills documents in automation workflows could be further clarified.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
