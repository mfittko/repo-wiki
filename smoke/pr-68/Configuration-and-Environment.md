---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
compiled_at: "2026-05-10T22:42:14.711Z"
kind: "configuration"
claim_status: "grounded"
source_paths: [".env",".env.example",".github/ISSUE_TEMPLATE/config.yml",".github/workflows/changelog-on-merge.yml",".github/workflows/wiki.yml",".pi/settings.json","src/compiler.ts","src/config.ts","src/llm-provider.ts","src/publisher.ts","test/compiler.test.ts","test/docs-linter.test.ts","test/dotenv.test.ts","test/extractors-utils.test.ts","test/publisher.test.ts","test/scanner.test.ts","test/update-changelog.test.ts"]
confidence: "high"
page_state: "generated"
---
# Configuration and Environment

## Detected configuration-related files

- [.env](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/.env)
- [.env.example](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/.env.example)
- [.github/ISSUE_TEMPLATE/config.yml](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/.github/ISSUE_TEMPLATE/config.yml)
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/.github/workflows/changelog-on-merge.yml)
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/.github/workflows/wiki.yml)
- [.pi/settings.json](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/.pi/settings.json)
- [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/src/compiler.ts)
- [src/config.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/src/config.ts)
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/src/llm-provider.ts)
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/src/publisher.ts)
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/compiler.test.ts)
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/docs-linter.test.ts)
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/dotenv.test.ts)
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/extractors-utils.test.ts)
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/publisher.test.ts)
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/scanner.test.ts)
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/update-changelog.test.ts)

## Explicit environment variables

- Unique variable names detected: 28
- Variable names: `API_KEY`, `API_TOKEN`, `APP_MODE`, `GH_TOKEN`, `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `GITHUB_WIKI_REMOTE`, `LLMWIKI_COMPILER_MODE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, `LLMWIKI_LLM_API_KEY`, `LLMWIKI_LLM_BASE_URL`, `LLMWIKI_LLM_MAX_OUTPUT_TOKENS`, `LLMWIKI_LLM_MODEL`, `LLMWIKI_LLM_PROVIDER`, `LLMWIKI_LLM_RETRIES`, `LLMWIKI_LLM_SYSTEM_PROMPT`, `LLMWIKI_LLM_SYSTEM_PROMPT_FILE`, `LLMWIKI_LLM_TEMPERATURE`, `LLMWIKI_LLM_TIMEOUT_MS`, `LLMWIKI_LLM_VALIDATION_RETRIES`, `LLMWIKI_PUBLISH_REMOTE`, `PATH`, `PORT`, `REPO_WIKI_MISSING_TEST_KEY`, `TELEGRAM_ALLOWED_USER_IDS`, `TELEGRAM_BOT_TOKEN`, `VITE_HOST`

| Source file | Variables |
| --- | --- |
| [.env](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/.env) | `LLMWIKI_COMPILER_MODE`, `LLMWIKI_LLM_API_KEY`, `LLMWIKI_PUBLISH_REMOTE`, `TELEGRAM_ALLOWED_USER_IDS`, `TELEGRAM_BOT_TOKEN` |
| [.env.example](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/.env.example) | `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `LLMWIKI_COMPILER_MODE`, `LLMWIKI_LLM_API_KEY` |
| [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/.github/workflows/changelog-on-merge.yml) | `GH_TOKEN` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/.github/workflows/wiki.yml) | `LLMWIKI_COMPILER_MODE`, `LLMWIKI_PUBLISH_REMOTE` |
| [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/src/compiler.ts) | `LLMWIKI_COMPILER_MODE` |
| [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/src/llm-provider.ts) | `LLMWIKI_COMPILER_MODE`, `LLMWIKI_LLM_API_KEY`, `LLMWIKI_LLM_BASE_URL`, `LLMWIKI_LLM_MAX_OUTPUT_TOKENS`, `LLMWIKI_LLM_MODEL`, `LLMWIKI_LLM_PROVIDER`, `LLMWIKI_LLM_RETRIES`, `LLMWIKI_LLM_SYSTEM_PROMPT`, `LLMWIKI_LLM_SYSTEM_PROMPT_FILE`, `LLMWIKI_LLM_TEMPERATURE`, `LLMWIKI_LLM_TIMEOUT_MS`, `LLMWIKI_LLM_VALIDATION_RETRIES` |
| [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/src/publisher.ts) | `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, `LLMWIKI_PUBLISH_REMOTE` |
| [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/compiler.test.ts) | `LLMWIKI_COMPILER_MODE`, `LLMWIKI_LLM_API_KEY`, `LLMWIKI_LLM_PROVIDER`, `REPO_WIKI_MISSING_TEST_KEY` |
| [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/docs-linter.test.ts) | `APP_MODE`, `LLMWIKI_LLM_BASE_URL`, `PORT` |
| [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/dotenv.test.ts) | `LLMWIKI_GIT_USER_NAME`, `LLMWIKI_PUBLISH_REMOTE` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/extractors-utils.test.ts) | `API_KEY`, `API_TOKEN`, `LLMWIKI_LLM_BASE_URL`, `PORT`, `VITE_HOST` |
| [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/publisher.test.ts) | `GITHUB_WIKI_REMOTE`, `LLMWIKI_PUBLISH_REMOTE` |
| [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/scanner.test.ts) | `APP_MODE`, `PORT` |
| [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/d0fcfd342fdf531e2b9e6176e234f013215af9fc/test/update-changelog.test.ts) | `PATH` |

## Secret handling

Generated wiki pages must describe variable names and configuration concepts, not copy secret values.
