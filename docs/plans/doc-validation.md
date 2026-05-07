# Epic: Documentation Validation

## Summary

Implement deep documentation validators that go beyond the current scaffold's conservative checks, enabling reliable detection of stale, contradicted, and unvalidated documentation claims.

## Architecture

```mermaid
flowchart TD
  Docs[Markdown Documentation] --> Extract[Claim Extraction]
  Extract --> Commands[Commands & Scripts]
  Extract --> EnvVars[Environment Variables]
  Extract --> FilePaths[File References]
  Extract --> Routes[API Routes]
  Extract --> ADRs[ADR Decisions]

  Commands --> V1[Script Validator]
  EnvVars --> V2[Env Var Validator]
  FilePaths --> V3[File Path Validator]
  Routes --> V4[Route Validator]
  ADRs --> V5[ADR Validator]

  PkgJson[package.json] --> V1
  CI[CI Workflows] --> V1
  Config[Config/Schema Files] --> V2
  Code[Source Code] --> V2
  Tree[Repo File Tree] --> V3
  Scanner[Route Extractors] --> V4
  GitLog[Git History] --> V5

  V1 --> Status{Validation Status}
  V2 --> Status
  V3 --> Status
  V4 --> Status
  V5 --> Status

  Status --> Validated[Validated ✓]
  Status --> Unvalidated[Unvalidated ?]
  Status --> Stale[Stale ⚠]
  Status --> Contradicted[Contradicted ✗]
```

```mermaid
flowchart LR
  subgraph Strictness Levels
    Strict[strict: errors block publish]
    Standard[standard: warnings + errors]
    Lenient[lenient: warnings only]
    Off[off: skip validation]
  end
  subgraph Output
    Report[Documentation-Debt-Report.md]
    OpenQ[Open-Questions.md]
    LintResult[Lint exit code]
  end
  Strict --> LintResult
  Standard --> Report
  Standard --> OpenQ
  Lenient --> Report
```

## Key Deliverables

- Package script validation against `package.json`
- Command validation against Makefiles, task runners, and CI workflows
- Route validation against framework-specific route extractors
- Environment variable validation against config/schema/code usage
- File reference validation against the repository tree
- ADR recency and supersession detection
- Configurable validation strictness levels
- Rich Documentation-Debt-Report generation with actionable items

## Success Criteria

- Commands mentioned in docs are verified against actual scripts/CI
- Environment variables in docs are cross-referenced with code usage
- File paths in docs are validated against the repo tree
- ADRs are flagged when superseded or older than threshold
- False positive rate is low enough that teams don't disable validation

## Dependencies

- Upstream: Production scanner (source cards with scripts, routes, env vars)
- Downstream: LLM compiler (validated doc cards influence wiki content)

## Open Questions

- How to handle commands that are valid but not in package.json (e.g., global CLIs)?
- Should validation run against CI workflow definitions or actual CI runs?
- How to detect ADR supersession without explicit metadata?
- What false-positive rate is acceptable before teams lose trust?
