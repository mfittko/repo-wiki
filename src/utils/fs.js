import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export async function writeJson(filePath, data) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function writeText(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
}

export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function walkFiles(rootDir, options = {}) {
  const exclude = options.exclude || defaultExcludes;
  const files = [];

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });

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

function shouldExclude(relative, name, exclude) {
  if (exclude.includes(name)) {
    return true;
  }

  return exclude.some((pattern) => {
    if (pattern.endsWith('/**')) {
      return relative.startsWith(pattern.slice(0, -3));
    }
    return relative === pattern || relative.startsWith(`${pattern}/`);
  });
}
