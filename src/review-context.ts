import { promises as fs } from 'node:fs';
import path from 'node:path';
import { runGit } from './utils/git.js';
import { readJson, fileExists, walkFiles, writeText } from './utils/fs.js';
import { detectLanguage } from './language.js';
import { extractImports, extractSymbols, extractExportedSymbols } from './extractors.js';
import { buildWikiGraphIndex, selectAffectedPagePaths } from './wiki-graph.js';
import { extractFrontmatterBlock } from './frontmatter.js';
import { defaultGraphPathForWiki } from './wiki-query.js';

export type ReviewContextTargetKind = 'pr' | 'branch' | 'range';

export type ResolvedReviewTarget = {
  kind: ReviewContextTargetKind;
  raw: string;
  title: string;
  baseRef: string;
  headRef: string;
  baseCommit: string;
  headCommit: string;
};

export type DiffHunkLine = {
  prefix: ' ' | '+' | '-';
  content: string;
  oldLine?: number;
  newLine?: number;
};

export type DiffHunk = {
  header: string;
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: DiffHunkLine[];
};

export type DiffFile = {
  oldPath: string;
  newPath: string;
  hunks: DiffHunk[];
};

export type AdjacentFile = {
  path: string;
  relation: string;
  content: string;
};

export type RelatedWikiPage = {
  path: string;
  title: string;
  changedPaths: string[];
  frontmatter: string | null;
  body: string;
};

export type ReviewContextBundle = {
  adjacentDepth: number;
  target: ResolvedReviewTarget;
  changedFiles: DiffFile[];
  adjacentFiles: AdjacentFile[];
  relatedWikiPages: RelatedWikiPage[];
  warnings: string[];
};

export type ReviewContextOptions = {
  repoPath: string;
  target: string;
  scanDir?: string;
  wikiDir?: string;
  graphPath?: string;
  adjacencyDepth?: number;
  format?: 'md' | 'json' | 'both';
  outPath?: string;
};

const JS_LANGUAGES = new Set(['JavaScript', 'JavaScript React', 'TypeScript', 'TypeScript React']);
const JS_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs'];
const SOURCE_EXTENSIONS = new Set([
  ...JS_EXTENSIONS,
  '.mjs', '.cjs',
  '.py', '.pyi',
  '.go',
  '.rs',
  '.rb',
  '.java', '.kt', '.kts', '.scala',
  '.c', '.cc', '.cpp', '.cxx', '.h', '.hpp',
  '.cs', '.fs', '.vb',
  '.swift', '.m', '.mm',
  '.php',
  '.sh', '.bash', '.zsh',
  '.lua', '.pl', '.r'
]);

function isSourcePath(path: string): boolean {
  const lastDot = path.lastIndexOf('.');
  if (lastDot < 0) return false;
  return SOURCE_EXTENSIONS.has(path.slice(lastDot).toLowerCase());
}

