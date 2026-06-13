import { parseArgs, type ParsedArgs } from './utils/args.js';
import { loadDotEnv } from './utils/dotenv.js';
import { initProject } from './init.js';
import { scanRepository } from './scanner.js';
import { createBootstrapPlan } from './planner.js';
import { compileWiki } from './compiler.js';
import { formatSearchResults, searchWiki, defaultSearchDirForWiki } from './search.js';
import { buildWikiExplanation, buildWikiQueryAnswer, defaultGraphPathForWiki, findWikiGraphPath, formatWikiExplanation, formatWikiGraphPath, formatWikiQueryAnswer } from './wiki-query.js';
import { lintWiki } from './linter.js';
import { lintDocs } from './docs-linter.js';
import { loadConfig } from './config.js';
import { publishWiki, PUBLISH_TARGETS, defaultFrontmatterPolicyForTarget, type PublishTarget } from './publisher.js';
import { isFrontmatterPolicy, parseFrontmatterPolicy, type FrontmatterPolicy } from './frontmatter.js';
import { runExtensionInstall } from './extension-install.js';

type PublishConfig = {
  target?: string;
  frontmatter?: string;
  wiki?: { branch?: string; frontmatter?: string };
  pages?: { branch?: string; path?: string; frontmatter?: string };
};

const HELP = `
repo-wiki <command> [options]

Commands:
  init      Add .llmwiki config/schema files to a repository.
  scan      Scan a repository into .llmwiki source cards and manifest files.
  plan      Create a bootstrap or incremental wiki compilation plan.
  compile   Generate or update local wiki markdown pages.
  lint      Validate generated wiki pages.
  lint-docs Validate ingested markdown documentation before compilation.
  publish   Push local wiki pages to GitHub Wiki or GitHub Pages.
  search    Search local wiki pages through the built-in offline index.
  query     Answer from local wiki/search/graph evidence.
  path      Find a deterministic traversal in .llmwiki/graph.json.
  explain   Explain a wiki page or graph node with evidence.
  run       Run scan -> plan -> lint-docs -> compile -> lint, optionally followed by publish.
  extension Install the pi extension shim and skill (extension install [--global|--project] [--pi-dir <dir>]).

Options:
  --target <github-wiki|github-pages>
            Publish destination (default: github-wiki).
  --pages-path <path>
            Publish path for github-pages target (default: .).
  --frontmatter-policy <strip|html-comment|preserve|provenance>
  --frontmatter <strip|html-comment|preserve|provenance>
            Frontmatter handling when publishing to the selected target.
            github-wiki defaults to provenance; github-pages defaults to preserve.
            html-comment is accepted for forward compatibility and currently behaves like strip.

Examples:
  repo-wiki init --repo . --write-agents
  repo-wiki run --mode bootstrap --repo . --scan .llmwiki/run --plan .llmwiki/bootstrap-plan.json --wiki .llmwiki/wiki
  repo-wiki publish --target github-wiki --wiki .llmwiki/wiki --remote https://github.com/OWNER/REPO.wiki.git
  repo-wiki publish --target github-pages --wiki .llmwiki/wiki --remote https://github.com/OWNER/REPO.git --branch gh-pages --pages-path .
  repo-wiki search "architecture" --wiki .llmwiki/wiki --json
  repo-wiki query "How does compile work?" --wiki .llmwiki/wiki --json
  repo-wiki path Architecture.md src/compiler.ts --graph .llmwiki/graph.json --json
  repo-wiki explain Module-compiler-ts.md --wiki .llmwiki/wiki --json
  npx repo-wiki run --mode bootstrap --repo /path/to/existing/repo --wiki /tmp/repo-wiki
`.trim();

function getStringOption(options: ParsedArgs, key: string) {
  const value = options[key];
  return typeof value === 'string' ? value : undefined;
}

function getPublishTargetOption(options: ParsedArgs, configuredTarget?: string): PublishTarget {
  const value = getStringOption(options, 'target') || configuredTarget;
  if (!value) {
    return 'github-wiki';
  }
  if (isPublishTarget(value)) {
    return value;
  }
  console.error(`Warning: unknown --target "${value}"; falling back to "github-wiki".`);
  return 'github-wiki';
}

