---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "8aa93c6e99a61f3c2d7a6b527fc351443c0d7c1c"
compiled_at: "2026-05-10T06:11:31.858Z"
kind: "security"
page_state: "generated"
---
# Security and Secrets

## Security-sensitive source areas

- [.env.example](https://github.com/mfittko/repo-wiki/blob/8aa93c6e99a61f3c2d7a6b527fc351443c0d7c1c/.env.example) - configuration, source
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/8aa93c6e99a61f3c2d7a6b527fc351443c0d7c1c/.github/workflows/changelog-on-merge.yml) - ci, configuration
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/8aa93c6e99a61f3c2d7a6b527fc351443c0d7c1c/.github/workflows/wiki.yml) - ci, configuration
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/8aa93c6e99a61f3c2d7a6b527fc351443c0d7c1c/src/llm-provider.ts) - configuration, source
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/8aa93c6e99a61f3c2d7a6b527fc351443c0d7c1c/src/publisher.ts) - configuration, source
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/8aa93c6e99a61f3c2d7a6b527fc351443c0d7c1c/test/docs-linter.test.ts) - configuration, test
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/8aa93c6e99a61f3c2d7a6b527fc351443c0d7c1c/test/dotenv.test.ts) - configuration, test
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/8aa93c6e99a61f3c2d7a6b527fc351443c0d7c1c/test/extractors-utils.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/8aa93c6e99a61f3c2d7a6b527fc351443c0d7c1c/test/publisher.test.ts) - configuration, test
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/8aa93c6e99a61f3c2d7a6b527fc351443c0d7c1c/test/scanner.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/8aa93c6e99a61f3c2d7a6b527fc351443c0d7c1c/test/update-changelog.test.ts) - configuration, test

## Policy

- Do not copy secrets or private tokens into wiki pages.
- Cite source paths instead of embedding sensitive source content.
- Require human review before publishing changes to authentication, authorization, billing, or deployment documentation.
