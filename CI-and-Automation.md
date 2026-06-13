---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a33ab6cfdfb7a298ba26e23ddb762c00190f3ef2"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and documentation workflows within the repository. It includes configuration templates for issue tracking, pull requests, and changelog management, as well as detailed documentation for various automated agents that support development, quality assurance, documentation, and review processes.

The module's workflows automate key repository maintenance tasks such as changelog generation on merges and releases, CI pipeline execution, and wiki compilation and publishing. The included agents define roles and responsibilities for automated processes that coordinate, develop, fix, review, and ensure quality in the codebase and documentation.

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

- **Workflow YAML files**:  
  - `changelog-on-merge.yml` — Automates changelog updates triggered on merge events, requiring `GH_TOKEN` environment variable.  
  - `changelog-release.yml` — Manages changelog generation during release processes.  
  - `ci.yml` — Defines the continuous integration pipeline for automated testing and validation.  
  - `wiki.yml` — Automates wiki compilation and publishing, controlled by environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

- **Agent documentation**:  
  - `coordinator.agent.md` — Describes the coordinator agent's workflow and responsibilities in managing background tasks.  
  - `developer.agent.md` — Details the developer agent's purpose and engineering principles.  
  - `docs.agent.md` — Outlines the documentation agent's expectations and output.  
  - `fixer.agent.md` — Explains the fixer agent's role in issue resolution and review workflow.  
  - `quality.agent.md` — Defines the quality agent's purpose and output standards.  
  - `review.agent.md` — Covers the review agent's scope and inputs for pull request reviews.

- **Templates and instructions**:  
  - Issue templates (`config.yml`, `epic.yml`, `task.yml`) provide structured issue reporting.  
  - `pull_request_template.md` guides contributors on change summaries, acceptance criteria, and definition of done.  
  - `copilot-review-instructions.md` offers guidance for AI-assisted pull request reviews.  
  - Skills documents (`keep-a-changelog/SKILL.md`, `repo-wiki-navigation/SKILL.md`) provide best practices for changelog maintenance and wiki navigation.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki automation control.
- No explicit external imports or dependencies are declared within the YAML or Markdown source files.
- The module integrates tightly with GitHub's native CI/CD and issue management features.

## Related Tests

- No explicit test files or test suites are included in this module.
- Validation of workflows and templates likely occurs through GitHub Actions runtime and repository usage.
- Agent documentation implies operational validation through their defined responsibilities and outputs.

## Known Gaps or Open Questions

- The source files are marked as "unvalidated," indicating that the documentation and workflows may require further review or testing to confirm correctness and completeness.
- The exact repository remote URL and commit SHA are unknown, limiting traceability.
- There is no explicit mention of automated test coverage or integration tests for the CI workflows.
- The interaction between agents and workflows could be further detailed to clarify orchestration and event triggers.
- Environment variable usage is noted but not exhaustively documented regarding required secrets or permissions.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
