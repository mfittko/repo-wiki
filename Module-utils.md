---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "ab4f4401735f73fb39983b8f7af41b5ed76b37f7"
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
  Offers Git-related utilities to run Git commands and retrieve information such as the current commit, remote URL, and status. Exports include `runGit`, `getGitCommit`, `getGitRemote`, and `getGitStatus`.

## Key symbols and entry points

- **Argument parsing**  
  - `parseArgs` (function)  
  - `ParsedArgs` (type)

- **Environment variable management**  
  - `loadDotEnv` (function)  
  - `parseDotEnv` (function)  
  - `DotEnvLoadResult` (type)

- **Filesystem utilities**  
  - `ensureDir` (function)  
  - `fileExists` (function)  
  - `readJson` (function)  
  - `writeJson` (function)  
  - `writeText` (function)  
  - `walkFiles` (function)  
  - `DEFAULT_WALK_EXCLUDES` (constant)

- **Git utilities**  
  - `runGit` (function)  
  - `getGitCommit` (function)  
  - `getGitRemote` (function)  
  - `getGitStatus` (function)

## Dependencies and imports

- `src/utils/dotenv.ts` imports:  
  - `./fs.js` (local filesystem utilities)  
  - Node.js built-in modules: `fs`, `path`

- `src/utils/fs.ts` imports:  
  - Node.js built-in modules: `fs`, `path`

- `src/utils/git.ts` imports:  
  - Node.js built-in modules: `child_process`, `util`

- `src/utils/args.ts` has no imports

## Related tests

No test files or test-related documentation cards were found associated with this module.

## Known gaps or open questions

- There is no explicit documentation or test coverage information available for this module.
- The exact behavior and usage details of the exported functions and types are not described beyond their symbol names and source file context.
- The repository remote URL and commit SHA are unspecified, limiting traceability.
- The module does not indicate any runtime environment assumptions or constraints.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
