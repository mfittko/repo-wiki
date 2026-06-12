---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "edb41c2402583d52b198e0b02471275199a0fcb1"
compiled_at: "2026-06-12T15:34:24.766Z"
kind: "configuration"
claim_status: "grounded"
source_paths: [".env.example",".github/ISSUE_TEMPLATE/config.yml",".github/workflows/changelog-on-merge.yml",".github/workflows/wiki.yml",".pi/settings.json","src/compiler.ts","src/config.ts","src/llm-provider.ts","src/publisher.ts","test/compiler.test.ts","test/docs-linter.test.ts","test/dotenv.test.ts","test/extractors-utils.test.ts","test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js","test/llm-provider.test.ts","test/publisher.test.ts","test/scanner.test.ts","test/update-changelog.test.ts"]
confidence: "high"
page_state: "generated"
---
# Configuration and Environment

## Detected configuration-related files

- [.env.example](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/.env.example)
- [.github/ISSUE_TEMPLATE/config.yml](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/.github/ISSUE_TEMPLATE/config.yml)
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/.github/workflows/changelog-on-merge.yml)
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/.github/workflows/wiki.yml)
- [.pi/settings.json](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/.pi/settings.json)
- [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/src/compiler.ts)
- [src/config.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/src/config.ts)
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/src/llm-provider.ts)
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/src/publisher.ts)
- [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/compiler.test.ts)
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/docs-linter.test.ts)
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/dotenv.test.ts)
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/extractors-utils.test.ts)
- [test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js)
- [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/llm-provider.test.ts)
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/publisher.test.ts)
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/scanner.test.ts)
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/update-changelog.test.ts)

## Explicit environment variables

- Unique variable names detected: 31
- Variable names: `API_KEY`, `API_TOKEN`, `APP_MODE`, `GH_TOKEN`, `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `GITHUB_WIKI_REMOTE`, `LLMWIKI_COMPILER_MODE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, `LLMWIKI_LLM_API_KEY`, `LLMWIKI_LLM_ARCHITECTURE_MAX_OUTPUT_TOKENS`, `LLMWIKI_LLM_ARCHITECTURE_MODEL`, `LLMWIKI_LLM_ARCHITECTURE_REASONING_EFFORT`, `LLMWIKI_LLM_ARCHITECTURE_TIMEOUT_MS`, `LLMWIKI_LLM_BASE_URL`, `LLMWIKI_LLM_MAX_OUTPUT_TOKENS`, `LLMWIKI_LLM_MODEL`, `LLMWIKI_LLM_PROVIDER`, `LLMWIKI_LLM_REASONING_EFFORT`, `LLMWIKI_LLM_RETRIES`, `LLMWIKI_LLM_SYSTEM_PROMPT`, `LLMWIKI_LLM_SYSTEM_PROMPT_FILE`, `LLMWIKI_LLM_TEMPERATURE`, `LLMWIKI_LLM_TIMEOUT_MS`, `LLMWIKI_LLM_VALIDATION_RETRIES`, `LLMWIKI_PUBLISH_REMOTE`, `PATH`, `PORT`, `REPO_WIKI_MISSING_TEST_KEY`, `VITE_HOST`

| Source file | Variables |
| --- | --- |
| [.env.example](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/.env.example) | `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `LLMWIKI_COMPILER_MODE`, `LLMWIKI_LLM_API_KEY` |
| [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/.github/workflows/changelog-on-merge.yml) | `GH_TOKEN` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/.github/workflows/wiki.yml) | `LLMWIKI_COMPILER_MODE`, `LLMWIKI_PUBLISH_REMOTE` |
| [src/compiler.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/src/compiler.ts) | `LLMWIKI_COMPILER_MODE` |
| [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/src/llm-provider.ts) | `LLMWIKI_COMPILER_MODE`, `LLMWIKI_LLM_API_KEY`, `LLMWIKI_LLM_ARCHITECTURE_MAX_OUTPUT_TOKENS`, `LLMWIKI_LLM_ARCHITECTURE_MODEL`, `LLMWIKI_LLM_ARCHITECTURE_REASONING_EFFORT`, `LLMWIKI_LLM_ARCHITECTURE_TIMEOUT_MS`, `LLMWIKI_LLM_BASE_URL`, `LLMWIKI_LLM_MAX_OUTPUT_TOKENS`, `LLMWIKI_LLM_MODEL`, `LLMWIKI_LLM_PROVIDER`, `LLMWIKI_LLM_REASONING_EFFORT`, `LLMWIKI_LLM_RETRIES`, `LLMWIKI_LLM_SYSTEM_PROMPT`, `LLMWIKI_LLM_SYSTEM_PROMPT_FILE`, `LLMWIKI_LLM_TEMPERATURE`, `LLMWIKI_LLM_TIMEOUT_MS`, `LLMWIKI_LLM_VALIDATION_RETRIES` |
| [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/src/publisher.ts) | `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, `LLMWIKI_PUBLISH_REMOTE` |
| [test/compiler.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/compiler.test.ts) | `LLMWIKI_COMPILER_MODE`, `LLMWIKI_LLM_API_KEY`, `LLMWIKI_LLM_PROVIDER`, `REPO_WIKI_MISSING_TEST_KEY` |
| [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/docs-linter.test.ts) | `APP_MODE`, `LLMWIKI_LLM_BASE_URL`, `PORT` |
| [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/dotenv.test.ts) | `LLMWIKI_GIT_USER_NAME`, `LLMWIKI_PUBLISH_REMOTE` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/extractors-utils.test.ts) | `API_KEY`, `API_TOKEN`, `LLMWIKI_LLM_BASE_URL`, `PORT`, `VITE_HOST` |
| [test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js) | `APP_MODE`, `PORT` |
| [test/llm-provider.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/llm-provider.test.ts) | `LLMWIKI_LLM_MODEL` |
| [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/publisher.test.ts) | `GITHUB_WIKI_REMOTE`, `LLMWIKI_PUBLISH_REMOTE` |
| [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/scanner.test.ts) | `APP_MODE`, `PORT` |
| [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/edb41c2402583d52b198e0b02471275199a0fcb1/test/update-changelog.test.ts) | `PATH` |

## Secret handling

Generated wiki pages must describe variable names and configuration concepts, not copy secret values.
