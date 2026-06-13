import type { ExtensionAPI, ExtensionContext } from '@earendil-works/pi-coding-agent';
import { Type, type Static } from 'typebox';
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

const repoWikiCommandSchema = Type.Object({
  args: Type.Optional(Type.String({ description: 'Arguments passed to the repo-wiki CLI' })),
});

const repoWikiScanSchema = Type.Object({
  repoPath: Type.Optional(Type.String({ description: 'Repository path' })),
  mode: Type.Optional(Type.String({ description: 'bootstrap or incremental' })),
  outDir: Type.Optional(Type.String({ description: 'Output scan directory' })),
  baseRef: Type.Optional(Type.String()),
  headRef: Type.Optional(Type.String()),
});

const repoWikiPlanSchema = Type.Object({
  scanDir: Type.Optional(Type.String({ description: 'Scan directory' })),
  outFile: Type.Optional(Type.String({ description: 'Plan output file' })),
});

const repoWikiCompileSchema = Type.Object({
  repoPath: Type.Optional(Type.String({ description: 'Repository path for config' })),
  scanDir: Type.Optional(Type.String()),
  planFile: Type.Optional(Type.String()),
  wikiDir: Type.Optional(Type.String()),
});

const repoWikiLintSchema = Type.Object({
  wikiDir: Type.Optional(Type.String()),
  scanDir: Type.Optional(Type.String()),
});

const repoWikiPublishSchema = Type.Object({
  wikiDir: Type.Optional(Type.String()),
  remote: Type.Optional(Type.String()),
  branch: Type.Optional(Type.String()),
  dryRun: Type.Optional(Type.Boolean()),
});

const repoWikiQuerySchema = Type.Object({
  question: Type.String({ description: 'Question to answer from the wiki' }),
  wikiDir: Type.Optional(Type.String()),
  graphPath: Type.Optional(Type.String()),
  limit: Type.Optional(Type.Number({ default: 5 })),
});

const repoWikiPathSchema = Type.Object({
  from: Type.String({ description: 'Start node or page' }),
  to: Type.String({ description: 'End node or page' }),
  graphPath: Type.Optional(Type.String()),
});

const repoWikiExplainSchema = Type.Object({
  target: Type.String({ description: 'Page or node to explain' }),
  wikiDir: Type.Optional(Type.String()),
  graphPath: Type.Optional(Type.String()),
});

const repoWikiSearchSchema = Type.Object({
  query: Type.String({ description: 'Search query' }),
  wikiDir: Type.Optional(Type.String()),
  limit: Type.Optional(Type.Number({ default: 10 })),
});

function truncateForTool(text: string, maxBytes = 50000, maxLines = 2000): string {
  const lines = text.split('\n');
  if (lines.length > maxLines || Buffer.byteLength(text, 'utf8') > maxBytes) {
    const head = lines.slice(0, maxLines);
    let joined = head.join('\n');
    while (Buffer.byteLength(joined, 'utf8') > maxBytes && head.length > 1) {
      head.pop();
      joined = head.join('\n');
    }
    return `${joined}\n\n[Output truncated]`;
  }
  return text;
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
      const tokens = args.trim() ? args.trim().split(/\s+/) : ['--help'];
      try {
        await runCli(tokens);
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
    async execute(_toolCallId, params: Static<typeof repoWikiCommandSchema>) {
      const tokens = params.args?.trim() ? params.args.trim().split(/\s+/) : ['--help'];
      await runCli(tokens);
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
    async execute(_toolCallId, params: Static<typeof repoWikiScanSchema>) {
      const result = await scanRepository({
        mode: (params.mode as 'bootstrap' | 'incremental') || 'bootstrap',
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
    async execute(_toolCallId, params: Static<typeof repoWikiPlanSchema>) {
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
    async execute(_toolCallId, params: Static<typeof repoWikiCompileSchema>) {
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
    async execute(_toolCallId, params: Static<typeof repoWikiLintSchema>) {
      const result = await lintWiki({
        wikiDir: params.wikiDir || '.llmwiki/wiki',
        scanDir: params.scanDir || '.llmwiki/run',
      });
      const text = JSON.stringify(result.summary, null, 2);
      const isError = (result.summary.errors as number) > 0;
      if (isError) {
        throw new Error(`Wiki lint failed with ${result.summary.errors} error(s)`);
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
    async execute(_toolCallId, params: Static<typeof repoWikiPublishSchema>) {
      const config = await loadConfig(process.cwd());
      const result = await publishWiki({
        wikiDir: params.wikiDir || '.llmwiki/wiki',
        remote: params.remote,
        target: 'github-wiki',
        branch: params.branch || (config.publish?.branch),
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
    async execute(_toolCallId, params: Static<typeof repoWikiSearchSchema>) {
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
    async execute(_toolCallId, params: Static<typeof repoWikiQuerySchema>) {
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
    async execute(_toolCallId, params: Static<typeof repoWikiPathSchema>) {
      const result = await findWikiGraphPath({
        from: params.from,
        to: params.to,
        graphPath: params.graphPath || defaultGraphPathForWiki('.llmwiki/wiki'),
      });
      const text = JSON.stringify(result, null, 2);
      if (!result.found) {
        throw new Error(`No path found from ${params.from} to ${params.to}`);
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
    async execute(_toolCallId, params: Static<typeof repoWikiExplainSchema>) {
      const wikiDir = params.wikiDir || '.llmwiki/wiki';
      const result = await buildWikiExplanation({
        target: params.target,
        wikiDir,
        graphPath: params.graphPath || defaultGraphPathForWiki(wikiDir),
        outDir: defaultSearchDirForWiki(wikiDir),
      });
      const text = JSON.stringify(result, null, 2);
      if (!result.found) {
        throw new Error(`Could not explain ${params.target}`);
      }
      return { content: [{ type: 'text', text: truncateForTool(text) }], details: result };
    },
  });
}
