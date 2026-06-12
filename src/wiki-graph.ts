import path from 'node:path';
import { readJson } from './utils/fs.js';

const MANAGED_PAGE_STATES = new Set(['generated', 'mixed']);
const GRAPH_NODE_KINDS_WITH_PATH_LOOKUPS = new Set(['page', 'source', 'documentation', 'module']);
const SUPPORTED_GRAPH_NODE_KINDS = new Set(['page', 'source', 'documentation', 'module']);
const SUPPORTED_GRAPH_EDGE_TYPES = new Set(['affects', 'wiki_link', 'provenance', 'owns']);

export type WikiGraphNode = {
  id: string;
  kind: string;
  path: string;
  page_state?: string;
};

export type WikiGraphEdge = {
  type: string;
  from: string;
  to: string;
};

export type WikiGraphData = {
  schema_version: number;
  nodes: WikiGraphNode[];
  edges: WikiGraphEdge[];
};

export type WikiGraphIndex = {
  graph: WikiGraphData;
  graphPath: string | null;
  graphLabel: string;
  nodeById: Map<string, WikiGraphNode>;
  nodesByKind: Map<string, WikiGraphNode[]>;
  nodesByPath: Map<string, WikiGraphNode[]>;
  edgesByType: Map<string, WikiGraphEdge[]>;
  outgoingEdgesByNodeId: Map<string, WikiGraphEdge[]>;
  incomingEdgesByNodeId: Map<string, WikiGraphEdge[]>;
};

export type AffectedWikiGraphPageSelection = {
  pageId: string;
  pagePath: string;
  pageState: string;
  changedPaths: string[];
};

export type WikiGraphTraversalSelection = {
  nodeId: string;
  path: string;
  kind: string;
};

export class WikiGraphError extends Error {
  code: string;
  graphPath: string | null;

  constructor(message: string, graphPath?: string | null) {
    super(graphPath ? `${message} (${path.basename(graphPath)})` : message);
    this.name = 'WikiGraphError';
    this.code = 'INVALID_GRAPH';
    this.graphPath = graphPath || null;
  }
}

export async function loadWikiGraph(graphPath: string): Promise<WikiGraphIndex> {
  const raw = await readJson(graphPath);
  return buildWikiGraphIndex(raw, { graphPath });
}

export function buildWikiGraphIndex(rawGraph: unknown, options: { graphPath?: string } = {}): WikiGraphIndex {
  const graph = parseWikiGraph(rawGraph, options);
  const nodeById = new Map<string, WikiGraphNode>();
  const nodesByKind = new Map<string, WikiGraphNode[]>();
  const nodesByPath = new Map<string, WikiGraphNode[]>();
  const edgesByType = new Map<string, WikiGraphEdge[]>();
  const outgoingEdgesByNodeId = new Map<string, WikiGraphEdge[]>();
  const incomingEdgesByNodeId = new Map<string, WikiGraphEdge[]>();

  for (const node of graph.nodes) {
    if (nodeById.has(node.id)) {
      throw new WikiGraphError(`Graph nodes must have unique ids; found duplicate ${node.id}.`, options.graphPath);
    }
    nodeById.set(node.id, node);
    pushIndexed(nodesByKind, node.kind, node);
    if (GRAPH_NODE_KINDS_WITH_PATH_LOOKUPS.has(node.kind)) {
      pushIndexed(nodesByPath, node.path, node);
    }
  }

  for (const edge of graph.edges) {
    const fromNode = nodeById.get(edge.from);
    if (!fromNode) {
      throw new WikiGraphError(`Graph edge ${edge.type} references missing from-node ${edge.from}.`, options.graphPath);
    }
    const toNode = nodeById.get(edge.to);
    if (!toNode) {
      throw new WikiGraphError(`Graph edge ${edge.type} references missing to-node ${edge.to}.`, options.graphPath);
    }
    validateEdgeEndpoints(edge, fromNode, toNode, options.graphPath);
    pushIndexed(edgesByType, edge.type, edge);
    pushIndexed(outgoingEdgesByNodeId, edge.from, edge);
    pushIndexed(incomingEdgesByNodeId, edge.to, edge);
  }

  return {
    graph,
    graphPath: options.graphPath || null,
    graphLabel: path.basename(options.graphPath || 'graph.json'),
    nodeById,
    nodesByKind,
    nodesByPath,
    edgesByType,
    outgoingEdgesByNodeId,
    incomingEdgesByNodeId
  };
}