export async function resolveReviewTarget(
  repoPath: string,
  target: string
): Promise<ResolvedReviewTarget> {
  const absoluteRepo = path.resolve(repoPath);

  if (/^#?\d+$/.test(target)) {
    const prNumber = target.replace(/^#/, '');
    const prInfo = await resolvePullRequest(absoluteRepo, prNumber);
    const baseCommit = await resolveMergeBase(absoluteRepo, prInfo.baseRef, prInfo.headRef);
    const headCommit = await resolveRef(absoluteRepo, prInfo.headRef);
    return {
      kind: 'pr',
      raw: target,
      title: prInfo.title,
      baseRef: prInfo.baseRef,
      headRef: prInfo.headRef,
      baseCommit,
      headCommit
    };
  }

  if (target.includes('..')) {
    const [baseRef, headRef] = target.split('..');
    if (!baseRef || !headRef) {
      throw new Error(`Invalid range target: ${target}`);
    }
    const baseCommit = await resolveRef(absoluteRepo, baseRef);
    const headCommit = await resolveRef(absoluteRepo, headRef);
    return {
      kind: 'range',
      raw: target,
      title: `range ${target}`,
      baseRef,
      headRef,
      baseCommit,
      headCommit
    };
  }

  const defaultRef = await resolveDefaultRemoteRef(absoluteRepo);
  const headRef = target;
  const headCommit = await resolveRef(absoluteRepo, headRef);
  const baseCommit = await resolveMergeBase(absoluteRepo, defaultRef, headCommit);
  return {
    kind: 'branch',
    raw: target,
    title: `branch ${target}`,
    baseRef: defaultRef,
    headRef,
    baseCommit,
    headCommit
  };
}

async function resolvePullRequest(
  repoPath: string,
  prNumber: string
): Promise<{ title: string; baseRef: string; headRef: string }> {
  try {
    const { stdout } = await runGit(
      ['-C', repoPath, 'remote', 'get-url', 'origin'],
      { cwd: repoPath }
    );
    void stdout;
  } catch {
    // continue
  }

  const { stdout } = await execGh(
    repoPath,
    ['pr', 'view', prNumber, '--json', 'number,title,baseRefName,headRefName,files']
  );
  const parsed = JSON.parse(stdout);
  if (!parsed.baseRefName || !parsed.headRefName) {
    throw new Error(`Could not resolve PR ${prNumber}: missing base or head ref`);
  }
  return {
    title: parsed.title || `PR #${prNumber}`,
    baseRef: parsed.baseRefName,
    headRef: parsed.headRefName
  };
}

async function execGh(repoPath: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  try {
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const execFileAsync = promisify(execFile);
    return await execFileAsync('gh', args, { cwd: repoPath, maxBuffer: 20 * 1024 * 1024 });
  } catch (error: any) {
    const stderr = String(error?.stderr || '');
    if (stderr.includes('command not found') || error?.code === 'ENOENT') {
      throw new Error(
        `GitHub CLI (gh) is required to resolve PR numbers. Install gh or use a branch/range target.`
      );
    }
    throw new Error(`gh failed: ${stderr || error?.message || String(error)}`);
  }
}

async function resolveDefaultRemoteRef(repoPath: string): Promise<string> {
  try {
    const { stdout } = await runGit(['rev-parse', '--abbrev-ref', 'origin/HEAD'], { cwd: repoPath });
    return stdout || 'origin/main';
  } catch {
    return 'origin/main';
  }
}

export async function resolveRef(repoPath: string, ref: string): Promise<string> {
  // Resolve a ref to a commit SHA. Try, in order:
  //   1. the ref as-given (local branch or tag)
  //   2. origin/<ref> (CI PR checkouts only have remote-tracking branches)
  //   3. explicit fetch from origin followed by re-checking origin/<ref>
  const candidates = [ref];
  if (!ref.startsWith('origin/')) {
    candidates.push(`origin/${ref}`);
  }
  for (const candidate of candidates) {
    try {
      const { stdout } = await runGit(['rev-parse', '--verify', candidate], { cwd: repoPath });
      return stdout;
    } catch {
      // try next candidate
    }
  }
  if (!ref.startsWith('origin/')) {
    try {
      await runGit(['fetch', '--no-tags', 'origin', ref], { cwd: repoPath });
    } catch {
      // ignore fetch errors; the final rev-parse will surface the real reason
    }
    try {
      const { stdout } = await runGit(['rev-parse', '--verify', `origin/${ref}`], { cwd: repoPath });
      return stdout;
    } catch {
      // fall through to the error below
    }
  }
  throw new Error(`Could not resolve git ref: ${ref}`);
}

async function resolveMergeBase(repoPath: string, baseRef: string, headRef: string): Promise<string> {
  const baseCommit = await resolveRef(repoPath, baseRef);
  const headCommit = await resolveRef(repoPath, headRef);
  try {
    const { stdout } = await runGit(['merge-base', baseCommit, headCommit], { cwd: repoPath });
    return stdout;
  } catch {
    throw new Error(`Could not compute merge-base for ${baseRef}..${headRef}`);
  }
}

export async function getChangedFilePaths(
  repoPath: string,
  baseCommit: string,
  headCommit: string,
  options: { sourceOnly?: boolean } = {}
): Promise<string[]> {
  const { stdout } = await runGit(
    ['diff', '--name-only', '-z', baseCommit, headCommit],
    { cwd: repoPath }
  );
  if (!stdout) {
    return [];
  }
  const paths = stdout
    .split('\0')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .sort();
  if (!options.sourceOnly) {
    return paths;
  }
  return paths.filter((path) => isSourcePath(path));
}

export async function getGitDiff(
  repoPath: string,
  baseCommit: string,
  headCommit: string
): Promise<string> {
  const { stdout } = await runGit(
    ['diff', '--unified=3', baseCommit, headCommit],
    { cwd: repoPath }
  );
  return stdout;
}

export function parseGitDiff(diffText: string): DiffFile[] {
  const files: DiffFile[] = [];
  const lines = diffText.split(/\r?\n/);
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.startsWith('diff --git ')) {
      index += 1;
      continue;
    }

    const match = line.match(/diff --git a\/(.+?) b\/(.+?)$/);
    const oldPath = match?.[1] || '';
    const newPath = match?.[2] || '';
    const hunks: DiffHunk[] = [];
    index += 1;

    while (index < lines.length && !lines[index].startsWith('diff --git ')) {
      const current = lines[index];
      const hunkHeader = current.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      if (!hunkHeader) {
        index += 1;
        continue;
      }

      const oldStart = Number(hunkHeader[1]);
      const oldCount = Number(hunkHeader[2] ?? '1');
      const newStart = Number(hunkHeader[3]);
      const newCount = Number(hunkHeader[4] ?? '1');
      const hunk: DiffHunk = {
        header: current,
        oldStart,
        oldCount,
        newStart,
        newCount,
        lines: []
      };
      index += 1;

      let oldLine = oldStart;
      let newLine = newStart;
      while (index < lines.length) {
        const hunkLine = lines[index];
        if (hunkLine.startsWith('@@ ') || hunkLine.startsWith('diff --git ')) {
          break;
        }
        const marker = hunkLine.charAt(0) as ' ' | '+' | '-';
        const content = hunkLine.slice(1);
        if (marker === ' ') {
          hunk.lines.push({ prefix: ' ', content, oldLine, newLine });
          oldLine += 1;
          newLine += 1;
        } else if (marker === '-') {
          hunk.lines.push({ prefix: '-', content, oldLine });
          oldLine += 1;
        } else if (marker === '+') {
          hunk.lines.push({ prefix: '+', content, newLine });
          newLine += 1;
        } else if (hunkLine === '\\ No newline at end of file') {
          // ignore
        }
        index += 1;
      }

      hunks.push(hunk);
    }

    files.push({ oldPath, newPath, hunks });
  }

  return files.sort((a, b) => a.newPath.localeCompare(b.newPath));
}

