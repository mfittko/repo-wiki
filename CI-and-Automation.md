---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "f3abfc0fc6ecf916c2293708106a5018ea85180d"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/npm-publish.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive set of continuous integration (CI) workflows, automation scripts, issue and pull request templates, and documentation agents designed to streamline and standardize development, review, and release processes within the repository. It includes configuration for automated changelog generation, npm package publishing, wiki compilation, and quality assurance workflows. The module also defines roles and responsibilities for various automated agents that assist in coordinating, developing, documenting, fixing, reviewing, and ensuring quality of code and documentation contributions.

Key goals include:

- Automating routine tasks such as changelog updates, publishing, and wiki generation.
- Standardizing issue and pull request templates to improve contribution quality.
- Defining agent roles to support collaborative workflows and maintain code quality.
- Providing documentation and skills guides to assist contributors in navigating and maintaining the repository.

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
- `.github/workflows/wiki.yml`

## Key Symbols and Entry Points

- **Workflow YAML files**:
  - `changelog-on-merge.yml`: Automates changelog updates triggered on merges, requires `GH_TOKEN` environment variable.
  - `changelog-release.yml`: Manages changelog generation during release processes.
  - `ci.yml`: Core continuous integration workflow running tests and validations.
  - `npm-publish.yml`: Automates npm package publishing.
  - `wiki.yml`: Automates wiki compilation and publishing, uses `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` environment variables.

- **Issue Templates**:
  - `config.yml`, `epic.yml`, `task.yml`: Define structured issue templates to guide contributors.

- **Pull Request Template**:
  - `pull_request_template.md`: Standardizes pull request descriptions and acceptance criteria.

- **Agent Documentation**:
  - `coordinator.agent.md`: Defines the coordinator agent’s workflow and responsibilities.
  - `developer.agent.md`: Describes the developer agent’s purpose and engineering principles.
  - `docs.agent.md`: Details the documentation agent’s expectations and output.
  - `fixer.agent.md`: Explains the fixer agent’s role and review workflow.
  - `quality.agent.md`: Outlines the quality agent’s purpose and output.
  - `review.agent.md`: Covers the review agent’s scope and inputs.

- **Skills Guides**:
  - `keep-a-changelog/SKILL.md`: Guidance on maintaining changelogs.
  - `repo-wiki-navigation/SKILL.md`: Instructions for navigating the repository wiki.

- **Copilot Review Instructions**:
  - `copilot-review-instructions.md`: Provides guidance for AI-assisted pull request reviews.

## Dependencies and Imports

- No explicit external dependencies or imports are declared within the YAML workflows or Markdown documentation.
- Environment variables used in workflows:
  - `GH_TOKEN` for changelog-on-merge workflow authentication.
  - `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki compilation and publishing workflows.

## Related Tests

- No explicit test files or test suites are included in this module.
- CI workflows (`ci.yml`) likely include automated tests and validations as part of their process, but specific test scripts or test source files are not listed here.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents described in Markdown files are not fully validated.
- The source repository URL and commit SHA are unknown, limiting traceability.
- No direct linkage to test code or coverage reports is provided.
- The interaction between the various agents and workflows could benefit from further documentation or diagrams.
- Environment variable requirements and secrets management practices are not detailed beyond variable names.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