export function parseWikiGraph(rawGraph: unknown, options: { graphPath?: string } = {}): WikiGraphData {
  if (!rawGraph || typeof rawGraph !== 'object' || Array.isArray(rawGraph)) {
    throw new WikiGraphError('Graph artifact must be a JSON object.', options.graphPath);
  }

  const graph = rawGraph as Record<string, unknown>;
  if (!Number.isInteger(graph.schema_version)) {
    throw new WikiGraphError('Graph artifact schema_version must be an integer.', options.graphPath);
  }
  if (!Array.isArray(graph.nodes)) {
    throw new WikiGraphError('Graph artifact nodes must be an array.', options.graphPath);
  }
  if (!Array.isArray(graph.edges)) {
    throw new WikiGraphError('Graph artifact edges must be an array.', options.graphPath);
  }

  const nodes = graph.nodes.map((node, index) => parseNode(node, index, options.graphPath)).sort(compareGraphNodes);
  const edges = graph.edges.map((edge, index) => parseEdge(edge, index, options.graphPath)).sort(compareGraphEdges);

  return {
    schema_version: Number(graph.schema_version),
    nodes,
    edges
  };
}

export function isSupportedWikiGraphSchema(index: WikiGraphIndex | WikiGraphData): boolean {
  const graph = 'graph' in index ? index.graph : index;
  return graph.schema_version === 1;
}

export function getNodeById(index: WikiGraphIndex, nodeId: string): WikiGraphNode | null {
  return index.nodeById.get(nodeId) || null;
}

export function getNodesByKind(index: WikiGraphIndex, kind: string): WikiGraphNode[] {
  return [...(index.nodesByKind.get(kind) || [])];
}

export function getNodesByPath(index: WikiGraphIndex, graphPath: string, options: { kind?: string } = {}): WikiGraphNode[] {
  const candidates = index.nodesByPath.get(normalizeGraphPath(graphPath)) || [];
  if (!options.kind) {
    return [...candidates];
  }
  return candidates.filter((node) => node.kind === options.kind);
}

export function getEdgesByType(index: WikiGraphIndex, type: string): WikiGraphEdge[] {
  return [...(index.edgesByType.get(type) || [])];
}

export function getOutgoingEdges(index: WikiGraphIndex, nodeId: string, options: { type?: string } = {}): WikiGraphEdge[] {
  const edges = index.outgoingEdgesByNodeId.get(nodeId) || [];
  if (!options.type) {
    return [...edges];
  }
  return edges.filter((edge) => edge.type === options.type);
}

export function getIncomingEdges(index: WikiGraphIndex, nodeId: string, options: { type?: string } = {}): WikiGraphEdge[] {
  const edges = index.incomingEdgesByNodeId.get(nodeId) || [];
  if (!options.type) {
    return [...edges];
  }
  return edges.filter((edge) => edge.type === options.type);
}

export function getAdjacentNodes(
  index: WikiGraphIndex,
  nodeId: string,
  options: { direction?: 'outgoing' | 'incoming'; type?: string } = {}
): WikiGraphNode[] {
  const direction = options.direction || 'outgoing';
  const edges = direction === 'incoming'
    ? getIncomingEdges(index, nodeId, { type: options.type })
    : getOutgoingEdges(index, nodeId, { type: options.type });

  return edges
    .map((edge) => getNodeById(index, direction === 'incoming' ? edge.from : edge.to))
    .filter((node): node is WikiGraphNode => !!node);
}


export function selectLinkedPagePaths(index: WikiGraphIndex, pagePath: string): WikiGraphTraversalSelection[] {
  return selectPageTraversalNodes(index, pagePath, 'wiki_link', ['page']);
}

export function selectPageProvenancePaths(index: WikiGraphIndex, pagePath: string): WikiGraphTraversalSelection[] {
  return selectPageTraversalNodes(index, pagePath, 'provenance', ['source', 'documentation']);
}

export function getManagedPagePaths(index: WikiGraphIndex): Set<string> {
  const managed = new Set<string>();
  for (const node of getNodesByKind(index, 'page')) {
    if (isManagedPageState(node.page_state)) {
      managed.add(node.path);
    }
  }
  return managed;
}

