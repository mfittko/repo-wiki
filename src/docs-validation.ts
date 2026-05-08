import path from 'node:path';
import { promises as fs } from 'node:fs';

const GENERATED_OUTPUT_ROOTS = new Set(['.llmwiki', 'coverage', 'dist', 'build', 'node_modules']);

export type PathResolution = {
  valid: boolean;
  path: string;
};

export function normalizeRepoPath(filePath: string) {
  return String(filePath || '').replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+$/, '');
}

export function isGeneratedOutputReference(filePath: string) {
  const normalized = normalizeRepoPath(filePath.replace(/^\.\//, ''));
  if (hasParentDirectorySegment(normalized)) {
    return false;
  }
  const root = normalized.split('/')[0];
  return GENERATED_OUTPUT_ROOTS.has(root);
}

export function candidateRepoPaths(referencePath: string, docPath: string) {
  const normalizedReference = normalizeRepoPath(referencePath);
  const cleaned = normalizeRepoPath(normalizedReference.replace(/^\.\//, ''));
  const docRelative = normalizeRepoPath(path.posix.normalize(path.posix.join(path.posix.dirname(normalizeRepoPath(docPath)), normalizedReference)));
  return [...new Set([cleaned, docRelative].filter((candidate) => candidate && candidate !== '.'))];
}

export async function resolveDocumentedPathOnDisk(referencePath: string, docPath: string, repoRoot: string, accessCache: Map<string, boolean> = new Map()): Promise<PathResolution> {
  const candidates = candidateRepoPaths(referencePath, docPath);
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

export function resolveDocumentedPathFromManifest(referencePath: string, docPath: string, manifestFiles: Set<string>, manifestDirectories = collectManifestDirectories(manifestFiles)): PathResolution {
  const candidates = candidateRepoPaths(referencePath, docPath);
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

function collectConfigEnvironmentVariables(value: any, names: Set<string>) {
  if (typeof value === 'string') {
    if (/^[A-Z][A-Z0-9_]{2,}$/.test(value)) {
      names.add(value);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectConfigEnvironmentVariables(entry, names);
    return;
  }
  if (value && typeof value === 'object') {
    for (const entry of Object.values(value)) {
      collectConfigEnvironmentVariables(entry, names);
    }
  }
}

function isPathInside(root: string, target: string) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function hasParentDirectorySegment(filePath: string) {
  return /(^|\/)\.\.(\/|$)/.test(filePath.replaceAll('\\', '/'));
}
