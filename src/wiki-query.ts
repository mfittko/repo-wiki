import path from 'node:path';
import { promises as fs } from 'node:fs';
import { buildSearchIndex, defaultSearchDirForWiki, searchIndex, searchWiki, type SearchResult } from './search.js';
import { getIncomingEdges, getNodeById, getNodesByPath, getOutgoingEdges, loadWikiGraph, selectPageProvenancePaths, type WikiGraphEdge, type WikiGraphIndex, type WikiGraphNode } from './wiki-graph.js';

export type WikiEvidence = {
  ref: string;
  kind: string;
  strength: 'source' | 'documentation' | 'wiki' | 'graph';
  via: string;
};

export type WikiQueryAnswer = {
  question: string;
  answer: string;
  totalResults: number;
  results: SearchResult[];
  evidence: WikiEvidence[];
};

export type WikiExplanation = {
  target: string;
  found: boolean;
  explanation: string;
  page: SearchResult | null;
  evidence: WikiEvidence[];
  related: Array<{ nodeId: string; path: string; kind: string; direction: 'incoming' | 'outgoing'; edgeType: string }>;
};

export type WikiGraphPathResult = {
  from: string;
  to: string;
  found: boolean;
  reason: 'ok' | 'unknown-source' | 'unknown-target' | 'no-path';
  path: Array<{ nodeId: string; path: string; kind: string }>;
  edges: WikiGraphEdge[];
};

export function defaultGraphPathForWiki(wikiDir: string) {
  return path.join(path.dirname(path.resolve(wikiDir)), 'graph.json');
}

export async function buildWikiQueryAnswer({
  question,
  wikiDir,
  graphPath = defaultGraphPathForWiki(wikiDir),
  limit = 5,
  outDir = defaultSearchDirForWiki(wikiDir)
}: {
  question: string;
  wikiDir: string;
  graphPath?: string;
  limit?: number;
  outDir?: string;
}): Promise<WikiQueryAnswer> {
  const result = await searchWiki({ query: question, wikiDir, outDir, limit });
  const graph = await loadOptionalGraph(graphPath);
  const evidence = collectEvidence(result.results, graph);
  return {
    question,
    answer: formatAnswer(question, result.results, evidence),
    totalResults: result.results.length,
    results: result.results,
    evidence
  };
}

export async function buildWikiExplanation({
  target,
  wikiDir,
  graphPath = defaultGraphPathForWiki(wikiDir),
  outDir = defaultSearchDirForWiki(wikiDir)
}: {
  target: string;
  wikiDir: string;
  graphPath?: string;
  outDir?: string;
}): Promise<WikiExplanation> {
  const { index } = await buildSearchIndex({ wikiDir, outDir });
  const graph = await loadOptionalGraph(graphPath);
  const page = findSearchResultForTarget(index, target);
  if (!page) {
    return {
      target,
      found: false,
      explanation: `No wiki page found for: ${target}`,
      page: null,
      evidence: [],
      related: []
    };
  }

  const evidence = collectEvidence([page], graph);
  const related = graph ? collectRelated(graph, page.pagePath) : [];
  return {
    target,
    found: true,
    explanation: formatExplanation(page, evidence, related),
    page,
    evidence,
    related
  };
}

export async function findWikiGraphPath({ graphPath, from, to }: { graphPath: string; from: string; to: string }): Promise<WikiGraphPathResult> {
  const graph = await loadWikiGraph(graphPath);
  const starts = resolveGraphNodes(graph, from);
  if (starts.length === 0) {
    return { from, to, found: false, reason: 'unknown-source', path: [], edges: [] };
  }
  const targets = new Set(resolveGraphNodes(graph, to).map((node) => node.id));
  if (targets.size === 0) {
    return { from, to, found: false, reason: 'unknown-target', path: [], edges: [] };
  }

  const queue = starts.map((node) => ({ node, path: [node], edges: [] as WikiGraphEdge[] }));
  const visited = new Set(starts.map((node) => node.id));

  for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
    const current = queue[queueIndex];
    if (targets.has(current.node.id)) {
      return {
        from,
        to,
        found: true,
        reason: 'ok',
        path: current.path.map(formatPathNode),
        edges: current.edges
      };
    }

    for (const edge of getOutgoingEdges(graph, current.node.id)) {
      const next = getNodeById(graph, edge.to);
      if (!next || visited.has(next.id)) {
        continue;
      }
      visited.add(next.id);
      queue.push({ node: next, path: [...current.path, next], edges: [...current.edges, edge] });
    }
  }

  return { from, to, found: false, reason: 'no-path', path: [], edges: [] };
}

