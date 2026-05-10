---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "abdb6f4647291d3179248fa6e7f94856f53ec49c"
compiled_at: "2026-05-10T17:16:36.236Z"
kind: "module"
module: "Repository Root"
claim_status: "grounded"
confidence: "high"
source_paths: [".env.example",".gitignore",".llmwiki/schema.md",".pi/AGENTS.md",".pi/settings.json",".tsbuildinfo","AGENTS.md","CHANGELOG.md","LICENSE","README.md","bin/repo-wiki.ts","package-lock.json","package.json","prompts/compiler.md","prompts/lint.md","prompts/page-templates.md","scripts/update-changelog.mjs","skills/repo-wiki-cli/SKILL.md","test/cli.test.ts","test/compiler.test.ts"]
page_state: "generated"
---
# Repository Root

## Purpose

Generated first-pass page for files grouped under Repository Root. This should be refined by the LLM compiler using source cards and targeted source excerpts.

## Signals

- Files: 38
- Categories: source, docs, package, test
- Languages: Text, Markdown, JSON, TypeScript, JavaScript
- Runtime hints: environment-variable, background-work, http-route, data-model, orm-model
- Reasons: api-surface, configuration, data-model, docs, orm-model, package, package-manifest, readme, source, test

## Source files

- [.env.example](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/.env.example)
- [.gitignore](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/.gitignore)
- [.llmwiki/schema.md](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/.llmwiki/schema.md)
- [.pi/AGENTS.md](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/.pi/AGENTS.md)
- [.pi/settings.json](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/.pi/settings.json)
- [.tsbuildinfo](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/.tsbuildinfo)
- [AGENTS.md](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/AGENTS.md)
- [CHANGELOG.md](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/CHANGELOG.md)
- [LICENSE](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/LICENSE)
- [README.md](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/README.md)
- [bin/repo-wiki.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/bin/repo-wiki.ts)
- [package-lock.json](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/package-lock.json)
- [package.json](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/package.json)
- [prompts/compiler.md](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/prompts/compiler.md)
- [prompts/lint.md](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/prompts/lint.md)
- [prompts/page-templates.md](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/prompts/page-templates.md)
- [scripts/update-changelog.mjs](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/scripts/update-changelog.mjs)
- [skills/repo-wiki-cli/SKILL.md](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/skills/repo-wiki-cli/SKILL.md)
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
- [test/run-compiled-tests.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/run-compiled-tests.ts)
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/scanner.test.ts)
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/update-changelog.test.ts)
- [test/wiki-patch.test.ts](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/test/wiki-patch.test.ts)
- [tsconfig.json](https://github.com/mfittko/repo-wiki/blob/abdb6f4647291d3179248fa6e7f94856f53ec49c/tsconfig.json)

## Related pages

- [Dependency Map](Dependency-Map)
- [Testing Strategy](Testing-Strategy)
- [Open Questions](Open-Questions)

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
