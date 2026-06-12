---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "edb41c2402583d52b198e0b02471275199a0fcb1"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-05T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and documentation workflows within the repository. It includes configuration templates for issue tracking, pull requests, and changelog management, as well as detailed documentation for various automated agents that support development, quality assurance, documentation, and review processes.

The workflows automate key tasks such as changelog generation on merges and releases, CI pipeline execution, and wiki compilation and publishing. The agents documented here define roles and responsibilities for automated contributors that assist in coordinating tasks, fixing issues, maintaining quality, and generating documentation.

Overall, this module aims to streamline development processes, enforce quality standards, and maintain up-to-date project documentation through automation and well-defined configuration.

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

- **Issue Templates**:  
  - `config.yml`, `epic.yml`, `task.yml` define structured issue templates to standardize issue reporting and tracking.

- **Agents Documentation**:  
  - `coordinator.agent.md`: Defines the coordinator agent's workflow and responsibilities.  
  - `developer.agent.md`: Describes the developer agent's purpose and engineering principles.  
  - `docs.agent.md`: Details the documentation agent's expectations and output.  
  - `fixer.agent.md`: Explains the fixer agent's role and review workflow.  
  - `quality.agent.md`: Covers the quality agent's purpose and output.  
  - `review.agent.md`: Outlines the review agent's purpose and scope.

- **Pull Request Template**:  
  - `pull_request_template.md` provides a standardized template for pull request submissions including change summary, acceptance criteria, and definition of done.

- **Copilot Review Instructions**:  
  - `copilot-review-instructions.md` offers guidance for AI-assisted pull request reviews.

- **Skills Documentation**:  
  - `keep-a-changelog/SKILL.md` and `repo-wiki-navigation/SKILL.md` describe skills related to changelog maintenance and wiki navigation.

- **Workflows**:  
  - `changelog-on-merge.yml`: Automates changelog updates on merge events, requires `GH_TOKEN` environment variable.  
  - `changelog-release.yml`: Automates changelog generation on release events.  
  - `ci.yml`: Defines the continuous integration pipeline.  
  - `wiki.yml`: Automates wiki compilation and publishing, uses `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` environment variables.

## Dependencies and Imports

- The workflows depend on environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki publishing configuration.
- The module relies on GitHub Actions infrastructure for CI and automation.
- The agents and skills documentation imply integration with AI or bot agents that perform automated tasks, though specific external dependencies are not detailed in the source files.

## Related Tests

- No explicit test files or test workflows are included in this module.
- Testing of workflows and agents likely occurs through integration in the repository's CI pipeline or manual validation.
- The changelog and wiki workflows may be indirectly tested by observing their effects on merges, releases, and wiki updates.

## Known Gaps or Open Questions

- The exact implementation details and runtime environment of the agents (e.g., coordinator, developer, fixer) are not fully described beyond their documentation markdown files.
- There is no explicit mention of unit or integration tests for the workflows or agents.
- The source repository URL and commit SHA are unknown, limiting traceability.
- The interaction between the various agents and how they coordinate in practice is not fully detailed.
- The security considerations for environment variables and tokens used in workflows are not documented here.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
