---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "0604877d3099270286da69c1cf111e77cb0f81b8"
compiled_at: "2026-05-10T08:42:10.997Z"
kind: "configuration"
page_state: "generated"
---
# Configuration and Environment

## Detected configuration-related files

- [.env.example](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/.env.example)
- [.github/ISSUE_TEMPLATE/config.yml](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/.github/ISSUE_TEMPLATE/config.yml)
- [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/.github/workflows/changelog-on-merge.yml)
- [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/.github/workflows/wiki.yml)
- [.pi/settings.json](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/.pi/settings.json)
- [src/config.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/config.ts)
- [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/llm-provider.ts)
- [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/publisher.ts)
- [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/docs-linter.test.ts)
- [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/dotenv.test.ts)
- [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts)
- [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/publisher.test.ts)
- [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/scanner.test.ts)
- [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/update-changelog.test.ts)

## Explicit environment variables

- Unique variable names detected: 25
- Variable names: `API_KEY`, `API_TOKEN`, `APP_MODE`, `GH_TOKEN`, `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `GITHUB_WIKI_REMOTE`, `LLMWIKI_COMPILER_MODE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, `LLMWIKI_LLM_API_KEY`, `LLMWIKI_LLM_BASE_URL`, `LLMWIKI_LLM_MAX_OUTPUT_TOKENS`, `LLMWIKI_LLM_MODEL`, `LLMWIKI_LLM_PROVIDER`, `LLMWIKI_LLM_RETRIES`, `LLMWIKI_LLM_SYSTEM_PROMPT`, `LLMWIKI_LLM_SYSTEM_PROMPT_FILE`, `LLMWIKI_LLM_TEMPERATURE`, `LLMWIKI_LLM_TIMEOUT_MS`, `LLMWIKI_PUBLISH_REMOTE`, `OPENAI_API_KEY`, `PATH`, `PORT`, `VITE_HOST`

| Source file | Variables |
| --- | --- |
| [.env.example](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/.env.example) | `GITHUB_REPOSITORY`, `GITHUB_TOKEN`, `OPENAI_API_KEY` |
| [.github/workflows/changelog-on-merge.yml](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/.github/workflows/changelog-on-merge.yml) | `GH_TOKEN` |
| [.github/workflows/wiki.yml](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/.github/workflows/wiki.yml) | `LLMWIKI_PUBLISH_REMOTE` |
| [src/llm-provider.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/llm-provider.ts) | `LLMWIKI_COMPILER_MODE`, `LLMWIKI_LLM_API_KEY`, `LLMWIKI_LLM_BASE_URL`, `LLMWIKI_LLM_MAX_OUTPUT_TOKENS`, `LLMWIKI_LLM_MODEL`, `LLMWIKI_LLM_PROVIDER`, `LLMWIKI_LLM_RETRIES`, `LLMWIKI_LLM_SYSTEM_PROMPT`, `LLMWIKI_LLM_SYSTEM_PROMPT_FILE`, `LLMWIKI_LLM_TEMPERATURE`, `LLMWIKI_LLM_TIMEOUT_MS` |
| [src/publisher.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/src/publisher.ts) | `GITHUB_WIKI_REMOTE`, `LLMWIKI_GIT_USER_EMAIL`, `LLMWIKI_GIT_USER_NAME`, `LLMWIKI_PUBLISH_REMOTE` |
| [test/docs-linter.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/docs-linter.test.ts) | `APP_MODE`, `LLMWIKI_LLM_BASE_URL`, `PORT` |
| [test/dotenv.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/dotenv.test.ts) | `LLMWIKI_GIT_USER_NAME`, `LLMWIKI_PUBLISH_REMOTE` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | `API_KEY`, `API_TOKEN`, `LLMWIKI_LLM_BASE_URL`, `PORT`, `VITE_HOST` |
| [test/publisher.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/publisher.test.ts) | `GITHUB_WIKI_REMOTE`, `LLMWIKI_PUBLISH_REMOTE` |
| [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/scanner.test.ts) | `APP_MODE`, `PORT` |
| [test/update-changelog.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/update-changelog.test.ts) | `PATH` |

## Secret handling

Generated wiki pages must describe variable names and configuration concepts, not copy secret values.
