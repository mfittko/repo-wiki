---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "e8e50cf58d4fe0b1575ca9d2f73e98541cc2c545"
page_state: "generated"
source_paths: ["src/utils/args.ts","src/utils/dotenv.ts","src/utils/fs.ts","src/utils/git.ts"]
compiled_at: "<ISO-8601 timestamp>"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module `utils`

## Purpose

The `utils` module provides a collection of utility functions and types implemented in TypeScript that support various common tasks related to argument parsing, environment variable loading, filesystem operations, and Git command execution. This module serves as foundational source code to facilitate handling command-line arguments, managing `.env` files, performing file system manipulations, and interacting with Git repositories programmatically.

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
- `parseDotEnv` — Function to parse the contents of `.env` files.
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
  - Node.js built-in modules: `fs`, `path`

- `src/utils/fs.ts` imports:
  - Node.js built-in modules: `fs`, `path`

- `src/utils/git.ts` imports:
  - Node.js built-in modules: `child_process`, `util`

- `src/utils/args.ts` has no imports.

## Related tests

No explicit test files or test-related documentation cards are present in the source data for this module.

## Known gaps or open questions

- There is no information about test coverage or test files related to this module.
- The repository remote URL and commit SHA are unknown, limiting traceability.
- No documentation or usage examples are provided for the exported symbols.
- The exact runtime environment or intended usage context is not specified.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