export async function buildReviewContextBundle(
  options: ReviewContextOptions
): Promise<ReviewContextBundle> {
  const absoluteRepo = path.resolve(options.repoPath);
  const target = await resolveReviewTarget(absoluteRepo, options.target);
  const changedPaths = await getChangedFilePaths(absoluteRepo, target.baseCommit, target.headCommit, { sourceOnly: true });
  const diffText = await getGitDiff(absoluteRepo, target.baseCommit, target.headCommit);
  const changedFiles = parseGitDiff(diffText);
  const warnings: string[] = [];

  const scanDir = options.scanDir ? path.resolve(options.scanDir) : path.join(absoluteRepo, '.llmwiki', 'run');
  const manifest = await loadScanManifest(scanDir);

  const adjacencyDepth = Math.max(0, Number(options.adjacencyDepth ?? 1));
  const adjacentFiles = await buildAdjacentContext({
    repoPath: absoluteRepo,
    changedPaths,
    depth: adjacencyDepth,
    manifestPath: manifest ? scanDir : null,
    manifest,
    warnings
  });

  const wikiDir = options.wikiDir ? path.resolve(options.wikiDir) : path.join(absoluteRepo, '.llmwiki', 'wiki');
  const graphPath = options.graphPath
    ? path.resolve(options.graphPath)
    : defaultGraphPathForWiki(wikiDir);
  const relatedWikiPages = await buildRelatedWikiPages({
    repoPath: absoluteRepo,
    wikiDir,
    graphPath,
    changedPaths,
    warnings
  });

  return {
    adjacentDepth: adjacencyDepth,
    target,
    changedFiles,
    adjacentFiles,
    relatedWikiPages,
    warnings
  };
}

async function loadScanManifest(scanDir: string): Promise<{ files: Array<{ path: string; language: string; imports: string[]; symbols: string[]; exported_symbols: Array<{ name: string }> }> } | null> {
  const manifestPath = path.join(scanDir, 'manifest.json');
  if (!(await fileExists(manifestPath))) {
    return null;
  }
  try {
    const raw = await readJson(manifestPath);
    if (raw && typeof raw === 'object' && Array.isArray((raw as any).files)) {
      return raw as any;
    }
    return null;
  } catch {
    return null;
  }
}

