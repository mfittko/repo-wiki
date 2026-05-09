---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "7cfbc938941623f13ab3a22b03aaeddd588e8d5a"
compiled_at: "2026-05-09T23:33:50.494Z"
kind: "testing_strategy"
page_state: "generated"
---
# Testing Strategy

## Detected test files

- [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/cli.test.ts)
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/compiler.test.ts)
- [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/context-assembler.test.ts)
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/docs-linter.test.ts)
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/dotenv.test.ts)
- [test/extractors-go.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/extractors-go.test.ts)
- [test/extractors-rust.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/extractors-rust.test.ts)
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/extractors-utils.test.ts)
- [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/frontmatter.test.ts)
- [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/init-planner.test.ts)
- [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/linter.test.ts)
- [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/llm-provider.test.ts)
- [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/page-ownership.test.ts)
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/publisher.test.ts)
- [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/repository-analysis.test.ts)
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/scanner.test.ts)
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/update-changelog.test.ts)

## Test-to-source mappings

- Mapped tests: 11
- Source files covered: 11

| Test | Source files | Heuristics |
| --- | --- | --- |
| [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/cli.test.ts) | [src/cli.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/src/cli.ts) | filename_affinity |
| [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/compiler.test.ts) | [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/src/compiler.ts) | filename_affinity |
| [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/context-assembler.test.ts) | [src/context-assembler.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/src/context-assembler.ts) | filename_affinity |
| [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/docs-linter.test.ts) | [src/docs-linter.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/src/docs-linter.ts) | filename_affinity |
| [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/frontmatter.test.ts) | [src/frontmatter.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/src/frontmatter.ts) | filename_affinity |
| [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/linter.test.ts) | [src/linter.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/src/linter.ts) | filename_affinity |
| [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/llm-provider.test.ts) | [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/src/llm-provider.ts) | filename_affinity |
| [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/page-ownership.test.ts) | [src/page-ownership.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/src/page-ownership.ts) | filename_affinity |
| [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/publisher.test.ts) | [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/src/publisher.ts) | filename_affinity |
| [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/repository-analysis.test.ts) | [src/repository-analysis.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/src/repository-analysis.ts) | filename_affinity |
| [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/test/scanner.test.ts) | [src/scanner.ts](https://github.com/mfittko/repo-wiki/blob/7cfbc938941623f13ab3a22b03aaeddd588e8d5a/src/scanner.ts) | filename_affinity |
