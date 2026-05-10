import path from 'node:path';
import { promises as fs } from 'node:fs';

const GENERATED_OUTPUT_ROOTS = new Set(['.llmwiki', 'coverage', 'dist', 'build', 'node_modules']);
const COMMON_ENV_VAR_NAMES = new Set(['CI', 'HOME', 'PATH', 'PORT', 'SHELL', 'TERM', 'USER']);

export type PathResolution = {
  valid: boolean;
  path: string;
};

export type DocumentedPathSource = 'link' | 'inline_code';

export function normalizeRepoPath(filePath: string) {
  return String(filePath || '').replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+$/, '');
}

export function normalizeRoutePath(routePath: string | null | undefined) {
  const cleaned = String(routePath || '').trim();
  if (!cleaned) return '';
  if (cleaned === '/') return '/';
  return cleaned.replace(/\/+$/, '');
}

export function buildRouteSurfaceIndex(manifest: any) {
  const byPath = new Map<string, Set<string>>();
  for (const file of manifest.files || []) {
    for (const route of file.route_surfaces || []) {
      const routePath = normalizeRoutePath(route.path);
      if (!routePath) continue;
      const methods = route.methods?.length ? route.methods : ['ANY'];
      const known = byPath.get(routePath) || new Set<string>();
      for (const method of methods) known.add(String(method).toUpperCase());
      byPath.set(routePath, known);
    }
  }
  return byPath;
}

export function validateRouteClaims(claims: any[], routeIndex: Map<string, Set<string>>) {
  const hasRouteMetadata = routeIndex.size > 0;
  return (claims || []).map((claim) => {
    if (!hasRouteMetadata) {
      return { claim, valid: false, reason: 'route claim could not be validated because scanner route metadata is unavailable.' };
    }
    if (!claim.path) {
      return { claim, valid: false, reason: 'route claim could not be validated because no route path was detected.' };
    }
    const methods = routeIndex.get(normalizeRoutePath(claim.path));
    if (!methods) {
      return { claim, valid: false, reason: `route claim did not match scanner route surfaces for path ${claim.path}.` };
    }
    if (claim.method && !methods.has(claim.method) && !methods.has('ANY')) {
      return { claim, valid: false, reason: `route claim method ${claim.method} for ${claim.path} did not match scanner route surfaces.` };
    }
    return { claim, valid: true, reason: null };
  });
}

export function isGeneratedOutputReference(filePath: string) {
  const normalized = normalizeRepoPath(filePath.replace(/^\.\//, ''));
  if (hasParentDirectorySegment(normalized)) {
    return false;
  }
  const root = normalized.split('/')[0];
  return GENERATED_OUTPUT_ROOTS.has(root);
}

export function candidateRepoPaths(referencePath: string, docPath: string, source: DocumentedPathSource = 'inline_code') {
  const normalizedReference = normalizeRepoPath(referencePath);
  const docRelative = normalizeRepoPath(path.posix.normalize(path.posix.join(path.posix.dirname(normalizeRepoPath(docPath)), normalizedReference)));
  if (source === 'link') {
    return [docRelative].filter((candidate) => candidate && candidate !== '.');
  }

  const cleaned = normalizeRepoPath(normalizedReference.replace(/^\.\//, ''));
  return [...new Set([cleaned, docRelative].filter((candidate) => candidate && candidate !== '.'))];
}

export async function resolveDocumentedPathOnDisk(referencePath: string, docPath: string, repoRoot: string, accessCache: Map<string, boolean> = new Map(), source: DocumentedPathSource = 'inline_code'): Promise<PathResolution> {
  const candidates = candidateRepoPaths(referencePath, docPath, source);
  const absoluteRoot = path.resolve(repoRoot);

  for (const candidate of candidates) {
    const absolute = path.resolve(absoluteRoot, candidate);
    if (!isPathInside(absoluteRoot, absolute)) {
      continue;
    }

    if (isGeneratedOutputReference(candidate)) {
      return { valid: true, path: candidate };
    }

    let exists = accessCache.get(absolute);
    if (exists === undefined) {
      try {
        await fs.access(absolute);
        exists = true;
      } catch {
        exists = false;
      }
      accessCache.set(absolute, exists);
    }

    if (exists) {
      return { valid: true, path: candidate };
    }
  }

  return { valid: false, path: candidates[0] || referencePath };
}

export function resolveDocumentedPathFromManifest(referencePath: string, docPath: string, manifestFiles: Set<string>, manifestDirectories = collectManifestDirectories(manifestFiles), source: DocumentedPathSource = 'inline_code'): PathResolution {
  const candidates = candidateRepoPaths(referencePath, docPath, source);
  for (const candidate of candidates) {
    if (isGeneratedOutputReference(candidate) || manifestFiles.has(candidate) || manifestDirectories.has(candidate)) {
      return { valid: true, path: candidate };
    }
  }
  return { valid: false, path: candidates[0] || referencePath };
}

export function collectManifestDirectories(files: Set<string>) {
  const dirs = new Set<string>();
  for (const file of files) {
    let current = path.posix.dirname(file);
    while (current && current !== '.') {
      dirs.add(current);
      current = path.posix.dirname(current);
    }
  }
  return dirs;
}

export function collectKnownEnvironmentVariables(manifest: any) {
  const names = new Set<string>();
  for (const file of manifest.files || []) {
    for (const name of file.environment_variables || []) {
      names.add(name);
    }
  }
  collectConfigEnvironmentVariables(manifest.config, names);
  return names;
}

function collectConfigEnvironmentVariables(value: any, names: Set<string>, envKeyContext = false) {
  if (typeof value === 'string') {
    if (envKeyContext && isLikelyEnvironmentVariableName(value)) {
      names.add(value);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectConfigEnvironmentVariables(entry, names, envKeyContext);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      collectConfigEnvironmentVariables(entry, names, envKeyContext || isEnvironmentVariableConfigKey(key));
    }
  }
}

function isLikelyEnvironmentVariableName(value: string) {
  if (!/^[A-Z][A-Z0-9_]{1,}$/.test(value)) return false;
  if (COMMON_ENV_VAR_NAMES.has(value)) return true;
  return value.includes('_');
}

function isEnvironmentVariableConfigKey(key: string) {
  return /(?:^|[_-])env(?:s|[_-]?vars?)?(?:$|[_-])/i.test(key)
    || /environment[_-]?variables?/i.test(key)
    || /env$/i.test(key);
}

function isPathInside(root: string, target: string) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export function cleanDocumentedPathTarget(value: string) {
  const withoutAngleBrackets = value.trim().replace(/^<|>$/g, '');
  const withoutTitle = withoutAngleBrackets.replace(/\s+(?:"[^"]*"|'[^']*'|\([^)]*\))$/, '');
  return withoutTitle
    .split('#')[0]
    .split('?')[0]
    .replace(/^['"]|['"]$/g, '')
    .trim();
}

export function hasParentDirectorySegment(filePath: string) {
  return /(^|\/)\.\.(\/|$)/.test(filePath.replaceAll('\\', '/'));
}
