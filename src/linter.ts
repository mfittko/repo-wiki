import { promises as fs } from 'node:fs';
import path from 'node:path';
import { extractFrontmatterBlock, stripFrontmatter } from './frontmatter.js';
import { containsSecretLikeContent } from './secret-patterns.js';
import { loadWikiGraph, getEdgesByType, getIncomingEdges, getNodeById, getNodesByKind, getOutgoingEdges, isManagedPageState, isSupportedWikiGraphSchema } from './wiki-graph.js';

const REQUIRED_PAGES = [
  'Home.md',
  '_Sidebar.md',
  'Index.md',
  'Log.md',
  'Agent-Context-Pack.md',
  'Repository-Overview.md',
  'Architecture.md',
  'Build-Test-and-Run.md',
  'Open-Questions.md'
];

const PROVENANCE_EXEMPT_PAGES = new Set([
  'Home.md',
  '_Sidebar.md',
  'Index.md',
  'Log.md'
]);
const GRAPH_HEALTH_EXEMPT_PAGES = new Set([
  'Home.md',
  '_Sidebar.md',
  'Index.md',
  'Log.md',
  'Agent-Context-Pack.md'
]);
const MATERIAL_CLAIM_MIN_LENGTH = 24;
const FRONTMATTER_METADATA_FIELDS = [
  'source_repo',
  'source_commit',
  'compiled_at',
  'page_state',
  'kind',
  'module',
  'confidence',
  'claim_status',
  'source_paths'
];
const FRONTMATTER_METADATA_PATTERN = new RegExp(`^(${FRONTMATTER_METADATA_FIELDS.join('|')}):`);
const MARKDOWN_LIST_LINK_PATTERN = /^[-*]\s+\[[^\]]+\]\([^)]+\)/;
const STRUCTURAL_PUNCTUATION_ONLY_PATTERN = /^[`()[\]{}|:;.,\-–—_]+$/;

type LintIssue = {
  level: 'error' | 'warning';
  code: string;
  message: string;
};

type GraphHealthFinding = {
  code: 'GRAPH001' | 'GRAPH002' | 'GRAPH003' | 'GRAPH004';
  severity: 'warning';
  page_or_path: string;
  target: string | null;
  message: string;
};

export async function lintWiki({ wikiDir, scanDir }: { wikiDir: string; scanDir: string }) {
  const manifest = JSON.parse(await fs.readFile(path.join(scanDir, 'manifest.json'), 'utf8'));
  const issues: LintIssue[] = [];
  const files = await listMarkdown(wikiDir);
  const topLevelPages = await listTopLevelMarkdown(wikiDir);
  const topLevelExisting = new Set(topLevelPages.map((file) => path.basename(file)));

  for (const required of REQUIRED_PAGES) {
    if (!topLevelExisting.has(required)) {
      issues.push(error('missing-required-page', `${required} is missing.`));
    }
  }

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const relativePath = path.relative(wikiDir, file).replaceAll(path.sep, '/');

    const frontmatter = parseFrontmatter(content);

    if (!hasSourceCommitFrontmatter(frontmatter)) {
      issues.push(warning('missing-source-commit', `${relativePath} does not include source_commit frontmatter.`));
    }

    if (containsSecretLikeContent(content)) {
      issues.push(error('secret-like-content', `${relativePath} contains secret-like content.`));
    }

    for (const link of extractWikiLinks(content)) {
      const target = `${link}.md`;
      if (!topLevelExisting.has(target) && !topLevelExisting.has(link)) {
        issues.push(warning('broken-wiki-link', `${relativePath} links to missing page ${link}.`));
      }
    }

    if (shouldCheckGeneratedProvenance(relativePath, frontmatter, content)) {
      if (!hasProvenanceSignal(content, frontmatter)) {
        issues.push(warning('missing-source-provenance', `${relativePath} includes material claims without source provenance (source_paths, source links/paths, or explicit secondary-documentation labeling).`));
      }
    }

    if (isGeneratedOrMixed(frontmatter) && frontmatter.kind === 'module' && !hasNonEmptySourcePaths(frontmatter)) {
      issues.push(warning('missing-source-paths', `${relativePath} is a generated module page without non-empty source_paths metadata.`));
    }
  }

  const graphHealthFindings = await collectGraphHealthFindings(scanDir);
  for (const finding of graphHealthFindings) {
    issues.push({
      level: finding.severity,
      code: finding.code,
      message: finding.message
    });
  }

  const sortedIssues = [...issues].sort(compareLintIssues);
  const errors = sortedIssues.filter((issue) => issue.level === 'error').length;
  const warnings = sortedIssues.filter((issue) => issue.level === 'warning').length;

  return {
    manifest,
    issues: sortedIssues,
    summary: {
      wikiDir,
      pages: files.length,
      errors,
      warnings,
      issues: sortedIssues,
      graph_health: {
        findings: graphHealthFindings,
        errors: 0,
        warnings: graphHealthFindings.length,
        total: graphHealthFindings.length
      }
    }
  };
}

async function listTopLevelMarkdown(wikiDir: string) {
  const entries = await fs.readdir(wikiDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(wikiDir, entry.name))
    .sort();
}

async function listMarkdown(wikiDir: string): Promise<string[]> {
  const entries = await fs.readdir(wikiDir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(wikiDir, entry.name);
    if (entry.isDirectory()) {
      return listMarkdown(entryPath);
    }
    return entry.isFile() && entry.name.endsWith('.md') ? [entryPath] : [];
  }));
  return files.flat().sort();
}

function hasSourceCommitFrontmatter(frontmatter: Record<string, any>): boolean {
  return Object.hasOwn(frontmatter, 'source_commit');
}

function extractWikiLinks(content: string): string[] {
  const links = new Set<string>();
  const pattern = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const match of content.matchAll(pattern)) {
    const target = String(match[1]);
    if (/^https?:/.test(target) || target.startsWith('#') || target.includes('/')) {
      continue;
    }
    links.add(target.replace(/\.md$/, ''));
  }

  return [...links];
}

function parseFrontmatter(content: string) {
  const block = extractFrontmatterBlock(content);
  if (!block) {
    return {};
  }

  const result: Record<string, any> = {};
  const lines = block.yaml.split('\n');
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const separator = line.indexOf(':');
    if (separator <= 0) {
      index++;
      continue;
    }

    const key = line.slice(0, separator).trim();
    const raw = line.slice(separator + 1).trim();
    if (!key) {
      index++;
      continue;
    }

    if (raw === '') {
      const values: any[] = [];
      index++;
      while (index < lines.length && /^\s+-/.test(lines[index])) {
        values.push(parseFrontmatterScalar(lines[index].replace(/^\s*-\s*/, '').trim()));
        index++;
      }
      result[key] = values;
      continue;
    }

    result[key] = parseFrontmatterScalar(raw);
    index++;
  }
  return result;
}

function parseFrontmatterScalar(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw.replace(/^['"]|['"]$/g, '');
  }
}

function isGeneratedOrMixed(frontmatter: Record<string, any>) {
  return frontmatter.page_state === 'generated' || frontmatter.page_state === 'mixed';
}

function hasNonEmptySourcePaths(frontmatter: Record<string, any>) {
  return Array.isArray(frontmatter.source_paths) && frontmatter.source_paths.some((entry) => typeof entry === 'string' && entry.trim().length > 0);
}

function hasAuthoritativeSourcePaths(frontmatter: Record<string, any>) {
  return Array.isArray(frontmatter.source_paths) && frontmatter.source_paths.some((entry) => typeof entry === 'string' && entry.trim().length > 0 && !isDocumentationPath(entry));
}

function hasExplicitSecondaryDocumentationProvenance(content: string, frontmatter: Record<string, any>) {
  if (!Array.isArray(frontmatter.source_paths) || !frontmatter.source_paths.some((entry) => typeof entry === 'string' && isDocumentationPath(entry))) {
    return false;
  }

  return /(secondary evidence|secondary documentation|unvalidated documentation|documentation debt|documentation cards? listed below are secondary evidence|markdown documentation is ingested as secondary evidence)/i.test(stripFrontmatter(content));
}

function isDocumentationPath(entry: string) {
  const normalized = entry.trim().replace(/\\/g, '/').toLowerCase();
  const segments = normalized.split('/').filter(Boolean);
  const basename = segments.at(-1) || '';
  const extension = path.extname(basename);
  const firstSegment = segments[0] || '';

  if (['.md', '.mdx', '.markdown'].includes(extension)) {
    return true;
  }

  if (['readme', 'changelog'].includes(basename)) {
    return true;
  }

  return extension === '.json' && firstSegment === '.llmwiki' && segments.includes('docs');
}

function shouldCheckGeneratedProvenance(relativePath: string, frontmatter: Record<string, any>, content: string) {
  if (!isGeneratedOrMixed(frontmatter)) {
    return false;
  }

  if (PROVENANCE_EXEMPT_PAGES.has(relativePath)) {
    return false;
  }

  return hasMaterialClaimLikeText(content);
}

function hasMaterialClaimLikeText(content: string) {
  const lines = stripFrontmatter(content)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let inFence = false;
  for (const line of lines) {
    if (line.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (
      line.startsWith('#')
      || MARKDOWN_LIST_LINK_PATTERN.test(line)
      || /^\|[-:\s|]+\|?$/.test(line)
      || /^<!--/.test(line)
      || FRONTMATTER_METADATA_PATTERN.test(line)
    ) {
      continue;
    }
    if (line.length >= MATERIAL_CLAIM_MIN_LENGTH && /[A-Za-z]/.test(line) && !STRUCTURAL_PUNCTUATION_ONLY_PATTERN.test(line)) {
      return true;
    }
  }
  return false;
}

function hasProvenanceSignal(content: string, frontmatter: Record<string, any>) {
  if (hasAuthoritativeSourcePaths(frontmatter)) {
    return true;
  }

  if (hasExplicitSecondaryDocumentationProvenance(content, frontmatter)) {
    return true;
  }

  const body = stripFrontmatter(content);
  if (/https:\/\/github\.com\/[^)\s]+\/blob\/[^)\s]+/i.test(body)) {
    return true;
  }
  if (extractBacktickedPaths(body).some((candidate) => isAuthoritativeInlinePathProvenance(candidate))) {
    return true;
  }
  if (/(secondary evidence|secondary documentation|unvalidated documentation|documentation debt)/i.test(body) && extractBacktickedPaths(body).some((candidate) => isDocumentationPath(candidate))) {
    return true;
  }

  return false;
}

function extractBacktickedPaths(content: string) {
  return [...content.matchAll(/`([^`\n]+)`/g)]
    .map((match) => String(match[1]).trim())
    .filter((candidate) => isPathLikeProvenanceCandidate(candidate));
}

