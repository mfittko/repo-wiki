---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "ea1e8dd9452865235cc07cb3c68da8017c735bab"
compiled_at: "2026-05-10T00:06:23.580Z"
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

- [.env.example](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/.env.example)
- [.gitignore](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/.gitignore)
- [.llmwiki/schema.md](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/.llmwiki/schema.md)
- [.pi/AGENTS.md](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/.pi/AGENTS.md)
- [.pi/settings.json](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/.pi/settings.json)
- [.tsbuildinfo](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/.tsbuildinfo)
- [AGENTS.md](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/AGENTS.md)
- [CHANGELOG.md](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/CHANGELOG.md)
- [LICENSE](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/LICENSE)
- [README.md](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/README.md)
- [bin/repo-wiki.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/bin/repo-wiki.ts)
- [package-lock.json](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/package-lock.json)
- [package.json](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/package.json)
- [prompts/compiler.md](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/prompts/compiler.md)
- [prompts/lint.md](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/prompts/lint.md)
- [prompts/page-templates.md](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/prompts/page-templates.md)
- [scripts/update-changelog.mjs](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/scripts/update-changelog.mjs)
- [skills/repo-wiki-cli/SKILL.md](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/skills/repo-wiki-cli/SKILL.md)
- [test/cli.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/cli.test.ts)
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/compiler.test.ts)
- [test/context-assembler.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/context-assembler.test.ts)
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/docs-linter.test.ts)
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/dotenv.test.ts)
- [test/extractors-go.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/extractors-go.test.ts)
- [test/extractors-rust.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/extractors-rust.test.ts)
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/extractors-utils.test.ts)
- [test/frontmatter.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/frontmatter.test.ts)
- [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/init-planner.test.ts)
- [test/linter.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/linter.test.ts)
- [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/llm-provider.test.ts)
- [test/page-ownership.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/page-ownership.test.ts)
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/publisher.test.ts)
- [test/repository-analysis.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/repository-analysis.test.ts)
- [test/run-compiled-tests.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/run-compiled-tests.ts)
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/scanner.test.ts)
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/test/update-changelog.test.ts)
- [tmp/.keep](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/tmp/.keep)
- [tsconfig.json](https://github.com/mfittko/repo-wiki/blob/ea1e8dd9452865235cc07cb3c68da8017c735bab/tsconfig.json)

## Related pages

- [Dependency Map](Dependency-Map)
- [Testing Strategy](Testing-Strategy)
- [Open Questions](Open-Questions)

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