function getFrontmatterPolicyOption(options: ParsedArgs, target: PublishTarget, configuredPolicy?: string): FrontmatterPolicy {
  const explicitOptionName = getFrontmatterOptionName(options);
  const explicitValue = explicitOptionName ? getStringOption(options, explicitOptionName.slice(2)) : undefined;
  const value = explicitValue || configuredPolicy;
  const defaultPolicy = defaultFrontmatterPolicyForTarget(target);
  const policy = value === undefined ? defaultPolicy : isFrontmatterPolicy(value) ? parseFrontmatterPolicy(value) : defaultPolicy;

  if (explicitValue !== undefined && !isFrontmatterPolicy(explicitValue)) {
    console.error(`Warning: unknown ${explicitOptionName} "${explicitValue}"; falling back to "${defaultPolicy}".`);
  } else if (policy === 'html-comment') {
    console.error(`Warning: ${explicitOptionName || '--frontmatter-policy'} html-comment is reserved for future metadata comments and currently behaves like strip.`);
  }

  return policy;
}

function getFrontmatterOptionName(options: ParsedArgs): '--frontmatter-policy' | '--frontmatter' | null {
  if (getStringOption(options, 'frontmatter-policy') !== undefined) {
    return '--frontmatter-policy';
  }
  if (getStringOption(options, 'frontmatter') !== undefined) {
    return '--frontmatter';
  }
  return null;
}

