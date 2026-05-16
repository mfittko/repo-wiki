---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "c5432024529f5133bed4df4fd18ec2b67d908b7e"
compiled_at: "2026-05-16T12:55:26.012Z"
kind: "testing_strategy"
claim_status: "grounded"
source_paths: ["src/cli.ts","src/compiler.ts","src/context-assembler.ts","src/docs-linter.ts","src/frontmatter.ts","src/linter.ts","src/llm-provider.ts","src/page-ownership.ts","src/publisher.ts","src/repository-analysis.ts","src/scanner.ts","src/search.ts","src/wiki-graph.ts","src/wiki-patch.ts","test/cli.test.ts","test/compiler-eval.test.ts","test/compiler.test.ts","test/context-assembler.test.ts","test/docs-linter.test.ts","test/dotenv.test.ts","test/extractors-go.test.ts","test/extractors-rust.test.ts","test/extractors-utils.test.ts","test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js","test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js","test/frontmatter.test.ts","test/init-planner.test.ts","test/linter.test.ts","test/llm-provider.test.ts","test/page-ownership.test.ts","test/publisher.test.ts","test/repository-analysis.test.ts","test/scanner.test.ts","test/search.test.ts","test/update-changelog.test.ts","test/wiki-graph.test.ts","test/wiki-patch.test.ts"]
confidence: "high"
page_state: "generated"
---
# Testing Strategy

## Detected test files

- [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/cli.test.ts)
- [test/compiler-eval.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/compiler-eval.test.ts)
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/compiler.test.ts)
- [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/context-assembler.test.ts)
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/docs-linter.test.ts)
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/dotenv.test.ts)
- [test/extractors-go.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/extractors-go.test.ts)
- [test/extractors-rust.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/extractors-rust.test.ts)
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/extractors-utils.test.ts)
- [test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js)
- [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/frontmatter.test.ts)
- [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/init-planner.test.ts)
- [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/linter.test.ts)
- [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/llm-provider.test.ts)
- [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/page-ownership.test.ts)
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/publisher.test.ts)
- [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/repository-analysis.test.ts)
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/scanner.test.ts)
- [test/search.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/search.test.ts)
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/update-changelog.test.ts)
- [test/wiki-graph.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/wiki-graph.test.ts)
- [test/wiki-patch.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/wiki-patch.test.ts)

## Test-to-source mappings

- Mapped tests: 15
- Source files covered: 15

| Test | Source files | Heuristics |
| --- | --- | --- |
| [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/cli.test.ts) | [src/cli.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/src/cli.ts) | filename_affinity |
| [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/compiler.test.ts) | [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/src/compiler.ts) | filename_affinity |
| [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/context-assembler.test.ts) | [src/context-assembler.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/src/context-assembler.ts) | filename_affinity |
| [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/docs-linter.test.ts) | [src/docs-linter.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/src/docs-linter.ts) | filename_affinity |
| [test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js) | [test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js) | imports |
| [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/frontmatter.test.ts) | [src/frontmatter.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/src/frontmatter.ts) | filename_affinity |
| [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/linter.test.ts) | [src/linter.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/src/linter.ts) | filename_affinity |
| [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/llm-provider.test.ts) | [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/src/llm-provider.ts) | filename_affinity |
| [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/page-ownership.test.ts) | [src/page-ownership.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/src/page-ownership.ts) | filename_affinity |
| [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/publisher.test.ts) | [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/src/publisher.ts) | filename_affinity |
| [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/repository-analysis.test.ts) | [src/repository-analysis.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/src/repository-analysis.ts) | filename_affinity |
| [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/scanner.test.ts) | [src/scanner.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/src/scanner.ts) | filename_affinity |
| [test/search.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/search.test.ts) | [src/search.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/src/search.ts) | filename_affinity |
| [test/wiki-graph.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/wiki-graph.test.ts) | [src/wiki-graph.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/src/wiki-graph.ts) | filename_affinity |
| [test/wiki-patch.test.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/test/wiki-patch.test.ts) | [src/wiki-patch.ts](https://github.com/mfittko/repo-wiki/blob/c5432024529f5133bed4df4fd18ec2b67d908b7e/src/wiki-patch.ts) | filename_affinity |
