---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "f6fa9cd8d40529ec9635fe39175ec63f3a861bfc"
compiled_at: "2026-05-09T23:44:16.154Z"
kind: "security"
page_state: "generated"
---
# Security and Secrets

## Security-sensitive source areas

- [.env.example](https://github.com/mfittko/repo-wiki/blob/f6fa9cd8d40529ec9635fe39175ec63f3a861bfc/.env.example) - configuration, source
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/f6fa9cd8d40529ec9635fe39175ec63f3a861bfc/.github/workflows/changelog-on-merge.yml) - ci, configuration
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/f6fa9cd8d40529ec9635fe39175ec63f3a861bfc/.github/workflows/wiki.yml) - ci, configuration
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/f6fa9cd8d40529ec9635fe39175ec63f3a861bfc/src/llm-provider.ts) - configuration, source
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/f6fa9cd8d40529ec9635fe39175ec63f3a861bfc/src/publisher.ts) - configuration, source
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/f6fa9cd8d40529ec9635fe39175ec63f3a861bfc/test/docs-linter.test.ts) - configuration, test
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/f6fa9cd8d40529ec9635fe39175ec63f3a861bfc/test/dotenv.test.ts) - configuration, test
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/f6fa9cd8d40529ec9635fe39175ec63f3a861bfc/test/extractors-utils.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/f6fa9cd8d40529ec9635fe39175ec63f3a861bfc/test/publisher.test.ts) - configuration, test
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/f6fa9cd8d40529ec9635fe39175ec63f3a861bfc/test/scanner.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/f6fa9cd8d40529ec9635fe39175ec63f3a861bfc/test/update-changelog.test.ts) - configuration, test

## Policy

- Do not copy secrets or private tokens into wiki pages.
- Cite source paths instead of embedding sensitive source content.
- Require human review before publishing changes to authentication, authorization, billing, or deployment documentation.
