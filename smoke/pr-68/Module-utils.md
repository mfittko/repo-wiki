---
source_repo: "https://github.com/mfittko/repo-wiki.git"
source_commit: "d0fcfd342fdf531e2b9e6176e234f013215af9fc"
page_state: "generated"
source_paths: ["src/utils/args.ts","src/utils/dotenv.ts","src/utils/fs.ts","src/utils/git.ts"]
compiled_at: "2026-05-10T21:15:56.521Z"
kind: "module"
confidence: "medium"
claim_status: "source-grounded"
---

# Module utils

## Purpose

The `utils` module provides a set of TypeScript utility functions and types that facilitate common development tasks. It includes functionality for parsing command-line arguments, loading and parsing environment variables from `.env` files, performing filesystem operations such as reading, writing, and walking files, and interacting with Git repositories through command execution and status retrieval. These utilities are designed to support other parts of the codebase by abstracting common patterns and operations into reusable components.

## Source file list

- [src/utils/args.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/src/utils/args.ts)
- [src/utils/dotenv.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/src/utils/dotenv.ts)
- [src/utils/fs.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/src/utils/fs.ts)
- [src/utils/git.ts](https://github.com/mfittko/repo-wiki/blob/bb2f44bb9d97a2d694ed9182c195f3863a8ba4c3/src/utils/git.ts)

## Key symbols and entry points

### Argument Parsing (`src/utils/args.ts`)

- `parseArgs`: Function to parse command-line arguments into a structured format.
- `ParsedArgs`: Type defining the structure of parsed arguments returned by `parseArgs`.

### Environment Variable Loading (`src/utils/dotenv.ts`)

- `loadDotEnv`: Loads environment variables from `.env` files into the process environment.
- `parseDotEnv`: Parses the raw content of `.env` files into key-value pairs.
- `DotEnvLoadResult`: Type describing the outcome of loading `.env` files, including success or error details.

### Filesystem Utilities (`src/utils/fs.ts`)

- `DEFAULT_WALK_EXCLUDES`: Default glob patterns or filenames to exclude during directory traversal.
- `ensureDir`: Ensures that a directory exists, creating it if it does not.
- `fileExists`: Checks whether a specified file exists.
- `readJson`: Reads and parses a JSON file into an object.
- `writeJson`: Serializes an object and writes it as JSON to a file.
- `writeText`: Writes plain text content to a file.
- `walkFiles`: Recursively traverses directories to list files, respecting exclude patterns.

### Git Utilities (`src/utils/git.ts`)

- `runGit`: Executes arbitrary Git commands and returns their output.
- `getGitCommit`: Retrieves the current Git commit hash of the repository.
- `getGitRemote`: Retrieves the URL of the configured Git remote.
- `getGitStatus`: Retrieves the current status of the Git repository.

## Dependencies and imports

- `src/utils/args.ts`:
  - No external imports.
- `src/utils/dotenv.ts`:
  - Imports local module: `./fs.js`
  - Node.js built-in modules: `fs`, `path`
- `src/utils/fs.ts`:
  - Node.js built-in modules: `fs`, `path`
- `src/utils/git.ts`:
  - Node.js built-in modules: `child_process`, `util`

## Related tests

No explicit test files or test-related documentation cards are linked to this module. It is advisable to verify the existence of tests covering these utilities or to implement tests to ensure their correctness and robustness.

## Known gaps or open questions

- The argument parsing utility (`parseArgs`) lacks documentation on supported argument formats, options, or usage examples.
- Details on error handling, edge cases, and behavior of Git utilities (`runGit`, `getGitCommit`, etc.) are not documented.
- The strategy for handling environment variable conflicts or overrides when loading `.env` files is not specified.
- There is no information on test coverage or testing strategies for this module.
- Additional usage examples and clarifications on filesystem traversal exclusions and Git command execution could improve understanding and usability.

<!-- HUMAN_NOTES_START -->
<!-- HUMAN_NOTES_END -->
