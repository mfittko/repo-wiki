# Wiki and Documentation Lint Prompt

Validate the compiled wiki and ingested markdown.

Check for:

- missing required pages
- broken wiki links
- orphan pages
- missing source commit metadata
- secret-like content
- stale documentation influencing authoritative wiki text
- documentation claims contradicted by code, tests, CI, config, schemas, or migrations
- unvalidated operational claims from markdown
- duplicate pages or concepts
- oversized pages

Documentation is not rejected by default; it is scored, labeled, and reported.
