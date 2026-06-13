---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "104e3c23e782dbd282df6b81c63dfae18768b23f"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/npm-publish.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-01T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive set of continuous integration (CI) workflows, automation scripts, issue and pull request templates, and documentation agents designed to streamline and standardize development, review, and release processes within a GitHub repository. It includes configuration for automated changelog generation, npm package publishing, wiki compilation, and quality assurance workflows. The module also defines roles and responsibilities for various automation agents (e.g., coordinator, developer, fixer, quality, review, docs) to facilitate collaboration and maintain high code and documentation standards.

Key goals include:

- Automating CI pipelines to ensure code quality and smooth releases.
- Providing structured issue and pull request templates to improve project management.
- Defining agent roles to automate and document review, fixing, and coordination tasks.
- Supporting changelog maintenance and wiki content generation through automated workflows.
- Enabling environment-variable-driven configuration for secure and flexible CI operations.

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

- **CI Workflows:**
  - `changelog-on-merge.yml`: Automates changelog updates on merges, requires `GH_TOKEN`.
  - `changelog-release.yml`: Manages changelog generation during releases.
  - `ci.yml`: Core continuous integration workflow running tests and checks.
  - `npm-publish.yml`: Automates npm package publishing, requires `NODE_AUTH_TOKEN`.
  - `wiki.yml`: Automates wiki compilation and publishing, configurable via `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

- **Issue Templates:**
  - `config.yml`, `epic.yml`, `task.yml`: Define structured issue templates for consistent issue reporting.

- **Agents Documentation:**
  - `coordinator.agent.md`: Defines the coordinator agent’s workflow and responsibilities.
  - `developer.agent.md`: Describes developer agent expectations and principles.
  - `docs.agent.md`: Details the documentation agent’s purpose and output.
  - `fixer.agent.md`: Explains fixer agent’s role and review workflow.
  - `quality.agent.md`: Outlines quality agent’s responsibilities and output.
  - `review.agent.md`: Covers review agent’s purpose and review scope.

- **Additional Docs:**
  - `copilot-review-instructions.md`: Guidance for Copilot-assisted pull request reviews.
  - `pull_request_template.md`: Template for pull request submissions.
  - Skills documentation for changelog maintenance and wiki navigation.

## Dependencies and Imports

- No explicit code imports; the module relies on GitHub Actions environment and tokens:
  - `GH_TOKEN` for changelog automation.
  - `NODE_AUTH_TOKEN` for npm publishing.
  - `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki workflows.

- The workflows and agents depend on GitHub Actions runners and standard GitHub repository features.

## Related Tests

- No explicit test files are included in this module.
- CI workflows likely include automated tests and checks as part of their execution (`ci.yml`).
- Quality and review agents imply integration with code quality and review processes, but no direct test artifacts are present.

## Known Gaps or Open Questions

- The documentation agent files and agent roles are marked as unvalidated; further validation and refinement may be needed.
- No direct linkage to test suites or coverage reports is provided.
- The exact implementation details of the agents’ automation logic are not included, only their documentation.
- Source repository and commit SHA are unknown, limiting traceability.
- Environment variable usage is documented but the setup and secrets management are not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
