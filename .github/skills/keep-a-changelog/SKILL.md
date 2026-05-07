---
name: keep-a-changelog
description: "Use when creating or maintaining CHANGELOG.md, deriving Keep a Changelog 1.1.0 entries from merged pull request metadata, or cutting a release section from Unreleased. Keywords: changelog, CHANGELOG.md, Keep a Changelog, release notes, unreleased, changelog maintenance."
user-invocable: false
---

# Keep a Changelog Maintenance

Use this skill after a pull request is merged to `main` or when cutting a release.

## Workflow
1. Use `gh pr view <number> --json title,body,files,url` to inspect the merged PR title, structured PR description, and changed files.
2. Treat the PR title as the primary human-written changelog signal, and the changed file list as the structural signal. The PR description should include a concise change summary in addition to acceptance criteria, definition of done, and non-goals, but changelog automation must not rely on a dedicated changelog section there.
3. Run the repository script to update `CHANGELOG.md` from GitHub PR metadata:
   - `node ./scripts/update-changelog.mjs update --pr <number> --repo <owner/repo>`
4. Verify that `CHANGELOG.md` now contains the expected `Unreleased` entries without duplicates.
5. If the script produces no entry, confirm that the change is documentation-only or test-only before accepting the no-op result.
6. When cutting a release, move `Unreleased` into a versioned section:
   - `node ./scripts/update-changelog.mjs release --version <x.y.z> --date <YYYY-MM-DD>`

## Review Policy
- Do not merge a PR that materially changes user-facing behavior, public API, developer workflow, CI or release workflow, or security posture unless its title is specific enough to support changelog derivation.
- Treat vague PR titles as a review issue, because changelog automation depends on them.
- Keep PR descriptions scoped to a concise change summary, acceptance criteria, definition of done, and non-goals; do not require a dedicated changelog section there for changelog purposes.
