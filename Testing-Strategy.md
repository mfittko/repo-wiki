---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "91e712dcb91ba10ae83e41a917bf0d92fd2b7545"
compiled_at: "2026-06-12T23:31:35.790Z"
kind: "testing_strategy"
claim_status: "grounded"
source_paths: ["src/cli.ts","src/compiler.ts","src/context-assembler.ts","src/docs-linter.ts","src/frontmatter.ts","src/linter.ts","src/llm-provider.ts","src/page-ownership.ts","src/publisher.ts","src/repository-analysis.ts","src/scanner.ts","src/search.ts","src/wiki-graph.ts","src/wiki-patch.ts","src/wiki-query.ts","test/cli.test.ts","test/compiler-eval.test.ts","test/compiler.test.ts","test/context-assembler.test.ts","test/docs-linter.test.ts","test/dotenv.test.ts","test/extractors-go.test.ts","test/extractors-rust.test.ts","test/extractors-utils.test.ts","test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js","test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js","test/frontmatter.test.ts","test/init-planner.test.ts","test/linter.test.ts","test/llm-provider.test.ts","test/page-ownership.test.ts","test/publisher.test.ts","test/repository-analysis.test.ts","test/scanner.test.ts","test/search.test.ts","test/update-changelog.test.ts","test/wiki-graph.test.ts","test/wiki-patch.test.ts","test/wiki-query.test.ts"]
confidence: "high"
page_state: "generated"
---
# Testing Strategy

## Detected test files

- [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/cli.test.ts)
- [test/compiler-eval.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/compiler-eval.test.ts)
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/compiler.test.ts)
- [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/context-assembler.test.ts)
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/docs-linter.test.ts)
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/dotenv.test.ts)
- [test/extractors-go.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/extractors-go.test.ts)
- [test/extractors-rust.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/extractors-rust.test.ts)
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/extractors-utils.test.ts)
- [test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js)
- [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/frontmatter.test.ts)
- [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/init-planner.test.ts)
- [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/linter.test.ts)
- [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/llm-provider.test.ts)
- [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/page-ownership.test.ts)
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/publisher.test.ts)
- [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/repository-analysis.test.ts)
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/scanner.test.ts)
- [test/search.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/search.test.ts)
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/update-changelog.test.ts)
- [test/wiki-graph.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/wiki-graph.test.ts)
- [test/wiki-patch.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/wiki-patch.test.ts)
- [test/wiki-query.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/wiki-query.test.ts)

## Test-to-source mappings

- Mapped tests: 16
- Source files covered: 16

| Test | Source files | Heuristics |
| --- | --- | --- |
| [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/cli.test.ts) | [src/cli.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/cli.ts) | filename_affinity |
| [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/compiler.test.ts) | [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/compiler.ts) | filename_affinity |
| [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/context-assembler.test.ts) | [src/context-assembler.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/context-assembler.ts) | filename_affinity |
| [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/docs-linter.test.ts) | [src/docs-linter.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/docs-linter.ts) | filename_affinity |
| [test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js) | [test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js) | imports |
| [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/frontmatter.test.ts) | [src/frontmatter.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/frontmatter.ts) | filename_affinity |
| [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/linter.test.ts) | [src/linter.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/linter.ts) | filename_affinity |
| [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/llm-provider.test.ts) | [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/llm-provider.ts) | filename_affinity |
| [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/page-ownership.test.ts) | [src/page-ownership.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/page-ownership.ts) | filename_affinity |
| [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/publisher.test.ts) | [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/publisher.ts) | filename_affinity |
| [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/repository-analysis.test.ts) | [src/repository-analysis.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/repository-analysis.ts) | filename_affinity |
| [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/scanner.test.ts) | [src/scanner.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/scanner.ts) | filename_affinity |
| [test/search.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/search.test.ts) | [src/search.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/search.ts) | filename_affinity |
| [test/wiki-graph.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/wiki-graph.test.ts) | [src/wiki-graph.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/wiki-graph.ts) | filename_affinity |
| [test/wiki-patch.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/wiki-patch.test.ts) | [src/wiki-patch.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/wiki-patch.ts) | filename_affinity |
| [test/wiki-query.test.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/test/wiki-query.test.ts) | [src/wiki-query.ts](https://github.com/mfittko/repo-wiki/blob/91e712dcb91ba10ae83e41a917bf0d92fd2b7545/src/wiki-query.ts) | filename_affinity |
