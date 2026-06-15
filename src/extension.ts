import type { ExtensionAPI, ExtensionContext } from '@earendil-works/pi-coding-agent';
import path from 'node:path';
import { runCli } from './cli.js';
import { scanRepository } from './scanner.js';
import { createBootstrapPlan } from './planner.js';
import { compileWiki } from './compiler.js';
import { lintWiki } from './linter.js';
import { publishWiki } from './publisher.js';
import {
  buildWikiQueryAnswer,
  buildWikiExplanation,
  findWikiGraphPath,
  defaultGraphPathForWiki,
} from './wiki-query.js';
import { searchWiki, defaultSearchDirForWiki } from './search.js';
import { loadConfig } from './config.js';

const repoWikiCommandSchema = {
  type: 'object',
  properties: {
    args: { type: 'string', description: 'Arguments passed to the repo-wiki CLI' }
  }
};

const repoWikiScanSchema = {
  type: 'object',
  properties: {
    repoPath: { type: 'string', description: 'Repository path' },
    mode: { type: 'string', enum: ['bootstrap', 'incremental'], description: 'Scan mode: bootstrap (full) or incremental (changed paths only)' },
    outDir: { type: 'string', description: 'Output scan directory' },
    baseRef: { type: 'string' },
    headRef: { type: 'string' }
  }
};

const repoWikiPlanSchema = {
  type: 'object',
  properties: {
    scanDir: { type: 'string', description: 'Scan directory' },
    outFile: { type: 'string', description: 'Plan output file' }
  }
};

const repoWikiCompileSchema = {
  type: 'object',
  properties: {
    repoPath: { type: 'string', description: 'Repository path for config' },
    scanDir: { type: 'string' },
    planFile: { type: 'string' },
    wikiDir: { type: 'string' }
  }
};

const repoWikiLintSchema = {
  type: 'object',
  properties: {
    wikiDir: { type: 'string' },
    scanDir: { type: 'string' }
  }
};

const repoWikiPublishSchema = {
  type: 'object',
  properties: {
    wikiDir: { type: 'string' },
    remote: { type: 'string' },
    branch: { type: 'string' },
    dryRun: { type: 'boolean' }
  }
};

const repoWikiQuerySchema = {
  type: 'object',
  properties: {
    question: { type: 'string', description: 'Question to answer from the wiki' },
    wikiDir: { type: 'string' },
    graphPath: { type: 'string' },
    limit: { type: 'number', default: 5 }
  }
};

const repoWikiPathSchema = {
  type: 'object',
  properties: {
    from: { type: 'string', description: 'Start node or page' },
    to: { type: 'string', description: 'End node or page' },
    wikiDir: { type: 'string', description: 'Wiki directory' },
    graphPath: { type: 'string' }
  }
};

const repoWikiExplainSchema = {
  type: 'object',
  properties: {
    target: { type: 'string', description: 'Page or node to explain' },
    wikiDir: { type: 'string' },
    graphPath: { type: 'string' }
  }
};

const repoWikiSearchSchema = {
  type: 'object',
  properties: {
    query: { type: 'string', description: 'Search query' },
    wikiDir: { type: 'string' },
    limit: { type: 'number', default: 10 }
  }
};

export function truncateForTool(text: string, maxBytes = 50000, maxLines = 2000): string {
  const marker = '\n\n[Output truncated]';
  const markerBytes = Buffer.byteLength(marker, 'utf8');
  const targetBytes = Math.max(0, maxBytes - markerBytes);

  const lines = text.split('\n');
  if (lines.length > maxLines || Buffer.byteLength(text, 'utf8') > maxBytes) {
    const head = lines.slice(0, maxLines);
    let joined = head.join('\n');
    while (Buffer.byteLength(joined, 'utf8') > targetBytes && head.length > 1) {
      head.pop();
      joined = head.join('\n');
    }
    // Hard-truncate any remaining single oversized line to honour the budget.
    while (Buffer.byteLength(joined, 'utf8') > targetBytes) {
      const buf = Buffer.from(joined, 'utf8');
      joined = buf.subarray(0, Math.max(0, targetBytes - 1)).toString('utf8');
      joined = joined.replace(/\uFFFD+$/, '');
    }
    return `${joined}${marker}`;
  }
  return text;
}

/**
 * Split an input string into argv tokens while respecting single and double
 * quotes and backslash escapes, matching typical shell behavior. Returns an
 * empty array for an empty/whitespace-only input; callers should substitute
 * their own default when the array is empty.
 */
export function splitArgs(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let escape = false;
  for (const ch of input) {
    if (escape) {
      current += ch;
      escape = false;
      continue;
    }
    if (ch === '\\' && !inSingle) {
      escape = true;
      continue;
    }
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (/\s/.test(ch) && !inSingle && !inDouble) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += ch;
  }
  if (escape) {
    throw new Error('Unterminated backslash escape');
  }
  if (inSingle || inDouble) {
    throw new Error(`Unterminated ${inSingle ? 'single' : 'double'} quote`);
  }
  if (current.length > 0) {
    tokens.push(current);
  }
  return tokens;
}

