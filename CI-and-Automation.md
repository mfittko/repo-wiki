---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "91e712dcb91ba10ae83e41a917bf0d92fd2b7545"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-05T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and documentation workflows within the repository. It includes configuration templates for issue tracking, pull requests, and changelog management, as well as detailed documentation for various automated agents that support development, quality assurance, documentation, fixing, reviewing, and coordination tasks.

The workflows automate key processes such as changelog generation on merges and releases, CI pipeline execution, and wiki compilation and publishing. The module also defines structured issue templates and pull request templates to standardize contributions and reviews.

The included agents document their respective roles and expectations, facilitating a collaborative and automated development environment that enhances code quality, documentation accuracy, and process consistency.

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

- **Issue Templates**: `.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/epic.yml`, `.github/ISSUE_TEMPLATE/task.yml`  
  Define structured issue reporting formats to streamline issue triage and management.

- **Pull Request Template**: `.github/pull_request_template.md`  
  Standardizes pull request descriptions, acceptance criteria, and definition of done.

- **Agents Documentation**:  
  - `.github/agents/coordinator.agent.md` — Coordinates workflows and background tasks.  
  - `.github/agents/developer.agent.md` — Defines developer expectations and engineering principles.  
  - `.github/agents/docs.agent.md` — Guides documentation generation and maintenance.  
  - `.github/agents/fixer.agent.md` — Details fixing workflows and review processes.  
  - `.github/agents/quality.agent.md` — Focuses on quality assurance outputs.  
  - `.github/agents/review.agent.md` — Describes review processes and follow-up scopes.

- **Copilot Review Instructions**: `.github/copilot-review-instructions.md`  
  Provides guidance for AI-assisted pull request reviews.

- **Skills Documentation**:  
  - `.github/skills/keep-a-changelog/SKILL.md` — Best practices for changelog maintenance.  
  - `.github/skills/repo-wiki-navigation/SKILL.md` — Navigation and usage of the repository wiki.

- **CI Workflows**:  
  - `.github/workflows/changelog-on-merge.yml` — Automates changelog updates on merges, requires `GH_TOKEN`.  
  - `.github/workflows/changelog-release.yml` — Manages changelog generation on releases.  
  - `.github/workflows/ci.yml` — Core continuous integration pipeline.  
  - `.github/workflows/wiki.yml` — Automates wiki compilation and publishing, uses `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` environment variables.

## Dependencies and Imports

- The workflows depend on environment variables such as `GH_TOKEN` for authentication in changelog updates and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki compilation and publishing.

- The module relies on GitHub Actions infrastructure for CI and automation.

- No explicit code imports are defined; the module is primarily configuration and documentation-driven.

## Related Tests

- No explicit test files are included in this module.

- Testing is implicitly supported by the CI workflows defined in `.github/workflows/ci.yml`.

- Validation of issue templates, pull request templates, and changelog automation is expected to be covered by the CI pipeline.

## Known Gaps or Open Questions

- The documentation files for agents and instructions are marked as unvalidated, indicating a need for review and possible updates to ensure accuracy and completeness.

- The source repository URL and commit SHA are unknown, limiting traceability.

- No explicit automated tests or test coverage reports are included in this module.

- The exact runtime environment and dependencies for the workflows beyond environment variables are not detailed.

- Further integration details between agents and workflows could be elaborated for clarity.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
