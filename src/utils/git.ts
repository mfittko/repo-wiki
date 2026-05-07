import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

type RunGitOptions = { cwd?: string; env?: NodeJS.ProcessEnv; maxBuffer?: number };

export async function runGit(args: string[], options: RunGitOptions = {}) {
  const { stdout, stderr } = await execFileAsync('git', args, {
    cwd: options.cwd,
    env: options.env || process.env,
    maxBuffer: options.maxBuffer || 20 * 1024 * 1024
  });
  return { stdout: stdout.trim(), stderr: stderr.trim() };
}

export async function getGitCommit(repoPath: string, fallback = 'unknown') {
  try {
    const { stdout } = await runGit(['rev-parse', 'HEAD'], { cwd: repoPath });
    return stdout || fallback;
  } catch {
    return fallback;
  }
}

export async function getGitRemote(repoPath: string, fallback = 'unknown') {
  try {
    const { stdout } = await runGit(['config', '--get', 'remote.origin.url'], { cwd: repoPath });
    return stdout || fallback;
  } catch {
    return fallback;
  }
}

export async function getGitStatus(repoPath: string) {
  try {
    const { stdout } = await runGit(['status', '--porcelain'], { cwd: repoPath });
    return stdout;
  } catch {
    return '';
  }
}
