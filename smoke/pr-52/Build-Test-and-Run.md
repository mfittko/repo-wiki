---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "7cfbc938941623f13ab3a22b03aaeddd588e8d5a"
compiled_at: "2026-05-09T23:33:50.490Z"
kind: "build_test_run"
page_state: "generated"
---
# Build, Test, and Run

## Detected package manifests

- [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json)

## Detected CI files

- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/.github/workflows/changelog-on-merge.yml)
- [.github/workflows/changelog-release.yml](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/.github/workflows/changelog-release.yml)
- [.github/workflows/ci.yml](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/.github/workflows/ci.yml)
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/.github/workflows/wiki.yml)

## Package scripts

- Package manifests with scripts: 1
- Scripts detected: 23

| Manifest | Package | Script | Command |
| --- | --- | --- | --- |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `build` | `tsc --project tsconfig.json` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `changelog:ensure` | `node ./scripts/update-changelog.mjs ensure` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `changelog:release` | `node ./scripts/update-changelog.mjs release` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `changelog:update` | `node ./scripts/update-changelog.mjs update` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `check` | `npm run build && npm run test:compiled` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `clean` | `rm -rf dist .tsbuildinfo` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `compile:local` | `npm run build --silent && node ./dist/bin/repo-wiki.js compile --scan .llmwiki/run --plan .llmwiki/bootstrap-plan.json --wiki .llmwiki/wiki` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `coverage` | `npm run build && npm run coverage:compiled` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `coverage:compiled` | `c8 --include=dist/src/**/*.js --reporter=text --check-coverage --lines 95 node ./dist/test/run-compiled-tests.js` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `kb:bootstrap` | `npm run build --silent && node ./dist/bin/repo-wiki.js run --mode bootstrap --repo . --scan .llmwiki/run --plan .llmwiki/bootstrap-plan.json --wiki .llmwiki/wiki` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `kb:incremental` | `npm run build --silent && node ./dist/bin/repo-wiki.js run --mode incremental --repo . --scan .llmwiki/run --plan .llmwiki/incremental-plan.json --wiki .llmwiki/wiki` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `kb:publish` | `npm run build --silent && node ./dist/bin/repo-wiki.js publish --wiki .llmwiki/wiki` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `lint:code` | `tsc --project tsconfig.json --noEmit` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `lint:docs` | `npm run build --silent && node ./dist/bin/repo-wiki.js lint-docs --repo . --scan .llmwiki/run` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `lint:local` | `npm run build --silent && node ./dist/bin/repo-wiki.js lint --wiki .llmwiki/wiki --scan .llmwiki/run` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `pack:check` | `npm run build --silent && npm pack --dry-run` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `plan:bootstrap` | `npm run build --silent && node ./dist/bin/repo-wiki.js plan --scan .llmwiki/run --out .llmwiki/bootstrap-plan.json` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `prepack` | `npm run build` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `repo-wiki` | `npm run build --silent && node ./dist/bin/repo-wiki.js` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `scan:bootstrap` | `npm run build --silent && node ./dist/bin/repo-wiki.js scan --mode bootstrap --repo . --out .llmwiki/run` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `self:wiki` | `npm run kb:bootstrap` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `test` | `npm run check` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/package.json) | `repo-wiki` | `test:compiled` | `node ./dist/test/run-compiled-tests.js` |

## Manual verification guidance

Treat extracted scripts as a starting point. Verify the canonical build, test, and run paths against CI workflows, container entrypoints, and deployment configs when they exist.
