---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "db3dd5c6e2bdb430282661ff44b002d22af0bade"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-10T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and issue management within the repository. It includes configuration templates for issue tracking, pull request workflows, and automated changelog generation. The module also documents various specialized agents that support development, quality assurance, documentation, fixing, reviewing, and coordination tasks, facilitating a structured and automated approach to repository maintenance and enhancement.

Key purposes include:

- Defining issue templates (`config.yml`, `epic.yml`, `task.yml`) to standardize issue reporting and tracking.
- Automating changelog updates on merges and releases through GitHub Actions workflows.
- Managing CI pipelines to ensure code quality and integration readiness.
- Automating wiki compilation and publishing workflows.
- Documenting roles and responsibilities of various agents (coordinator, developer, docs, fixer, quality, review) to streamline collaboration and task automation.
- Providing guidance for pull request reviews, including Copilot-assisted review instructions.
- Supporting repository documentation and navigation skills to improve maintainability.

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

- **Issue Templates**: `.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/epic.yml`, `.github/ISSUE_TEMPLATE/task.yml` — define structured issue reporting.
- **Agents Documentation**: Markdown files under `.github/agents/` describe the purpose, expectations, and workflows of various automation agents:
  - `coordinator.agent.md` — background coordination tasks.
  - `developer.agent.md` — development-related automation.
  - `docs.agent.md` — documentation generation and maintenance.
  - `fixer.agent.md` — automated fixing workflows.
  - `quality.agent.md` — quality assurance automation.
  - `review.agent.md` — code review processes.
- **Pull Request Template**: `.github/pull_request_template.md` — standardizes PR submission.
- **Copilot Review Instructions**: `.github/copilot-review-instructions.md` — guidance for AI-assisted code review.
- **Skills Documentation**: `.github/skills/keep-a-changelog/SKILL.md` and `.github/skills/repo-wiki-navigation/SKILL.md` — document best practices for changelog maintenance and wiki navigation.
- **Workflows**:
  - `changelog-on-merge.yml` — automates changelog updates on merges, requires `GH_TOKEN`.
  - `changelog-release.yml` — automates changelog generation on releases.
  - `ci.yml` — main continuous integration pipeline.
  - `wiki.yml` — automates wiki compilation and publishing, uses environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment and tokens such as `GH_TOKEN` for changelog automation.
- Wiki workflow depends on environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` to control compilation and publishing modes.
- The module is self-contained within GitHub repository configuration and markdown documentation; no external code imports are indicated.

## Related Tests

- No explicit test files or test workflows are included in this module.
- CI workflows (`ci.yml`) likely include automated tests as part of the pipeline, but details are not specified in the source files.
- Quality and review agents documentation suggest processes that may include automated checks, but no direct test artifacts are present.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents are documented but unvalidated; further validation and testing may be required.
- The source repository URL and commit SHA are unknown, limiting traceability.
- No explicit test coverage or test results are included; integration with testing frameworks is implied but not detailed.
- The interaction between various agents and workflows could be further elaborated to clarify orchestration.
- Environment variable usage is documented but the setup and secrets management are not described.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
