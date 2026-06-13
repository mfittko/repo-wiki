---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "1defe58385a113a4dfca789e393deecf0d6135a8"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/npm-publish.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive set of continuous integration (CI) workflows, automation agents, issue and pull request templates, and documentation skills designed to streamline and standardize development processes within the repository. It includes configuration files for GitHub Actions workflows that automate changelog generation, CI testing, npm package publishing, and wiki compilation. Additionally, it defines multiple specialized agents to coordinate tasks such as code development, documentation, quality assurance, fixing issues, and review processes. The module also contains templates to guide issue reporting and pull request submissions, ensuring consistency and clarity in contributions.

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

- **Agents**:  
  - `coordinator.agent.md` — Coordinates workflow cycles and task delegation.  
  - `developer.agent.md` — Defines developer responsibilities and engineering principles.  
  - `docs.agent.md` — Manages documentation creation and expectations.  
  - `fixer.agent.md` — Handles issue fixing workflows and review processes.  
  - `quality.agent.md` — Oversees quality assurance and output standards.  
  - `review.agent.md` — Guides review inputs and follow-up scopes.

- **Workflows**:  
  - `changelog-on-merge.yml` — Automates changelog updates on merges, requires `GH_TOKEN`.  
  - `changelog-release.yml` — Manages changelog generation during releases.  
  - `ci.yml` — Runs continuous integration tests and checks.  
  - `npm-publish.yml` — Automates npm package publishing, requires `NODE_AUTH_TOKEN`.  
  - `wiki.yml` — Compiles and publishes the repository wiki, uses `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

- **Templates and Instructions**:  
  - Issue templates (`config.yml`, `epic.yml`, `task.yml`) for standardized issue reporting.  
  - `pull_request_template.md` for consistent pull request submissions.  
  - `copilot-review-instructions.md` for guidance on AI-assisted code reviews.

- **Skills**:  
  - `keep-a-changelog/SKILL.md` — Best practices for maintaining changelogs.  
  - `repo-wiki-navigation/SKILL.md` — Guidance on navigating and using the repository wiki.

## Dependencies and Imports

- The workflows depend on environment variables for authentication and configuration:  
  - `GH_TOKEN` for changelog updates on merge.  
  - `NODE_AUTH_TOKEN` for npm publishing.  
  - `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki compilation and publishing.

- No explicit external imports are declared in the YAML or Markdown source files.

## Related Tests

- No explicit test files or test suites are included in this module. Testing is likely integrated within the CI workflows (`ci.yml`), which run automated checks on code changes.

## Known Gaps or Open Questions

- The documentation files are marked as unvalidated, indicating that their content or completeness may require review or updates.  
- The exact implementation details and runtime behavior of the agents are not fully described in the source excerpts.  
- No direct references to test coverage or test results are present, leaving the extent of automated testing unclear.  
- The repository remote URL and commit SHA are unknown, limiting traceability to a specific source state.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
