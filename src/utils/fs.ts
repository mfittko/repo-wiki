import { promises as fs } from 'node:fs';
import type { Dirent } from 'node:fs';
import path from 'node:path';

type WalkFile = { absolute: string; relative: string };
type WalkFilesOptions = {
  /** Replace the built-in traversal excludes. */
  exclude?: string[];
  /** Append excludes to the active list (either `exclude` or the defaults). */
  additionalExclude?: string[];
  /** Skip nested Git repository/worktree roots discovered below rootDir. */
  suppressNestedRepositories?: boolean;
  /** Observe nested repository/worktree roots that were suppressed. */
  onSuppressNestedRepository?: (relativePath: string) => void;
};

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function readJson(filePath: string) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export async function writeJson(filePath: string, data: unknown) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function writeText(filePath: string, content: string) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
}

export async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function walkFiles(rootDir: string, options: WalkFilesOptions = {}): Promise<WalkFile[]> {
  const exclude = [...new Set([...(options.exclude || DEFAULT_WALK_EXCLUDES), ...(options.additionalExclude || [])])];
  const files: WalkFile[] = [];
  const absoluteRoot = path.resolve(rootDir);

  async function walk(current: string) {
    const entries = await fs.readdir(current, { withFileTypes: true });

    if (options.suppressNestedRepositories && path.resolve(current) !== absoluteRoot && hasGitMarker(entries)) {
      options.onSuppressNestedRepository?.(path.relative(rootDir, current).replaceAll(path.sep, '/'));
      return;
    }

    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      const relative = path.relative(rootDir, absolute).replaceAll(path.sep, '/');

      if (shouldExclude(relative, entry.name, exclude)) {
        continue;
      }

      if (entry.isDirectory()) {
        await walk(absolute);
      } else if (entry.isFile()) {
        files.push({ absolute, relative });
      }
    }
  }

  await walk(rootDir);
  files.sort((a, b) => a.relative.localeCompare(b.relative));
  return files;
}

function hasGitMarker(entries: Dirent[]): boolean {
  return entries.some((entry) => entry.name === '.git' && (entry.isDirectory() || entry.isFile() || entry.isSymbolicLink()));
}

export const DEFAULT_WALK_EXCLUDES = [
  '.git',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.next',
  '.turbo',
  '.cache',
  '.llmwiki/run',
  '.llmwiki/wiki'
];

function shouldExclude(relative: string, name: string, exclude: string[]) {
  if (exclude.includes(name)) {
    return true;
  }

  return exclude.some((pattern) => {
    if (pattern.endsWith('/**')) {
      const base = pattern.slice(0, -3).replace(/\/+$/, '');
      return relative === base || relative.startsWith(`${base}/`);
    }
    return relative === pattern || relative.startsWith(`${pattern}/`);
  });
}
