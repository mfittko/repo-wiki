# Epic: LLM Compiler

## Summary

Replace the deterministic placeholder summaries in the wiki compiler with LLM-powered synthesis that produces human-quality wiki pages grounded in source cards, documentation cards, and targeted code excerpts.

## Architecture

```mermaid
flowchart TD
  SourceCards[Source Cards] --> Budget[Token Budget Assembler]
  DocCards[Documentation Cards] --> Budget
  CodeExcerpts[Targeted Code Excerpts] --> Budget
  Budget --> Context[Assembled Context Window]
  Context --> Prompt[Prompt Template Selection]
  PageType[Page Archetype] --> Prompt
  Prompt --> LLM[LLM Provider]
  LLM --> RawOutput[Raw LLM Output]
  RawOutput --> Patch[Structured Patch]
  Patch --> Preserve[Human Section Preservation]
  Preserve --> Cite[Citation Enforcement]
  Cite --> Lint[Lint Gate Validation]
  Lint -->|pass| Page[Final Wiki Page]
  Lint -->|fail| Retry[Retry / Flag]
```

```mermaid
flowchart LR
  subgraph Page Archetypes
    Foundation[Foundation Pages]
    Module[Module Pages]
    CrossCut[Cross-cutting Pages]
  end
  subgraph Prompts
    P1[home.md]
    P2[architecture.md]
    P3[module.md]
    P4[dependency-map.md]
  end
  Foundation --> P1
  Foundation --> P2
  Module --> P3
  CrossCut --> P4
```

```mermaid
sequenceDiagram
  participant Planner
  participant Assembler as Context Assembler
  participant LLM
  participant Linter

  Planner->>Assembler: Page plan + source cards
  Assembler->>Assembler: Select excerpts within token budget
  Assembler->>LLM: Prompt + context
  LLM-->>Assembler: Generated page content
  Assembler->>Linter: Validate output
  Linter-->>Assembler: Pass/fail + issues
  alt lint passes
    Assembler->>Planner: Emit final page
  else lint fails
    Assembler->>LLM: Retry with feedback
  end
```

## Key Deliverables

- LLM synthesis pipeline for each wiki page type (foundation, module, cross-cutting)
- Source card and code excerpt context assembly (token-budget aware)
- Structured patch output format for wiki pages
- Source citation enforcement (every material claim cites a path)
- Contradiction and confidence metadata in generated pages
- Human-maintained section preservation during regeneration
- Prompt templates for each page archetype

## Success Criteria

- Generated wiki pages are useful without manual editing
- Every factual claim cites source paths
- Human-maintained sections survive regeneration unchanged
- LLM output passes lint gates before acceptance
- Token budget stays within model context limits per page

## Dependencies

- Upstream: Production scanner (rich source cards), doc-validation (validated doc cards)
- Downstream: Incremental mode (page patching), agent-integration (Agent-Context-Pack quality)

## Open Questions

- Which LLM provider(s) to support? (OpenAI, Anthropic, local models)
- How much raw code should the compiler read per page?
- Should compilation be parallelized across pages?
- How to handle hallucination detection beyond lint gates?
- Cost/latency budget for full bootstrap vs incremental compile?
