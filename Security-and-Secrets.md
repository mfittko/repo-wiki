---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "0604877d3099270286da69c1cf111e77cb0f81b8"
compiled_at: "2026-05-10T08:42:10.997Z"
kind: "security"
page_state: "generated"
---
# Security and Secrets

## Security-sensitive source areas

- [.env.example](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/.env.example) - configuration, source
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/.github/workflows/changelog-on-merge.yml) - ci, configuration
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/.github/workflows/wiki.yml) - ci, configuration
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/llm-provider.ts) - configuration, source
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/publisher.ts) - configuration, source
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/docs-linter.test.ts) - configuration, test
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/dotenv.test.ts) - configuration, test
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/publisher.test.ts) - configuration, test
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/scanner.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/update-changelog.test.ts) - configuration, test

## Policy

- Do not copy secrets or private tokens into wiki pages.
- Cite source paths instead of embedding sensitive source content.
- Require human review before publishing changes to authentication, authorization, billing, or deployment documentation.
