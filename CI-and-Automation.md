---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "171111a1609e1e510e20bfa1989ecfcee1993eb2"
page_state: "generated"
source_paths: [".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/agents/coordinator.agent.md",".github/agents/developer.agent.md",".github/agents/docs.agent.md",".github/agents/fixer.agent.md",".github/agents/quality.agent.md",".github/agents/review.agent.md",".github/copilot-review-instructions.md",".github/pull_request_template.md",".github/skills/keep-a-changelog/SKILL.md",".github/skills/repo-wiki-navigation/SKILL.md",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml"]
compiled_at: "2024-06-05T00:00:00Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# CI and Automation Module

## Purpose

This module provides a comprehensive framework for continuous integration (CI), automation, and documentation workflows within the repository. It includes configuration templates for issue tracking, pull requests, and changelog management, as well as detailed agent documentation describing roles and responsibilities for automated and human-assisted workflows. The module supports automated changelog generation on merges and releases, CI pipeline execution, and wiki compilation and publishing automation.

Key goals include:

- Standardizing issue and pull request templates to streamline project management.
- Defining agent roles (coordinator, developer, docs, fixer, quality, review) to clarify automation and review responsibilities.
- Automating changelog updates triggered by merges and releases.
- Running CI workflows to validate code and documentation changes.
- Automating wiki compilation and publishing with environment-configurable workflows.
- Providing skills documentation to support changelog maintenance and wiki navigation.
- Offering guidance for Copilot-assisted pull request reviews.

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

- **Issue Templates**: `.github/ISSUE_TEMPLATE/config.yml`, `.github/ISSUE_TEMPLATE/epic.yml`, `.github/ISSUE_TEMPLATE/task.yml` — define structured issue creation.
- **Agent Documentation**: Markdown files under `.github/agents/` describe automated agents and their workflows:
  - `coordinator.agent.md` — coordinates workflows and constraints.
  - `developer.agent.md` — outlines developer expectations and principles.
  - `docs.agent.md` — documents documentation agent roles.
  - `fixer.agent.md` — details fixing workflows.
  - `quality.agent.md` — quality assurance roles.
  - `review.agent.md` — review process and scope.
- **Pull Request Template**: `.github/pull_request_template.md` — standardizes PR descriptions and acceptance criteria.
- **Copilot Review Instructions**: `.github/copilot-review-instructions.md` — guidance for AI-assisted code reviews.
- **Skills Documentation**: `.github/skills/keep-a-changelog/SKILL.md` and `.github/skills/repo-wiki-navigation/SKILL.md` — support changelog upkeep and wiki usage.
- **CI Workflows**:
  - `.github/workflows/changelog-on-merge.yml` — triggers changelog updates on merges, requires `GH_TOKEN`.
  - `.github/workflows/changelog-release.yml` — automates changelog generation on releases.
  - `.github/workflows/ci.yml` — main continuous integration pipeline.
  - `.github/workflows/wiki.yml` — automates wiki compilation and publishing, configurable via `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE`.

## Dependencies and Imports

- The workflows depend on environment variables such as `GH_TOKEN` for authentication and `LLMWIKI_COMPILER_MODE` and `LLMWIKI_PUBLISH_REMOTE` for wiki automation configuration.
- The module relies on GitHub Actions infrastructure for CI and automation.
- Agent documentation implies integration with automated agents or bots that execute defined roles, though specific external dependencies are not detailed in the source files.
- Skills documentation suggests usage of changelog and wiki management tools or conventions but does not specify external imports.

## Related Tests

- No explicit test files or test workflows are included in this module.
- CI workflows (`ci.yml`) likely include validation steps, but details are not provided in the source excerpts.
- Testing of automation and changelog workflows may be implicit in the CI pipeline.

## Known Gaps or Open Questions

- The exact implementation details and runtime behavior of the agents described in the Markdown docs are not specified.
- No direct references to test suites or test coverage for the CI and automation workflows.
- The source repository and commit SHA are unknown, limiting traceability.
- The degree of integration between the agents and the CI workflows is not fully detailed.
- The environment variable requirements for some workflows are noted, but their setup and security considerations are not documented here.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
