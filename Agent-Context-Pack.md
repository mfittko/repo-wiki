---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "3c7f4808701c06a5d3bcd8e1455221b272566b71"
compiled_at: "2026-05-11T06:58:40.134Z"
kind: "agent_context_pack"
claim_status: "grounded"
source_paths: [".env.example",".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml",".gitignore",".pi/settings.json",".tsbuildinfo","bin/repo-wiki.ts","LICENSE","package-lock.json","package.json","scripts/update-changelog.mjs","src/cli.ts","src/compiler.ts","src/config.ts","src/context-assembler.ts","src/data-model-signals.ts","src/docs-ingestor.ts","src/docs-linter.ts","src/docs-validation.ts","src/extractors.ts","src/frontmatter.ts","src/index.ts","src/init.ts","src/language.ts","src/linter.ts","src/llm-provider.ts","src/page-ownership.ts","src/planner.ts","src/prompts.ts","src/publisher.ts","src/repository-analysis.ts","src/scanner.ts","src/secret-patterns.ts","src/utils/args.ts","src/utils/dotenv.ts","src/utils/fs.ts","src/utils/git.ts","src/wiki-patch.ts","test/cli.test.ts","test/compiler.test.ts","test/context-assembler.test.ts","test/docs-linter.test.ts","test/dotenv.test.ts","test/extractors-go.test.ts","test/extractors-rust.test.ts"]
confidence: "medium"
page_state: "generated"
---
# Agent Context Pack

This page is the compact entry point for coding agents and developers.

## Repository snapshot

- Source: `https://github.com/mfittko/repo-wiki`
- Commit: `3c7f4808701c06a5d3bcd8e1455221b272566b71`
- Last compiled: `2026-05-11T06:58:40.127Z`
- Files scanned: 97

## Read first

1. [Architecture](Architecture.md)
2. [Build Test and Run](Build-Test-and-Run.md)
3. [Index](Index.md)
4. Relevant module page from the routing table below

## Task routing

| Task | Read these pages first |
|---|---|
| Work in Repository Root | [Repository Root](Repository-Root.md), [Testing Strategy](Testing-Strategy.md), [Dependency Map](Dependency-Map.md) |
| Work in CI and Automation | [CI and Automation](CI-and-Automation.md), [Testing Strategy](Testing-Strategy.md), [Dependency Map](Dependency-Map.md) |
| Work in Documentation | [Documentation](Documentation.md), [Testing Strategy](Testing-Strategy.md), [Dependency Map](Dependency-Map.md) |
| Work in Module utils | [Module utils](Module-utils.md), [Testing Strategy](Testing-Strategy.md), [Dependency Map](Dependency-Map.md) |
| Work in Module cli.ts | [Module cli.ts](Module-cli-ts.md), [Testing Strategy](Testing-Strategy.md), [Dependency Map](Dependency-Map.md) |
| Work in Module compiler.ts | [Module compiler.ts](Module-compiler-ts.md), [Testing Strategy](Testing-Strategy.md), [Dependency Map](Dependency-Map.md) |
| Work in Module config.ts | [Module config.ts](Module-config-ts.md), [Testing Strategy](Testing-Strategy.md), [Dependency Map](Dependency-Map.md) |
| Work in Module context-assembler.ts | [Module context-assembler.ts](Module-context-assembler-ts.md), [Testing Strategy](Testing-Strategy.md), [Dependency Map](Dependency-Map.md) |
| Work in Module data-model-signals.ts | [Module data-model-signals.ts](Module-data-model-signals-ts.md), [Testing Strategy](Testing-Strategy.md), [Dependency Map](Dependency-Map.md) |
| Work in Module docs-ingestor.ts | [Module docs-ingestor.ts](Module-docs-ingestor-ts.md), [Testing Strategy](Testing-Strategy.md), [Dependency Map](Dependency-Map.md) |

## Verification policy

Run the repository's own test, lint, and type-check commands when available. If commands are not detected, inspect package manifests and CI workflows before changing behavior.

## Confidence rule

The wiki is generated from source cards and documentation cards. Treat code, tests, CI, and config as authoritative when there is disagreement. Treat markdown documentation as useful but potentially stale unless marked validated.