export async function runCli(argv: string[]) {
  const [command, ...rest] = argv;
  const options = parseArgs(rest);
  await loadDotEnv(getDotEnvBaseDir(command, options));

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log(HELP);
    return;
  }

  switch (command) {
    case 'init': {
      const result = await initProject({
        repoPath: getStringOption(options, 'repo') || '.',
        force: Boolean(options.force),
        writeAgents: Boolean(options['write-agents'])
      });
      console.log(JSON.stringify(result.summary, null, 2));
      return;
    }

    case 'scan': {
      const result = await scanRepository({
        mode: getStringOption(options, 'mode') || 'bootstrap',
        repoPath: getStringOption(options, 'repo') || '.',
        outDir: getStringOption(options, 'out') || getStringOption(options, 'scan') || '.llmwiki/run',
        baseRef: getStringOption(options, 'base'),
        headRef: getStringOption(options, 'head')
      });
      console.log(JSON.stringify(result.summary, null, 2));
      return;
    }

    case 'plan': {
      const result = await createBootstrapPlan({
        scanDir: getStringOption(options, 'scan') || '.llmwiki/run',
        outFile: getStringOption(options, 'out') || getStringOption(options, 'plan') || '.llmwiki/bootstrap-plan.json'
      });
      console.log(JSON.stringify(result.summary, null, 2));
      return;
    }

    case 'compile': {
      const compileRepoPath = getStringOption(options, 'repo') || '.';
      const compileConfig = await loadConfig(compileRepoPath);
      const result = await compileWiki({
        scanDir: getStringOption(options, 'scan') || '.llmwiki/run',
        planFile: getStringOption(options, 'plan') || '.llmwiki/bootstrap-plan.json',
        wikiDir: getStringOption(options, 'wiki') || '.llmwiki/wiki',
        config: compileConfig
      });
      console.log(JSON.stringify(result.summary, null, 2));
      return;
    }

    case 'lint': {
      const result = await lintWiki({
        wikiDir: getStringOption(options, 'wiki') || '.llmwiki/wiki',
        scanDir: getStringOption(options, 'scan') || '.llmwiki/run'
      });
      for (const finding of result.summary.graph_health?.findings || []) {
        console.error(`${finding.severity.toUpperCase()} ${finding.code} ${finding.message}`);
      }
      console.log(JSON.stringify(result.summary, null, 2));
      if (result.summary.errors > 0) {
        process.exitCode = 1;
      }
      return;
    }

    case 'lint-docs': {
      const result = await lintDocs({
        scanDir: getStringOption(options, 'scan') || '.llmwiki/run',
        repoPath: getStringOption(options, 'repo') || '.'
      });
      console.log(JSON.stringify(result.summary, null, 2));
      if (result.summary.errors > 0) {
        process.exitCode = 1;
      }
      return;
    }

    case 'publish': {
      const config = await loadConfig(process.cwd());
      const target = getPublishTargetOption(options, config.publish?.target);
      const result = await publishWiki({
        wikiDir: getStringOption(options, 'wiki') || '.llmwiki/wiki',
        remote: getStringOption(options, 'remote'),
        target,
        branch: getStringOption(options, 'branch') || getConfiguredBranch(config.publish, target),
        pagesPath: getStringOption(options, 'pages-path') || config.publish?.pages?.path || '.',
        message: getStringOption(options, 'message'),
        dryRun: Boolean(options['dry-run']),
        frontmatterPolicy: getFrontmatterPolicyOption(options, target, getConfiguredFrontmatterPolicy(config.publish, target))
      });
      console.log(JSON.stringify(result.summary, null, 2));
      return;
    }

    case 'search': {
      const positionals = getPositionals(rest);
      const query = positionals.join(' ').trim();
      if (!query) {
        throw new Error('Missing search query. Usage: repo-wiki search <query> [--wiki <path>] [--json]');
      }

      const wikiDir = getStringOption(options, 'wiki') || '.llmwiki/wiki';
      const outDir = getStringOption(options, 'index') || getStringOption(options, 'search') || defaultSearchDirForWiki(wikiDir);
      const limit = parsePositiveInt(getStringOption(options, 'limit')) || 10;
      const result = await searchWiki({ query, wikiDir, outDir, limit });

      if (Boolean(options.json)) {
        console.log(JSON.stringify({
          query: result.summary.query,
          limit: result.summary.limit,
          totalResults: result.summary.totalResults,
          index: result.summary.index,
          results: result.results
        }, null, 2));
      } else {
        console.log(formatSearchResults(query, result.results));
      }
      return;
    }

    case 'query': {
      const positionals = getPositionals(rest);
      const question = positionals.join(' ').trim();
      if (!question) {
        throw new Error('Missing query question. Usage: repo-wiki query <question> [--wiki <path>] [--graph <path>] [--json]');
      }
      const wikiDir = getStringOption(options, 'wiki') || '.llmwiki/wiki';
      const graphPath = getStringOption(options, 'graph') || defaultGraphPathForWiki(wikiDir);
      const outDir = getStringOption(options, 'index') || getStringOption(options, 'search') || defaultSearchDirForWiki(wikiDir);
      const limit = parsePositiveInt(getStringOption(options, 'limit')) || 5;
      const result = await buildWikiQueryAnswer({ question, wikiDir, graphPath, outDir, limit });
      console.log(Boolean(options.json) ? JSON.stringify(result, null, 2) : formatWikiQueryAnswer(result));
      return;
    }

    case 'path': {
      const positionals = getPositionals(rest);
      const [from, to] = positionals;
      if (!from || !to) {
        throw new Error('Missing path endpoints. Usage: repo-wiki path <from> <to> [--graph <path>] [--json]');
      }
      const wikiDir = getStringOption(options, 'wiki') || '.llmwiki/wiki';
      const graphPath = getStringOption(options, 'graph') || defaultGraphPathForWiki(wikiDir);
      const result = await findWikiGraphPath({ graphPath, from, to });
      console.log(Boolean(options.json) ? JSON.stringify(result, null, 2) : formatWikiGraphPath(result));
      if (!result.found) {
        process.exitCode = 1;
      }
      return;
    }

    case 'explain': {
      const positionals = getPositionals(rest);
      const target = positionals.join(' ').trim();
      if (!target) {
        throw new Error('Missing explain target. Usage: repo-wiki explain <node-or-page> [--wiki <path>] [--graph <path>] [--json]');
      }
      const wikiDir = getStringOption(options, 'wiki') || '.llmwiki/wiki';
      const graphPath = getStringOption(options, 'graph') || defaultGraphPathForWiki(wikiDir);
      const outDir = getStringOption(options, 'index') || getStringOption(options, 'search') || defaultSearchDirForWiki(wikiDir);
      const result = await buildWikiExplanation({ target, wikiDir, graphPath, outDir });
      console.log(Boolean(options.json) ? JSON.stringify(result, null, 2) : formatWikiExplanation(result));
      if (!result.found) {
        process.exitCode = 1;
      }
      return;
    }

    case 'run': {
      const result = await runPipeline(options);
      console.log(JSON.stringify(result.summary, null, 2));
      if (result.summary.status === 'blocked') {
        process.exitCode = 1;
      }
      return;
    }

    case 'extension': {
      const subCommand = rest[0];
      if (subCommand !== 'install') {
        throw new Error(`Unknown extension subcommand: ${subCommand ?? '(none)'}\n\n${HELP}`);
      }
      await runExtensionInstall({
        global: Boolean(options.global),
        project: Boolean(options.project),
        piDir: getStringOption(options, 'pi-dir'),
        force: Boolean(options.force)
      });
      return;
    }

    default:
      throw new Error(`Unknown command: ${command}\n\n${HELP}`);
  }
}

