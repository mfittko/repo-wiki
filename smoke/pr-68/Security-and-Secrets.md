---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
compiled_at: "2026-05-10T22:42:14.711Z"
kind: "security"
claim_status: "grounded"
source_paths: [".env",".env.example",".github/workflows/changelog-on-merge.yml",".github/workflows/wiki.yml","src/compiler.ts","src/llm-provider.ts","src/publisher.ts","test/compiler.test.ts","test/docs-linter.test.ts","test/dotenv.test.ts","test/extractors-utils.test.ts","test/publisher.test.ts","test/scanner.test.ts","test/update-changelog.test.ts"]
confidence: "medium"
page_state: "generated"
---
# Security and Secrets

## Security-sensitive source areas

- [.env](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/.env) - configuration, source
- [.env.example](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/.env.example) - configuration, source
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/.github/workflows/changelog-on-merge.yml) - ci, configuration
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/.github/workflows/wiki.yml) - ci, configuration
- [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/src/compiler.ts) - configuration, source
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/src/llm-provider.ts) - configuration, source
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/src/publisher.ts) - configuration, source
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/compiler.test.ts) - configuration, test
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/docs-linter.test.ts) - api-surface, configuration, test
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/dotenv.test.ts) - configuration, test
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/extractors-utils.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/publisher.test.ts) - configuration, test
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/scanner.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/update-changelog.test.ts) - configuration, test

## Policy

- Do not copy secrets or private tokens into wiki pages.
- Cite source paths instead of embedding sensitive source content.
- Require human review before publishing changes to authentication, authorization, billing, or deployment documentation.
