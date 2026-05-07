# Epic: Agent Integration

## Summary

Make the generated wiki maximally useful for coding agents by producing optimized context packs, generating agent pointer files, and optionally exposing a query interface or MCP endpoint.

## Architecture

```mermaid
flowchart TD
  Wiki[Generated Wiki Pages] --> Pack[Agent-Context-Pack Generator]
  Wiki --> Pointer[Agent Pointer Generator]
  Wiki --> Index[Search Index Builder]
  Pack --> AgentContext[Agent-Context-Pack.md]
  Pointer --> AgentsFile[AGENTS.md / AGENTS.repo-wiki.md]
  Index --> Query[repo-wiki query CLI]
  Index --> MCP[MCP Endpoint]
  AgentContext --> Agent[Coding Agent]
  AgentsFile --> Agent
  Query --> Agent
  MCP --> Agent
```

```mermaid
flowchart LR
  subgraph Context Pack Contents
    Arch[Architecture Summary]
    ModMap[Module Map]
    Conv[Key Conventions]
    Pitfalls[Known Pitfalls]
    Routes[Task Routing Table]
  end
  subgraph Agent Reads
    First[1. Agent-Context-Pack]
    Then[2. Relevant Module Page]
    Finally[3. Cross-cutting Pages]
  end
  Arch --> First
  ModMap --> First
  Conv --> First
  Pitfalls --> First
  Routes --> Then
```

```mermaid
sequenceDiagram
  participant Agent as Coding Agent
  participant MCP as MCP Endpoint
  participant Graph as Wiki Graph
  participant Wiki as Wiki Pages

  Agent->>MCP: query("how does auth work?")
  MCP->>Graph: find related nodes
  Graph-->>MCP: [Auth-Module, Security-Page, API-Routes]
  MCP->>Wiki: fetch page content
  Wiki-->>MCP: page markdown
  MCP-->>Agent: synthesized answer + sources
```

## Key Deliverables

- Generate `AGENTS.md` or `AGENTS.repo-wiki.md` pointers in target repos
- Generate `Agent-Context-Pack.md` optimized for coding agent consumption
- Context pack includes: architecture summary, module map, key conventions, known pitfalls
- Optional `repo-wiki query` command for targeted wiki lookups
- Optional MCP (Model Context Protocol) endpoint for agent tool use
- Optional local search index over generated wiki

## Success Criteria

- A coding agent reading Agent-Context-Pack.md gains actionable project understanding
- Agent pointer files direct agents to the wiki without manual configuration
- Query interface (if implemented) returns relevant wiki content for natural-language questions

## Dependencies

- Upstream: LLM compiler (quality wiki content), production scanner (rich source data)
- Downstream: None (terminal epic)

## Open Questions

- What format should Agent-Context-Pack.md use for maximum agent utility?
- Should the MCP endpoint serve raw wiki pages or synthesized answers?
- How to keep agent pointers in sync with wiki structure changes?
- Should query use embedding search, keyword search, or both?
