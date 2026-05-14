---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "db3dd5c6e2bdb430282661ff44b002d22af0bade"
compiled_at: "2026-05-14T01:16:43.917Z"
kind: "security"
claim_status: "grounded"
source_paths: [".env.example",".github/workflows/changelog-on-merge.yml",".github/workflows/wiki.yml","src/compiler.ts","src/llm-provider.ts","src/publisher.ts","test/compiler.test.ts","test/docs-linter.test.ts","test/dotenv.test.ts","test/extractors-utils.test.ts","test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js","test/llm-provider.test.ts","test/publisher.test.ts","test/scanner.test.ts","test/update-changelog.test.ts"]
confidence: "medium"
page_state: "generated"
---
# Security and Secrets

## Security-sensitive source areas

- [.env.example](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/.env.example) - configuration, source
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/.github/workflows/changelog-on-merge.yml) - ci, configuration
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/.github/workflows/wiki.yml) - ci, configuration
- [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/src/compiler.ts) - api-surface, configuration, source
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/src/llm-provider.ts) - configuration, source
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/src/publisher.ts) - configuration, source
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/test/compiler.test.ts) - configuration, test
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/test/docs-linter.test.ts) - api-surface, configuration, test
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/test/dotenv.test.ts) - configuration, test
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/test/extractors-utils.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js) - api-surface, configuration, source
- [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/test/llm-provider.test.ts) - configuration, test
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/test/publisher.test.ts) - configuration, test
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/test/scanner.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/db3dd5c6e2bdb430282661ff44b002d22af0bade/test/update-changelog.test.ts) - configuration, test

## Policy

- Do not copy secrets or private tokens into wiki pages.
- Cite source paths instead of embedding sensitive source content.
- Require human review before publishing changes to authentication, authorization, billing, or deployment documentation.
