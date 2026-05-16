---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "b1b3a9c5f3b8a59dd631cd206cda223760e1ba3a"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-10T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and documentation workflows within the repository. It includes configuration templates for issue tracking, pull requests, and changelog management, as well as detailed agent documentation describing roles and responsibilities for automated and human contributors in the development lifecycle.

The module's workflows automate key processes such as changelog generation on merges and releases, CI pipeline execution, and wiki compilation and publishing. The included agents guide the coordination, development, documentation, fixing, quality assurance, and review tasks, ensuring a structured and efficient automation ecosystem.

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
- **Agent Documentation** (`*.agent.md`): Describe the purpose, expectations, and workflows for various automated agents such as coordinator, developer, docs, fixer, quality, and review agents.
- **Pull Request Template** (`pull_request_template.md`): Standardizes the pull request submission process with sections for change summary, acceptance criteria, and definition of done.
- **Copilot Review Instructions** (`copilot-review-instructions.md`): Provides guidance for AI-assisted pull request reviews.
- **Skills Documentation** (`keep-a-changelog/SKILL.md`, `repo-wiki-navigation/SKILL.md`): Document best practices and skills related to changelog maintenance and wiki navigation.
- **Workflows** (`*.yml`):
  - `changelog-on-merge.yml`: Automates changelog updates triggered on merges, requiring `GH_TOKEN` environment variable.
  - `changelog-release.yml`: Manages changelog generation during release events.
  - `ci.yml`: Defines the continuous integration pipeline for automated testing and validation.
  - `wiki.yml`: Automates wiki compilation and publishing, using environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- The workflows rely on GitHub Actions environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki publishing configuration.
- No explicit external imports or dependencies are declared in the YAML workflows or Markdown documentation.
- The module integrates tightly with GitHub's native CI/CD and issue management features.

## Related Tests

- No explicit test files or test suites are included in this module.
- CI workflows (`ci.yml`) likely include automated testing steps, but specific test scripts or test cases are not part of the source files listed.
- Testing is implicitly supported through the CI pipeline automation.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents described in Markdown files are not fully validated.
- No direct linkage to test coverage or test results is provided.
- The source repository URL and commit SHA are unknown, limiting traceability.
- The module does not include explicit error handling or fallback mechanisms in the workflows.
- Further validation of environment variable usage and secrets management is recommended.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
