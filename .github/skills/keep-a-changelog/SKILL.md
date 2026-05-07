---
name: keep-a-changelog
description: "Use when creating or maintaining CHANGELOG.md, converting merged PR changelog notes into Keep a Changelog 1.1.0 format, or cutting a release section from Unreleased. Keywords: changelog, CHANGELOG.md, Keep a Changelog, release notes, unreleased, changelog maintenance."
user-invocable: false
---

# Keep a Changelog Maintenance

Use this skill after a pull request is merged to `main` or when cutting a release.

## Workflow
1. Use `gh pr view <number> --json body,title,url` to inspect the merged PR body.
2. Locate the `## Changelog` section in the PR body.
3. If the PR explicitly states that no changelog update is required, confirm the rationale is credible and skip the file update.
4. Otherwise, require categorized changelog bullets under Keep a Changelog headings.
5. Run the repository script to update `CHANGELOG.md` from GitHub PR metadata:
   - `node ./scripts/update-changelog.mjs update --pr <number> --repo <owner/repo>`
6. Verify that `CHANGELOG.md` now contains the expected `Unreleased` entries without duplicates.
7. When cutting a release, move `Unreleased` into a versioned section:
   - `node ./scripts/update-changelog.mjs release --version <x.y.z> --date <YYYY-MM-DD>`

## Review Policy
- Do not merge a PR that materially changes user-facing behavior, public API, developer workflow, CI or release workflow, or security posture without either:
  - a valid `## Changelog` section with categorized entries, or
  - an explicit and defensible no-changelog rationale.
- Treat malformed changelog entries as a review issue, not as something to silently guess.
- Keep entries concise, user-meaningful, and grouped under the standard Keep a Changelog categories.