function isPathLikeProvenanceCandidate(candidate: string) {
  return /^[^\s`]+\.[A-Za-z0-9]+$/.test(candidate) && (candidate.includes('/') || /\.(?:ya?ml|json|toml)$/.test(candidate) || isDocumentationPath(candidate));
}

function isAuthoritativeInlinePathProvenance(candidate: string) {
  return !isDocumentationPath(candidate);
}

function error(code: string, message: string): LintIssue {
  return { level: 'error', code, message };
}

function warning(code: string, message: string): LintIssue {
  return { level: 'warning', code, message };
}

async function collectGraphHealthFindings(scanDir: string): Promise<GraphHealthFinding[]> {
  const graphPath = path.join(path.dirname(scanDir), 'graph.json');
  let graph;
  try {
    graph = await loadWikiGraph(graphPath);
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  if (!isSupportedWikiGraphSchema(graph)) {
    return [];
  }

  const graphLabel = graph.graphLabel;
  const pageNodes = getNodesByKind(graph, 'page')
    .map((node) => ({
      id: node.id,
      path: node.path,
      page_state: String(node.page_state || 'generated')
    }))
    .sort((left, right) => left.path.localeCompare(right.path));

  const findings: GraphHealthFinding[] = [];

  for (const page of pageNodes) {
    if (!GRAPH_HEALTH_EXEMPT_PAGES.has(page.path) && getIncomingEdges(graph, page.id, { type: 'wiki_link' }).length === 0) {
      findings.push({
        code: 'GRAPH001',
        severity: 'warning',
        page_or_path: page.path,
        target: null,
        message: `${page.path} has no inbound wiki links in ${graphLabel}.`
      });
    }
  }

  for (const edge of getEdgesByType(graph, 'wiki_link')) {
    const fromPage = getNodeById(graph, edge.from);
    if (!fromPage || fromPage.kind !== 'page') {
      continue;
    }
    const toPage = getNodeById(graph, edge.to);
    if (toPage?.kind === 'page') {
      continue;
    }
    const fromPath = String(fromPage.path || edge.from.replace(/^page:/, ''));
    const missingTarget = edge.to.replace(/^page:/, '');
    findings.push({
      code: 'GRAPH002',
      severity: 'warning',
      page_or_path: fromPath,
      target: missingTarget,
      message: `${fromPath} links to missing page ${missingTarget} in ${graphLabel}.`
    });
  }

  for (const page of pageNodes) {
    if (GRAPH_HEALTH_EXEMPT_PAGES.has(page.path)) {
      continue;
    }
    if (!isManagedPageState(page.page_state)) {
      continue;
    }
    if (getOutgoingEdges(graph, page.id, { type: 'provenance' }).length > 0) {
      continue;
    }
    findings.push({
      code: 'GRAPH003',
      severity: 'warning',
      page_or_path: page.path,
      target: null,
      message: `${page.path} is managed but has no provenance edges in ${graphLabel}.`
    });
  }

  for (const edge of getEdgesByType(graph, 'provenance')) {
    const fromPage = getNodeById(graph, edge.from);
    if (!fromPage || fromPage.kind !== 'page') {
      continue;
    }
    const toNode = getNodeById(graph, edge.to);
    if (toNode && (toNode.kind === 'source' || toNode.kind === 'documentation')) {
      continue;
    }
    const fromPath = String(fromPage.path || edge.from.replace(/^page:/, ''));
    const danglingTarget = edge.to.replace(/^(source|documentation):/, '');
    findings.push({
      code: 'GRAPH004',
      severity: 'warning',
      page_or_path: fromPath,
      target: danglingTarget,
      message: `${fromPath} references missing provenance target ${danglingTarget} in ${graphLabel}.`
    });
  }

  return findings.sort(compareGraphHealthFindings);
}

function compareLintIssues(left: LintIssue, right: LintIssue) {
  return severityRank(left.level) - severityRank(right.level)
    || left.code.localeCompare(right.code)
    || left.message.localeCompare(right.message);
}

function compareGraphHealthFindings(left: GraphHealthFinding, right: GraphHealthFinding) {
  return severityRank(left.severity) - severityRank(right.severity)
    || left.code.localeCompare(right.code)
    || left.page_or_path.localeCompare(right.page_or_path)
    || (left.target || '').localeCompare(right.target || '');
}

function severityRank(severity: 'error' | 'warning') {
  return severity === 'error' ? 0 : 1;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return !!error && typeof error === 'object' && 'code' in error;
}
