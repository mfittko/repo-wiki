import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileExists } from './utils/fs.js';
import { getGitStatus, runGit } from './utils/git.js';
import { applyFrontmatterPolicy, type FrontmatterPolicy } from './frontmatter.js';

export async function publishWiki({
  wikiDir,
  remote,
  branch = 'master',
  message,
  dryRun = false,
  frontmatterPolicy = 'strip' as FrontmatterPolicy,
  gitUserName = process.env.LLMWIKI_GIT_USER_NAME || 'repo-wiki-bot',
  gitUserEmail = process.env.LLMWIKI_GIT_USER_EMAIL || 'repo-wiki-bot@users.noreply.github.com'
}) {
  const absoluteWikiDir = path.resolve(wikiDir || '.llmwiki/wiki');
  const publishRemote = remote || process.env.LLMWIKI_PUBLISH_REMOTE || process.env.GITHUB_WIKI_REMOTE;

  if (!await fileExists(absoluteWikiDir)) {
    throw new Error(`Wiki directory does not exist: ${absoluteWikiDir}`);
  }

  const markdownFiles = await listMarkdownFiles(absoluteWikiDir);

  if (dryRun) {
    return {
      summary: {
        status: 'dry-run',
        wikiDir: absoluteWikiDir,
        remote: publishRemote || null,
        branch,
        pages: markdownFiles.length,
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
        pages: markdownFiles.length,
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
      await runGit(['clone', publishRemote, checkoutDir]);
      cloned = true;
    } catch {
      await fs.mkdir(checkoutDir, { recursive: true });
      await runGit(['init'], { cwd: checkoutDir });
      await runGit(['remote', 'add', 'origin', publishRemote], { cwd: checkoutDir });
    }

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
          remote: publishRemote,
          branch,
          pages: markdownFiles.length,
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
        remote: publishRemote.replace(/x-access-token:[^@]+@/, 'x-access-token:***@'),
        branch,
        pages: markdownFiles.length,
        frontmatterPolicy,
        cloned
      }
    };
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

async function copyGeneratedWiki(sourceDir, targetDir, frontmatterPolicy: FrontmatterPolicy = 'strip') {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const source = path.join(sourceDir, entry.name);
    const target = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await fs.cp(source, target, { recursive: true, force: true });
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = await fs.readFile(source, 'utf8');
      const transformed = applyFrontmatterPolicy(content, frontmatterPolicy);
      await fs.writeFile(target, transformed, 'utf8');
    } else if (entry.isFile()) {
      await fs.copyFile(source, target);
    }
  }
}

async function listMarkdownFiles(wikiDir) {
  const entries = await fs.readdir(wikiDir, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md')).map((entry) => entry.name).sort();
}
