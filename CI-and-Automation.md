---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2a5afb6af319ea4b1fcdbebcdd868a271584028c"
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

The module's workflows automate key repository maintenance tasks such as changelog generation on merges and releases, CI pipeline execution, and wiki compilation and publishing. The agents documented here define roles and responsibilities for automated processes that coordinate, develop, fix, review, and ensure quality in the codebase and documentation.

Together, these components enable streamlined project management, consistent documentation standards, and reliable automated testing and deployment processes.

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
- **Agents Documentation** (`.github/agents/*.agent.md`): Describe the purpose, expectations, and workflows of automated agents such as:
  - Coordinator Agent: Manages workflow shortcuts and constraints.
  - Developer Agent: Guides engineering principles and development expectations.
  - Docs Agent: Oversees documentation output and standards.
  - Fixer Agent: Handles bug fixes and review workflows.
  - Quality Agent: Ensures quality control and output.
  - Review Agent: Manages review inputs and follow-up scopes.
- **Copilot Review Instructions** (`.github/copilot-review-instructions.md`): Provides guidance for AI-assisted pull request reviews.
- **Pull Request Template** (`.github/pull_request_template.md`): Standardizes pull request descriptions including change summaries, acceptance criteria, and definitions of done.
- **Skills Documentation** (`.github/skills/*/SKILL.md`): Contains best practices for changelog maintenance and repository wiki navigation.
- **Workflows** (`.github/workflows/*.yml`):
  - `changelog-on-merge.yml`: Automates changelog updates on merges, requiring `GH_TOKEN` environment variable.
  - `changelog-release.yml`: Manages changelog generation during releases.
  - `ci.yml`: Defines the continuous integration pipeline.
  - `wiki.yml`: Automates wiki compilation and publishing, using environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- The workflows depend on environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki compilation and publishing configuration.
- The module relies on GitHub Actions infrastructure for CI and automation.
- Agents and skills documentation imply integration with AI-assisted tools and automated review processes.
- No explicit external imports or third-party dependencies are declared in the source files.

## Related Tests

- No explicit test files or test suites are included in this module.
- Testing is likely integrated within the CI workflows (`ci.yml`), which may run automated tests as part of the pipeline.
- Validation of issue templates, pull request templates, and changelog automation may be indirectly tested through workflow runs.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents are documented but unvalidated, indicating potential areas for further verification.
- The source repository URL and commit SHA are unknown, limiting traceability.
- No direct references to test coverage or test results are present.
- The interaction between the various agents and workflows could benefit from additional integration documentation.
- The environment variable requirements for workflows suggest sensitive configuration that must be managed externally.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