export function selectAffectedPagePaths(
  index: WikiGraphIndex,
  changedPaths: string[],
  options: { managedOnly?: boolean } = {}
): AffectedWikiGraphPageSelection[] {
  const managedOnly = options.managedOnly !== false;
  const selections = new Map<string, { pageId: string; pagePath: string; pageState: string; changedPaths: Set<string> }>();

  for (const changedPath of normalizeAndUniqueGraphPaths(changedPaths)) {
    const sourceNodes = getNodesByPath(index, changedPath)
      .filter((node) => node.kind === 'source' || node.kind === 'documentation');

    for (const sourceNode of sourceNodes) {
      for (const edge of getOutgoingEdges(index, sourceNode.id, { type: 'affects' })) {
        const pageNode = getNodeById(index, edge.to);
        if (!pageNode || pageNode.kind !== 'page') {
          continue;
        }
        const pageState = String(pageNode.page_state || 'generated');
        if (managedOnly && !isManagedPageState(pageState)) {
          continue;
        }
        let selection = selections.get(pageNode.path);
        if (!selection) {
          selection = {
            pageId: pageNode.id,
            pagePath: pageNode.path,
            pageState,
            changedPaths: new Set<string>()
          };
          selections.set(pageNode.path, selection);
        }
        selection.changedPaths.add(changedPath);
      }
    }
  }

  return [...selections.values()]
    .map((selection) => ({
      pageId: selection.pageId,
      pagePath: selection.pagePath,
      pageState: selection.pageState,
      changedPaths: [...selection.changedPaths].sort()
    }))
    .sort((left, right) => left.pagePath.localeCompare(right.pagePath));
}

export function isManagedPageState(pageState: string | undefined): boolean {
  return MANAGED_PAGE_STATES.has(String(pageState || 'generated'));
}


function selectPageTraversalNodes(
  index: WikiGraphIndex,
  pagePath: string,
  edgeType: 'wiki_link' | 'provenance',
  targetKinds: string[]
): WikiGraphTraversalSelection[] {
  const pageNodes = getNodesByPath(index, pagePath, { kind: 'page' });
  const targetKindSet = new Set(targetKinds);
  const selected = new Map<string, WikiGraphTraversalSelection>();

  for (const pageNode of pageNodes) {
    for (const edge of getOutgoingEdges(index, pageNode.id, { type: edgeType })) {
      const targetNode = getNodeById(index, edge.to);
      if (!targetNode || !targetKindSet.has(targetNode.kind)) {
        continue;
      }
      selected.set(targetNode.id, {
        nodeId: targetNode.id,
        path: targetNode.path,
        kind: targetNode.kind
      });
    }
  }

  return [...selected.values()].sort(compareTraversalSelections);
}

function compareTraversalSelections(left: WikiGraphTraversalSelection, right: WikiGraphTraversalSelection) {
  return left.kind.localeCompare(right.kind)
    || left.path.localeCompare(right.path)
    || left.nodeId.localeCompare(right.nodeId);
}

function parseNode(rawNode: unknown, index: number, graphPath?: string): WikiGraphNode {
  if (!rawNode || typeof rawNode !== 'object' || Array.isArray(rawNode)) {
    throw new WikiGraphError(`Graph node at index ${index} must be an object.`, graphPath);
  }

  const node = rawNode as Record<string, unknown>;
  if (typeof node.id !== 'string' || !node.id) {
    throw new WikiGraphError(`Graph node at index ${index} must include a non-empty string id.`, graphPath);
  }
  if (typeof node.kind !== 'string' || !node.kind) {
    throw new WikiGraphError(`Graph node ${String(node.id)} must include a non-empty string kind.`, graphPath);
  }
  if (!SUPPORTED_GRAPH_NODE_KINDS.has(String(node.kind))) {
    throw new WikiGraphError(`Graph node ${String(node.id)} has unsupported kind ${String(node.kind)}.`, graphPath);
  }
  if (typeof node.path !== 'string' || !node.path) {
    throw new WikiGraphError(`Graph node ${String(node.id)} must include a non-empty string path.`, graphPath);
  }

  const normalizedPath = normalizeGraphPath(String(node.path));
  validateNodeId({
    id: String(node.id),
    kind: String(node.kind),
    path: normalizedPath
  }, graphPath);

  return {
    id: String(node.id),
    kind: String(node.kind),
    path: normalizedPath,
    ...(typeof node.page_state === 'string' ? { page_state: String(node.page_state) } : {})
  };
}

