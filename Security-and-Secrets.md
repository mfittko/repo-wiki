---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "73d2678ea962143138b0ea2c5c2afd3eb79dd847"
compiled_at: "2026-05-13T17:29:32.095Z"
kind: "security"
claim_status: "grounded"
source_paths: [".env.example",".github/workflows/changelog-on-merge.yml",".github/workflows/wiki.yml","src/compiler.ts","src/llm-provider.ts","src/publisher.ts","test/compiler.test.ts","test/docs-linter.test.ts","test/dotenv.test.ts","test/extractors-utils.test.ts","test/llm-provider.test.ts","test/publisher.test.ts","test/scanner.test.ts","test/update-changelog.test.ts"]
confidence: "medium"
page_state: "generated"
---
# Security and Secrets

## Security-sensitive source areas

- [.env.example](https://github.com/mfittko/repo-wiki/blob/73d2678ea962143138b0ea2c5c2afd3eb79dd847/.env.example) - configuration, source
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/73d2678ea962143138b0ea2c5c2afd3eb79dd847/.github/workflows/changelog-on-merge.yml) - ci, configuration
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/73d2678ea962143138b0ea2c5c2afd3eb79dd847/.github/workflows/wiki.yml) - ci, configuration
- [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/73d2678ea962143138b0ea2c5c2afd3eb79dd847/src/compiler.ts) - api-surface, configuration, source
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/73d2678ea962143138b0ea2c5c2afd3eb79dd847/src/llm-provider.ts) - configuration, source
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/73d2678ea962143138b0ea2c5c2afd3eb79dd847/src/publisher.ts) - configuration, source
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/73d2678ea962143138b0ea2c5c2afd3eb79dd847/test/compiler.test.ts) - configuration, test
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/73d2678ea962143138b0ea2c5c2afd3eb79dd847/test/docs-linter.test.ts) - api-surface, configuration, test
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/73d2678ea962143138b0ea2c5c2afd3eb79dd847/test/dotenv.test.ts) - configuration, test
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/73d2678ea962143138b0ea2c5c2afd3eb79dd847/test/extractors-utils.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/73d2678ea962143138b0ea2c5c2afd3eb79dd847/test/llm-provider.test.ts) - configuration, test
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/73d2678ea962143138b0ea2c5c2afd3eb79dd847/test/publisher.test.ts) - configuration, test
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/73d2678ea962143138b0ea2c5c2afd3eb79dd847/test/scanner.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/73d2678ea962143138b0ea2c5c2afd3eb79dd847/test/update-changelog.test.ts) - configuration, test

## Policy

- Do not copy secrets or private tokens into wiki pages.
- Cite source paths instead of embedding sensitive source content.
- Require human review before publishing changes to authentication, authorization, billing, or deployment documentation.
