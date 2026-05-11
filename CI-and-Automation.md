---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "f47907b8f64c2674438a61f152c6d5a09a19c523"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-15T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and issue management within the repository. It includes configuration templates for issue tracking, pull request workflows, and automated changelog generation. The module also documents various specialized agents that support development, quality assurance, documentation, fixing, reviewing, and coordination tasks, enabling streamlined and automated project management and code quality processes.

Key goals include:

- Standardizing issue templates for consistent reporting and tracking of epics, tasks, and configuration issues.
- Defining automated workflows for CI pipelines, changelog updates on merges and releases, and wiki publishing.
- Documenting agent roles that automate and assist in code review, quality checks, documentation generation, and coordination.
- Providing guidance for pull request reviews, changelog maintenance, and repository navigation skills.
- Leveraging environment variables and background workflows to enable secure and efficient automation.

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
  - `config.yml`, `epic.yml`, `task.yml` — YAML configurations defining issue templates for different issue types.

- **Agents Documentation**:  
  - `coordinator.agent.md` — Describes the coordinator agent's constraints, responsibilities, and approach.  
  - `developer.agent.md` — Details the developer agent's purpose, expectations, and engineering principles.  
  - `docs.agent.md` — Explains the documentation agent's role and output expectations.  
  - `fixer.agent.md` — Covers the fixer agent's purpose, expectations, and review workflow.  
  - `quality.agent.md` — Defines the quality agent's purpose, expectations, and output.  
  - `review.agent.md` — Outlines the review agent's purpose, inputs, and follow-up scope.

- **Pull Request and Review Guidance**:  
  - `copilot-review-instructions.md` — Guidance for Copilot-assisted pull request reviews.  
  - `pull_request_template.md` — Template for pull request descriptions including change summary, acceptance criteria, and definition of done.

- **Skills Documentation**:  
  - `keep-a-changelog/SKILL.md` — Instructions and best practices for maintaining changelogs.  
  - `repo-wiki-navigation/SKILL.md` — Guidance on navigating and using the repository wiki effectively.

- **CI Workflows**:  
  - `changelog-on-merge.yml` — Automates changelog updates triggered on merges, requires `GH_TOKEN` environment variable.  
  - `changelog-release.yml` — Automates changelog generation during releases.  
  - `ci.yml` — Defines the core continuous integration pipeline workflow.  
  - `wiki.yml` — Automates wiki compilation and publishing, uses `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` environment variables.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki publishing configuration.
- The module relies on GitHub Actions infrastructure for background execution of CI and automation tasks.
- No external imports or third-party dependencies are explicitly declared in the source files.

## Related Tests

- No explicit test files or test suites are included in this module.
- Validation of workflows and templates is expected to be performed via GitHub Actions runtime and repository usage.
- Agents and skills documentation imply operational validation through their respective automated processes and human review.

## Known Gaps or Open Questions

- The source commit and repository remote URL are unknown, limiting traceability.
- The agents' documentation files are marked as unvalidated, indicating potential need for review or updates.
- No explicit test coverage or automated test scripts are provided to verify the correctness of workflows or templates.
- The interaction and orchestration details between different agents and workflows are not fully detailed in the documentation.
- Environment variable usage is noted but lacks comprehensive security or configuration guidelines.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
