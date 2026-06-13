---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "06a68a1856f28bfd2083ba36b00bf83a0754e19c"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/npm-publish.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation workflows, and issue management within the repository. It includes configuration templates for issue tracking, pull request management, and automated workflows that support changelog generation, publishing, and wiki compilation. The module also documents various specialized agents that coordinate and automate tasks such as development, documentation, code fixing, quality assurance, and review processes. Together, these components streamline project maintenance, enforce engineering principles, and enhance collaboration through automation and structured workflows.

## Source file list

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

## Key symbols and entry points

- **Issue Templates**:  
  - `config.yml`, `epic.yml`, `task.yml` define structured issue templates to standardize issue reporting and tracking.

- **Agents Documentation**:  
  - `coordinator.agent.md`: Describes the coordinator agent responsible for managing workflow cycles and constraints.  
  - `developer.agent.md`: Details the developer agent’s purpose and engineering principles.  
  - `docs.agent.md`: Covers the documentation agent’s role and output expectations.  
  - `fixer.agent.md`: Explains the fixer agent’s responsibilities and review workflow.  
  - `quality.agent.md`: Defines the quality agent’s purpose and output.  
  - `review.agent.md`: Outlines the review agent’s scope and inputs.

- **Pull Request and Review Guidance**:  
  - `copilot-review-instructions.md`: Provides instructions for Copilot-assisted pull request reviews.  
  - `pull_request_template.md`: Template for pull request submissions including change summary and acceptance criteria.

- **Skills Documentation**:  
  - `keep-a-changelog/SKILL.md`: Guidance on maintaining changelogs.  
  - `repo-wiki-navigation/SKILL.md`: Instructions for navigating the repository wiki.

- **CI Workflows**:  
  - `changelog-on-merge.yml`: Automates changelog updates on merges, requires `GH_TOKEN`.  
  - `changelog-release.yml`: Manages changelog generation during releases.  
  - `ci.yml`: Core continuous integration workflow running background tasks.  
  - `npm-publish.yml`: Automates npm package publishing.  
  - `wiki.yml`: Automates wiki compilation and publishing, uses environment variables `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and imports

- This module primarily consists of YAML and Markdown files for configuration and documentation; it does not explicitly import external code modules.
- Environment variables used in workflows include:  
  - `GH_TOKEN` for authentication in changelog updates.  
  - `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki compilation and publishing control.

## Related tests

- No explicit test files or test workflows are included in this module.
- Testing of CI workflows and automation is likely integrated into the broader repository CI pipeline but is not detailed here.

## Known gaps or open questions

- The documentation files are marked as unvalidated, indicating that some content may require review or updates for accuracy and completeness.
- The source repository URL and commit SHA are unknown, limiting traceability.
- No explicit test coverage or validation workflows are documented within this module.
- The exact runtime environment and dependencies for the agents and workflows are not fully detailed.
- Further integration details between agents and workflows could clarify operational flow.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
