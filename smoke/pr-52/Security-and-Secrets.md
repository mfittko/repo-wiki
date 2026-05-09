---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "b53c0639ff3f1e1d616403ddd6e297456e7a5c27"
compiled_at: "2026-05-09T23:16:22.626Z"
kind: "security"
page_state: "generated"
---
# Security and Secrets

## Security-sensitive source areas

- [.env.example](https://github.com/mfittko/repo-wiki/blob/b53c0639ff3f1e1d616403ddd6e297456e7a5c27/.env.example) - configuration, source
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/b53c0639ff3f1e1d616403ddd6e297456e7a5c27/.github/workflows/changelog-on-merge.yml) - ci, configuration
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/b53c0639ff3f1e1d616403ddd6e297456e7a5c27/.github/workflows/wiki.yml) - ci, configuration
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/b53c0639ff3f1e1d616403ddd6e297456e7a5c27/src/llm-provider.ts) - configuration, source
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/b53c0639ff3f1e1d616403ddd6e297456e7a5c27/src/publisher.ts) - configuration, source
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/b53c0639ff3f1e1d616403ddd6e297456e7a5c27/test/docs-linter.test.ts) - configuration, test
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/b53c0639ff3f1e1d616403ddd6e297456e7a5c27/test/dotenv.test.ts) - configuration, test
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/b53c0639ff3f1e1d616403ddd6e297456e7a5c27/test/extractors-utils.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/b53c0639ff3f1e1d616403ddd6e297456e7a5c27/test/publisher.test.ts) - configuration, test
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/b53c0639ff3f1e1d616403ddd6e297456e7a5c27/test/scanner.test.ts) - api-surface, configuration, data-model, orm-model, test
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/b53c0639ff3f1e1d616403ddd6e297456e7a5c27/test/update-changelog.test.ts) - configuration, test

## Policy

- Do not copy secrets or private tokens into wiki pages.
- Cite source paths instead of embedding sensitive source content.
- Require human review before publishing changes to authentication, authorization, billing, or deployment documentation.