type AdjacencyManifestCard = {
  path: string;
  language: string;
  imports: string[];
  symbols: string[];
  exported_symbols: Array<{ name: string }>;
};

type AdjacencyOptions = {
  repoPath: string;
  changedPaths: string[];
  depth: number;
  manifestPath: string | null;
  manifest: { files: AdjacencyManifestCard[] } | null;
  warnings: string[];
};

async function buildAdjacentContext(
  options: AdjacencyOptions
): Promise<AdjacentFile[]> {
  const { repoPath, changedPaths, depth, manifest, warnings } = options;
  if (depth <= 0 || changedPaths.length === 0) {
    return [];
  }

  const allCards: AdjacencyManifestCard[] = manifest
    ? manifest.files
    : await buildCardsFromWalk(repoPath, warnings);

  const sourcePaths = new Set(allCards.map((card) => normalizePath(card.path)));
  const cardByPath = new Map(allCards.map((card) => [normalizePath(card.path), card]));
  const changedSet = new Set(changedPaths.map(normalizePath));
  const changedCards = allCards.filter((card) => changedSet.has(normalizePath(card.path)));

  let frontier = new Set(changedCards.map((card) => normalizePath(card.path)));
  const adjacent = new Map<string, { path: string; relation: string }>();

  for (let level = 0; level < depth; level += 1) {
    const nextFrontier = new Map<string, string>();
    for (const changedPath of frontier) {
      const changedCard = cardByPath.get(changedPath);
      if (!changedCard) {
        continue;
      }
      const language = changedCard.language;

      if (JS_LANGUAGES.has(language)) {
        const importees = resolveJavaScriptImportees(changedCard, sourcePaths, repoPath);
        for (const importee of importees) {
          if (!changedSet.has(importee) && !adjacent.has(importee)) {
            const relation = `imported by ${changedPath}`;
            adjacent.set(importee, { path: importee, relation });
            nextFrontier.set(importee, relation);
          }
        }

        const importers = resolveJavaScriptImporters(changedCard, allCards, sourcePaths, repoPath);
        for (const importer of importers) {
          const normalized = normalizePath(importer);
          if (!changedSet.has(normalized) && !adjacent.has(normalized)) {
            const relation = `imports ${changedPath}`;
            adjacent.set(normalized, { path: normalized, relation });
            nextFrontier.set(normalized, relation);
          }
        }
      } else {
        const symbolReferenced = await resolveSymbolReferencedFiles(changedCard, allCards, repoPath);
        for (const neighbor of symbolReferenced) {
          const normalized = normalizePath(neighbor);
          if (!changedSet.has(normalized) && !adjacent.has(normalized)) {
            const relation = `references ${changedPath}`;
            adjacent.set(normalized, { path: normalized, relation });
            nextFrontier.set(normalized, relation);
          }
        }
      }
    }
    frontier = new Set(nextFrontier.keys());
  }

  const results: AdjacentFile[] = [];
  for (const neighborPath of [...adjacent.keys()].sort()) {
    const absolute = path.join(repoPath, neighborPath);
    try {
      const content = await fs.readFile(absolute, 'utf8');
      results.push({
        path: neighborPath,
        relation: adjacent.get(neighborPath)!.relation,
        content
      });
    } catch {
      warnings.push(`Adjacent file missing at HEAD: ${neighborPath}`);
    }
  }

  return results;
}

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

async function buildCardsFromWalk(
  repoPath: string,
  warnings: string[]
): Promise<AdjacencyManifestCard[]> {
  const files = await walkFiles(repoPath, {
    additionalExclude: ['.git', 'node_modules', 'dist', 'build', 'coverage', '.llmwiki']
  });
  const cards: AdjacencyManifestCard[] = [];
  for (const file of files) {
    const language = detectLanguage(file.relative);
    if (language === 'Text' || language === 'JSON' || language === 'YAML') {
      continue;
    }
    try {
      const content = await fs.readFile(file.absolute, 'utf8');
      cards.push({
        path: file.relative,
        language,
        imports: extractImports(content, language),
        symbols: extractSymbols(content, language),
        exported_symbols: extractExportedSymbols(content, language)
      });
    } catch {
      warnings.push(`Could not read source file for adjacency: ${file.relative}`);
    }
  }
  return cards;
}

function resolveJavaScriptImportees(
  card: AdjacencyManifestCard,
  sourcePaths: Set<string>,
  repoPath: string
): string[] {
  const results: string[] = [];
  for (const specifier of card.imports) {
    const resolved = resolveJavaScriptImportSpecifier(card.path, specifier, repoPath, sourcePaths);
    if (resolved) {
      results.push(resolved);
    }
  }
  return results;
}

