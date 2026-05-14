---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "64636a87dfde6c5a3055391035a1bb4598fc5c10"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-10T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and documentation workflows within the repository. It includes configuration templates for issue tracking, pull request management, and automated changelog generation. The module also defines specialized GitHub agents to coordinate development, documentation, quality assurance, code review, and fixing tasks, facilitating a structured and automated development lifecycle.

Key purposes include:

- Standardizing issue and pull request templates to streamline project management and collaboration.
- Automating changelog updates on merges and releases to maintain accurate project history.
- Running CI workflows to validate code changes and maintain quality.
- Automating wiki compilation and publishing to keep project documentation up to date.
- Defining roles and responsibilities for various automated agents (coordinator, developer, docs, fixer, quality, review) to support different aspects of the development and review process.
- Providing skills documentation to assist with changelog maintenance and repository wiki navigation.
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
- `.github/workflows/wiki.yml`

## Key Symbols and Entry Points

- **Issue Templates**:  
  - `config.yml`, `epic.yml`, `task.yml` — YAML configurations defining issue templates to standardize issue reporting.

- **GitHub Agents Documentation**:  
  - `coordinator.agent.md` — Describes the coordinator agent’s workflow and responsibilities.  
  - `developer.agent.md` — Details the developer agent’s purpose and engineering principles.  
  - `docs.agent.md` — Outlines the documentation agent’s expectations and output.  
  - `fixer.agent.md` — Explains the fixer agent’s role and review workflow.  
  - `quality.agent.md` — Defines the quality agent’s purpose and output.  
  - `review.agent.md` — Covers the review agent’s purpose and review scope.

- **Pull Request and Review Guidance**:  
  - `copilot-review-instructions.md` — Instructions for Copilot-assisted PR reviews.  
  - `pull_request_template.md` — Template for pull request submissions.

- **Skills Documentation**:  
  - `keep-a-changelog/SKILL.md` — Guidance on maintaining changelogs.  
  - `repo-wiki-navigation/SKILL.md` — Instructions for navigating the repository wiki.

- **CI and Automation Workflows**:  
  - `changelog-on-merge.yml` — Workflow to update changelogs automatically on merges, requires `GH_TOKEN` environment variable.  
  - `changelog-release.yml` — Workflow for changelog generation on releases.  
  - `ci.yml` — Core continuous integration workflow running automated checks.  
  - `wiki.yml` — Workflow to compile and publish the wiki, uses `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` environment variables.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment variables such as `GH_TOKEN` for authentication and permissions, and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki compilation and publishing control.
- The module relies on GitHub’s native Actions and repository structure for issue templates, pull request templates, and workflow triggers.
- No external imports or third-party dependencies are explicitly declared in the source files.

## Related Tests

- No explicit test files or test workflows are included in this module.
- CI workflows (`ci.yml`) likely include automated tests or checks, but details are not specified in the source excerpts.
- Quality and review agents documentation suggest processes that may involve automated validation or manual review steps.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents (coordinator, developer, docs, fixer, quality, review) are documented but unvalidated, indicating potential need for verification or updates.
- The specific tests run by the CI workflow are not detailed, leaving unclear the scope and coverage of automated testing.
- Environment variable usage hints at external secrets or configuration that must be managed outside the repository.
- The integration and orchestration between the various workflows and agents could benefit from further documentation or examples.
- No direct references to error handling or failure recovery mechanisms in the automation workflows.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
