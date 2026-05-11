---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "f47907b8f64c2674438a61f152c6d5a09a19c523"
compiled_at: "2026-05-11T08:03:18.700Z"
kind: "architecture"
claim_status: "grounded"
source_paths: [".env.example",".github/ISSUE_TEMPLATE/config.yml",".github/ISSUE_TEMPLATE/epic.yml",".github/ISSUE_TEMPLATE/task.yml",".github/workflows/changelog-on-merge.yml",".github/workflows/changelog-release.yml",".github/workflows/ci.yml",".github/workflows/wiki.yml",".gitignore",".pi/settings.json",".tsbuildinfo","bin/repo-wiki.ts","LICENSE","package-lock.json","package.json","scripts/update-changelog.mjs","src/cli.ts","src/compiler.ts","src/config.ts","src/context-assembler.ts","src/data-model-signals.ts","src/docs-ingestor.ts","src/docs-linter.ts","src/docs-validation.ts","src/extractors.ts","src/frontmatter.ts","src/index.ts","src/init.ts","src/language.ts","src/linter.ts","src/llm-provider.ts","src/page-ownership.ts","src/planner.ts","src/prompts.ts","src/publisher.ts","src/repository-analysis.ts","src/scanner.ts","src/secret-patterns.ts","src/utils/args.ts","src/utils/dotenv.ts","src/utils/fs.ts","src/utils/git.ts","src/wiki-patch.ts","test/cli.test.ts","test/compiler.test.ts","test/context-assembler.test.ts","test/docs-linter.test.ts","test/dotenv.test.ts","test/extractors-go.test.ts","test/extractors-rust.test.ts"]
confidence: "medium"
page_state: "generated"
---
# Architecture

This page is a first-pass architecture summary based on repository structure. The production compiler should replace this with an LLM-reviewed synthesis that uses source cards and targeted code excerpts.

## Structural map

```mermaid
flowchart TD
  Repo[Repository at f47907b8]
  Repo --> M0[Repository Root]
  Repo --> M1[CI and Automation]
  Repo --> M2[Documentation]
  Repo --> M3[Module utils]
  Repo --> M4[Module cli.ts]
  Repo --> M5[Module compiler.ts]
  Repo --> M6[Module config.ts]
  Repo --> M7[Module context-assembler.ts]
  Repo --> M8[Module data-model-signals.ts]
  Repo --> M9[Module docs-ingestor.ts]
  Repo --> M10[Module docs-linter.ts]
  Repo --> M11[Module docs-validation.ts]
```

## Module groups

### Repository Root

- Files: 38
- Dominant categories: source, docs, package, test
- Dominant languages: Text, Markdown, JSON, TypeScript, JavaScript
- Important reasons: api-surface, configuration, data-model, docs, orm-model, package, package-manifest, readme, source, test

### CI and Automation

- Files: 17
- Dominant categories: docs, source, ci
- Dominant languages: Markdown, YAML
- Important reasons: ci, configuration, docs, source

### Documentation

- Files: 15
- Dominant categories: docs
- Dominant languages: Markdown
- Important reasons: docs

### Module utils

- Files: 4
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module cli.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module compiler.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: configuration, source

### Module config.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module context-assembler.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module data-model-signals.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module docs-ingestor.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module docs-linter.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module docs-validation.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module extractors.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module frontmatter.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module index.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module init.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module language.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module linter.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module llm-provider.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: configuration, source

### Module page-ownership.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module planner.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module prompts.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module publisher.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: configuration, source

### Module repository-analysis.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module scanner.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module secret-patterns.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

### Module wiki-patch.ts

- Files: 1
- Dominant categories: source
- Dominant languages: TypeScript
- Important reasons: source

