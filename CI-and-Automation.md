---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "ab4f4401735f73fb39983b8f7af41b5ed76b37f7"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and project management workflows within the repository. It includes configuration files for issue templates, pull request templates, and GitHub Actions workflows that automate changelog generation, release processes, and wiki compilation. Additionally, it documents various specialized "agents" that support roles such as coordination, development, documentation, fixing, quality assurance, and review, facilitating automated and semi-automated project tasks.

The module aims to streamline development and maintenance processes by:

- Defining structured issue and pull request templates to standardize contributions.
- Automating changelog updates on merges and releases.
- Running CI pipelines to validate code and documentation.
- Automating wiki compilation and publishing.
- Providing documentation and instructions for AI-assisted code review and project navigation.
- Supporting background and environment-aware workflows through GitHub Actions.

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

- **Issue Templates**: `.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/epic.yml`, `.github/ISSUE_TEMPLATE/task.yml` — define structured issue reporting formats.
- **Pull Request Template**: `.github/pull_request_template.md` — standardizes PR descriptions and acceptance criteria.
- **Agents Documentation**: Markdown files under `.github/agents/` describe roles and responsibilities for automated or semi-automated agents supporting project workflows.
- **Skills Documentation**: `.github/skills/keep-a-changelog/SKILL.md` and `.github/skills/repo-wiki-navigation/SKILL.md` provide guidance on changelog maintenance and wiki navigation.
- **GitHub Actions Workflows**:
  - `.github/workflows/changelog-on-merge.yml` — automates changelog updates on merges, requires `GH_TOKEN`.
  - `.github/workflows/changelog-release.yml` — manages changelog during releases.
  - `.github/workflows/ci.yml` — runs continuous integration pipelines.
  - `.github/workflows/wiki.yml` — compiles and publishes the repository wiki, uses environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment variables such as `GH_TOKEN`, `LLMWIKI_COMPILER_MODE`, and `LLMWIKI_PUBLISH_REMOTE` for authentication and configuration.
- The module relies on GitHub's native CI/CD infrastructure and markdown rendering.
- No external code imports are specified within the YAML or markdown source files.

## Related Tests

- No explicit test files or test suites are included in this module.
- CI workflows (`.github/workflows/ci.yml`) likely include automated tests or validation steps, but details are not specified in the source excerpts.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents described in markdown files are not provided; their operational integration with automation workflows is unclear.
- No direct references to testing frameworks or test coverage reports are present.
- The source repository and commit SHA are unknown, limiting traceability.
- The degree of automation and manual intervention required for some workflows (e.g., changelog release) is not fully documented.
- Validation status of documentation files is unconfirmed, indicating potential need for review or updates.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
