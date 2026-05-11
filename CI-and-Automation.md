---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "3c7f4808701c06a5d3bcd8e1455221b272566b71"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-10T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and issue management within the repository. It includes configuration templates for issue tracking, pull request workflows, and automated changelog generation. The module also documents specialized GitHub agents designed to coordinate, develop, document, fix, review, and ensure quality in the codebase. These agents support automation and streamline collaboration by defining clear roles and responsibilities.

The workflows automate key repository tasks such as running CI pipelines, updating changelogs on merges and releases, and managing wiki content compilation and publishing. The issue templates standardize reporting and task creation, improving project management and traceability.

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
- **GitHub Agents** (`*.agent.md`): Markdown documentation describing the purpose, expectations, and workflows of automated agents that assist in coordination, development, documentation, fixing, quality assurance, and review.
- **Pull Request Template** (`pull_request_template.md`): Standardizes pull request descriptions with sections for change summary, acceptance criteria, and definition of done.
- **Copilot Review Instructions** (`copilot-review-instructions.md`): Guidance for AI-assisted code review processes.
- **Skills Documentation** (`keep-a-changelog/SKILL.md`, `repo-wiki-navigation/SKILL.md`): Instructions and best practices for maintaining changelogs and navigating the repository wiki.
- **Workflows** (`*.yml`): YAML files defining CI pipelines and automation tasks:
  - `ci.yml`: Core continuous integration workflow.
  - `changelog-on-merge.yml`: Automates changelog updates on merges, requires `GH_TOKEN`.
  - `changelog-release.yml`: Automates changelog generation on releases.
  - `wiki.yml`: Automates wiki compilation and publishing, uses environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- No explicit external imports or dependencies are declared in the source files.
- Workflows rely on GitHub Actions environment variables such as `GH_TOKEN`, `LLMWIKI_COMPILER_MODE`, and `LLMWIKI_PUBLISH_REMOTE` for authentication and configuration.
- The module assumes GitHub Actions environment and permissions for automation tasks.

## Related Tests

- No explicit test files or test workflows are included in this module.
- Quality and review agents imply integration with code review and quality assurance processes, but no direct test automation is documented here.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the GitHub agents are documented only in markdown and not linked to executable code or scripts.
- No direct linkage to test suites or validation workflows for the CI pipelines is provided.
- The source repository URL and commit SHA are unknown, limiting traceability.
- The module does not specify how environment variables are provisioned or managed securely.
- Validation status of documentation files is unconfirmed, indicating potential need for review or updates.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