function resolveJavaScriptImporters(
  card: AdjacencyManifestCard,
  allCards: AdjacencyManifestCard[],
  sourcePaths: Set<string>,
  repoPath: string
): string[] {
  const targetPath = normalizePath(card.path);
  const importers: string[] = [];
  for (const other of allCards) {
    if (normalizePath(other.path) === targetPath) {
      continue;
    }
    if (!JS_LANGUAGES.has(other.language)) {
      continue;
    }
    for (const specifier of other.imports) {
      const resolved = resolveJavaScriptImportSpecifier(other.path, specifier, repoPath, sourcePaths);
      if (resolved === targetPath) {
        importers.push(other.path);
        break;
      }
    }
  }
  return importers;
}

function resolveJavaScriptImportSpecifier(
  fromPath: string,
  specifier: string,
  repoPath: string,
  sourcePaths: Set<string>
): string | null {
  if (!specifier.startsWith('.')) {
    return null;
  }
  const fromDir = path.dirname(path.join(repoPath, fromPath));
  const base = path.resolve(fromDir, specifier);
  const candidates: string[] = [base];
  for (const ext of JS_EXTENSIONS) {
    candidates.push(`${base}${ext}`);
    candidates.push(path.join(base, `index${ext}`));
  }
  for (const candidate of candidates) {
    const relative = normalizePath(path.relative(repoPath, candidate));
    if (sourcePaths.has(relative)) {
      return relative;
    }
  }
  return null;
}

async function resolveSymbolReferencedFiles(
  changedCard: AdjacencyManifestCard,
  allCards: AdjacencyManifestCard[],
  repoPath: string
): Promise<string[]> {
  const absolute = path.join(repoPath, changedCard.path);
  let content: string;
  try {
    content = await fs.readFile(absolute, 'utf8');
  } catch {
    return [];
  }

  const language = changedCard.language || detectLanguage(changedCard.path);
  const exportedNames = extractExportedSymbols(content, language).map((entry) => entry.name);
  const allNames = new Set([...exportedNames, ...extractSymbols(content, language)]);
  if (allNames.size === 0) {
    return [];
  }

  const patterns = [...allNames]
    .filter((name) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name))
    .map(escapeRegExp)
    .map((escaped) => new RegExp(`\\b${escaped}\\b`, 'g'));

  const neighbors: string[] = [];
  for (const other of allCards) {
    if (normalizePath(other.path) === normalizePath(changedCard.path)) {
      continue;
    }
    try {
      const otherContent = await fs.readFile(path.join(repoPath, other.path), 'utf8');
      // Reset lastIndex on every global regex before .test() so stateful matching
      // does not leak matches across files.
      const matched = patterns.some((pattern) => {
        pattern.lastIndex = 0;
        return pattern.test(otherContent);
      });
      if (matched) {
        neighbors.push(other.path);
      }
    } catch {
      // ignore unreadable files
    }
  }
  return neighbors;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

type WikiOptions = {
  repoPath: string;
  wikiDir: string;
  graphPath: string;
  changedPaths: string[];
  warnings: string[];
};

async function buildRelatedWikiPages(options: WikiOptions): Promise<RelatedWikiPage[]> {
  const { repoPath, wikiDir, graphPath, changedPaths, warnings } = options;
  if (!(await fileExists(graphPath))) {
    warnings.push(`Wiki graph not found at ${graphPath}; skipping related wiki pages.`);
    return [];
  }

  let index;
  try {
    const raw = await readJson(graphPath);
    index = buildWikiGraphIndex(raw, { graphPath });
  } catch (error: any) {
    warnings.push(`Could not load wiki graph: ${error?.message || String(error)}`);
    return [];
  }

  const selections = selectAffectedPagePaths(index, changedPaths);
  const pages: RelatedWikiPage[] = [];
  for (const selection of selections) {
    const pagePath = selection.pagePath;
    const absolute = path.join(wikiDir, pagePath);
    let rawContent: string;
    try {
      rawContent = await fs.readFile(absolute, 'utf8');
    } catch {
      warnings.push(`Related wiki page missing: ${pagePath}`);
      continue;
    }
    const frontmatter = extractFrontmatterBlock(rawContent);
    pages.push({
      path: pagePath,
      title: pagePath.replace(/\.md$/, ''),
      changedPaths: selection.changedPaths,
      frontmatter: frontmatter?.yaml || null,
      body: frontmatter?.body ?? rawContent
    });
  }
  return pages;
}

