# Why repo-wiki exists

`repo-wiki` applies the LLM Wiki pattern to software repositories: compile repository knowledge into a durable, interlinked wiki instead of asking an LLM to reconstruct the same context from raw files on every question.

This project is inspired by Andrej Karpathy's LLM Wiki concept note. This page is a repo-wiki-specific summary written in this project's own words, not a copy of the external note. For the original source, see:

- Andrej Karpathy, "LLM Wiki": <https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f>

## The product lens

Many repository-assistance workflows are ephemeral. A developer or coding agent searches code, reads scattered docs, reconstructs architecture, answers one question, and then loses most of that synthesis to chat history or local context. The next person or agent repeats much of the work.

`repo-wiki` turns repeated investigation into a maintained artifact:

- the Git repository at a pinned commit remains the source of truth;
- generated wiki pages become the compiled knowledge layer;
- `.llmwiki/schema.md`, `.llmwiki/config.json`, prompts, and agent pointers define how the wiki should be maintained;
- `Index.md` routes humans and agents to relevant pages;
- `Log.md` records ingests, compiles, lint passes, publication events, and future query/file-back events.

The generated wiki does not replace source-level investigation. It is a first navigation layer that helps humans and coding agents start with repository-shaped context, then verify material claims against code, tests, configuration, and validated documentation.

## Why a maintained wiki instead of only search or RAG

Search and retrieval-augmented generation are useful for finding relevant fragments, but they usually perform synthesis at query time. That makes important context easy to lose:

- architecture summaries are rebuilt repeatedly;
- contradictions between documentation and code may be noticed once and forgotten;
- useful answers remain in chat instead of becoming repository knowledge;
- new agents begin from raw files rather than accumulated understanding.

A maintained wiki lets synthesis compound. Module pages, architecture pages, documentation-debt reports, open questions, and future filed-back investigations can be updated as the repository changes. The result is a durable knowledge base that remains inspectable in ordinary markdown and publishable through GitHub Wiki.

## What repo-wiki adds

`repo-wiki` narrows the general LLM Wiki idea to the software-repository domain:

- deterministic scanning and planning over repository files;
- documentation ingestion with validation and debt reporting;
- generated GitHub Wiki pages under `.llmwiki/wiki`;
- lint gates for required pages, links, source metadata, and secret-like content;
- a publish path to `OWNER/REPO.wiki.git`;
- a package and CLI intended to work for this repository and for external repositories.

The long-term goal is repository memory infrastructure: developers understand unfamiliar code faster, agents use the wiki before diving into source, maintainers can see documentation drift, and high-value repository answers can become durable wiki pages with provenance.

## Authority model

The generated wiki is derived. When evidence conflicts, `repo-wiki` treats source authority in this order:

1. code at the pinned commit;
2. tests;
3. CI, build, and runtime configuration;
4. generated schemas, route maps, and migrations;
5. markdown documentation as secondary evidence;
6. issues, PRs, and comments as contextual evidence only when explicitly ingested;
7. existing generated wiki pages as derived evidence.

This is why `repo-wiki` includes linting and documentation-debt reporting: the product should compile useful knowledge without turning stale docs or unsupported LLM output into confident generated fiction.

For the full roadmap, layer mapping, and implementation plan, see [PLAN.md](./PLAN.md).
