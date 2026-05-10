---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "2ce19fbe28dc7fd82aa053ba642325b8a9e91f02"
compiled_at: "2026-05-10T22:25:53.509Z"
kind: "security"
claim_status: "grounded"
source_paths: [".env.example",".github/workflows/changelog-on-merge.yml",".github/workflows/wiki.yml","src/compiler.ts","src/llm-provider.ts","src/publisher.ts","test/compiler.test.ts","test/docs-linter.test.ts","test/dotenv.test.ts","test/extractors-utils.test.ts","test/publisher.test.ts","test/scanner.test.ts","test/update-changelog.test.ts"]
confidence: "medium"
page_state: "generated"
---
# Security and Secrets

## Security-sensitive source areas

- [.env.example](https://github.com/mfittko/repo-wiki/blob/2ce19fbe28dc7fd82aa053ba642325b8a9e91f02/.env.example) - configuration, source
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/2ce19fbe28dc7fd82aa053ba642325b8a9e91f02/.github/workflows/changelog-on-merge.yml) - ci, configuration
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/2ce19fbe28dc7fd82aa053ba642325b8a9e91f02/.github/workflows/wiki.yml) - ci, configuration
- [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/2ce19fbe28dc7fd82aa053ba642325b8a9e91f02/src/compiler.ts) - configuration, source
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/2ce19fbe28dc7fd82aa053ba642325b8a9e91f02/src/llm-provider.ts) - configuration, source
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/2ce19fbe28dc7fd82aa053ba642325b8a9e91f02/src/publisher.ts) - configuration, source
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/2ce19fbe28dc7fd82aa053ba642325b8a9e91f02/test/compiler.test.ts) - configuration, test
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/2ce19fbe28dc7fd82aa053ba642325b8a9e91f02/test/docs-linter.test.ts) - api-surface, configuration, test
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/2ce19fbe28dc7fd82aa053ba642325b8a9e91f02/test/dotenv.test.ts) - configuration, test
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/2ce19fbe28dc7fd82aa053ba642325b8a9e91f02/test/extractors-utils.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/2ce19fbe28dc7fd82aa053ba642325b8a9e91f02/test/publisher.test.ts) - configuration, test
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/2ce19fbe28dc7fd82aa053ba642325b8a9e91f02/test/scanner.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/2ce19fbe28dc7fd82aa053ba642325b8a9e91f02/test/update-changelog.test.ts) - configuration, test

## Policy

- Do not copy secrets or private tokens into wiki pages.
- Cite source paths instead of embedding sensitive source content.
- Require human review before publishing changes to authentication, authorization, billing, or deployment documentation.
