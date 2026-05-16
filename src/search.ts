import path from 'node:path';
import { promises as fs } from 'node:fs';
import { extractFrontmatterBlock, parseSimpleYamlObject } from './frontmatter.js';
import { ensureDir, writeJson } from './utils/fs.js';

export const SEARCH_INDEX_VERSION = 1;
const DEFAULT_LIMIT = 10;

type ParsedFrontmatter = {
  kind: string | null;
  pageState: string | null;
  sourceCommit: string | null;
  sourcePaths: string[];
};

export type SearchIndexEntry = {
  pagePath: string;
  title: string;
  kind: string | null;
  pageState: string | null;
  summary: string | null;
  snippet: string;
  sourceCommit: string | null;
  sourcePaths: string[];
  headings: string[];
  outboundLinks: string[];
  inboundLinks: string[];
  searchText: string;
};

export type SearchIndex = {
  version: number;
  wikiDir: string;
  sourceCommits: string[];
  entries: SearchIndexEntry[];
};

export type SearchResult = {
  rank: number;
  score: number;
  pagePath: string;
  title: string;
  kind: string | null;
  pageState: string | null;
  summary: string | null;
  snippet: string;
  sourcePaths: string[];
  graph: {
    outboundLinks: string[];
    inboundLinks: string[];
  };
};

export function defaultSearchDirForWiki(wikiDir: string) {
  return path.join(path.dirname(path.resolve(wikiDir)), 'search');
}

