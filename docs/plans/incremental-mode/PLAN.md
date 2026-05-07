# Epic: Incremental Mode

## Summary

Implement diff-based wiki maintenance that scans only changed files, identifies affected wiki pages, and produces targeted page patches rather than full regeneration.

## Architecture

```mermaid
flowchart TD
  PrevCommit[Previous Compiled Commit] --> Diff[git diff base..head]
  HeadCommit[Current Commit] --> Diff
  Diff --> Changed[Changed Files]
  Changed --> CardMap[Source Card Mapping]
  CardMap --> ImportGraph[Import Graph Lookup]
  ImportGraph --> AffectedCards[Affected Source Cards]
  AffectedCards --> PageMap[Page Frontmatter Mapping]
  PageMap --> AffectedPages[Affected Wiki Pages]
  AffectedPages --> Patch[Targeted Page Patching]
  Patch --> CrossLink[Cross-link Validation]
  CrossLink --> DebtReport[Debt Report Update]
  DebtReport --> Lint[Lint Gates]
  Lint -->|pass| Publish[Safe Publish]
  Lint -->|fail| Block[Block & Report]
```

```mermaid
flowchart LR
  subgraph Change Propagation
    File[Changed File] --> DirectPage[Direct Page]
    File --> Importer[Importing Modules]
    Importer --> TransitivePage[Transitive Pages]
    File --> Test[Related Tests]
    Test --> TestPage[Testing Strategy Page]
  end
```

```mermaid
stateDiagram-v2
  [*] --> DetectChanges
  DetectChanges --> MapToCards
  MapToCards --> FindAffectedPages
  FindAffectedPages --> PatchPages
  PatchPages --> ValidateCrossLinks
  ValidateCrossLinks --> RunLint
  RunLint --> Publish: pass
  RunLint --> FullBootstrap: too many changes
  Publish --> [*]
  FullBootstrap --> [*]
```

## Key Deliverables

- Store previous compiled commit reference
- Git diff computation (base..head changed files)
- Changed-file to source-card mapping
- Affected-page identification via import graph and page frontmatter
- Targeted page patching (update only affected sections)
- Re-run cross-link validation after patching
- Re-run documentation debt report for affected docs
- Safe publish after lint gates pass

## Success Criteria

- Incremental run touches only pages affected by the diff
- Cross-links remain valid after partial updates
- Incremental output matches what a full bootstrap would produce for affected pages
- Runtime scales with change size, not repository size

## Dependencies

- Upstream: Production scanner (import graph, affected-page graph), LLM compiler (page patching)
- Downstream: CI publishing (post-merge incremental runs)

## Open Questions

- How to handle renames and moved files?
- What triggers a full re-bootstrap vs incremental patch?
- Should incremental mode track page staleness independently?
- How to handle transitive dependency changes (A imports B, B changes)?
