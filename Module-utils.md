---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "a33ab6cfdfb7a298ba26e23ddb762c00190f3ef2"
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

- **Argument Parsing**  
  - `parseArgs` — Parses command-line arguments.  
  - `ParsedArgs` — Type representing parsed arguments.

- **Environment Variable Handling**  
  - `loadDotEnv` — Loads environment variables from `.env` files.  
  - `parseDotEnv` — Parses `.env` file content.  
  - `DotEnvLoadResult` — Type representing the result of loading `.env` files.

- **Filesystem Utilities**  
  - `ensureDir` — Ensures a directory exists, creating it if necessary.  
  - `fileExists` — Checks if a file exists.  
  - `readJson` — Reads and parses a JSON file.  
  - `writeJson` — Writes JSON data to a file.  
  - `writeText` — Writes text data to a file.  
  - `walkFiles` — Recursively walks files in a directory with exclusion support.  
  - `DEFAULT_WALK_EXCLUDES` — Default patterns to exclude during file walking.

- **Git Utilities**  
  - `getGitCommit` — Retrieves the current Git commit hash.  
  - `getGitRemote` — Retrieves the Git remote URL.  
  - `getGitStatus` — Retrieves the current Git status.  
  - `runGit` — Runs arbitrary Git commands.

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

No test files or test-related documentation cards are present in the current source data for this module.

## Known gaps or open questions

- There is no explicit documentation or test coverage information available for this module.  
- The exact behavior and options of the utility functions are not detailed beyond symbol names and import dependencies.  
- The repository remote URL and commit SHA are unspecified, limiting traceability.  
- The module does not currently expose any higher-level orchestration or integration utilities beyond the individual utility functions.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