export function formatReviewContextBundle(
  bundle: ReviewContextBundle,
  format: 'md' | 'json'
): string {
  if (format === 'json') {
    return JSON.stringify(
      {
        target: bundle.target,
        adjacentDepth: bundle.adjacentDepth,
        changedFiles: bundle.changedFiles,
        adjacentFiles: bundle.adjacentFiles,
        relatedWikiPages: bundle.relatedWikiPages,
        warnings: bundle.warnings
      },
      null,
      2
    );
  }
  return formatReviewContextMarkdown(bundle);
}

function formatReviewContextMarkdown(bundle: ReviewContextBundle): string {
  const lines: string[] = [];
  lines.push(`# Review context for ${bundle.target.title}`);
  lines.push('');

  lines.push('## Changed lines');
  lines.push('');
  if (bundle.changedFiles.length === 0) {
    lines.push('_No changed source files in this range._');
    lines.push('');
  } else {
    for (const file of bundle.changedFiles) {
      const displayPath = file.newPath || file.oldPath || 'unknown';
      lines.push(`### ${displayPath}`);
      lines.push('');
      for (const hunk of file.hunks) {
        lines.push(`**Hunk** \`${hunk.header}\``);
        lines.push('');
      }
      lines.push('```diff');
      for (const hunk of file.hunks) {
        lines.push(hunk.header);
        for (const line of hunk.lines) {
          // Always emit the diff prefix (+/-/space) even for empty lines so the
          // per-line markers stay unambiguous.
          lines.push(`${line.prefix}${line.content}`);
        }
      }
      lines.push('```');
      lines.push('');
    }
  }

  const depth = bundle.adjacentDepth;
  lines.push(`## Adjacent context (depth ${bundle.adjacentDepth})`);
  lines.push('');
  if (bundle.adjacentFiles.length === 0) {
    lines.push('_No adjacent source files detected._');
    lines.push('');
  } else {
    for (const adjacent of bundle.adjacentFiles) {
      lines.push(`### ${adjacent.path} (${adjacent.relation})`);
      lines.push('');
      lines.push('```diff');
      for (const rawLine of adjacent.content.split(/\r?\n/)) {
        // Always prefix context lines (with a leading space) including blank
        // ones so the +/-/space markers stay unambiguous.
        lines.push(` ${rawLine}`);
      }
      lines.push('```');
      lines.push('');
    }
  }

  lines.push('## Related wiki pages');
  lines.push('');
  if (bundle.relatedWikiPages.length === 0) {
    lines.push('_No affected wiki pages found via graph affects edges._');
    lines.push('');
  } else {
    for (const page of bundle.relatedWikiPages) {
      lines.push(`### ${page.title}`);
      lines.push('');
      if (page.frontmatter) {
        lines.push('```yaml');
        lines.push(page.frontmatter);
        lines.push('```');
        lines.push('');
      }
      lines.push(page.body);
      lines.push('');
      lines.push(`_Affected source paths: ${page.changedPaths.join(', ')}_`);
      lines.push('');
    }
  }

  if (bundle.warnings.length > 0) {
    lines.push('## Warnings');
    lines.push('');
    for (const warning of bundle.warnings) {
      lines.push(`- ${warning}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export async function writeReviewContextBundle(
  bundle: ReviewContextBundle,
  outPath: string,
  format: 'md' | 'json' | 'both'
): Promise<string[]> {
  // Treat outPath as a base path. Strip a trailing .md / .json so callers
  // can pass either `bundle` (writes `bundle.md` / `bundle.json`) or
  // `bundle.md` (writes `bundle.md` + `bundle.json`) without producing
  // confusing suffixes like `bundle.md.json`.
  const base = outPath.replace(/\.(md|json)$/i, '');
  const written: string[] = [];
  if (format === 'md' || format === 'both') {
    const mdPath = `${base}.md`;
    await writeText(mdPath, formatReviewContextMarkdown(bundle));
    written.push(mdPath);
  }
  if (format === 'json' || format === 'both') {
    const jsonPath = `${base}.json`;
    await writeText(jsonPath, formatReviewContextBundle(bundle, 'json'));
    written.push(jsonPath);
  }
  return written;
}
