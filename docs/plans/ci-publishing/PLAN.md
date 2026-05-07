# Epic: CI & Publishing

## Summary

Production-ready GitHub Actions workflows and publishing infrastructure that safely pushes generated wiki content, enforces security policies, and supports both bootstrap and incremental post-merge flows.

## Architecture

```mermaid
flowchart TD
  Trigger{Trigger} --> |push to main| Incremental[Incremental Mode]
  Trigger --> |workflow_dispatch| Bootstrap[Bootstrap Mode]
  Trigger --> |schedule| Refresh[Full Refresh]

  Incremental --> Checkout[Checkout Source]
  Bootstrap --> Checkout
  Refresh --> Checkout

  Checkout --> Install[npm ci]
  Install --> Test[npm test]
  Test --> Generate[repo-wiki run]
  Generate --> SecGate{Secret Gate}
  SecGate -->|secrets detected| Block[Block & Alert]
  SecGate -->|clean| LintGate{Lint Gate}
  LintGate -->|fail| Block
  LintGate -->|pass| ReviewGate{Review Required?}
  ReviewGate -->|sensitive pages| HumanReview[Human Review]
  ReviewGate -->|no| Publish[Push to Wiki]
  HumanReview -->|approved| Publish
  Publish --> Notify[Status Notification]
```

```mermaid
flowchart LR
  subgraph Token Management
    App[GitHub App]
    PAT[Fine-grained PAT]
    OIDC[OIDC Token]
  end
  subgraph Publish Strategies
    Direct[Direct Push]
    PR[Wiki PR]
    Atomic[Atomic All-or-Nothing]
  end
  App --> Direct
  PAT --> Direct
  App --> PR
  OIDC --> Atomic
```

```mermaid
sequenceDiagram
  participant GH as GitHub Actions
  participant Wiki as repo-wiki CLI
  participant Lint as Lint Gates
  participant Remote as REPO.wiki.git

  GH->>Wiki: repo-wiki run --mode incremental
  Wiki-->>GH: generated pages
  GH->>Lint: validate (secrets, links, structure)
  Lint-->>GH: pass/fail
  alt pass
    GH->>Remote: git push
    Remote-->>GH: success
  else fail
    GH->>GH: upload artifact, notify
  end
```

## Key Deliverables

- GitHub Actions workflow for wiki generation on push to main
- GitHub Actions workflow for manual/dispatch wiki bootstrap
- Token management (GitHub App or fine-grained PAT)
- Security gate: block publish on secret-like content detection
- Optional human review gate for sensitive pages (auth, billing, deployment, security)
- PR-based wiki publishing option (wiki PR instead of direct push)
- Artifact retention for unpublished wiki builds
- Status checks and notifications

## Success Criteria

- Wiki auto-updates on merge to main with no manual intervention
- Secrets never reach published wiki pages
- Untrusted PRs cannot trigger wiki publication
- Failed lint gates block publication
- Clear audit trail of what was published and when

## Dependencies

- Upstream: Incremental mode (post-merge updates), all lint gates
- Downstream: None (terminal epic)

## Open Questions

- Should the publisher open a PR against the wiki repo instead of pushing directly?
- How to handle wiki publication failures (retry, alert, rollback)?
- Should wiki publication be atomic (all pages or nothing) or incremental?
- How to manage wiki git history (squash or preserve per-page commits)?
