import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileExists } from './utils/fs.js';
import { getGitStatus, runGit } from './utils/git.js';
import { applyFrontmatterPolicy, type FrontmatterPolicy } from './frontmatter.js';

export type PublishTarget = 'github-wiki' | 'github-pages';

export const PUBLISH_TARGETS: readonly PublishTarget[] = ['github-wiki', 'github-pages'];

export interface PublishWikiOptions {
  wikiDir?: string;
  remote?: string;
  branch?: string;
  target?: PublishTarget;
  pagesPath?: string;
  message?: string;
  dryRun?: boolean;
  frontmatterPolicy?: FrontmatterPolicy;
  gitUserName?: string;
  gitUserEmail?: string;
}

export async function publishWiki({
  wikiDir,
  remote,
  branch,
  target = 'github-wiki',
  pagesPath = '.',
  message,
  dryRun = false,
  frontmatterPolicy,
  gitUserName = process.env.LLMWIKI_GIT_USER_NAME || 'repo-wiki-bot',
  gitUserEmail = process.env.LLMWIKI_GIT_USER_EMAIL || 'repo-wiki-bot@users.noreply.github.com'
}: PublishWikiOptions) {
  const absoluteWikiDir = path.resolve(wikiDir || '.llmwiki/wiki');
  const publishRemote = remote || process.env.LLMWIKI_PUBLISH_REMOTE || process.env.GITHUB_WIKI_REMOTE;
  const summaryRemote = sanitizeRemote(publishRemote);
  const publishTarget: PublishTarget = target;
  const publishBranch = branch || defaultBranchForTarget(publishTarget);
  const publishFrontmatterPolicy = frontmatterPolicy || defaultFrontmatterPolicyForTarget(publishTarget);
  const resolvedPublishPath = resolvePublishPath(publishTarget, pagesPath);
  assertSafeGitArgument(publishBranch, 'branch');
  assertSafeGitArgument(publishRemote, 'remote');

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
        branch: publishBranch,
        target: publishTarget,
        path: resolvedPublishPath.relative,
        pages: markdownFileCount,
        frontmatterPolicy: publishFrontmatterPolicy
      }
    };
  }

  if (!publishRemote) {
    return {
      summary: {
        status: 'skipped-no-remote',
        wikiDir: absoluteWikiDir,
        remote: null,
        branch: publishBranch,
        target: publishTarget,
        path: resolvedPublishPath.relative,
        pages: markdownFileCount,
        frontmatterPolicy: publishFrontmatterPolicy,
        next_step: publishTarget === 'github-pages'
          ? 'Set LLMWIKI_PUBLISH_REMOTE or pass --remote with a target repository URL, for example OWNER/REPO.git.'
          : 'Set LLMWIKI_PUBLISH_REMOTE or pass --remote with an OWNER/REPO.wiki.git URL.'
      }
    };
  }

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'repo-wiki-publish-'));
  const checkoutDir = path.join(tempRoot, 'wiki');
  const commitMessage = message || `Compile repository wiki ${new Date().toISOString()}`;
  let cloned = false;

  try {
    try {
      await runGit(['clone', '--branch', publishBranch, '--', publishRemote, checkoutDir]);
      cloned = true;
    } catch (error) {
      if (!isCloneFallbackError(error)) {
        throw error;
      }
      await fs.mkdir(checkoutDir, { recursive: true });
      await runGit(['init'], { cwd: checkoutDir });
      await runGit(['remote', 'add', 'origin', publishRemote], { cwd: checkoutDir });
    }

    const publishDir = resolvedPublishPath.absoluteResolver(checkoutDir);
    await cleanPublishPath(checkoutDir, publishDir);
    await copyGeneratedWiki(absoluteWikiDir, publishDir, publishFrontmatterPolicy);
    if (publishTarget === 'github-pages') {
      await ensurePagesEntryAndNavigation(publishDir);
    }
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
          branch: publishBranch,
          target: publishTarget,
          path: resolvedPublishPath.relative,
          pages: markdownFileCount,
          frontmatterPolicy: publishFrontmatterPolicy,
          cloned
        }
      };
    }

    await runGit(['commit', '-m', commitMessage], { cwd: checkoutDir });
    await runGit(['push', 'origin', `HEAD:${publishBranch}`], { cwd: checkoutDir });

    return {
      summary: {
        status: 'published',
        wikiDir: absoluteWikiDir,
        remote: summaryRemote,
        branch: publishBranch,
        target: publishTarget,
        path: resolvedPublishPath.relative,
        pages: markdownFileCount,
        frontmatterPolicy: publishFrontmatterPolicy,
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

async function cleanPublishPath(checkoutDir: string, publishDir: string) {
  if (checkoutDir === publishDir) {
    await cleanCheckout(checkoutDir);
    return;
  }
  await fs.rm(publishDir, { recursive: true, force: true });
  await fs.mkdir(publishDir, { recursive: true });
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

function defaultBranchForTarget(target: PublishTarget) {
  return target === 'github-pages' ? 'gh-pages' : 'master';
}

export function defaultFrontmatterPolicyForTarget(target: PublishTarget): FrontmatterPolicy {
  return target === 'github-wiki' ? 'strip' : 'preserve';
}

function assertSafeGitArgument(value: string | undefined, label: string) {
  if (!value) {
    return;
  }
  if (/^[\s-]/.test(value)) {
    throw new Error(`Publish ${label} must not start with whitespace or "-": ${value}`);
  }
  if (/[\u0000\r\n]/.test(value)) {
    throw new Error(`Publish ${label} contains unsupported control characters.`);
  }
}

function resolvePublishPath(target: PublishTarget, pagesPath?: string) {
  const rawPath = target === 'github-pages' ? (pagesPath || '.').trim() || '.' : '.';

  if (path.isAbsolute(rawPath)) {
    throw new Error(`Publish path must be relative: ${rawPath}`);
  }

  const pathForSegments = rawPath.replace(/\\/g, '/');
  const segments = pathForSegments.split('/').filter(Boolean);
  if (segments.includes('..')) {
    throw new Error(`Publish path must not contain ".." path segments: ${rawPath}`);
  }
  if (segments.includes('.git')) {
    throw new Error(`Publish path must not target reserved .git paths: ${rawPath}`);
  }

  const normalized = path.posix.normalize(pathForSegments).replace(/^\.\/+/, '') || '.';

  return {
    relative: normalized,
    absoluteResolver: (checkoutDir: string) => path.resolve(checkoutDir, normalized)
  };
}

async function ensurePagesEntryAndNavigation(targetDir: string) {
  const homePath = path.join(targetDir, 'Home.md');
  const indexPath = path.join(targetDir, 'index.md');
  if (await fileExists(homePath) && !await fileExists(indexPath)) {
    const homeContent = await fs.readFile(homePath, 'utf8');
    await fs.writeFile(indexPath, homeContent, 'utf8');
  }

  const sidebarPath = path.join(targetDir, '_Sidebar.md');
  const navigationPath = path.join(targetDir, 'Navigation.md');
  if (await fileExists(sidebarPath) && !await fileExists(navigationPath)) {
    const sidebarContent = await fs.readFile(sidebarPath, 'utf8');
    await fs.writeFile(navigationPath, sidebarContent, 'utf8');
  }
}