async function runCliIsolated(argv: string[]) {
  const previousExitCode = process.exitCode;
  process.exitCode = undefined;
  try {
    await runCli(argv);
  } catch (error) {
    process.exitCode = previousExitCode;
    throw error;
  }
  const leaked = process.exitCode;
  process.exitCode = previousExitCode;
  if (leaked !== undefined && leaked !== 0) {
    throw new Error(`repo-wiki CLI exited with status ${leaked}`);
  }
}

export default function repoWikiExtension(pi: ExtensionAPI) {
  function notify(ctx: ExtensionContext, message: string, type: 'info' | 'warning' | 'error' = 'info') {
    if (ctx.ui?.notify) {
      ctx.ui.notify(message, type);
    }
  }

  pi.registerCommand('repo_wiki', {
    description: 'Run a repo-wiki CLI command',
    handler: async (args: string, ctx: ExtensionContext) => {
      const tokens = args.trim() ? splitArgs(args) : ['--help'];
      try {
        await runCliIsolated(tokens);
        notify(ctx, 'repo-wiki command finished', 'info');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        notify(ctx, `repo-wiki command failed: ${message}`, 'error');
        throw error;
      }
    },
  });

  pi.registerTool({
    name: 'repo_wiki_cli',
    label: 'Repo Wiki CLI',
    description: 'Run a repo-wiki CLI subcommand by passing raw arguments.',
    promptSnippet: 'Run repo-wiki CLI commands inside pi.',
    promptGuidelines: ['Use repo_wiki_cli when the user asks for repo-wiki CLI behavior and structured tool arguments are not needed.'],
    parameters: repoWikiCommandSchema,
    async execute(_toolCallId, params: any) {
      const tokens = params.args?.trim() ? splitArgs(params.args) : ['--help'];
      await runCliIsolated(tokens);
      return { content: [{ type: 'text', text: 'repo-wiki CLI command finished' }], details: {} };
    },
  });

  pi.registerTool({
    name: 'repo_wiki_scan',
    label: 'Repo Wiki Scan',
    description: 'Scan a repository into source cards and a manifest.',
    promptSnippet: 'Scan a repository for repo-wiki.',
    promptGuidelines: ['Use repo_wiki_scan before planning or compiling a wiki.'],
    parameters: repoWikiScanSchema,
    async execute(_toolCallId, params: any) {
      const result = await scanRepository({
        mode: params.mode ?? 'bootstrap',
        repoPath: params.repoPath || '.',
        outDir: params.outDir || '.llmwiki/run',
        baseRef: params.baseRef,
        headRef: params.headRef,
      });
      const text = JSON.stringify(result.summary, null, 2);
      return { content: [{ type: 'text', text: truncateForTool(text) }], details: result.summary };
    },
  });

  pi.registerTool({
    name: 'repo_wiki_plan',
    label: 'Repo Wiki Plan',
    description: 'Create a bootstrap or incremental wiki compilation plan.',
    promptSnippet: 'Create a repo-wiki page plan.',
    promptGuidelines: ['Use repo_wiki_plan after scan and before compile.'],
    parameters: repoWikiPlanSchema,
    async execute(_toolCallId, params: any) {
      const result = await createBootstrapPlan({
        scanDir: params.scanDir || '.llmwiki/run',
        outFile: params.outFile || '.llmwiki/bootstrap-plan.json',
      });
      const text = JSON.stringify(result.summary, null, 2);
      return { content: [{ type: 'text', text: truncateForTool(text) }], details: result.summary };
    },
  });

  pi.registerTool({
    name: 'repo_wiki_compile',
    label: 'Repo Wiki Compile',
    description: 'Generate local wiki markdown from a scan and plan.',
    promptSnippet: 'Compile a repo-wiki from scan and plan.',
    promptGuidelines: ['Use repo_wiki_compile after scan and plan.'],
    parameters: repoWikiCompileSchema,
    async execute(_toolCallId, params: any) {
      const repoPath = params.repoPath || '.';
      const config = await loadConfig(repoPath);
      const result = await compileWiki({
        scanDir: params.scanDir || '.llmwiki/run',
        planFile: params.planFile || '.llmwiki/bootstrap-plan.json',
        wikiDir: params.wikiDir || '.llmwiki/wiki',
        config,
      });
      const text = JSON.stringify(result.summary, null, 2);
      return { content: [{ type: 'text', text: truncateForTool(text) }], details: result.summary };
    },
  });

  pi.registerTool({
    name: 'repo_wiki_lint',
    label: 'Repo Wiki Lint',
    description: 'Validate generated wiki pages.',
    promptSnippet: 'Lint a repo-wiki.',
    promptGuidelines: ['Use repo_wiki_lint after compile to validate the wiki.'],
    parameters: repoWikiLintSchema,
    async execute(_toolCallId, params: any) {
      const result = await lintWiki({
        wikiDir: params.wikiDir || '.llmwiki/wiki',
        scanDir: params.scanDir || '.llmwiki/run',
      });
      const text = JSON.stringify(result.summary, null, 2);
      const isError = (result.summary.errors as number) > 0;
      if (isError) {
        throw new Error(`Wiki lint failed with ${result.summary.errors} error(s)\n${truncateForTool(text)}`);
      }
      return { content: [{ type: 'text', text: truncateForTool(text) }], details: result.summary };
    },
  });

  pi.registerTool({
    name: 'repo_wiki_publish',
    label: 'Repo Wiki Publish',
    description: 'Push local wiki pages to GitHub Wiki.',
    promptSnippet: 'Publish a repo-wiki to GitHub Wiki.',
    promptGuidelines: ['Use repo_wiki_publish only when the user asks to publish and a remote is configured.'],
    parameters: repoWikiPublishSchema,
    async execute(_toolCallId, params: any) {
      const wikiDir = params.wikiDir || '.llmwiki/wiki';
      const config = await loadConfig(path.dirname(path.dirname(wikiDir)));
      const target = 'github-wiki';
      const branchFromConfig = config.publish?.wiki?.branch;
      const result = await publishWiki({
        wikiDir,
        remote: params.remote,
        target,
        branch: params.branch || branchFromConfig,
        pagesPath: '.',
        dryRun: Boolean(params.dryRun),
        frontmatterPolicy: 'provenance',
      });
      const text = JSON.stringify(result.summary, null, 2);
      return { content: [{ type: 'text', text: truncateForTool(text) }], details: result.summary };
    },
  });

  pi.registerTool({
    name: 'repo_wiki_search',
    label: 'Repo Wiki Search',
    description: 'Search local wiki pages with the offline index.',
    promptSnippet: 'Search the repo-wiki.',
    promptGuidelines: ['Use repo_wiki_search to find wiki pages by keyword.'],
    parameters: repoWikiSearchSchema,
    async execute(_toolCallId, params: any) {
      const wikiDir = params.wikiDir || '.llmwiki/wiki';
      const result = await searchWiki({
        query: params.query,
        wikiDir,
        outDir: defaultSearchDirForWiki(wikiDir),
        limit: params.limit ?? 10,
      });
      const text = JSON.stringify({ query: result.summary.query, totalResults: result.summary.totalResults, results: result.results }, null, 2);
      return { content: [{ type: 'text', text: truncateForTool(text) }], details: result };
    },
  });

  pi.registerTool({
    name: 'repo_wiki_query',
    label: 'Repo Wiki Query',
    description: 'Answer a question from wiki search and graph evidence.',
    promptSnippet: 'Query the repo-wiki for an answer.',
    promptGuidelines: ['Use repo_wiki_query for evidence-backed answers about the repository.'],
    parameters: repoWikiQuerySchema,
    async execute(_toolCallId, params: any) {
      const wikiDir = params.wikiDir || '.llmwiki/wiki';
      const result = await buildWikiQueryAnswer({
        question: params.question,
        wikiDir,
        graphPath: params.graphPath || defaultGraphPathForWiki(wikiDir),
        outDir: defaultSearchDirForWiki(wikiDir),
        limit: params.limit ?? 5,
      });
      const text = JSON.stringify(result, null, 2);
      return { content: [{ type: 'text', text: truncateForTool(text) }], details: result };
    },
  });

  pi.registerTool({
    name: 'repo_wiki_path',
    label: 'Repo Wiki Path',
    description: 'Find a deterministic graph path between two wiki nodes.',
    promptSnippet: 'Find a path in the repo-wiki graph.',
    promptGuidelines: ['Use repo_wiki_path to explain relationships between wiki pages.'],
    parameters: repoWikiPathSchema,
    async execute(_toolCallId, params: any) {
      const wikiDir = params.wikiDir || '.llmwiki/wiki';
      const result = await findWikiGraphPath({
        from: params.from,
        to: params.to,
        graphPath: params.graphPath || defaultGraphPathForWiki(wikiDir),
      });
      const text = JSON.stringify(result, null, 2);
      if (!result.found) {
        throw new Error(
          `No path found from ${params.from} to ${params.to} (reason: ${result.reason ?? 'unknown'})`
        );
      }
      return { content: [{ type: 'text', text: truncateForTool(text) }], details: result };
    },
  });

  pi.registerTool({
    name: 'repo_wiki_explain',
    label: 'Repo Wiki Explain',
    description: 'Explain a wiki page or graph node with evidence.',
    promptSnippet: 'Explain a repo-wiki node or page.',
    promptGuidelines: ['Use repo_wiki_explain to summarize a specific wiki topic.'],
    parameters: repoWikiExplainSchema,
    async execute(_toolCallId, params: any) {
      const wikiDir = params.wikiDir || '.llmwiki/wiki';
      const result = await buildWikiExplanation({
        target: params.target,
        wikiDir,
        graphPath: params.graphPath || defaultGraphPathForWiki(wikiDir),
        outDir: defaultSearchDirForWiki(wikiDir),
      });
      const text = JSON.stringify(result, null, 2);
      if (!result.found) {
        const detail = result.explanation ? `: ${result.explanation}` : '';
        throw new Error(`Could not explain ${params.target}${detail}`);
      }
      return { content: [{ type: 'text', text: truncateForTool(text) }], details: result };
    },
  });
}
