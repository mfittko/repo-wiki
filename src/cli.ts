import { parseArgs, type ParsedArgs } from './utils/args.js';
import { initProject } from './init.js';
import { scanRepository } from './scanner.js';
import { createBootstrapPlan } from './planner.js';
import { compileWiki } from './compiler.js';
import { lintWiki } from './linter.js';
import { lintDocs } from './docs-linter.js';
import { publishWiki } from './publisher.js';
import { isFrontmatterPolicy, parseFrontmatterPolicy, type FrontmatterPolicy } from './frontmatter.js';

const HELP = `
repo-wiki <command> [options]

Commands:
  init      Add .llmwiki config/schema files to a repository.
  scan      Scan a repository into .llmwiki source cards and manifest files.
  plan      Create a bootstrap or incremental wiki compilation plan.
  compile   Generate or update local wiki markdown pages.
  lint      Validate generated wiki pages.
  lint-docs Validate ingested markdown documentation before compilation.
  publish   Push local wiki pages to OWNER/REPO.wiki.git.
  run       Run scan -> plan -> compile -> lint, optionally followed by publish.

Options:
  --frontmatter-policy <strip|html-comment|preserve>
            Frontmatter handling when publishing to GitHub Wiki (default: strip).
            html-comment is accepted for forward compatibility and currently behaves like strip.

Examples:
  repo-wiki init --repo . --write-agents
  repo-wiki run --mode bootstrap --repo . --scan .llmwiki/run --plan .llmwiki/bootstrap-plan.json --wiki .llmwiki/wiki
  repo-wiki publish --wiki .llmwiki/wiki --remote https://github.com/OWNER/REPO.wiki.git
  npx repo-wiki run --mode bootstrap --repo /path/to/existing/repo --wiki /tmp/repo-wiki
`.trim();

function getStringOption(options: ParsedArgs, key: string) {
  const value = options[key];
  return typeof value === 'string' ? value : undefined;
}

function getFrontmatterPolicyOption(options: ParsedArgs): FrontmatterPolicy {
  const value = getStringOption(options, 'frontmatter-policy');
  const policy = parseFrontmatterPolicy(value);

  if (value !== undefined && !isFrontmatterPolicy(value)) {
    console.error(`Warning: unknown --frontmatter-policy "${value}"; falling back to "strip".`);
  } else if (policy === 'html-comment') {
    console.error('Warning: --frontmatter-policy html-comment is reserved for future metadata comments and currently behaves like strip.');
  }

  return policy;
}

export async function runCli(argv: string[]) {
  const [command, ...rest] = argv;
  const options = parseArgs(rest);

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
      const result = await compileWiki({
        scanDir: getStringOption(options, 'scan') || '.llmwiki/run',
        planFile: getStringOption(options, 'plan') || '.llmwiki/bootstrap-plan.json',
        wikiDir: getStringOption(options, 'wiki') || '.llmwiki/wiki'
      });
      console.log(JSON.stringify(result.summary, null, 2));
      return;
    }

    case 'lint': {
      const result = await lintWiki({
        wikiDir: getStringOption(options, 'wiki') || '.llmwiki/wiki',
        scanDir: getStringOption(options, 'scan') || '.llmwiki/run'
      });
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
      const result = await publishWiki({
        wikiDir: getStringOption(options, 'wiki') || '.llmwiki/wiki',
        remote: getStringOption(options, 'remote'),
        branch: getStringOption(options, 'branch') || 'master',
        message: getStringOption(options, 'message'),
        dryRun: Boolean(options['dry-run']),
        frontmatterPolicy: getFrontmatterPolicyOption(options)
      });
      console.log(JSON.stringify(result.summary, null, 2));
      return;
    }

    case 'run': {
      const result = await runPipeline(options);
      console.log(JSON.stringify(result.summary, null, 2));
      if (result.summary.lint.errors > 0) {
        process.exitCode = 1;
      }
      return;
    }

    default:
      throw new Error(`Unknown command: ${command}\n\n${HELP}`);
  }
}

async function runPipeline(options: ParsedArgs) {
  const mode = getStringOption(options, 'mode') || 'bootstrap';
  const repoPath = getStringOption(options, 'repo') || '.';
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

  const compile = await compileWiki({
    scanDir,
    planFile,
    wikiDir
  });

  const lint = await lintWiki({
    wikiDir,
    scanDir
  });

  let publish = null;
  if (options.publish) {
    publish = await publishWiki({
      wikiDir,
      remote: getStringOption(options, 'remote'),
      branch: getStringOption(options, 'branch') || 'master',
      message: getStringOption(options, 'message'),
      dryRun: Boolean(options['dry-run']),
      frontmatterPolicy: getFrontmatterPolicyOption(options)
    });
  }

  return {
    scan,
    plan,
    compile,
    lint,
    publish,
    summary: {
      mode,
      repoPath,
      scan: scan.summary,
      plan: plan.summary,
      docsLint: docsLint.summary,
      compile: compile.summary,
      lint: lint.summary,
      publish: publish?.summary || null
    }
  };
}
