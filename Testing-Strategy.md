---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "8e450a538b4c7a54090597526dbb48dc26c508a2"
compiled_at: "2026-05-10T06:16:09.768Z"
kind: "testing_strategy"
page_state: "generated"
---
# Testing Strategy

## Detected test files

- [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/cli.test.ts)
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/compiler.test.ts)
- [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/context-assembler.test.ts)
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/docs-linter.test.ts)
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/dotenv.test.ts)
- [test/extractors-go.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/extractors-go.test.ts)
- [test/extractors-rust.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/extractors-rust.test.ts)
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/extractors-utils.test.ts)
- [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/frontmatter.test.ts)
- [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/init-planner.test.ts)
- [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/linter.test.ts)
- [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/llm-provider.test.ts)
- [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/page-ownership.test.ts)
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/publisher.test.ts)
- [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/repository-analysis.test.ts)
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/scanner.test.ts)
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/update-changelog.test.ts)
- [test/wiki-patch.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/wiki-patch.test.ts)

## Test-to-source mappings

- Mapped tests: 12
- Source files covered: 12

| Test | Source files | Heuristics |
| --- | --- | --- |
| [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/cli.test.ts) | [src/cli.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/src/cli.ts) | filename_affinity |
| [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/compiler.test.ts) | [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/src/compiler.ts) | filename_affinity |
| [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/context-assembler.test.ts) | [src/context-assembler.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/src/context-assembler.ts) | filename_affinity |
| [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/docs-linter.test.ts) | [src/docs-linter.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/src/docs-linter.ts) | filename_affinity |
| [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/frontmatter.test.ts) | [src/frontmatter.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/src/frontmatter.ts) | filename_affinity |
| [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/linter.test.ts) | [src/linter.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/src/linter.ts) | filename_affinity |
| [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/llm-provider.test.ts) | [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/src/llm-provider.ts) | filename_affinity |
| [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/page-ownership.test.ts) | [src/page-ownership.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/src/page-ownership.ts) | filename_affinity |
| [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/publisher.test.ts) | [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/src/publisher.ts) | filename_affinity |
| [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/repository-analysis.test.ts) | [src/repository-analysis.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/src/repository-analysis.ts) | filename_affinity |
| [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/scanner.test.ts) | [src/scanner.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/src/scanner.ts) | filename_affinity |
| [test/wiki-patch.test.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/test/wiki-patch.test.ts) | [src/wiki-patch.ts](https://github.com/mfittko/repo-wiki/blob/8e450a538b4c7a54090597526dbb48dc26c508a2/src/wiki-patch.ts) | filename_affinity |
