import { promises as fs } from 'node:fs';
import path from 'node:path';

type WalkFile = { absolute: string; relative: string };
type WalkFilesOptions = { exclude?: string[] };

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
  const exclude = [...new Set([...defaultExcludes, ...(options.exclude || [])])];
  const files: WalkFile[] = [];
  const absoluteRoot = path.resolve(rootDir);

  async function walk(current: string) {
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      const relative = path.relative(rootDir, absolute).replaceAll(path.sep, '/');

      if (shouldExclude(relative, entry.name, exclude)) {
        continue;
      }

      if (entry.isDirectory()) {
        if (await isNestedRepositoryRoot(absolute, absoluteRoot)) {
          continue;
        }
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

async function isNestedRepositoryRoot(dirPath: string, absoluteRoot: string) {
  if (path.resolve(dirPath) === absoluteRoot) {
    return false;
  }

  const gitMarker = path.join(dirPath, '.git');
  try {
    const stat = await fs.stat(gitMarker);
    return stat.isDirectory() || stat.isFile();
  } catch {
    return false;
  }
}

const defaultExcludes = [
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