function parseEdge(rawEdge: unknown, index: number, graphPath?: string): WikiGraphEdge {
  if (!rawEdge || typeof rawEdge !== 'object' || Array.isArray(rawEdge)) {
    throw new WikiGraphError(`Graph edge at index ${index} must be an object.`, graphPath);
  }

  const edge = rawEdge as Record<string, unknown>;
  if (typeof edge.type !== 'string' || !edge.type) {
    throw new WikiGraphError(`Graph edge at index ${index} must include a non-empty string type.`, graphPath);
  }
  if (!SUPPORTED_GRAPH_EDGE_TYPES.has(String(edge.type))) {
    throw new WikiGraphError(`Graph edge at index ${index} has unsupported type ${String(edge.type)}.`, graphPath);
  }
  if (typeof edge.from !== 'string' || !edge.from) {
    throw new WikiGraphError(`Graph edge at index ${index} must include a non-empty string from.`, graphPath);
  }
  if (typeof edge.to !== 'string' || !edge.to) {
    throw new WikiGraphError(`Graph edge at index ${index} must include a non-empty string to.`, graphPath);
  }

  return {
    type: String(edge.type),
    from: String(edge.from),
    to: String(edge.to)
  };
}

function normalizeAndUniqueGraphPaths(paths: string[]): string[] {
  return [...new Set((paths || []).map(normalizeGraphPath).filter(Boolean))].sort();
}

function normalizeGraphPath(value: string): string {
  return String(value || '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .trim();
}

function compareGraphNodes(left: WikiGraphNode, right: WikiGraphNode) {
  return left.kind.localeCompare(right.kind)
    || left.path.localeCompare(right.path)
    || left.id.localeCompare(right.id);
}

function compareGraphEdges(left: WikiGraphEdge, right: WikiGraphEdge) {
  return left.type.localeCompare(right.type)
    || left.from.localeCompare(right.from)
    || left.to.localeCompare(right.to);
}

function validateNodeId(node: { id: string; kind: string; path: string }, graphPath?: string) {
  if (node.kind === 'documentation') {
    if (node.id === `documentation:${node.path}` || node.id === `source:${node.path}`) {
      return;
    }
    throw new WikiGraphError(`Graph node ${node.id} must match its kind/path (expected documentation:${node.path} or source:${node.path}).`, graphPath);
  }
  if (node.kind === 'module') {
    if (/^module:[^:\s][^:\n\r]*$/.test(node.id)) {
      return;
    }
    throw new WikiGraphError(`Graph node ${node.id} must use module:<id> format.`, graphPath);
  }
  if (node.id !== `${node.kind}:${node.path}`) {
    throw new WikiGraphError(`Graph node ${node.id} must match its kind/path (expected ${node.kind}:${node.path}).`, graphPath);
  }
}

function validateEdgeEndpoints(edge: WikiGraphEdge, fromNode: WikiGraphNode, toNode: WikiGraphNode, graphPath?: string) {
  switch (edge.type) {
    case 'affects':
      if ((fromNode.kind === 'source' || fromNode.kind === 'documentation' || fromNode.kind === 'module') && toNode.kind === 'page') {
        return;
      }
      break;
    case 'wiki_link':
      if (fromNode.kind === 'page' && toNode.kind === 'page') {
        return;
      }
      break;
    case 'provenance':
      if (fromNode.kind === 'page' && (toNode.kind === 'source' || toNode.kind === 'documentation')) {
        return;
      }
      break;
    case 'owns':
      if (fromNode.kind === 'module' && (toNode.kind === 'page' || toNode.kind === 'source' || toNode.kind === 'documentation')) {
        return;
      }
      break;
    default:
      break;
  }
  throw new WikiGraphError(`Graph edge ${edge.type} has invalid endpoint kinds ${fromNode.kind} -> ${toNode.kind}.`, graphPath);
}

function pushIndexed<T>(index: Map<string, T[]>, key: string, value: T) {
  let bucket = index.get(key);
  if (!bucket) {
    bucket = [];
    index.set(key, bucket);
  }
  bucket.push(value);
}
