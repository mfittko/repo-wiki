# Copilot Pull Request Review Guidance

When reviewing pull requests in this repository:

- Use `docs/PLAN.md`, `.llmwiki/schema.md`, and the PR plan references as the implementation contract.
- Verify each acceptance criterion from the PR description and report status with evidence links to changed files.
- Verify each definition-of-done item and report status with evidence links.
- Flag any gap against non-goals when scope appears to exceed them.
- Check changelog automation changes for rerun safety and idempotency.
- Treat source code as authoritative and generated wiki pages as derived artifacts.
- Treat secrets and private tokens as never-allowed content in generated markdown.

Review response format requirements:

1. `## Review Verdict` with a table: `ID | Acceptance criterion | Status | Evidence`
2. `## Definition of Done Verdict` with a table: `ID | Definition of done item | Status | Evidence`
3. `## Non-goal Compliance`
4. `## Changelog` with `### Added`, `### Changed`, and optional `### Fixed` sections
5. `## Merge Readiness` with a clear merge-ready or not-merge-ready conclusion

Status values should be `Pass`, `Partial`, `Fail`, or `Open`.
