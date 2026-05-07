import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function runGit(args, options = {}) {
  const { stdout, stderr } = await execFileAsync('git', args, {
    cwd: options.cwd,
    env: options.env || process.env,
    maxBuffer: options.maxBuffer || 20 * 1024 * 1024
  });
  return { stdout: stdout.trim(), stderr: stderr.trim() };
}

export async function getGitCommit(repoPath, fallback = 'unknown') {
  try {
    const { stdout } = await runGit(['rev-parse', 'HEAD'], { cwd: repoPath });
    return stdout || fallback;
  } catch {
    return fallback;
  }
}

export async function getGitRemote(repoPath, fallback = 'unknown') {
  try {
    const { stdout } = await runGit(['config', '--get', 'remote.origin.url'], { cwd: repoPath });
    return stdout || fallback;
  } catch {
    return fallback;
  }
}

export async function getGitStatus(repoPath) {
  try {
    const { stdout } = await runGit(['status', '--porcelain'], { cwd: repoPath });
    return stdout;
  } catch {
    return '';
  }
}
