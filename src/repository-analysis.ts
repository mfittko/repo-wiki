import { builtinModules } from 'node:module';
import path from 'node:path';

const RESOLVABLE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.json'];

type SourceCard = {
  path: string;
  category: string;
  imports?: string[];
  package_name?: string | null;
  package_scripts?: Record<string, string>;
};

const FILE_NODE_PREFIX = 'file:';
const PACKAGE_NODE_PREFIX = 'package:';
const SCHEME_SPECIFIER_PATTERN = /^[A-Za-z][A-Za-z+.-]*:/;
const NODE_BUILTIN_MODULES = new Set(builtinModules.map((moduleName) => moduleName.replace(/^node:/, '')));

export function extractPackageMetadata(filePath: string, content: string): { package_name: string | null; package_scripts: Record<string, string> } | null {
  if (!filePath.toLowerCase().endsWith('package.json')) {
    return null;
  }

  try {
    const parsed = JSON.parse(content);
    const scripts = normalizeScripts(parsed.scripts);

    return {
      package_name: typeof parsed.name === 'string' ? parsed.name : null,
      package_scripts: scripts
    };
  } catch {
    return {
      package_name: null,
      package_scripts: {}
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
      scripts: card.package_scripts || {}
    }))
    .sort((left, right) => left.path.localeCompare(right.path));

  const dependencyGraph = collectDependencyGraph(cards, fileIndex);
  const dependencyEdges = dependencyGraph.edges;
  const testMappings = buildTestMappings(cards, dependencyEdges, fileIndex);

  return {
    package_scripts: packageScripts,
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
