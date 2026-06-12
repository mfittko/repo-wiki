---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a3ed30252c9bfb054e0b54fe5e6c52f8f0b8d703"
page_state: "generated"
source_paths: ["src/utils/args.ts","src/utils/dotenv.ts","src/utils/fs.ts","src/utils/git.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `utils`

## Purpose

The `utils` module provides a collection of utility functions and types implemented in TypeScript to support various common tasks related to argument parsing, environment variable loading, filesystem operations, and Git command interactions. This module serves as foundational source code to facilitate handling command-line arguments, managing `.env` files, performing file system manipulations, and executing Git commands programmatically.

## Source file list

- `src/utils/args.ts`  
  Implements argument parsing utilities including the `parseArgs` function and the `ParsedArgs` type.

- `src/utils/dotenv.ts`  
  Provides functionality to load and parse `.env` files with exports such as `loadDotEnv`, `parseDotEnv`, and the `DotEnvLoadResult` type.

- `src/utils/fs.ts`  
  Contains filesystem-related utilities such as directory creation, file existence checks, JSON reading/writing, file walking, and text writing. Key exports include `ensureDir`, `fileExists`, `readJson`, `writeJson`, `writeText`, `walkFiles`, and the constant `DEFAULT_WALK_EXCLUDES`.

- `src/utils/git.ts`  
  Offers Git-related utilities to run Git commands and retrieve information like commit hashes, remote URLs, and repository status. Exports include `runGit`, `getGitCommit`, `getGitRemote`, and `getGitStatus`.

## Key symbols and entry points

- **Argument Parsing**  
  - `parseArgs`  
  - `ParsedArgs`

- **Environment Variable Handling**  
  - `loadDotEnv`  
  - `parseDotEnv`  
  - `DotEnvLoadResult`

- **Filesystem Utilities**  
  - `DEFAULT_WALK_EXCLUDES`  
  - `ensureDir`  
  - `fileExists`  
  - `readJson`  
  - `writeJson`  
  - `writeText`  
  - `walkFiles`

- **Git Utilities**  
  - `runGit`  
  - `getGitCommit`  
  - `getGitRemote`  
  - `getGitStatus`

## Dependencies and imports

- `src/utils/args.ts`  
  - No external imports.

- `src/utils/dotenv.ts`  
  - Imports from local module `./fs.js`  
  - Node built-in modules: `fs`, `path`

- `src/utils/fs.ts`  
  - Node built-in modules: `fs`, `path`

- `src/utils/git.ts`  
  - Node built-in modules: `child_process`, `util`

## Related tests

No test files or test-related documentation cards were identified for this module in the provided source data.

## Known gaps or open questions

- There is no explicit documentation or test coverage information available for this module.
- The exact repository remote URL and commit SHA are not specified.
- The module's integration or usage context within the larger project is not described.
- No information on error handling strategies or performance considerations is provided.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
