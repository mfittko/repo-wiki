import path from 'node:path';
import { promises as fs } from 'node:fs';

const GENERATED_OUTPUT_ROOTS = new Set(['.llmwiki', 'coverage', 'dist', 'build', 'node_modules']);
const COMMON_ENV_VAR_NAMES = new Set(['CI', 'HOME', 'PATH', 'PORT', 'SHELL', 'TERM', 'USER']);

export type PathResolution = {
  valid: boolean;
  path: string;
};

export type DocumentedPathSource = 'link' | 'inline_code';
export type RouteEvidence = {
  source_path: string;
  framework: string;
  target: string;
  handler: string | null;
  method: string;
  path: string;
};

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
  const byPath = new Map<string, Map<string, RouteEvidence[]>>();
  const files = [...(manifest.files || [])].sort((left, right) => String(left.path || '').localeCompare(String(right.path || '')));
  for (const file of files) {
    const routes = [...(file.route_surfaces || [])].sort((left, right) => {
      const leftPath = normalizeRoutePath(left.path);
      const rightPath = normalizeRoutePath(right.path);
      if (leftPath !== rightPath) return leftPath.localeCompare(rightPath);
      return String(left.target || '').localeCompare(String(right.target || ''));
    });
    for (const route of routes) {
      const routePath = normalizeRoutePath(route.path);
      if (!routePath) continue;
      const methods = route.methods?.length ? route.methods : ['ANY'];
      const byMethod = byPath.get(routePath) || new Map<string, RouteEvidence[]>();
      for (const methodValue of methods) {
        const method = String(methodValue).toUpperCase();
        const evidence = byMethod.get(method) || [];
        evidence.push({
          source_path: String(file.path || ''),
          framework: String(route.framework || 'unknown'),
          target: String(route.target || 'unknown'),
          handler: route.handler || null,
          method,
          path: routePath
        });
        byMethod.set(method, evidence);
      }
      byPath.set(routePath, byMethod);
    }
  }
  return byPath;
}

export function validateRouteClaims(claims: any[], routeIndex: Map<string, Map<string, RouteEvidence[]>>) {
  const hasRouteMetadata = routeIndex.size > 0;
  return (claims || []).map((claim) => {
    if (!hasRouteMetadata) {
      return { claim, valid: false, reason: 'route claim could not be validated because scanner route metadata is unavailable.', evidence: [] };
    }
    if (!claim.path) {
      return { claim, valid: false, reason: 'route claim could not be validated because no route path was detected.', evidence: [] };
    }
    const path = normalizeRoutePath(claim.path);
    const byMethod = routeIndex.get(path);
    if (!byMethod) {
      return { claim, valid: false, reason: `route claim did not match scanner route surfaces for path ${claim.path}.`, evidence: [] };
    }

    if (!claim.method) {
      const evidence = [...new Map([...byMethod.values()].flat().map((item) => [routeEvidenceKey(item), item])).values()];
      return evidence.length > 0
        ? { claim, valid: true, reason: null, evidence }
        : { claim, valid: false, reason: `route claim did not match scanner route surfaces for path ${claim.path}.`, evidence: [] };
    }

    const exact = byMethod.get(claim.method) || [];
    const wildcard = byMethod.get('ANY') || [];
    const evidence = [...new Map([...exact, ...wildcard].map((item) => [routeEvidenceKey(item), item])).values()];
    if (evidence.length === 0) {
      return { claim, valid: false, reason: `route claim method ${claim.method} for ${claim.path} did not match scanner route surfaces.`, evidence: [] };
    }
    return { claim, valid: true, reason: null, evidence };
  });
}

export function dedupeRouteValidationFindings(findings: any[], docPath?: string) {
  const deduped = new Map<string, any>();
  for (const finding of findings || []) {
    const path = normalizeRoutePath(finding?.claim?.path) || '';
    const method = String(finding?.claim?.method || 'ANY').toUpperCase();
    const status = finding?.valid ? 'validated' : 'unvalidated';
    const reason = String(finding?.reason || '');
    const scope = String(finding?.doc || docPath || '');
    const key = [scope, method, path, status, reason].join('\u0000');
    const line = Number(finding?.claim?.line || 0);
    if (!deduped.has(key)) {
      deduped.set(key, {
        ...finding,
        doc: scope || finding?.doc,
        locations: line > 0 ? [line] : []
      });
      continue;
    }
    const existing = deduped.get(key);
    if (line > 0 && !existing.locations.includes(line)) {
      existing.locations.push(line);
      existing.locations.sort((left: number, right: number) => left - right);
    }
  }
  return [...deduped.values()].sort((left, right) => {
    const leftDoc = String(left.doc || '');
    const rightDoc = String(right.doc || '');
    if (leftDoc !== rightDoc) return leftDoc.localeCompare(rightDoc);
    const leftPath = normalizeRoutePath(left?.claim?.path);
    const rightPath = normalizeRoutePath(right?.claim?.path);
    if (leftPath !== rightPath) return leftPath.localeCompare(rightPath);
    const leftMethod = String(left?.claim?.method || 'ANY');
    const rightMethod = String(right?.claim?.method || 'ANY');
    if (leftMethod !== rightMethod) return leftMethod.localeCompare(rightMethod);
    const leftLine = Number(left.locations?.[0] || left?.claim?.line || 0);
    const rightLine = Number(right.locations?.[0] || right?.claim?.line || 0);
    return leftLine - rightLine;
  });
}

function routeEvidenceKey(value: RouteEvidence) {
  return [value.source_path, value.framework, value.target, value.handler || '', value.method, value.path].join('\u0000');
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
