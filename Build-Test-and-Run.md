---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "64636a87dfde6c5a3055391035a1bb4598fc5c10"
compiled_at: "2026-05-14T14:52:54.265Z"
kind: "build_test_run"
claim_status: "grounded"
source_paths: [".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml","package.json","test/fixtures/compiler-e2e/basic-node-service/repo/.github/workflows/ci.yml","test/fixtures/compiler-e2e/basic-node-service/repo/package.json","test/fixtures/compiler-e2e/docs-only-module-downgrade/repo/package.json"]
confidence: "high"
page_state: "generated"
---
# Build, Test, and Run

## Detected package manifests

- [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json)
- [test/fixtures/compiler-e2e/basic-node-service/repo/package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/test/fixtures/compiler-e2e/basic-node-service/repo/package.json)
- [test/fixtures/compiler-e2e/docs-only-module-downgrade/repo/package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/test/fixtures/compiler-e2e/docs-only-module-downgrade/repo/package.json)

## Detected CI files

- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-on-merge.yml)
- [.github/workflows/changelog-release.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-release.yml)
- [.github/workflows/ci.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/ci.yml)
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/wiki.yml)
- [test/fixtures/compiler-e2e/basic-node-service/repo/.github/workflows/ci.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/test/fixtures/compiler-e2e/basic-node-service/repo/.github/workflows/ci.yml)

## Package scripts

- Package manifests with scripts: 3
- Scripts detected: 26