export function formatWikiQueryAnswer(answer: WikiQueryAnswer) {
  return answer.answer;
}

export function formatWikiExplanation(explanation: WikiExplanation) {
  return explanation.explanation;
}

export function formatWikiGraphPath(result: WikiGraphPathResult) {
  if (!result.found) {
    return `No path from ${result.from} to ${result.to}: ${result.reason}`;
  }
  const lines = [`Path from ${result.from} to ${result.to}:`];
  result.path.forEach((node, index) => {
    if (index === 0) {
      lines.push(`${index + 1}. ${node.path || node.nodeId} (${node.kind})`);
      return;
    }
    const edge = result.edges[index - 1];
    lines.push(`${index + 1}. --${edge.type}--> ${node.path || node.nodeId} (${node.kind})`);
  });
  return lines.join('\n');
}

async function loadOptionalGraph(graphPath: string): Promise<WikiGraphIndex | null> {
  try {
    await fs.access(graphPath);
    return await loadWikiGraph(graphPath);
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function collectEvidence(results: SearchResult[], graph: WikiGraphIndex | null) {
  const evidence = new Map<string, WikiEvidence>();
  for (const result of results) {
    for (const sourcePath of result.sourcePaths) {
      addEvidence(evidence, {
        ref: sourcePath,
        kind: inferEvidenceKind(sourcePath),
        strength: inferEvidenceStrength(sourcePath),
        via: `wiki:${result.pagePath}`
      });
    }
    if (!graph) {
      continue;
    }
    for (const item of selectPageProvenancePaths(graph, result.pagePath)) {
      addEvidence(evidence, {
        ref: item.path,
        kind: item.kind,
        strength: item.kind === 'documentation' ? 'documentation' : 'source',
        via: `graph:${result.pagePath}`
      });
    }
  }
  return [...evidence.values()].sort(compareEvidence);
}

function addEvidence(evidence: Map<string, WikiEvidence>, item: WikiEvidence) {
  const key = `${item.strength}:${item.kind}:${item.ref}`;
  if (!evidence.has(key)) {
    evidence.set(key, item);
  }
}

function formatAnswer(question: string, results: SearchResult[], evidence: WikiEvidence[]) {
  if (results.length === 0) {
    return `No local wiki evidence found for: ${question}`;
  }
  const top = results.slice(0, 3).map((result, index) => `${index + 1}. ${result.title}: ${result.summary || result.snippet} [${result.pagePath}]`);
  const evidenceRefs = evidence.filter((item) => item.strength !== 'wiki').slice(0, 8).map((item) => item.ref);
  return [
    `Wiki-first answer for: ${question}`,
    ...top,
    evidenceRefs.length > 0 ? `Evidence: ${evidenceRefs.join(', ')}` : 'Evidence: wiki pages only; verify against source before treating as authoritative.'
  ].join('\n');
}

function formatExplanation(page: SearchResult, evidence: WikiEvidence[], related: WikiExplanation['related']) {
  const lines = [
    `${page.title} (${page.pagePath})`,
    page.summary || page.snippet || 'No summary available.'
  ];
  const evidenceRefs = evidence.filter((item) => item.strength !== 'wiki').map((item) => item.ref);
  lines.push(evidenceRefs.length > 0 ? `Evidence: ${evidenceRefs.join(', ')}` : 'Evidence: wiki page only; source verification needed.');
  if (related.length > 0) {
    lines.push(`Graph: ${related.slice(0, 6).map((item) => `${item.direction}:${item.edgeType}:${item.path}`).join(', ')}`);
  }
  return lines.join('\n');
}

function findSearchResultForTarget(index: Awaited<ReturnType<typeof buildSearchIndex>>['index'], target: string): SearchResult | null {
  const normalized = normalizeTarget(target);
  const exact = index.entries.find((entry) => normalizeTarget(entry.pagePath) === normalized || normalizeTarget(entry.title) === normalized);
  if (exact) {
    return entryToSearchResult(exact, 1, 0);
  }
  const [first] = searchIndex(index, target, 1);
  return first || null;
}

function entryToSearchResult(entry: Awaited<ReturnType<typeof buildSearchIndex>>['index']['entries'][number], rank: number, score: number): SearchResult {
  return {
    rank,
    score,
    pagePath: entry.pagePath,
    title: entry.title,
    kind: entry.kind,
    pageState: entry.pageState,
    summary: entry.summary,
    snippet: entry.snippet,
    sourcePaths: entry.sourcePaths,
    graph: { outboundLinks: entry.outboundLinks, inboundLinks: entry.inboundLinks }
  };
}

function collectRelated(graph: WikiGraphIndex, pagePath: string): WikiExplanation['related'] {
  const pageNodes = getNodesByPath(graph, pagePath, { kind: 'page' });
  const related: WikiExplanation['related'] = [];
  for (const node of pageNodes) {
    for (const edge of getOutgoingEdges(graph, node.id)) {
      const target = getNodeById(graph, edge.to);
      if (target) related.push({ nodeId: target.id, path: target.path, kind: target.kind, direction: 'outgoing', edgeType: edge.type });
    }
    for (const edge of getIncomingEdges(graph, node.id)) {
      const source = getNodeById(graph, edge.from);
      if (source) related.push({ nodeId: source.id, path: source.path, kind: source.kind, direction: 'incoming', edgeType: edge.type });
    }
  }
  return related.sort((left, right) => left.direction.localeCompare(right.direction) || left.edgeType.localeCompare(right.edgeType) || left.path.localeCompare(right.path));
}

function resolveGraphNodes(graph: WikiGraphIndex, target: string): WikiGraphNode[] {
  const exact = getNodeById(graph, target);
  if (exact) return [exact];
  const normalized = normalizeTarget(target);
  const byPath = getNodesByPath(graph, target);
  if (byPath.length > 0) return byPath;
  return graph.graph.nodes.filter((node) => normalizeTarget(node.path) === normalized || normalizeTarget(node.id) === normalized).sort(compareNodes);
}

function formatPathNode(node: WikiGraphNode) {
  return { nodeId: node.id, path: node.path, kind: node.kind };
}

function inferEvidenceKind(ref: string) {
  return /\.(md|mdx|markdown)$/i.test(ref) ? 'documentation' : 'source';
}

function inferEvidenceStrength(ref: string): WikiEvidence['strength'] {
  return /\.(md|mdx|markdown)$/i.test(ref) ? 'documentation' : 'source';
}


function normalizeTarget(value: string) {
  return value
    .toLowerCase()
    .replace(/^page:\s*/, '')
    .replace(/^source:\s*/, '')
    .replace(/^documentation:\s*/, '')
    .replace(/^\.\//, '')
    .replace(/\.md$/i, '')
    .trim()
    .replace(/\s+/g, '-');
}

function compareNodes(left: WikiGraphNode, right: WikiGraphNode) {
  return left.kind.localeCompare(right.kind) || left.path.localeCompare(right.path) || left.id.localeCompare(right.id);
}


function compareEvidence(left: WikiEvidence, right: WikiEvidence) {
  return evidenceStrengthRank(left.strength) - evidenceStrengthRank(right.strength)
    || left.ref.localeCompare(right.ref)
    || left.via.localeCompare(right.via);
}

function evidenceStrengthRank(strength: WikiEvidence['strength']) {
  if (strength === 'source') return 0;
  if (strength === 'documentation') return 1;
  if (strength === 'graph') return 2;
  return 3;
}
