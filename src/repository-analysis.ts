import { builtinModules } from 'node:module';
import path from 'node:path';

const RESOLVABLE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.json'];

type SourceCard = {
  path: string;
  category: string;
  imports?: string[];
  package_name?: string | null;
  package_scripts?: Record<string, string>;
  package_script_sources?: Array<{ name: string; line?: number; end_line?: number }>;
  ci_workflow_commands?: string[];
  ci_workflow_command_sources?: Array<{ command: string; line?: number; end_line?: number }>;
};

const FILE_NODE_PREFIX = 'file:';
const PACKAGE_NODE_PREFIX = 'package:';
const SCHEME_SPECIFIER_PATTERN = /^[A-Za-z][A-Za-z+.-]*:/;
const NODE_BUILTIN_MODULES = new Set(builtinModules.map((moduleName) => moduleName.replace(/^node:/, '')));

export function extractPackageMetadata(
  filePath: string,
  content: string
): { package_name: string | null; package_scripts: Record<string, string>; package_script_sources: Array<{ name: string; line?: number; end_line?: number }> } | null {
  if (!filePath.toLowerCase().endsWith('package.json')) {
    return null;
  }

  try {
    const parsed = JSON.parse(content);
    const scripts = normalizeScripts(parsed.scripts);

    return {
      package_name: typeof parsed.name === 'string' ? parsed.name : null,
      package_scripts: scripts,
      package_script_sources: extractPackageScriptSources(content, scripts)
    };
  } catch {
    return {
      package_name: null,
      package_scripts: {},
      package_script_sources: []
    };
  }
}

export function buildRepositoryAnalysis(cards: SourceCard[]) {
  const fileIndex = new Map(cards.map((card) => [card.path, card]));
  const packageScripts = cards
    .filter((card) => card.path.toLowerCase().endsWith('package.json'))
    .map((card) => ({
      path: card.path,
      name: card.package_name || null,
      scripts: card.package_scripts || {},
      script_sources: (card.package_script_sources || []).map((source) => ({
        name: source.name,
        ...(typeof source.line === 'number' ? { line: source.line } : {}),
        ...(typeof source.end_line === 'number' ? { end_line: source.end_line } : {})
      }))
    }))
    .sort((left, right) => left.path.localeCompare(right.path));

  const dependencyGraph = collectDependencyGraph(cards, fileIndex);
  const dependencyEdges = dependencyGraph.edges;
  const testMappings = buildTestMappings(cards, dependencyEdges, fileIndex);

  const ciWorkflowCommands = [...new Set(cards.flatMap((card) => card.ci_workflow_commands || []))].sort();
  const ciWorkflowCommandSources = cards
    .flatMap((card) => (card.ci_workflow_command_sources || []).map((entry) => ({
      path: card.path,
      command: entry.command,
      ...(typeof entry.line === 'number' ? { line: entry.line } : {}),
      ...(typeof entry.end_line === 'number' ? { end_line: entry.end_line } : {})
    })))
    .sort(compareCommandSourceEntries);

  return {
    package_scripts: packageScripts,
    ci_workflow_commands: ciWorkflowCommands,
    ci_workflow_command_sources: ciWorkflowCommandSources,
    dependency_graph: {
      nodes: dependencyGraph.nodes,
      edges: dependencyEdges,
      summary: {
        edges: dependencyEdges.length,
        importers: countUnique(dependencyEdges.map((edge) => edge.from)),
        imported_files: countUnique(dependencyEdges.filter((edge) => !isPackageEdge(edge)).map((edge) => edge.to)),
        imported_packages: countUnique(dependencyEdges.filter((edge) => isPackageEdge(edge)).map((edge) => edge.to))
      }
    },
    test_to_source: {
      mappings: testMappings,
      summary: {
        mapped_tests: testMappings.length,
        source_files: countUnique(testMappings.flatMap((mapping) => mapping.sources))
      }
    }
  };
}

function extractPackageScriptSources(content: string, scripts: Record<string, string>) {
  const lines = content.split('\n');
  const sources: Array<{ name: string; line?: number; end_line?: number }> = [];
  const scriptsRange = locateTopLevelObjectPropertyRange(content, 'scripts');
  if (!scriptsRange) {
    return Object.keys(scripts || {}).map((name) => ({ name }));
  }

  const startLine = lineNumberAtIndex(content, scriptsRange.valueStartIndex);
  const endLine = lineNumberAtIndex(content, scriptsRange.valueEndIndex);
  const rangeLines = lines.slice(startLine - 1, endLine);
  for (const name of Object.keys(scripts || {})) {
    const escapedName = escapeRegExp(name);
    const pattern = new RegExp(`(?:^|[,{])\\s*"${escapedName}"\\s*:`);
    const lineIndex = rangeLines.findIndex((line) => pattern.test(line));
    sources.push(lineIndex === -1 ? { name } : { name, line: startLine + lineIndex });
  }
  return sources;
}

