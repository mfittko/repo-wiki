---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "4876d92ad775fdaa882464db71be1c1ed241f47f"
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
  Provides functionality to load and parse `.env` files with symbols such as `loadDotEnv`, `parseDotEnv`, and the `DotEnvLoadResult` type.

- `src/utils/fs.ts`  
  Contains filesystem-related utilities including directory creation, file existence checks, JSON reading/writing, file walking, and text writing. Key symbols include `ensureDir`, `fileExists`, `readJson`, `writeJson`, `writeText`, `walkFiles`, and the constant `DEFAULT_WALK_EXCLUDES`.

- `src/utils/git.ts`  
  Offers Git-related utilities to retrieve commit information, remote URLs, repository status, and to run arbitrary Git commands. Exposed symbols include `getGitCommit`, `getGitRemote`, `getGitStatus`, and `runGit`.

## Key symbols and entry points

- **Argument parsing**  
  - `parseArgs`  
  - `ParsedArgs`

- **Environment variable management**  
  - `loadDotEnv`  
  - `parseDotEnv`  
  - `DotEnvLoadResult`

- **Filesystem utilities**  
  - `ensureDir`  
  - `fileExists`  
  - `readJson`  
  - `writeJson`  
  - `writeText`  
  - `walkFiles`  
  - `DEFAULT_WALK_EXCLUDES`

- **Git utilities**  
  - `getGitCommit`  
  - `getGitRemote`  
  - `getGitStatus`  
  - `runGit`

## Dependencies and imports

- `src/utils/dotenv.ts` imports:  
  - `./fs.js` (local filesystem utilities)  
  - Node.js built-in modules: `fs`, `path`

- `src/utils/fs.ts` imports:  
  - Node.js built-in modules: `fs`, `path`

- `src/utils/git.ts` imports:  
  - Node.js built-in modules: `child_process`, `util`

- `src/utils/args.ts` has no imports.

## Related tests

No test files or test-related documentation cards were found associated with this module at this time.

## Known gaps or open questions

- There is no explicit documentation or test coverage information available for this module.
- The exact repository remote URL and commit SHA are not specified.
- The module's integration or usage context within the larger project is not described.
- Potential runtime environment assumptions or constraints are not documented.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