| Manifest | Package | Script | Command |
| --- | --- | --- | --- |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L34) | `repo-wiki` | `build` | `tsc --project tsconfig.json` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L52) | `repo-wiki` | `changelog:ensure` | `node ./scripts/update-changelog.mjs ensure` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L53) | `repo-wiki` | `changelog:release` | `node ./scripts/update-changelog.mjs release` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L54) | `repo-wiki` | `changelog:update` | `node ./scripts/update-changelog.mjs update` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L38) | `repo-wiki` | `check` | `npm run build && npm run test:compiled` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L32) | `repo-wiki` | `clean` | `rm -rf dist .tsbuildinfo` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L43) | `repo-wiki` | `compile:local` | `npm run build --silent && node ./dist/bin/repo-wiki.js compile --scan .llmwiki/run --plan .llmwiki/bootstrap-plan.json --wiki .llmwiki/wiki` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L37) | `repo-wiki` | `coverage` | `npm run build && npm run coverage:compiled` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L36) | `repo-wiki` | `coverage:compiled` | `c8 --include=dist/src/**/*.js --reporter=text --check-coverage --lines 95 node ./dist/test/run-compiled-tests.js` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L45) | `repo-wiki` | `kb:bootstrap` | `npm run build --silent && node ./dist/bin/repo-wiki.js run --mode bootstrap --repo . --scan .llmwiki/run --plan .llmwiki/bootstrap-plan.json --wiki .llmwiki/wiki` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L46) | `repo-wiki` | `kb:incremental` | `npm run build --silent && node ./dist/bin/repo-wiki.js run --mode incremental --repo . --scan .llmwiki/run --plan .llmwiki/incremental-plan.json --wiki .llmwiki/wiki` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L47) | `repo-wiki` | `kb:publish` | `npm run build --silent && node ./dist/bin/repo-wiki.js publish --wiki .llmwiki/wiki` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L33) | `repo-wiki` | `lint:code` | `tsc --project tsconfig.json --noEmit` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L50) | `repo-wiki` | `lint:docs` | `npm run build --silent && node ./dist/bin/repo-wiki.js lint-docs --repo . --scan .llmwiki/run` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L44) | `repo-wiki` | `lint:local` | `npm run build --silent && node ./dist/bin/repo-wiki.js lint --wiki .llmwiki/wiki --scan .llmwiki/run` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L49) | `repo-wiki` | `pack:check` | `npm run build --silent && npm pack --dry-run` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L42) | `repo-wiki` | `plan:bootstrap` | `npm run build --silent && node ./dist/bin/repo-wiki.js plan --scan .llmwiki/run --out .llmwiki/bootstrap-plan.json` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L51) | `repo-wiki` | `prepack` | `npm run build` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L40) | `repo-wiki` | `repo-wiki` | `npm run build --silent && node ./dist/bin/repo-wiki.js` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L41) | `repo-wiki` | `scan:bootstrap` | `npm run build --silent && node ./dist/bin/repo-wiki.js scan --mode bootstrap --repo . --out .llmwiki/run` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L48) | `repo-wiki` | `self:wiki` | `npm run kb:bootstrap` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L39) | `repo-wiki` | `test` | `npm run check` |
| [package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/package.json#L35) | `repo-wiki` | `test:compiled` | `node ./dist/test/run-compiled-tests.js` |
| [test/fixtures/compiler-e2e/basic-node-service/repo/package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/test/fixtures/compiler-e2e/basic-node-service/repo/package.json#L5) | `basic-node-service-fixture` | `build` | `node ./infra/deploy.js` |
| [test/fixtures/compiler-e2e/basic-node-service/repo/package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/test/fixtures/compiler-e2e/basic-node-service/repo/package.json#L6) | `basic-node-service-fixture` | `test` | `node --test` |
| [test/fixtures/compiler-e2e/docs-only-module-downgrade/repo/package.json](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/test/fixtures/compiler-e2e/docs-only-module-downgrade/repo/package.json#L5) | `docs-only-fixture` | `test` | `echo docs` |

## CI workflow commands

- Commands detected: 38

| Source | Command |
| --- | --- |
| [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-on-merge.yml#L33) | `echo "No changelog update needed` |
| [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-on-merge.yml#L34) | `exit 0` |
| [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-on-merge.yml#L36) | `git config user.name "github-actions[bot]` |
| [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-on-merge.yml#L37) | `git config user.email "41898282+github-actions[bot]@users.noreply.github.com` |
| [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-on-merge.yml#L38) | `git add CHANGELOG.md` |
| [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-on-merge.yml#L40) | `git push origin HEAD:main` |
| [.github/workflows/changelog-release.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-release.yml#L39) | `version="${version#v}` |
| [.github/workflows/changelog-release.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-release.yml#L40) | `date="$(date -u +%F)` |
| [.github/workflows/changelog-release.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-release.yml#L43) | `date="$(date -u +%F)` |
| [.github/workflows/changelog-release.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-release.yml#L45) | `echo "version=$version" >> "$GITHUB_OUTPUT` |
| [.github/workflows/changelog-release.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-release.yml#L46) | `echo "date=$date" >> "$GITHUB_OUTPUT` |
| [.github/workflows/changelog-release.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-release.yml#L54) | `echo "No changelog rotation needed` |
| [.github/workflows/changelog-release.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-release.yml#L55) | `exit 0` |
| [.github/workflows/changelog-release.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-release.yml#L57) | `git config user.name "github-actions[bot]` |
| [.github/workflows/changelog-release.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-release.yml#L58) | `git config user.email "41898282+github-actions[bot]@users.noreply.github.com` |
| [.github/workflows/changelog-release.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-release.yml#L59) | `git add CHANGELOG.md` |
| [.github/workflows/changelog-release.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/changelog-release.yml#L61) | `git push origin HEAD:main` |
| [.github/workflows/ci.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/ci.yml#L21) | `npm ci` |
| [.github/workflows/ci.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/ci.yml#L24) | `npm run lint:code` |
| [.github/workflows/ci.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/ci.yml#L35) | `npm run check` |
| [.github/workflows/ci.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/ci.yml#L37) | `npm run coverage` |
| [.github/workflows/ci.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/ci.yml#L39) | `npm run pack:check` |
| [.github/workflows/ci.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/ci.yml#L49) | `npm ci` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/wiki.yml#L42) | `npm ci` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/wiki.yml#L45) | `npm run build` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/wiki.yml#L52) | `echo "MODE=incremental" >> "$GITHUB_ENV` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/wiki.yml#L56) | `node ./dist/bin/repo-wiki.js scan --mode "$MODE" --repo . --out .llmwiki/run` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/wiki.yml#L59) | `node ./dist/bin/repo-wiki.js plan --scan .llmwiki/run --out .llmwiki/plan.json` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/wiki.yml#L79) | `node ./dist/bin/repo-wiki.js compile --scan .llmwiki/run --plan .llmwiki/plan.json --wiki .llmwiki/wiki` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/wiki.yml#L82) | `node ./dist/bin/repo-wiki.js lint --wiki .llmwiki/wiki --scan .llmwiki/run` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/wiki.yml#L104) | `npm ci` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/wiki.yml#L105) | `npm run build` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/wiki.yml#L115) | `node ./dist/bin/repo-wiki.js publish --target github-wiki --wiki .llmwiki/wiki` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/wiki.yml#L132) | `npm ci` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/wiki.yml#L133) | `npm run build` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/.github/workflows/wiki.yml#L144) | `node ./dist/bin/repo-wiki.js publish --target github-pages --wiki .llmwiki/wiki --branch gh-pages --pages-path "$PAGES_PATH` |
| [test/fixtures/compiler-e2e/basic-node-service/repo/.github/workflows/ci.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/test/fixtures/compiler-e2e/basic-node-service/repo/.github/workflows/ci.yml#L8) | `npm ci` |
| [test/fixtures/compiler-e2e/basic-node-service/repo/.github/workflows/ci.yml](https://github.com/mfittko/repo-wiki/blob/64636a87dfde6c5a3055391035a1bb4598fc5c10/test/fixtures/compiler-e2e/basic-node-service/repo/.github/workflows/ci.yml#L9) | `npm test` |

## Manual verification guidance

Treat extracted scripts as a starting point. Verify the canonical build, test, and run paths against CI workflows, container entrypoints, and deployment configs when they exist.
