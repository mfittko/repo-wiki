---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "abdb6f4647291d3179248fa6e7f94856f53ec49c"
compiled_at: "2026-05-10T17:16:36.233Z"
kind: "testing_strategy"
claim_status: "grounded"
source_paths: ["src/cli.ts","src/compiler.ts","src/context-assembler.ts","src/docs-linter.ts","src/frontmatter.ts","src/linter.ts","src/llm-provider.ts","src/page-ownership.ts","src/publisher.ts","src/repository-analysis.ts","src/scanner.ts","src/wiki-patch.ts","test/cli.test.ts","test/compiler.test.ts","test/context-assembler.test.ts","test/docs-linter.test.ts","test/dotenv.test.ts","test/extractors-go.test.ts","test/extractors-rust.test.ts","test/extractors-utils.test.ts","test/frontmatter.test.ts","test/init-planner.test.ts","test/linter.test.ts","test/llm-provider.test.ts","test/page-ownership.test.ts","test/publisher.test.ts","test/repository-analysis.test.ts","test/scanner.test.ts","test/update-changelog.test.ts","test/wiki-patch.test.ts"]
confidence: "high"
page_state: "generated"
---
# Testing Strategy

## Detected test files

- [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/cli.test.ts)
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/compiler.test.ts)
- [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/context-assembler.test.ts)
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/docs-linter.test.ts)
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/dotenv.test.ts)
- [test/extractors-go.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/extractors-go.test.ts)
- [test/extractors-rust.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/extractors-rust.test.ts)
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/extractors-utils.test.ts)
- [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/frontmatter.test.ts)
- [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/init-planner.test.ts)
- [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/linter.test.ts)
- [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/llm-provider.test.ts)
- [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/page-ownership.test.ts)
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/publisher.test.ts)
- [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/repository-analysis.test.ts)
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/scanner.test.ts)
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/update-changelog.test.ts)
- [test/wiki-patch.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/wiki-patch.test.ts)

## Test-to-source mappings

- Mapped tests: 12
- Source files covered: 12

| Test | Source files | Heuristics |
| --- | --- | --- |
| [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/cli.test.ts) | [src/cli.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/src/cli.ts) | filename_affinity |
| [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/compiler.test.ts) | [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/src/compiler.ts) | filename_affinity |
| [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/context-assembler.test.ts) | [src/context-assembler.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/src/context-assembler.ts) | filename_affinity |
| [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/docs-linter.test.ts) | [src/docs-linter.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/src/docs-linter.ts) | filename_affinity |
| [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/frontmatter.test.ts) | [src/frontmatter.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/src/frontmatter.ts) | filename_affinity |
| [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/linter.test.ts) | [src/linter.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/src/linter.ts) | filename_affinity |
| [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/llm-provider.test.ts) | [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/src/llm-provider.ts) | filename_affinity |
| [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/page-ownership.test.ts) | [src/page-ownership.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/src/page-ownership.ts) | filename_affinity |
| [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/publisher.test.ts) | [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/src/publisher.ts) | filename_affinity |
| [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/repository-analysis.test.ts) | [src/repository-analysis.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/src/repository-analysis.ts) | filename_affinity |
| [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/scanner.test.ts) | [src/scanner.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/src/scanner.ts) | filename_affinity |
| [test/wiki-patch.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/wiki-patch.test.ts) | [src/wiki-patch.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/src/wiki-patch.ts) | filename_affinity |
