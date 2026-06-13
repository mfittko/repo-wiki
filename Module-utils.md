---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "f5a973364c2a93ccbfa3b102d1da911a58e92021"
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
- `src/utils/dotenv.ts`  
- `src/utils/fs.ts`  
- `src/utils/git.ts`  

## Key symbols and entry points

### `src/utils/args.ts`
- `parseArgs` — Function to parse command-line arguments.
- `ParsedArgs` — Type representing the structure of parsed arguments.

### `src/utils/dotenv.ts`
- `loadDotEnv` — Function to load environment variables from `.env` files.
- `parseDotEnv` — Function to parse `.env` file content.
- `DotEnvLoadResult` — Type representing the result of loading `.env` files.

### `src/utils/fs.ts`
- `DEFAULT_WALK_EXCLUDES` — Default patterns to exclude when walking directories.
- `ensureDir` — Function to ensure a directory exists, creating it if necessary.
- `fileExists` — Function to check if a file exists.
- `readJson` — Function to read and parse a JSON file.
- `walkFiles` — Function to recursively walk files in a directory.
- `writeJson` — Function to write JSON data to a file.
- `writeText` — Function to write text data to a file.

### `src/utils/git.ts`
- `runGit` — Function to run arbitrary Git commands.
- `getGitCommit` — Function to retrieve the current Git commit hash.
- `getGitRemote` — Function to get the Git remote URL.
- `getGitStatus` — Function to get the current Git status.

## Dependencies and imports

- `src/utils/dotenv.ts` imports:
  - `./fs.js` (local filesystem utilities)
  - `node:fs` (Node.js filesystem module)
  - `node:path` (Node.js path module)

- `src/utils/fs.ts` imports:
  - `node:fs`
  - `node:path`

- `src/utils/git.ts` imports:
  - `node:child_process` (to spawn Git commands)
  - `node:util` (for promisification and utilities)

- `src/utils/args.ts` has no imports.

## Related tests

No test files or test-related documentation cards are present in the current source data for this module.

## Known gaps or open questions

- There is no explicit documentation or test coverage information available for this module.
- The exact repository remote URL and commit SHA are not specified.
- The usage context or higher-level integration of these utilities is not described.
- No information on error handling strategies or edge cases is provided.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
