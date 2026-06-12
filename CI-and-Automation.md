---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a3ed30252c9bfb054e0b54fe5e6c52f8f0b8d703"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-05T12:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and documentation workflows within the repository. It includes configuration templates for issue tracking, pull requests, and changelog management, as well as detailed agent documentation describing roles and responsibilities for automated and human-assisted workflows. The module supports automated changelog generation on merges and releases, CI pipeline execution, and wiki compilation and publishing through GitHub Actions workflows.

Key goals include:

- Standardizing issue and pull request templates to streamline project management.
- Defining agent roles (coordinator, developer, docs, fixer, quality, review) to organize automated and manual review and development tasks.
- Automating changelog updates triggered by merges and releases.
- Running CI pipelines to validate code and documentation changes.
- Automating wiki compilation and publishing with environment-configurable workflows.
- Providing skills documentation to support changelog maintenance and wiki navigation.
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

- **Issue Templates**: `.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/epic.yml`, `.github/ISSUE_TEMPLATE/task.yml` define structured issue creation.
- **Agent Documentation**: Markdown files under `.github/agents/` describe the purpose, expectations, and workflows for various automated agents involved in coordination, development, documentation, fixing, quality assurance, and review.
- **Pull Request Template**: `.github/pull_request_template.md` standardizes PR descriptions and acceptance criteria.
- **Copilot Review Instructions**: `.github/copilot-review-instructions.md` guides AI-assisted code review.
- **Skills Documentation**: `.github/skills/keep-a-changelog/SKILL.md` and `.github/skills/repo-wiki-navigation/SKILL.md` provide procedural knowledge for changelog upkeep and wiki navigation.
- **Workflows**:
  - `.github/workflows/changelog-on-merge.yml`: Automates changelog updates on merges, requires `GH_TOKEN`.
  - `.github/workflows/changelog-release.yml`: Automates changelog generation on releases.
  - `.github/workflows/ci.yml`: Runs CI pipelines for validation.
  - `.github/workflows/wiki.yml`: Automates wiki compilation and publishing, configurable via `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki publishing configuration.
- The module relies on GitHub Actions infrastructure and standard YAML workflow syntax.
- Agent roles and workflows assume integration with GitHub issue and pull request APIs.
- Skills and agent documentation are self-contained Markdown files without external imports.

## Related Tests

- No explicit test files are included in this module.
- Validation of workflows and templates likely occurs through GitHub Actions runs and manual review.
- Agent documentation and skills may be tested indirectly via their application in automated workflows and human processes.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents described in Markdown are not fully specified.
- No direct test suites or automated validation scripts are included in the source files.
- The source repository URL and commit SHA are unknown, limiting traceability.
- The degree of automation integration with external systems beyond GitHub Actions is not detailed.
- The status of documentation files is unvalidated, indicating potential need for review or updates.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