function locateTopLevelObjectPropertyRange(content: string, propertyName: string) {
  let inString = false;
  let escaped = false;
  let depth = 0;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      const key = readJsonString(content, index);
      if (!key) {
        inString = true;
        continue;
      }

      if (depth === 1 && key.value === propertyName) {
        const colonIndex = skipWhitespace(content, key.endIndex + 1);
        if (content[colonIndex] !== ':') {
          index = key.endIndex;
          continue;
        }
        const valueStartIndex = skipWhitespace(content, colonIndex + 1);
        if (content[valueStartIndex] !== '{') {
          return null;
        }
        const valueEndIndex = findMatchingBrace(content, valueStartIndex);
        if (valueEndIndex === -1) {
          return null;
        }
        return { valueStartIndex, valueEndIndex };
      }

      index = key.endIndex;
      continue;
    }

    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth = Math.max(0, depth - 1);
    }
  }

  return null;
}

function readJsonString(content: string, quoteIndex: number) {
  let escaped = false;
  for (let index = quoteIndex + 1; index < content.length; index += 1) {
    const char = content[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      return { value: content.slice(quoteIndex + 1, index), endIndex: index };
    }
  }
  return null;
}

function findMatchingBrace(content: string, startIndex: number) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < content.length; index += 1) {
    const char = content[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function skipWhitespace(content: string, startIndex: number) {
  let index = startIndex;
  while (index < content.length && /\s/.test(content[index])) {
    index += 1;
  }
  return index;
}

function lineNumberAtIndex(content: string, index: number) {
  if (index <= 0) {
    return 1;
  }
  let line = 1;
  for (let cursor = 0; cursor < Math.min(index, content.length); cursor += 1) {
    if (content[cursor] === '\n') {
      line += 1;
    }
  }
  return line;
}

function collectDependencyGraph(cards, fileIndex) {
  const nodes = new Map();
  const edges = [];
  const seen = new Set();
  const orderedCards = [...cards].sort((left, right) => left.path.localeCompare(right.path));

  for (const card of orderedCards) {
    for (const specifier of card.imports || []) {
      const target = resolveImportTarget(card.path, specifier, fileIndex);

      if (!target) {
        continue;
      }

      const from = normalizeRepoPath(card.path);
      const to = target.type === 'file' ? target.path : `${PACKAGE_NODE_PREFIX}${target.name}`;
      const key = `${from}\u0000${to}\u0000${specifier}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      edges.push({ from, to, specifier });
      nodes.set(`${FILE_NODE_PREFIX}${from}`, { id: `${FILE_NODE_PREFIX}${from}`, type: 'file', path: from });

      if (target.type === 'file') {
        nodes.set(`${FILE_NODE_PREFIX}${target.path}`, { id: `${FILE_NODE_PREFIX}${target.path}`, type: 'file', path: target.path });
      } else {
        nodes.set(`${PACKAGE_NODE_PREFIX}${target.name}`, { id: `${PACKAGE_NODE_PREFIX}${target.name}`, type: 'package', package: target.name });
      }
    }
  }

  return {
    nodes: [...nodes.values()].sort(compareNodes),
    edges: edges.sort(compareEdges)
  };
}

function buildTestMappings(cards, dependencyEdges, fileIndex) {
  const importedSources = new Map();

  for (const edge of dependencyEdges) {
    const importer = fileIndex.get(edge.from);
    const target = fileIndex.get(edge.to);

    if (importer?.category !== 'test' || !target || target.category === 'test') {
      continue;
    }

    let sources = importedSources.get(edge.from);
    if (!sources) {
      sources = new Set();
      importedSources.set(edge.from, sources);
    }

    sources.add(edge.to);
  }

  return cards
    .filter((card) => card.category === 'test')
    .map((card) => {
      const sources = new Set(importedSources.get(card.path) || []);
      const heuristics = new Set();

      if (sources.size > 0) {
        heuristics.add('imports');
      }

      for (const candidate of inferFilenameAffinitySources(card.path, fileIndex)) {
        sources.add(candidate);
        heuristics.add('filename_affinity');
      }

      return {
        test: card.path,
        sources: [...sources].sort(),
        heuristics: [...heuristics].sort()
      };
    })
    .filter((mapping) => mapping.sources.length > 0)
    .sort((left, right) => left.test.localeCompare(right.test));
}

function inferFilenameAffinitySources(testPath, fileIndex) {
  const strippedPath = stripTestSuffix(testPath);
  const candidateStems = new Set([stripExtension(strippedPath)]);

  if (strippedPath.includes('/__tests__/')) {
    candidateStems.add(stripExtension(strippedPath.replace('/__tests__/', '/')));
  }

  for (const prefix of ['test/', 'tests/']) {
    if (strippedPath.startsWith(prefix)) {
      const remainder = strippedPath.slice(prefix.length);
      candidateStems.add(stripExtension(remainder));
      candidateStems.add(stripExtension(`src/${remainder}`));
    }
  }

  for (const segment of ['/test/', '/tests/']) {
    if (strippedPath.includes(segment)) {
      candidateStems.add(stripExtension(strippedPath.replace(segment, '/')));
    }
  }

  const resolved = new Set();
  for (const stem of candidateStems) {
    const candidate = resolveStemTarget(stem, fileIndex);
    if (!candidate) {
      continue;
    }

    const card = fileIndex.get(candidate);
    if (card?.category !== 'test') {
      resolved.add(candidate);
    }
  }

  return [...resolved].sort();
}

function resolveImportTarget(importerPath, specifier, fileIndex) {
  if (!specifier) {
    return null;
  }

  if (specifier.startsWith('.')) {
    const importerDir = path.posix.dirname(importerPath);
    const basePath = normalizeRepoPath(path.posix.join(importerDir, specifier));
    const resolvedPath = resolveCandidateTarget(basePath, fileIndex);
    return resolvedPath ? { type: 'file', path: resolvedPath } : null;
  }

  const packageName = resolvePackageSpecifier(specifier);
  return packageName ? { type: 'package', name: packageName } : null;
}

function resolveStemTarget(stem, fileIndex) {
  return resolveCandidateTarget(normalizeRepoPath(stem), fileIndex);
}

function resolveCandidateTarget(candidatePath, fileIndex) {
  for (const option of expandCandidatePaths(candidatePath)) {
    if (fileIndex.has(option)) {
      return option;
    }
  }

  return null;
}

function expandCandidatePaths(candidatePath) {
  const normalized = normalizeRepoPath(candidatePath);
  const candidates = [];
  const extension = path.posix.extname(normalized);

  if (extension) {
    candidates.push(normalized);
  } else {
    candidates.push(normalized);

    for (const ext of RESOLVABLE_EXTENSIONS) {
      candidates.push(`${normalized}${ext}`);
    }

    for (const ext of RESOLVABLE_EXTENSIONS) {
      candidates.push(path.posix.join(normalized, `index${ext}`));
    }
  }

  return [...new Set(candidates)];
}

function normalizeScripts(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([name, command]) => typeof name === 'string' && typeof command === 'string')
      .sort(([left], [right]) => left.localeCompare(right))
  ) as Record<string, string>;
}

function normalizeRepoPath(filePath) {
  return path.posix.normalize(filePath).replace(/^\.\//, '').replace(/^\/+/g, '');
}

function stripExtension(filePath) {
  const extension = path.posix.extname(filePath);
  return extension ? filePath.slice(0, -extension.length) : filePath;
}

function stripTestSuffix(filePath) {
  return filePath.replace(/(\.test|\.spec)(\.[mc]?[jt]sx?)$/i, '$2');
}

function countUnique(values) {
  return new Set(values).size;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compareEdges(left, right) {
  if (left.from !== right.from) {
    return left.from.localeCompare(right.from);
  }

  if (left.to !== right.to) {
    return left.to.localeCompare(right.to);
  }

  return left.specifier.localeCompare(right.specifier);
}

function compareNodes(left, right) {
  return left.id.localeCompare(right.id);
}

function compareCommandSourceEntries(
  left: { path: string; command: string; line?: number; end_line?: number },
  right: { path: string; command: string; line?: number; end_line?: number }
) {
  if (left.path !== right.path) {
    return left.path.localeCompare(right.path);
  }
  if ((left.line || 0) !== (right.line || 0)) {
    return (left.line || 0) - (right.line || 0);
  }
  if ((left.end_line || 0) !== (right.end_line || 0)) {
    return (left.end_line || 0) - (right.end_line || 0);
  }
  return left.command.localeCompare(right.command);
}

function isPackageEdge(edge) {
  return typeof edge.to === 'string' && edge.to.startsWith(PACKAGE_NODE_PREFIX);
}

function resolvePackageSpecifier(specifier) {
  if (!specifier || specifier.startsWith('node:') || specifier.startsWith('#') || specifier.startsWith('/')) {
    return null;
  }

  if (SCHEME_SPECIFIER_PATTERN.test(specifier)) {
    return null;
  }

  if (isNodeBuiltinSpecifier(specifier)) {
    return null;
  }

  if (specifier.startsWith('@')) {
    const parts = specifier.split('/');
    const packageSegment = parts[1];
    // Scoped package names require both scope and package segments (e.g. @scope/pkg).
    return parts.length >= 2 && packageSegment && packageSegment.length > 0 ? `${parts[0]}/${packageSegment}` : null;
  }

  const [name] = specifier.split('/');
  return name && name.length > 0 ? name : null;
}

function isNodeBuiltinSpecifier(specifier) {
  return NODE_BUILTIN_MODULES.has(specifier);
}
