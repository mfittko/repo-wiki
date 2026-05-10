---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "176374fc6ec27cb41eb2b6ed9e5833b68ee7778a"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and project workflow management within the repository. It includes configuration templates for issue tracking, pull request workflows, and automated changelog generation, alongside detailed documentation for various automated agents that support development, quality assurance, documentation, and review processes.

The module's core goals are to:

- Standardize issue and pull request templates to streamline project management and collaboration.
- Automate changelog creation and release processes to maintain accurate project history.
- Define and document specialized agents (coordinator, developer, docs, fixer, quality, review) that automate and assist with various aspects of repository maintenance and code quality.
- Provide skills documentation to support changelog maintenance and wiki navigation.
- Enable automated wiki compilation and publishing workflows.
- Support GitHub Actions workflows that run CI pipelines, changelog updates, and wiki publishing with environment variable configurations.

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

- **Issue Templates**: `.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/epic.yml`, `.github/ISSUE_TEMPLATE/task.yml` — YAML configurations defining issue templates to standardize reporting and task tracking.
- **Agents Documentation**: Markdown files under `.github/agents/` describing the purpose, expectations, and workflows of automated agents that assist with coordination, development, documentation, fixing, quality assurance, and review.
- **Pull Request Template**: `.github/pull_request_template.md` — Markdown template guiding contributors on change summaries, acceptance criteria, and definition of done.
- **Copilot Review Instructions**: `.github/copilot-review-instructions.md` — Guidance for AI-assisted code review processes.
- **Skills Documentation**: `.github/skills/keep-a-changelog/SKILL.md` and `.github/skills/repo-wiki-navigation/SKILL.md` — Documentation of skills related to changelog maintenance and wiki navigation.
- **CI Workflows**:
  - `.github/workflows/ci.yml` — Core continuous integration pipeline.
  - `.github/workflows/changelog-on-merge.yml` — Automates changelog updates on merges, requires `GH_TOKEN`.
  - `.github/workflows/changelog-release.yml` — Automates changelog generation for releases.
  - `.github/workflows/wiki.yml` — Automates wiki compilation and publishing, uses environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki publishing configuration.
- The module relies on GitHub's native CI/CD infrastructure and GitHub Actions runners.
- No external imports or third-party dependencies are explicitly declared in the source files.

## Related Tests

- No explicit test files or test workflows are included in this module.
- Testing is implicitly supported through the CI workflows (`.github/workflows/ci.yml`) which likely run automated tests as part of the integration pipeline.
- Quality and review agents documentation suggest processes that may include automated checks and validations, but no direct test artifacts are present.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents are documented but unvalidated, indicating potential need for verification or updates.
- No direct linkage to test suites or coverage reports is provided, leaving the scope of automated testing unclear.
- The source repository and commit SHA are unknown, limiting traceability.
- The environment variable requirements for workflows are partially documented but may require further elaboration for setup.
- The integration between the changelog workflows and release processes could benefit from additional documentation or examples.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
