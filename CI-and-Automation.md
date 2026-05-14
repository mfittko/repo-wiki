---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "fcd0cab90b26fc622c67172972b85e39ed7ab703"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-10T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and issue management within the repository. It includes configuration templates for issue tracking, pull request workflows, and automated changelog generation. The module also documents various specialized "agents" that support roles such as coordination, development, documentation, fixing, quality assurance, and review processes. These agents help automate and standardize tasks to improve project quality and maintainability.

The workflows defined in this module automate key processes such as running CI pipelines, generating changelogs on merges and releases, and compiling and publishing the project wiki. The issue templates and pull request templates standardize contributions and issue reporting, ensuring consistent project management practices.

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
  - `config.yml`, `epic.yml`, `task.yml` define structured issue templates to guide contributors in reporting and categorizing issues.

- **Agents Documentation**:  
  - `coordinator.agent.md` — outlines responsibilities and approach for coordination tasks.  
  - `developer.agent.md` — describes developer role expectations and engineering principles.  
  - `docs.agent.md` — details documentation agent purpose and output.  
  - `fixer.agent.md` — explains fixer agent's role and review workflow.  
  - `quality.agent.md` — covers quality assurance agent's purpose and output.  
  - `review.agent.md` — defines review agent's purpose and scope.

- **Pull Request Template**:  
  - `pull_request_template.md` standardizes pull request descriptions, acceptance criteria, and definition of done.

- **Copilot Review Instructions**:  
  - `copilot-review-instructions.md` provides guidance for AI-assisted code review.

- **Skills Documentation**:  
  - `keep-a-changelog/SKILL.md` and `repo-wiki-navigation/SKILL.md` describe skills related to changelog maintenance and wiki navigation.

- **Workflows**:  
  - `changelog-on-merge.yml` — automates changelog updates on merges, requires `GH_TOKEN` environment variable.  
  - `changelog-release.yml` — automates changelog generation on releases.  
  - `ci.yml` — defines the continuous integration pipeline.  
  - `wiki.yml` — automates wiki compilation and publishing, uses `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` environment variables.

## Dependencies and Imports

- The workflows depend on GitHub Actions environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki publishing configuration.
- The module relies on GitHub Actions infrastructure for automation.
- No explicit external imports or dependencies are declared in the source files.

## Related Tests

- No explicit test files or test workflows are included in this module.
- Testing is implicitly supported by the CI workflow (`ci.yml`), which likely runs validation and build steps.
- Quality and review agents documentation suggest processes that may include automated checks, but no direct test artifacts are present.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents are documented but unvalidated, indicating potential need for verification.
- The source repository URL and commit SHA are unknown, limiting traceability.
- No explicit test coverage or test results are referenced.
- The integration and interaction between agents and workflows could be further detailed.
- Environment variable usage is noted but not fully documented regarding setup and security considerations.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