function getDotEnvBaseDir(command: string | undefined, options: ParsedArgs) {
  const repoPath = getStringOption(options, 'repo');
  if (repoPath && ['init', 'scan', 'compile', 'lint-docs', 'run'].includes(command || '')) {
    return repoPath;
  }
  return process.cwd();
}

async function runPipeline(options: ParsedArgs) {
  const mode = getStringOption(options, 'mode') || 'bootstrap';
  const repoPath = getStringOption(options, 'repo') || '.';
  const config = await loadConfig(repoPath);
  const scanDir = getStringOption(options, 'scan') || '.llmwiki/run';
  const planFile = getStringOption(options, 'plan') || (mode === 'incremental' ? '.llmwiki/incremental-plan.json' : '.llmwiki/bootstrap-plan.json');
  const wikiDir = getStringOption(options, 'wiki') || '.llmwiki/wiki';

  const scan = await scanRepository({
    mode,
    repoPath,
    outDir: scanDir,
    baseRef: getStringOption(options, 'base'),
    headRef: getStringOption(options, 'head')
  });

  const plan = await createBootstrapPlan({
    scanDir,
    outFile: planFile
  });

  const docsLint = await lintDocs({
    scanDir,
    repoPath
  });

  if (docsLint.summary.errors > 0) {
    const reason = 'docs-lint-errors';
    return {
      scan,
      plan,
      docsLint,
      compile: null,
      lint: null,
      publish: null,
      summary: {
        status: 'blocked',
        blockedStage: 'lint-docs',
        mode,
        repoPath,
        scan: scan.summary,
        plan: plan.summary,
        docsLint: docsLint.summary,
        compile: { status: 'skipped', reason },
        lint: { status: 'skipped', reason },
        publish: options.publish ? { status: 'blocked', reason } : null
      }
    };
  }

  const compile = await compileWiki({
    scanDir,
    planFile,
    wikiDir,
    config
  });

  const lint = await lintWiki({
    wikiDir,
    scanDir
  });

  let publish = null;
  let publishSummary: Record<string, unknown> | null = null;
  if (options.publish && lint.summary.errors > 0) {
    publishSummary = { status: 'blocked', reason: 'wiki-lint-errors' };
  } else if (options.publish) {
    const target = getPublishTargetOption(options, config.publish?.target);
    publish = await publishWiki({
      wikiDir,
      remote: getStringOption(options, 'remote'),
      target,
      branch: getStringOption(options, 'branch') || getConfiguredBranch(config.publish, target),
      pagesPath: getStringOption(options, 'pages-path') || config.publish?.pages?.path || '.',
      message: getStringOption(options, 'message'),
      dryRun: Boolean(options['dry-run']),
      frontmatterPolicy: getFrontmatterPolicyOption(options, target, getConfiguredFrontmatterPolicy(config.publish, target))
    });
    publishSummary = publish.summary;
  }
  const lintBlocked = lint.summary.errors > 0;

  return {
    scan,
    plan,
    compile,
    lint,
    publish,
    summary: {
      status: lintBlocked ? 'blocked' : 'ok',
      blockedStage: lintBlocked ? 'lint' : null,
      mode,
      repoPath,
      scan: scan.summary,
      plan: plan.summary,
      docsLint: docsLint.summary,
      compile: compile.summary,
      lint: lint.summary,
      publish: publishSummary
    }
  };
}

function isPublishTarget(value: string): value is PublishTarget {
  return (PUBLISH_TARGETS as readonly string[]).includes(value);
}

function getConfiguredBranch(configuredPublish: PublishConfig | undefined, target: PublishTarget) {
  if (target === 'github-pages') {
    return configuredPublish?.pages?.branch || 'gh-pages';
  }
  return configuredPublish?.wiki?.branch || 'master';
}

function getConfiguredFrontmatterPolicy(configuredPublish: PublishConfig | undefined, target: PublishTarget) {
  if (target === 'github-pages') {
    return configuredPublish?.pages?.frontmatter || configuredPublish?.frontmatter;
  }
  if (target === 'github-wiki') {
    return configuredPublish?.wiki?.frontmatter || configuredPublish?.frontmatter;
  }
  return configuredPublish?.frontmatter;
}

function getPositionals(argv: string[]) {
  const positionals: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      index += 1;
    }
  }

  return positionals;
}

function parsePositiveInt(value: string | undefined) {
  if (!value) {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
