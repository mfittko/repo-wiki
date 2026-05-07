import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

async function collectTestFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectTestFiles(fullPath);
    }
    if (entry.isFile() && entry.name.endsWith('.test.js')) {
      return [fullPath];
    }
    return [];
  }));

  return files.flat().sort();
}

const testFiles = await collectTestFiles(currentDir);
if (testFiles.length === 0) {
  throw new Error(`No compiled test files found under ${currentDir}`);
}

try {
  const { stdout, stderr } = await execFileAsync(process.execPath, ['--test', ...testFiles], {
    env: process.env,
    maxBuffer: 20 * 1024 * 1024
  });
  if (stdout) {
    process.stdout.write(stdout);
  }
  if (stderr) {
    process.stderr.write(stderr);
  }
} catch (error: any) {
  if (error?.stdout) {
    process.stdout.write(error.stdout);
  }
  if (error?.stderr) {
    process.stderr.write(error.stderr);
  }
  process.exit(error?.code || 1);
}
