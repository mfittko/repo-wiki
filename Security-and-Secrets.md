---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "ea1e8dd9452865235cc07cb3c68da8017c735bab"
compiled_at: "2026-05-10T00:06:23.579Z"
kind: "security"
page_state: "generated"
---
# Security and Secrets

## Security-sensitive source areas

- [.env.example](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/.env.example) - configuration, source
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/.github/workflows/changelog-on-merge.yml) - ci, configuration
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/.github/workflows/wiki.yml) - ci, configuration
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/src/llm-provider.ts) - configuration, source
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/src/publisher.ts) - configuration, source
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/docs-linter.test.ts) - configuration, test
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/dotenv.test.ts) - configuration, test
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/extractors-utils.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/publisher.test.ts) - configuration, test
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/scanner.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/update-changelog.test.ts) - configuration, test

## Policy

- Do not copy secrets or private tokens into wiki pages.
- Cite source paths instead of embedding sensitive source content.
- Require human review before publishing changes to authentication, authorization, billing, or deployment documentation.
