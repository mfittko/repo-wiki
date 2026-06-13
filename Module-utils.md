---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "06a68a1856f28bfd2083ba36b00bf83a0754e19c"
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
  Offers Git-related utilities to run Git commands and retrieve information such as the current commit, remote URL, and status. Exposed symbols include `runGit`, `getGitCommit`, `getGitRemote`, and `getGitStatus`.

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
  - Node.js built-in modules: `fs`, `path`

- `src/utils/fs.ts`  
  - Node.js built-in modules: `fs`, `path`

- `src/utils/git.ts`  
  - Node.js built-in modules: `child_process`, `util`

## Related tests

No explicit test files or test-related documentation cards are present in the source data for this module.

## Known gaps or open questions

- There is no information about test coverage or test files associated with this module.
- The repository remote URL and commit SHA are unspecified, limiting traceability.
- No documentation or usage examples are provided for the exported symbols.
- The environment context or runtime assumptions for these utilities are not detailed.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
