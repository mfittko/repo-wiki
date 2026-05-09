---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "57f31fb6202a15b1b0598d7ae36a693c21359721"
compiled_at: "2026-05-09T23:55:11.606Z"
kind: "security"
page_state: "generated"
---
# Security and Secrets

## Security-sensitive source areas

- [.env.example](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/.env.example) - configuration, source
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/.github/workflows/changelog-on-merge.yml) - ci, configuration
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/.github/workflows/wiki.yml) - ci, configuration
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/src/llm-provider.ts) - configuration, source
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/src/publisher.ts) - configuration, source
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/docs-linter.test.ts) - configuration, test
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/dotenv.test.ts) - configuration, test
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/extractors-utils.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/publisher.test.ts) - configuration, test
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/scanner.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/update-changelog.test.ts) - configuration, test

## Policy

- Do not copy secrets or private tokens into wiki pages.
- Cite source paths instead of embedding sensitive source content.
- Require human review before publishing changes to authentication, authorization, billing, or deployment documentation.
