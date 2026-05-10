---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "0604877d3099270286da69c1cf111e77cb0f81b8"
compiled_at: "2026-05-10T08:42:10.989Z"
kind: "testing_strategy"
page_state: "generated"
---
# Testing Strategy

## Detected test files

- [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/cli.test.ts)
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/compiler.test.ts)
- [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/context-assembler.test.ts)
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/docs-linter.test.ts)
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/dotenv.test.ts)
- [test/extractors-go.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-go.test.ts)
- [test/extractors-rust.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-rust.test.ts)
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts)
- [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/frontmatter.test.ts)
- [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/init-planner.test.ts)
- [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/linter.test.ts)
- [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/llm-provider.test.ts)
- [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/page-ownership.test.ts)
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/publisher.test.ts)
- [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/repository-analysis.test.ts)
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/scanner.test.ts)
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/update-changelog.test.ts)
- [test/wiki-patch.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/wiki-patch.test.ts)

## Test-to-source mappings

- Mapped tests: 12
- Source files covered: 12

| Test | Source files | Heuristics |
| --- | --- | --- |
| [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/cli.test.ts) | [src/cli.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/cli.ts) | filename_affinity |
| [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/compiler.test.ts) | [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/compiler.ts) | filename_affinity |
| [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/context-assembler.test.ts) | [src/context-assembler.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/context-assembler.ts) | filename_affinity |
| [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/docs-linter.test.ts) | [src/docs-linter.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/docs-linter.ts) | filename_affinity |
| [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/frontmatter.test.ts) | [src/frontmatter.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/frontmatter.ts) | filename_affinity |
| [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/linter.test.ts) | [src/linter.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/linter.ts) | filename_affinity |
| [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/llm-provider.test.ts) | [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/llm-provider.ts) | filename_affinity |
| [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/page-ownership.test.ts) | [src/page-ownership.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/page-ownership.ts) | filename_affinity |
| [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/publisher.test.ts) | [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/publisher.ts) | filename_affinity |
| [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/repository-analysis.test.ts) | [src/repository-analysis.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/repository-analysis.ts) | filename_affinity |
| [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/scanner.test.ts) | [src/scanner.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/scanner.ts) | filename_affinity |
| [test/wiki-patch.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/wiki-patch.test.ts) | [src/wiki-patch.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/wiki-patch.ts) | filename_affinity |
