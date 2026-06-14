---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "4876d92ad775fdaa882464db71be1c1ed241f47f"
compiled_at: "2026-06-14T00:48:58.158Z"
kind: "security"
claim_status: "grounded"
source_paths: [".env.example",".github/workflows/changelog-on-merge.yml",".github/workflows/review-context.yml",".github/workflows/wiki.yml","scripts/attach-review-context.mjs","src/compiler.ts","src/llm-provider.ts","src/publisher.ts","test/compiler.test.ts","test/docs-linter.test.ts","test/dotenv.test.ts","test/extractors-utils.test.ts","test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js","test/llm-provider.test.ts","test/publisher.test.ts","test/review-context.test.ts","test/scanner.test.ts","test/update-changelog.test.ts"]
confidence: "medium"
page_state: "generated"
---
# Security and Secrets

## Security-sensitive source areas

- [.env.example](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/.env.example) - configuration, source
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/.github/workflows/changelog-on-merge.yml) - ci, configuration
- [.github/workflows/review-context.yml](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/.github/workflows/review-context.yml) - ci, configuration
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/.github/workflows/wiki.yml) - ci, configuration
- [scripts/attach-review-context.mjs](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/scripts/attach-review-context.mjs) - configuration, source
- [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/src/compiler.ts) - api-surface, configuration, source
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/src/llm-provider.ts) - configuration, source
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/src/publisher.ts) - configuration, source
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/test/compiler.test.ts) - api-surface, configuration, test
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/test/docs-linter.test.ts) - api-surface, configuration, test
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/test/dotenv.test.ts) - configuration, test
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/test/extractors-utils.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js) - api-surface, configuration, source
- [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/test/llm-provider.test.ts) - configuration, test
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/test/publisher.test.ts) - configuration, test
- [test/review-context.test.ts](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/test/review-context.test.ts) - configuration, test
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/test/scanner.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/4876d92ad775fdaa882464db71be1c1ed241f47f/test/update-changelog.test.ts) - configuration, test

## Policy

- Do not copy secrets or private tokens into wiki pages.
- Cite source paths instead of embedding sensitive source content.
- Require human review before publishing changes to authentication, authorization, billing, or deployment documentation.
