---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "4876d92ad775fdaa882464db71be1c1ed241f47f"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/npm-publish.yml",".github/workflows/review-context.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive set of continuous integration (CI) workflows, automation agents, issue and pull request templates, and documentation skills designed to streamline and standardize development, review, and release processes within a GitHub repository. It includes configuration files for issue templates and pull request templates to guide contributors, multiple specialized agents to automate tasks such as coordination, development, documentation, fixing, quality assurance, and review, as well as workflows to automate changelog generation, CI runs, npm publishing, review context setup, and wiki compilation.

The module aims to:

- Automate routine project management and development tasks through GitHub Actions workflows.
- Provide structured templates and agents to improve issue tracking, pull request quality, and documentation.
- Support changelog maintenance and release automation.
- Facilitate wiki generation and navigation skills to enhance project documentation usability.
- Integrate environment variables and tokens securely for workflow execution.

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
- `.github/workflows/review-context.yml`
- `.github/workflows/wiki.yml`

## Key Symbols and Entry Points

- **Issue Templates**: `.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/epic.yml`, `.github/ISSUE_TEMPLATE/task.yml` — define structured issue reporting formats.
- **Agents**: Markdown documents describing roles and responsibilities of automation agents:
  - `coordinator.agent.md` — manages coordination workflows.
  - `developer.agent.md` — outlines developer expectations and principles.
  - `docs.agent.md` — focuses on documentation generation and maintenance.
  - `fixer.agent.md` — automates bug fixing and review workflows.
  - `quality.agent.md` — ensures quality assurance processes.
  - `review.agent.md` — manages code review inputs and follow-ups.
- **Pull Request Template**: `.github/pull_request_template.md` — standardizes PR submissions.
- **Copilot Review Instructions**: `.github/copilot-review-instructions.md` — guidance for AI-assisted code reviews.
- **Skills**:
  - `keep-a-changelog/SKILL.md` — instructions for changelog maintenance.
  - `repo-wiki-navigation/SKILL.md` — guidance for navigating the repository wiki.
- **Workflows**:
  - `changelog-on-merge.yml` — automates changelog updates on merges, requires `GH_TOKEN`.
  - `changelog-release.yml` — manages changelog generation for releases.
  - `ci.yml` — main continuous integration workflow.
  - `npm-publish.yml` — automates npm package publishing.
  - `review-context.yml` — sets up review context, requires `GH_TOKEN`.
  - `wiki.yml` — automates wiki compilation and publishing, uses `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment variables such as `GH_TOKEN` for authentication and publishing.
- Wiki compilation workflow depends on environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` to control compilation and publishing behavior.
- The module relies on GitHub Actions infrastructure and standard YAML syntax for workflow definitions.
- Markdown files serve as documentation and configuration for automation agents and templates, with no external imports.

## Related Tests

- No explicit test files or test workflows are included in this module.
- Validation of workflows and templates likely occurs through GitHub Actions runtime and repository usage.
- Agents and skills documentation imply manual or automated validation through usage scenarios but no direct test artifacts are present.

## Known Gaps or Open Questions

- The source commit and repository remote are unspecified, limiting traceability.
- The status of documentation files is unvalidated, indicating potential need for review or updates.
- No explicit test coverage or automated test workflows are included, which may affect confidence in automation correctness.
- Details on how environment variables are provisioned and secured are not documented here.
- The interaction and orchestration between agents and workflows could benefit from further elaboration or diagrams.
- The module does not specify versioning or compatibility constraints for workflows or agents.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
