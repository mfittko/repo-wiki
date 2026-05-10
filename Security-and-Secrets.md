---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "b8cbf96e1f992a8d3818f45b712ece4f64b11535"
compiled_at: "2026-05-10T16:00:12.221Z"
kind: "security"
page_state: "generated"
---
# Security and Secrets

## Security-sensitive source areas

- [.env.example](https://github.com/mfittko/repo-wiki/blob/b8cbf96e1f992a8d3818f45b712ece4f64b11535/.env.example) - configuration, source
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/b8cbf96e1f992a8d3818f45b712ece4f64b11535/.github/workflows/changelog-on-merge.yml) - ci, configuration
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/b8cbf96e1f992a8d3818f45b712ece4f64b11535/.github/workflows/wiki.yml) - ci, configuration
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/b8cbf96e1f992a8d3818f45b712ece4f64b11535/src/llm-provider.ts) - configuration, source
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/b8cbf96e1f992a8d3818f45b712ece4f64b11535/src/publisher.ts) - configuration, source
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/b8cbf96e1f992a8d3818f45b712ece4f64b11535/test/docs-linter.test.ts) - api-surface, configuration, test
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/b8cbf96e1f992a8d3818f45b712ece4f64b11535/test/dotenv.test.ts) - configuration, test
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/b8cbf96e1f992a8d3818f45b712ece4f64b11535/test/extractors-utils.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/b8cbf96e1f992a8d3818f45b712ece4f64b11535/test/publisher.test.ts) - configuration, test
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/b8cbf96e1f992a8d3818f45b712ece4f64b11535/test/scanner.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/b8cbf96e1f992a8d3818f45b712ece4f64b11535/test/update-changelog.test.ts) - configuration, test

## Policy

- Do not copy secrets or private tokens into wiki pages.
- Cite source paths instead of embedding sensitive source content.
- Require human review before publishing changes to authentication, authorization, billing, or deployment documentation.
