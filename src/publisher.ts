import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileExists } from './utils/fs.js';
import { getGitStatus, runGit } from './utils/git.js';
import { applyFrontmatterPolicy, type FrontmatterPolicy } from './frontmatter.js';

export interface PublishWikiOptions {
  wikiDir?: string;
  remote?: string;
  branch?: string;
  message?: string;
  dryRun?: boolean;
  frontmatterPolicy?: FrontmatterPolicy;
  gitUserName?: string;
  gitUserEmail?: string;
}

export async function publishWiki({
  wikiDir,
  remote,
  branch = 'master',
  message,
  dryRun = false,
  frontmatterPolicy = 'strip',
  gitUserName = process.env.LLMWIKI_GIT_USER_NAME || 'repo-wiki-bot',
  gitUserEmail = process.env.LLMWIKI_GIT_USER_EMAIL || 'repo-wiki-bot@users.noreply.github.com'
}: PublishWikiOptions) {
  const absoluteWikiDir = path.resolve(wikiDir || '.llmwiki/wiki');
  const publishRemote = remote || process.env.LLMWIKI_PUBLISH_REMOTE || process.env.GITHUB_WIKI_REMOTE;
  const summaryRemote = sanitizeRemote(publishRemote);

  if (!await fileExists(absoluteWikiDir)) {
    throw new Error(`Wiki directory does not exist: ${absoluteWikiDir}`);
  }

  const markdownFileCount = await countMarkdownFiles(absoluteWikiDir);

  if (dryRun) {
    return {
      summary: {
        status: 'dry-run',
        wikiDir: absoluteWikiDir,
        remote: summaryRemote,
        branch,
        pages: markdownFileCount,
        frontmatterPolicy
      }
    };
  }

  if (!publishRemote) {
    return {
      summary: {
        status: 'skipped-no-remote',
        wikiDir: absoluteWikiDir,
        remote: null,
        branch,
        pages: markdownFileCount,
        frontmatterPolicy,
        next_step: 'Set LLMWIKI_PUBLISH_REMOTE or pass --remote with an OWNER/REPO.wiki.git URL.'
      }
    };
  }

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publish-'));
  const checkoutDir = path.join(tempRoot, 'wiki');
  const commitMessage = message || `Compile repository wiki ${new Date().toISOString()}`;
  let cloned = false;

  try {
    try {
      await runGit(['clone', '--branch', branch, publishRemote, checkoutDir]);
      cloned = true;
    } catch (error) {
      if (!isCloneFallbackError(error)) {
        throw error;
      }
      await fs.mkdir(checkoutDir, { recursive: true });
      await runGit(['init'], { cwd: checkoutDir });
      await runGit(['remote', 'add', 'origin', publishRemote], { cwd: checkoutDir });
    }

    await cleanCheckout(checkoutDir);
    await copyGeneratedWiki(absoluteWikiDir, checkoutDir, frontmatterPolicy);
    await runGit(['config', 'user.name', gitUserName], { cwd: checkoutDir });
    await runGit(['config', 'user.email', gitUserEmail], { cwd: checkoutDir });
    await runGit(['add', '.'], { cwd: checkoutDir });

    const status = await getGitStatus(checkoutDir);
    if (!status) {
      return {
        summary: {
          status: 'no-changes',
          wikiDir: absoluteWikiDir,
          remote: summaryRemote,
          branch,
          pages: markdownFileCount,
          frontmatterPolicy,
          cloned
        }
      };
    }

    await runGit(['commit', '-m', commitMessage], { cwd: checkoutDir });
    await runGit(['push', 'origin', `HEAD:${branch}`], { cwd: checkoutDir });

    return {
      summary: {
        status: 'published',
        wikiDir: absoluteWikiDir,
        remote: summaryRemote,
        branch,
        pages: markdownFileCount,
        frontmatterPolicy,
        cloned
      }
    };
  } catch (error) {
    throw redactGitError(error, publishRemote);
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

function sanitizeRemote(remote: string | undefined) {
  if (!remote) {
    return null;
  }
  return remote.replace(/([a-z][a-z\d+.-]*:\/\/)([^/?#@]+):([^/?#@]+)@/gi, '$1***:***@')
    .replace(/([a-z][a-z\d+.-]*:\/\/)([^/?#@:]+)@/gi, '$1***@');
}

function redactGitError(error: unknown, remote: string | undefined) {
  const redactedRemote = sanitizeRemote(remote);
  const redact = (value: unknown) => {
    if (typeof value !== 'string') {
      return value;
    }
    const sanitized = sanitizeRemote(value) || value;
    return remote && redactedRemote ? sanitized.split(remote).join(redactedRemote) : sanitized;
  };

  if (!(error instanceof Error)) {
    return new Error(String(redact(error)));
  }

  const redactedError = new Error(String(redact(error.message)));
  redactedError.name = error.name;
  redactedError.stack = typeof error.stack === 'string' ? String(redact(error.stack)) : error.stack;

  for (const key of ['code', 'signal', 'stdout', 'stderr', 'cmd'] as const) {
    const value = (error as NodeJS.ErrnoException & Record<string, unknown>)[key];
    if (value !== undefined) {
      (redactedError as unknown as Record<string, unknown>)[key] = redact(value);
    }
  }

  return redactedError;
}

function isCloneFallbackError(error: unknown) {
  const details = [
    error instanceof Error ? error.message : '',
    typeof (error as Record<string, unknown>)?.stderr === 'string' ? (error as Record<string, string>).stderr : ''
  ].join('\n').toLowerCase();

  return details.includes('remote branch') && details.includes('not found')
    || details.includes('repository') && details.includes('not found')
    || details.includes('repository') && details.includes('does not exist')
    || details.includes('does not appear to be a git repository');
}

async function cleanCheckout(targetDir: string) {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(targetDir, { withFileTypes: true });

  await Promise.all(entries
    .filter((entry) => entry.name !== '.git')
    .map((entry) => fs.rm(path.join(targetDir, entry.name), { recursive: true, force: true })));
}

async function copyGeneratedWiki(sourceDir: string, targetDir: string, frontmatterPolicy: FrontmatterPolicy = 'strip') {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === '.git') {
      continue;
    }

    const source = path.join(sourceDir, entry.name);
    const target = path.join(targetDir, entry.name);

    if (entry.isSymbolicLink()) {
      await copySymlink(source, target);
    } else if (entry.isDirectory()) {
      await copyGeneratedWiki(source, target, frontmatterPolicy);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = await fs.readFile(source, 'utf8');
      const transformed = applyFrontmatterPolicy(content, frontmatterPolicy);
      await fs.writeFile(target, transformed, 'utf8');
    } else if (entry.isFile()) {
      await fs.copyFile(source, target);
    }
  }
}

async function copySymlink(source: string, target: string) {
  const linkTarget = await fs.readlink(source);
  await fs.rm(target, { recursive: true, force: true });
  await fs.symlink(linkTarget, target);
}

async function countMarkdownFiles(wikiDir: string): Promise<number> {
  const entries = await fs.readdir(wikiDir, { withFileTypes: true });
  const nestedCounts = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(wikiDir, entry.name);
    if (entry.isDirectory()) {
      return countMarkdownFiles(entryPath);
    }
    return entry.isFile() && entry.name.endsWith('.md') ? 1 : 0;
  }));
  return nestedCounts.reduce((total, count) => total + count, 0);
}
