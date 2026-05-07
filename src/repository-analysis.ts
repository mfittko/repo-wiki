import path from 'node:path';

const RESOLVABLE_EXTENSIONS = ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.json'];

export function extractPackageMetadata(filePath, content) {
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

export function buildRepositoryAnalysis(cards) {
  const fileIndex = new Map(cards.map((card) => [card.path, card]));
  const packageScripts = cards
    .filter((card) => card.path.toLowerCase().endsWith('package.json'))
    .map((card) => ({
      path: card.path,
      name: card.package_name || null,
      scripts: card.package_scripts || {}
    }))
    .sort((left, right) => left.path.localeCompare(right.path));

  const dependencyEdges = collectDependencyEdges(cards, fileIndex);
  const testMappings = buildTestMappings(cards, dependencyEdges, fileIndex);

  return {
    package_scripts: packageScripts,
    dependency_graph: {
      edges: dependencyEdges,
      summary: {
        edges: dependencyEdges.length,
        importers: countUnique(dependencyEdges.map((edge) => edge.from)),
        imported_files: countUnique(dependencyEdges.map((edge) => edge.to))
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

function collectDependencyEdges(cards, fileIndex) {
  const edges = [];
  const seen = new Set();

  for (const card of cards) {
    for (const specifier of card.imports || []) {
      const target = resolveImportTarget(card.path, specifier, fileIndex);

      if (!target) {
        continue;
      }

      const key = `${card.path}\u0000${target}\u0000${specifier}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      edges.push({ from: card.path, to: target, specifier });
    }
  }

  return edges.sort(compareEdges);
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
  if (!specifier.startsWith('.')) {
    return null;
  }

  const importerDir = path.posix.dirname(importerPath);
  const basePath = normalizeRepoPath(path.posix.join(importerDir, specifier));
  return resolveCandidateTarget(basePath, fileIndex);
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
  );
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
