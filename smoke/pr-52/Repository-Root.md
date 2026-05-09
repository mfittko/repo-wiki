---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "57f31fb6202a15b1b0598d7ae36a693c21359721"
compiled_at: "2026-05-09T23:55:11.607Z"
kind: "module"
module: "Repository Root"
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
- Runtime hints: environment-variable, background-work, data-model, http-route, orm-model
- Reasons: api-surface, configuration, data-model, docs, orm-model, package, package-manifest, readme, source, test

## Source files

- [.env.example](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/.env.example)
- [.gitignore](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/.gitignore)
- [.llmwiki/schema.md](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/.llmwiki/schema.md)
- [.pi/AGENTS.md](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/.pi/AGENTS.md)
- [.pi/settings.json](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/.pi/settings.json)
- [.tsbuildinfo](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/.tsbuildinfo)
- [AGENTS.md](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/AGENTS.md)
- [CHANGELOG.md](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/CHANGELOG.md)
- [LICENSE](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/LICENSE)
- [README.md](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/README.md)
- [bin/repo-wiki.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/bin/repo-wiki.ts)
- [package-lock.json](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/package-lock.json)
- [package.json](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/package.json)
- [prompts/compiler.md](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/prompts/compiler.md)
- [prompts/lint.md](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/prompts/lint.md)
- [prompts/page-templates.md](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/prompts/page-templates.md)
- [scripts/update-changelog.mjs](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/scripts/update-changelog.mjs)
- [skills/repo-wiki-cli/SKILL.md](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/skills/repo-wiki-cli/SKILL.md)
- [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/cli.test.ts)
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/compiler.test.ts)
- [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/context-assembler.test.ts)
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/docs-linter.test.ts)
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/dotenv.test.ts)
- [test/extractors-go.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/extractors-go.test.ts)
- [test/extractors-rust.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/extractors-rust.test.ts)
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/extractors-utils.test.ts)
- [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/frontmatter.test.ts)
- [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/init-planner.test.ts)
- [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/linter.test.ts)
- [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/llm-provider.test.ts)
- [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/page-ownership.test.ts)
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/publisher.test.ts)
- [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/repository-analysis.test.ts)
- [test/run-compiled-tests.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/run-compiled-tests.ts)
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/scanner.test.ts)
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/test/update-changelog.test.ts)
- [tmp/.keep](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/tmp/.keep)
- [tsconfig.json](https://github.com/mfittko/repo-wiki/blob/57f31fb6202a15b1b0598d7ae36a693c21359721/tsconfig.json)

## Related pages

- [Dependency Map](Dependency-Map)
- [Testing Strategy](Testing-Strategy)
- [Open Questions](Open-Questions)

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
