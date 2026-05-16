---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "349f357c41f2135ffba209e27c9fa6e032320e2e"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and project workflow management within the repository. It includes configuration templates for issue tracking, pull requests, and changelog management, as well as detailed documentation for various automated agents that support development, quality assurance, documentation, fixing, reviewing, and coordination tasks.

The module's CI workflows automate key processes such as changelog generation on merges and releases, continuous integration testing, and wiki compilation and publishing. The included agents define roles and responsibilities to streamline collaboration and maintain code quality through automated and semi-automated workflows.

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

- **Issue Templates** (`config.yml`, `epic.yml`, `task.yml`): Define structured issue reporting formats to standardize and streamline issue creation and triage.
- **Agents Documentation** (`*.agent.md`): Describe the purpose, expectations, and workflows for automated agents such as:
  - Coordinator Agent: Manages background workflows and coordination.
  - Developer Agent: Focuses on engineering principles and development tasks.
  - Docs Agent: Handles documentation generation and maintenance.
  - Fixer Agent: Automates bug fixing and patching workflows.
  - Quality Agent: Ensures code quality and testing standards.
  - Review Agent: Manages code review processes.
- **Copilot Review Instructions** (`copilot-review-instructions.md`): Guidance for AI-assisted pull request reviews.
- **Pull Request Template** (`pull_request_template.md`): Standardizes pull request descriptions and acceptance criteria.
- **Skills Documentation** (`keep-a-changelog/SKILL.md`, `repo-wiki-navigation/SKILL.md`): Provide best practices for changelog maintenance and wiki navigation.
- **CI Workflows** (`changelog-on-merge.yml`, `changelog-release.yml`, `ci.yml`, `wiki.yml`): Automate changelog updates, release processes, continuous integration testing, and wiki compilation/publishing. These workflows run in the background and use environment variables such as `GH_TOKEN`, `LLMWIKI_COMPILER_MODE`, and `LLMWIKI_PUBLISH_REMOTE` for secure and configurable operation.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment variables for authentication and configuration:
  - `GH_TOKEN` for changelog automation.
  - `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki compilation and publishing.
- The module relies on GitHub's native CI/CD infrastructure and GitHub Actions runners.
- No external imports or third-party dependencies are explicitly declared in the source files.

## Related Tests

- No explicit test files or test suites are included in this module.
- Quality assurance is supported through the `quality.agent.md` documentation and CI workflows that likely include automated tests as part of the continuous integration process.

## Known Gaps or Open Questions

- The documentation files are marked as "unvalidated," indicating that some content may require review or updates to ensure accuracy and completeness.
- The exact implementation details and runtime behavior of the agents and workflows are not fully described in the source excerpts.
- No direct references to testing frameworks or test coverage reports are present, leaving the scope of automated testing unclear.
- The repository remote URL and commit SHA are unknown, limiting traceability to a specific source version.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
