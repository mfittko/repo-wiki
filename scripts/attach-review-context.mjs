#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const { buildReviewContextBundle, formatReviewContextBundle } = await import(path.resolve(scriptDir, '../dist/src/review-context.js'));

const MARKER = '<!-- repo-wiki-review-context -->';

function parseArgs(argv) {
  const options = { target: 'pr' };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--pr') {
      options.pr = argv[i + 1];
      i += 1;
    } else if (token === '--repo') {
      options.repo = argv[i + 1];
      i += 1;
    } else if (token === '--out') {
      options.out = argv[i + 1];
      i += 1;
    } else if (token === '--format') {
      options.format = argv[i + 1];
      i += 1;
    } else if (token === '--wiki-dir') {
      options.wikiDir = argv[i + 1];
      i += 1;
    } else if (token === '--scan') {
      options.scanDir = argv[i + 1];
      i += 1;
    } else if (token === '--adjacency') {
      options.adjacencyDepth = Number(argv[i + 1]);
      i += 1;
    }
  }
  return options;
}

async function execGh(args, cwd) {
  const { stdout, stderr } = await execFileAsync('gh', args, { cwd, maxBuffer: 20 * 1024 * 1024 });
  return { stdout: stdout.trim(), stderr: stderr.trim() };
}

async function resolveRepository(repoPath) {
  if (process.env.GITHUB_REPOSITORY) {
    return process.env.GITHUB_REPOSITORY;
  }
  const { stdout: rawUrl } = await execFileAsync('git', ['config', '--get', 'remote.origin.url'], { cwd: repoPath });
  const url = rawUrl.trim();
  const match = url.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (!match) {
    throw new Error(`Could not determine GitHub repository from remote: ${url}`);
  }
  return `${match[1]}/${match[2]}`;
}

async function findExistingCommentId(repository, prNumber) {
  try {
    const { stdout } = await execGh(['pr', 'view', prNumber, '--json', 'comments', '--repo', repository]);
    const parsed = JSON.parse(stdout);
    const comments = Array.isArray(parsed.comments) ? parsed.comments : [];
    for (const comment of comments) {
      if (comment.body && comment.body.includes(MARKER)) {
        return comment.id;
      }
    }
  } catch {
    // fall through to create new comment
  }
  return null;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const prNumber = options.pr;
  if (!prNumber || !/^\d+$/.test(prNumber)) {
    throw new Error('Usage: attach-review-context.mjs --pr <number> [--repo <path>] [--out <path>] [--format md|json|both] [--wiki-dir <dir>] [--scan <dir>] [--adjacency <depth>]');
  }

  const repoPath = path.resolve(options.repo || process.cwd());
  const format = options.format || 'md';
  if (!['md', 'json', 'both'].includes(format)) {
    throw new Error(`Unknown format: ${format}`);
  }

  const bundle = await buildReviewContextBundle({
    repoPath,
    target: prNumber,
    wikiDir: options.wikiDir,
    scanDir: options.scanDir,
    adjacencyDepth: Number.isFinite(options.adjacencyDepth) ? options.adjacencyDepth : 1,
    format
  });

  const mdBody = formatReviewContextBundle(bundle, 'md');
  const jsonBody = formatReviewContextBundle(bundle, 'json');

  const baseOut = options.out
    ? path.resolve(options.out)
    : path.join(repoPath, '.llmwiki', `review-context-pr-${prNumber}`);

  await fs.mkdir(path.dirname(baseOut), { recursive: true });
  if (format === 'md' || format === 'both') {
    await fs.writeFile(`${baseOut}.md`, `${MARKER}\n\n${mdBody}`, 'utf8');
  }
  if (format === 'json' || format === 'both') {
    await fs.writeFile(`${baseOut}.json`, jsonBody, 'utf8');
  }

  const repository = await resolveRepository(repoPath);
  const existingId = await findExistingCommentId(repository, prNumber);

  const counts = {
    changedFiles: bundle.changedFiles.length,
    adjacentFiles: bundle.adjacentFiles.length,
    wikiPages: bundle.relatedWikiPages.length
  };
  const artifactName = `review-context-pr-${prNumber}`;
  const summaryBody = [
    MARKER,
    `📎 \`repo-wiki review-context\` bundle: ${counts.changedFiles} changed / ${counts.adjacentFiles} adjacent (depth ${bundle.adjacencyDepth ?? 1}) / ${counts.wikiPages} wiki pages · artifact \`${artifactName}\`.`
  ].join('\n');

  const tempBodyFile = `${baseOut}.summary`;
  await fs.writeFile(tempBodyFile, summaryBody, 'utf8');

  if (existingId) {
    try {
      await execGh(['api', '-X', 'PATCH', '-F', `body=@${tempBodyFile}`, `/repos/${repository}/issues/comments/${existingId}`], repoPath);
    } catch (error) {
      // The comment we located may have been deleted between runs, or
      // `gh pr view --json comments` may have returned a stale/different
      // id. Fall through and post a fresh comment.
      console.warn(`Failed to update existing comment ${existingId}: ${error?.stderr || error?.message || String(error)}. Posting a new comment instead.`);
      await execGh(['pr', 'comment', prNumber, '--body-file', tempBodyFile, '--repo', repository], repoPath);
    }
  } else {
    await execGh(['pr', 'comment', prNumber, '--body-file', tempBodyFile, '--repo', repository], repoPath);
  }

  await fs.unlink(tempBodyFile).catch(() => {});
  console.log(JSON.stringify({ status: 'ok', pr: prNumber, repository, updated: Boolean(existingId), bundlePath: `${baseOut}.md`, counts }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
