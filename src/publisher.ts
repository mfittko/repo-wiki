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
  const publishTarget: PublishTarget = target;
  const publishRemote = resolvePublishRemote(publishTarget, remote);
  const summaryRemote = sanitizeRemote(publishRemote);
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
          : 'Set LLMWIKI_PUBLISH_REMOTE, GITHUB_WIKI_REMOTE, or pass --remote with an OWNER/REPO.wiki.git URL.'
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
    assertPublishPathContained(checkoutDir, publishDir);
    if (publishTarget === 'github-pages') {
      await cleanGeneratedMarkdown(publishDir);
    } else {
      await cleanPublishPath(checkoutDir, publishDir);
    }
    await copyGeneratedWiki(absoluteWikiDir, publishDir, publishFrontmatterPolicy);
    if (publishTarget === 'github-pages') {
      await ensurePagesSiteSupport(checkoutDir, publishDir);
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

async function cleanGeneratedMarkdown(publishDir: string) {
  await fs.mkdir(publishDir, { recursive: true });
  const entries = await fs.readdir(publishDir, { withFileTypes: true });

  await Promise.all(entries.map(async (entry) => {
    if (isReservedPublishEntry(entry.name)) {
      return;
    }

    const entryPath = path.join(publishDir, entry.name);
    if (entry.isDirectory()) {
      await cleanGeneratedMarkdown(entryPath);
      return;
    }
    if (entry.isFile() && entry.name.endsWith('.md') && !isPreservedPagesMarkdown(entry.name)) {
      await fs.rm(entryPath, { force: true });
    }
  }));
}

function isReservedPublishEntry(name: string) {
  return name === '.git' || name === '.github' || name === '_layouts';
}

function isPreservedPagesMarkdown(name: string) {
  return name === 'index.md' || name === 'Navigation.md';
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

function resolvePublishRemote(target: PublishTarget, remote: string | undefined) {
  if (remote || process.env.LLMWIKI_PUBLISH_REMOTE) {
    return remote || process.env.LLMWIKI_PUBLISH_REMOTE;
  }
  return target === 'github-wiki' ? process.env.GITHUB_WIKI_REMOTE : undefined;
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
    throw new Error(`Publish ${label} must not start with whitespace or "-".`);
  }
  if (/[\u0000\r\n]/.test(value)) {
    throw new Error(`Publish ${label} contains unsupported control characters.`);
  }
}

function resolvePublishPath(target: PublishTarget, pagesPath?: string) {
  const rawPath = target === 'github-pages' ? (pagesPath || '.').trim() || '.' : '.';
  const pathForSegments = rawPath.replace(/\\/g, '/');

  if (path.isAbsolute(pathForSegments) || path.posix.isAbsolute(pathForSegments)) {
    throw new Error(`Publish path must be relative: ${rawPath}`);
  }

  const segments = pathForSegments.split('/').filter(Boolean);
  if (segments.includes('..')) {
    throw new Error(`Publish path must not contain ".." path segments: ${rawPath}`);
  }
  if (segments.some((segment) => segment.toLowerCase() === '.git')) {
    throw new Error(`Publish path must not target reserved .git paths: ${rawPath}`);
  }

  const normalized = path.posix.normalize(pathForSegments).replace(/^\.\/+/, '') || '.';

  return {
    relative: normalized,
    absoluteResolver: (checkoutDir: string) => path.resolve(checkoutDir, normalized)
  };
}

function assertPublishPathContained(checkoutDir: string, publishDir: string) {
  const relative = path.relative(checkoutDir, publishDir);
  if (relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`))) {
    return;
  }
  throw new Error(`Publish path must stay inside checkout: ${publishDir}`);
}

async function ensurePagesSiteSupport(siteRootDir: string, publishDir: string) {
  await ensurePagesEntryAndNavigation(publishDir);
  await ensurePagesMermaidSupport(siteRootDir);
}

async function ensurePagesEntryAndNavigation(publishDir: string) {
  const homePath = path.join(publishDir, 'Home.md');
  const indexPath = path.join(publishDir, 'index.md');
  if (await fileExists(homePath) && !await fileExists(indexPath)) {
    const homeContent = await fs.readFile(homePath, 'utf8');
    await fs.writeFile(indexPath, homeContent, 'utf8');
  }

  const sidebarPath = path.join(publishDir, '_Sidebar.md');
  const navigationPath = path.join(publishDir, 'Navigation.md');
  if (await fileExists(sidebarPath) && !await fileExists(navigationPath)) {
    const sidebarContent = await fs.readFile(sidebarPath, 'utf8');
    await fs.writeFile(navigationPath, sidebarContent, 'utf8');
  }
}

async function ensurePagesMermaidSupport(siteRootDir: string) {
  const configPath = path.join(siteRootDir, '_config.yml');
  if (!await fileExists(configPath)) {
    await fs.writeFile(configPath, PAGES_CONFIG, 'utf8');
  }

  const layoutDir = path.join(siteRootDir, '_layouts');
  const layoutPath = path.join(layoutDir, 'repo-wiki.html');
  if (!await fileExists(layoutPath)) {
    await fs.mkdir(layoutDir, { recursive: true });
    await fs.writeFile(layoutPath, PAGES_LAYOUT, 'utf8');
  }
}

const PAGES_CONFIG = `defaults:
  - scope:
      path: ""
    values:
      layout: "repo-wiki"
`;

const PAGES_LAYOUT = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{% if page.title %}{{ page.title | escape }}{% else %}{{ page.name | replace: '.md', '' | escape }}{% endif %}</title>
  <style>
    body { color: #24292f; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.5; margin: 0; }
    main { box-sizing: border-box; margin: 0 auto; max-width: 980px; padding: 2rem; }
    a { color: #0969da; text-decoration: none; }
    a:hover { text-decoration: underline; }
    pre { background: #f6f8fa; border-radius: 6px; overflow: auto; padding: 1rem; }
    code { background: #f6f8fa; border-radius: 4px; padding: 0.1em 0.3em; }
    pre code { background: transparent; padding: 0; }
    table { border-collapse: collapse; display: block; overflow: auto; width: 100%; }
    th, td { border: 1px solid #d0d7de; padding: 0.4rem 0.75rem; }
    .mermaid { background: #fff; border: 1px solid #d0d7de; border-radius: 6px; margin: 1rem 0; padding: 1rem; }
  </style>
</head>
<body>
  <main>
    {{ content }}
  </main>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
    const blocks = document.querySelectorAll('pre > code.language-mermaid');
    blocks.forEach((block) => {
      const container = document.createElement('div');
      container.className = 'mermaid';
      container.textContent = block.textContent || '';
      block.parentElement?.replaceWith(container);
    });
    await mermaid.run({ nodes: document.querySelectorAll('.mermaid') });
  </script>
</body>
</html>
`;

