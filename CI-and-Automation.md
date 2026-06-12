---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2f0f1d4621e326372c896cfd4888a22f68ec0f48"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and project workflow management within the repository. It includes configuration templates for issues and pull requests, detailed agent documentation describing automated roles and responsibilities, and CI workflow definitions to automate changelog generation, testing, and wiki compilation.

Key aspects include:

- **Issue and Pull Request Templates:** YAML configurations for issue types (`config.yml`, `epic.yml`, `task.yml`) and a Markdown pull request template to standardize contributions.
- **Agent Documentation:** Markdown files describing various automated agents such as coordinator, developer, docs, fixer, quality, and review agents. These agents define roles, expectations, and workflows to support automation and quality assurance.
- **CI Workflows:** YAML workflows automate changelog updates on merges and releases, run continuous integration tests, and manage wiki compilation and publishing. Environment variables like `GH_TOKEN`, `LLMWIKI_COMPILER_MODE`, and `LLMWIKI_PUBLISH_REMOTE` support secure and configurable automation.
- **Skills Documentation:** Guides on maintaining changelogs and navigating the repository wiki to support contributors and automation processes.
- **Copilot Review Instructions:** Guidance for AI-assisted code review processes.

Together, these components enable a robust, automated development lifecycle that integrates documentation, quality control, and release management.

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

- **Issue Templates:** `.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/epic.yml`, `.github/ISSUE_TEMPLATE/task.yml` — define issue creation standards.
- **Pull Request Template:** `.github/pull_request_template.md` — standardizes PR descriptions and acceptance criteria.
- **Agents:** Markdown files under `.github/agents/` describe automated roles:
  - `coordinator.agent.md` — manages workflow coordination.
  - `developer.agent.md` — outlines development expectations.
  - `docs.agent.md` — focuses on documentation generation.
  - `fixer.agent.md` — handles bug fixes and corrections.
  - `quality.agent.md` — ensures code quality.
  - `review.agent.md` — manages code review processes.
- **CI Workflows:**
  - `changelog-on-merge.yml` — automates changelog updates on merges.
  - `changelog-release.yml` — manages changelog during releases.
  - `ci.yml` — runs continuous integration tests.
  - `wiki.yml` — compiles and publishes the project wiki.
- **Skills Documentation:** Guides for changelog maintenance and wiki navigation.
- **Copilot Review Instructions:** `.github/copilot-review-instructions.md` — AI-assisted review guidance.

## Dependencies and Imports

- The workflows rely on environment variables for secure operation:
  - `GH_TOKEN` for GitHub API authentication in changelog workflows.
  - `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki compilation and publishing.
- The module depends on GitHub Actions infrastructure for CI and automation.
- No explicit external imports are defined in the YAML or Markdown source files.

## Related Tests

- No explicit test files are included in this module.
- CI workflows (`ci.yml`) likely run tests defined elsewhere in the repository.
- Quality and review agents imply integration with testing and code quality tools, but these are not detailed in this module.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents are described in Markdown but lack validation status.
- No direct linkage to test suites or coverage reports is provided.
- The source repository and commit SHA are unknown, limiting traceability.
- The interaction between agents and workflows could be further documented for clarity.
- The role of skills documentation in automation workflows could be expanded.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