export async function buildSearchIndex({
  wikiDir,
  outDir = defaultSearchDirForWiki(wikiDir)
}: {
  wikiDir: string;
  outDir?: string;
}) {
  const resolvedWikiDir = path.resolve(wikiDir);
  const resolvedOutDir = path.resolve(outDir);
  const pageFiles = (await fs.readdir(resolvedWikiDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const drafts = [] as Array<{
    pagePath: string;
    title: string;
    kind: string | null;
    pageState: string | null;
    summary: string | null;
    snippet: string;
    sourceCommit: string | null;
    sourcePaths: string[];
    headings: string[];
    outboundRefs: string[];
    searchText: string;
  }>;

  for (const pagePath of pageFiles) {
    const filePath = path.join(resolvedWikiDir, pagePath);
    const content = await fs.readFile(filePath, 'utf8');
    drafts.push(parseSearchEntry(pagePath, content));
  }

  const pageRefIndex = new Map<string, string>();
  for (const entry of drafts) {
    pageRefIndex.set(normalizePageReference(entry.pagePath), entry.pagePath);
    pageRefIndex.set(normalizePageReference(entry.title), entry.pagePath);
  }

  const inboundMap = new Map<string, Set<string>>();
  const entries: SearchIndexEntry[] = drafts.map((entry) => {
    const outboundLinks = uniqueSorted(entry.outboundRefs
      .map((ref) => resolvePageReference(ref, pageRefIndex))
      .filter((ref): ref is string => Boolean(ref) && ref !== entry.pagePath));

    for (const target of outboundLinks) {
      if (!inboundMap.has(target)) {
        inboundMap.set(target, new Set());
      }
      inboundMap.get(target)!.add(entry.pagePath);
    }

    return {
      pagePath: entry.pagePath,
      title: entry.title,
      kind: entry.kind,
      pageState: entry.pageState,
      summary: entry.summary,
      snippet: entry.snippet,
      sourceCommit: entry.sourceCommit,
      sourcePaths: entry.sourcePaths,
      headings: entry.headings,
      outboundLinks,
      inboundLinks: [],
      searchText: entry.searchText
    };
  }).sort((a, b) => a.pagePath.localeCompare(b.pagePath));

  for (const entry of entries) {
    entry.inboundLinks = uniqueSorted([...(inboundMap.get(entry.pagePath) || new Set<string>())]);
  }

  const sourceCommits = uniqueSorted(entries
    .map((entry) => entry.sourceCommit)
    .filter((value): value is string => Boolean(value)));

  const index: SearchIndex = {
    version: SEARCH_INDEX_VERSION,
    wikiDir: normalizeStoredPath(path.relative(resolvedOutDir, resolvedWikiDir) || '.'),
    sourceCommits,
    entries
  };

  await ensureDir(resolvedOutDir);
  const outFile = path.join(resolvedOutDir, 'index.json');
  await writeJson(outFile, index);

  return {
    index,
    summary: {
      outDir: normalizeSummaryPath(path.relative(process.cwd(), resolvedOutDir) || '.'),
      outFile: normalizeSummaryPath(path.relative(process.cwd(), outFile) || path.basename(outFile)),
      pages: entries.length,
      sourceCommits
    }
  };
}

export async function searchWiki({
  query,
  wikiDir,
  outDir = defaultSearchDirForWiki(wikiDir),
  limit = DEFAULT_LIMIT
}: {
  query: string;
  wikiDir: string;
  outDir?: string;
  limit?: number;
}) {
  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_LIMIT;
  const { index, summary: indexSummary } = await buildSearchIndex({ wikiDir, outDir });
  const results = searchIndex(index, query, normalizedLimit);

  return {
    index,
    results,
    summary: {
      query,
      limit: normalizedLimit,
      totalResults: results.length,
      index: indexSummary
    }
  };
}

export function searchIndex(index: SearchIndex, query: string, limit = DEFAULT_LIMIT): SearchResult[] {
  if (!Number.isFinite(limit) || limit <= 0) {
    return [];
  }

  const tokens = tokenizeSearchText(query);
  if (tokens.length === 0) {
    return [];
  }

  const normalizedQuery = tokens.join(' ');
  const scored = index.entries
    .map((entry) => ({ entry, score: scoreEntry(entry, tokens, normalizedQuery) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      const titleCompare = left.entry.title.localeCompare(right.entry.title);
      if (titleCompare !== 0) {
        return titleCompare;
      }
      return left.entry.pagePath.localeCompare(right.entry.pagePath);
    })
    .slice(0, Math.max(1, Math.floor(limit)));

  return scored.map(({ entry, score }, indexPosition) => ({
    rank: indexPosition + 1,
    score,
    pagePath: entry.pagePath,
    title: entry.title,
    kind: entry.kind,
    pageState: entry.pageState,
    summary: entry.summary,
    snippet: buildResultSnippet(entry, tokens),
    sourcePaths: entry.sourcePaths,
    graph: {
      outboundLinks: entry.outboundLinks,
      inboundLinks: entry.inboundLinks
    }
  }));
}

export function formatSearchResults(query: string, results: SearchResult[]) {
  if (results.length === 0) {
    return `No results for: ${query}`;
  }

  const lines = [`Search results for: ${query}`, ''];
  for (const result of results) {
    lines.push(`${result.rank}. ${result.title} (${result.kind || 'page'})`);
    lines.push(`   page: ${result.pagePath}`);
    lines.push(`   score: ${result.score}`);
    lines.push(`   ${result.summary || result.snippet}`);
    if (result.sourcePaths.length > 0) {
      lines.push(`   source_paths: ${formatSourcePaths(result.sourcePaths)}`);
    }
    const graphBits = [] as string[];
    if (result.graph.inboundLinks.length > 0) {
      graphBits.push(`inbound ${result.graph.inboundLinks.length}`);
    }
    if (result.graph.outboundLinks.length > 0) {
      graphBits.push(`outbound ${result.graph.outboundLinks.length}`);
    }
    if (graphBits.length > 0) {
      lines.push(`   graph: ${graphBits.join(', ')}`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

function parseSearchEntry(pagePath: string, content: string) {
  const block = extractFrontmatterBlock(content);
  const frontmatter = parseFrontmatter(block?.yaml || '');
  const body = (block?.body || content).trim();
  const title = extractTitle(pagePath, body);
  const headings = extractHeadings(body);
  const cleanBody = normalizeWhitespace(markdownToText(body));
  const summary = extractSummary(body, cleanBody);
  const snippet = buildBaseSnippet(summary, cleanBody);
  const outboundRefs = extractWikiLinkReferences(body);
  const searchText = normalizeSearchText([
    title,
    frontmatter.kind,
    headings.join(' '),
    summary,
    cleanBody,
    frontmatter.sourcePaths.join(' '),
    outboundRefs.join(' ')
  ].filter((value): value is string => Boolean(value)).join(' '));

  return {
    pagePath,
    title,
    kind: frontmatter.kind,
    pageState: frontmatter.pageState,
    summary,
    snippet,
    sourceCommit: frontmatter.sourceCommit,
    sourcePaths: frontmatter.sourcePaths,
    headings,
    outboundRefs,
    searchText
  };
}

function parseFrontmatter(rawYaml: string): ParsedFrontmatter {
  const parsed = parseSimpleYamlObject(rawYaml) || {};
  return {
    kind: readOptionalFrontmatterString(parsed.kind),
    pageState: readOptionalFrontmatterString(parsed.page_state),
    sourceCommit: readOptionalFrontmatterString(parsed.source_commit),
    sourcePaths: uniqueSorted(readFrontmatterStringArray(parsed.source_paths))
  };
}

function readOptionalFrontmatterString(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

function readFrontmatterStringArray(value: unknown) {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    return [];
  }
  const entries: string[] = [];
  for (const entry of value) {
    const normalized = readOptionalFrontmatterString(entry);
    if (normalized !== null) {
      entries.push(normalized);
    }
  }
  return entries;
}

function extractTitle(pagePath: string, body: string) {
  const headingMatch = /^#\s+(.+)$/m.exec(body);
  if (headingMatch) {
    return normalizeWhitespace(markdownToText(headingMatch[1]));
  }

  return pagePath
    .replace(/\.md$/i, '')
    .replace(/-/g, ' ')
    .trim();
}

function extractHeadings(body: string) {
  const headings = body
    .split('\n')
    .map((line) => /^#{2,6}\s+(.+)$/.exec(line.trim()))
    .filter((match): match is RegExpExecArray => Boolean(match))
    .map((match) => normalizeWhitespace(markdownToText(match[1])))
    .filter(Boolean);

  return uniqueSorted(headings);
}

function extractSummary(body: string, cleanBody: string) {
  const paragraphs = body
    .replace(/^#\s+.*$/m, '')
    .split(/\n\s*\n/)
    .map((part) => normalizeWhitespace(markdownToText(part)))
    .filter((part) => part && !part.startsWith('```'));

  const summary = paragraphs.find((paragraph) => paragraph.length > 0) || cleanBody;
  if (!summary) {
    return null;
  }

  return truncate(summary, 220);
}

function buildBaseSnippet(summary: string | null, cleanBody: string) {
  return truncate(summary || cleanBody, 220) || '';
}

function extractWikiLinkReferences(body: string) {
  const refs = new Set<string>();
  const markdownLink = /\[[^\]]+\]\(([^)]+)\)/g;
  for (const match of body.matchAll(markdownLink)) {
    const target = match[1]?.trim();
    if (!target || isExternalReference(target)) {
      continue;
    }
    refs.add(target);
  }

  const wikilink = /\[\[([^\]]+)\]\]/g;
  for (const match of body.matchAll(wikilink)) {
    const target = match[1]?.trim();
    if (target) {
      refs.add(target);
    }
  }

  return uniqueSorted([...refs]);
}

function isExternalReference(target: string) {
  return target.startsWith('http://') || target.startsWith('https://') || target.startsWith('#') || target.startsWith('mailto:');
}

function resolvePageReference(target: string, pageRefIndex: Map<string, string>) {
  const cleaned = target.split('#')[0].split('?')[0].trim();
  if (!cleaned) {
    return null;
  }

  const normalized = normalizePageReference(path.basename(cleaned));
  return pageRefIndex.get(normalized) || null;
}

function normalizePageReference(value: string) {
  return value
    .replace(/^\.\//, '')
    .replace(/\.md$/i, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function scoreEntry(entry: SearchIndexEntry, tokens: string[], normalizedQuery: string) {
  const titleText = normalizeSearchText(entry.title);
  const kindText = normalizeSearchText(entry.kind || '');
  const summaryText = normalizeSearchText(entry.summary || '');
  const headingsText = normalizeSearchText(entry.headings.join(' '));
  const sourceText = normalizeSearchText(entry.sourcePaths.join(' '));
  const linkText = normalizeSearchText([...entry.outboundLinks, ...entry.inboundLinks].join(' '));
  const bodyText = entry.searchText;

  let score = 0;
  if (normalizedQuery && titleText.includes(normalizedQuery)) score += 120;
  if (normalizedQuery && summaryText.includes(normalizedQuery)) score += 45;
  if (normalizedQuery && headingsText.includes(normalizedQuery)) score += 35;
  if (normalizedQuery && sourceText.includes(normalizedQuery)) score += 30;

  for (const token of tokens) {
    score += countOccurrences(titleText, token) * 40;
    score += countOccurrences(kindText, token) * 20;
    score += countOccurrences(sourceText, token) * 18;
    score += countOccurrences(summaryText, token) * 14;
    score += countOccurrences(headingsText, token) * 10;
    score += Math.min(6, countOccurrences(linkText, token)) * 4;
    score += Math.min(10, countOccurrences(bodyText, token)) * 2;
  }

  const matchedTokens = tokens.filter((token) => bodyText.includes(token)).length;
  score += matchedTokens * 5;

  return score;
}

function buildResultSnippet(entry: SearchIndexEntry, tokens: string[]) {
  const body = normalizeWhitespace(entry.summary || entry.snippet || entry.searchText);
  const lower = body.toLowerCase();

  for (const token of tokens) {
    const index = lower.indexOf(token);
    if (index >= 0) {
      const start = Math.max(0, index - 55);
      const end = Math.min(body.length, index + token.length + 85);
      const snippet = body.slice(start, end).trim();
      return `${start > 0 ? '…' : ''}${snippet}${end < body.length ? '…' : ''}`;
    }
  }

  return entry.snippet;
}

function markdownToText(body: string) {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\(([^)]+)\)/g, ' $1 ')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 $2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[|*_~]/g, ' ');
}

function tokenizeSearchText(value: string) {
  return uniqueSorted(normalizeSearchText(value).split(' ').filter(Boolean));
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9/._-]+/g, ' ')
    .replace(/[._/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function truncate(value: string, maxLength: number) {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}


function normalizeStoredPath(value: string) {
  return value.replaceAll(path.sep, '/');
}

function normalizeSummaryPath(value: string) {
  return normalizeStoredPath(value);
}

function formatSourcePaths(sourcePaths: string[]) {
  const visible = sourcePaths.slice(0, 5);
  const hiddenCount = sourcePaths.length - visible.length;
  return hiddenCount > 0
    ? `${visible.join(', ')} (+${hiddenCount} more)`
    : visible.join(', ');
}

function countOccurrences(haystack: string, needle: string) {
  if (!haystack || !needle) {
    return 0;
  }

  let count = 0;
  let index = 0;
  while (index >= 0) {
    index = haystack.indexOf(needle, index);
    if (index === -1) {
      break;
    }
    count += 1;
    index += needle.length;
  }
  return count;
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}
