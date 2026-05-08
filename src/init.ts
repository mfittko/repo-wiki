import path from 'node:path';
import { LLM_DEFAULTS } from './llm-provider.js';
import { ensureDir, fileExists, writeJson, writeText } from './utils/fs.js';

const DEFAULT_CONFIG = {
  schema_version: 1,
  role: 'consumer-repository',
  source: {
    repo: '.',
    default_mode: 'bootstrap',
    exclude: [
      '.git/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.llmwiki/run/**',
      '.llmwiki/wiki/**'
    ],
    suppress_nested_repositories: true
  },
  documentation: {
    ingest: true,
    authority: 'secondary',
    include: ['README.md', 'docs/**/*.md', 'ADR/**/*.md', '.github/**/*.md'],
    exclude: ['CHANGELOG.md', 'docs/archive/**', 'docs/old/**'],
    stale_after_days: 180,
    require_code_validation: true,
    allow_unvalidated_context: true,
    preserve_original_claims: false,
    fail_on_stale_docs: false,
    fail_on_conflicting_docs: true
  },
  compiler: {
    mode: 'deterministic',
    llm: {
      provider: LLM_DEFAULTS.hostedProvider,
      base_url: LLM_DEFAULTS.baseUrl,
      model: LLM_DEFAULTS.model,
      api_key_env: LLM_DEFAULTS.apiKeyEnv,
      system_prompt: LLM_DEFAULTS.systemPrompt,
      temperature: LLM_DEFAULTS.temperature,
      max_output_tokens: LLM_DEFAULTS.maxOutputTokens,
      timeout_ms: LLM_DEFAULTS.timeoutMs,
      retries: LLM_DEFAULTS.retries
    }
  },
  wiki: {
    local_dir: '.llmwiki/wiki',
    publish_remote_env: 'LLMWIKI_PUBLISH_REMOTE',
    publish_branch: 'master',
    max_pages: 500,
    preserve_human_sections: true
  },
  lint: {
    fail_on_errors: true,
    warn_on_orphans: true,
    block_secret_like_content: true,
    broken_links: 'error',
    stale_docs: 'warning',
    contradicted_docs: 'error',
    unvalidated_doc_claims: 'warning'
  }
};

const DEFAULT_SCHEMA = `# LLM Wiki Schema\n\nThis file defines how this repository is compiled into GitHub Wiki pages by repo-wiki.\n\n## Source of truth\n\nThe repository at the pinned Git commit is authoritative. Generated wiki pages are derived artifacts.\n\n## Required generated pages\n\n- Home.md\n- _Sidebar.md\n- Index.md\n- Log.md\n- Agent-Context-Pack.md\n- Repository-Overview.md\n- Architecture.md\n- Build-Test-and-Run.md\n- Open-Questions.md\n- Documentation-Debt-Report.md\n\n## Documentation ingestion\n\nMarkdown documentation is ingested as secondary evidence by default. It can reveal intent and terminology, but operational or behavioral claims should be validated against code, tests, CI, configuration, or generated schemas. Stale or contradicted markdown is reported by \`repo-wiki lint-docs\`.\n\n## Rules\n\n- Prefer updating existing pages over creating new pages.\n- Preserve marked human-maintained sections.\n- Add uncertain claims to Open-Questions.md.\n- Cite source paths for material claims.\n- Do not copy secrets, tokens, private keys, or .env values.\n`;

const AGENT_POINTER = `# Repository Wiki Knowledge Base\n\nThis repository can be compiled into a GitHub Wiki knowledge base with repo-wiki.\n\nRecommended local bootstrap:\n\n\`\`\`bash\nnpx repo-wiki run --mode bootstrap --repo . --scan .llmwiki/run --plan .llmwiki/bootstrap-plan.json --wiki .llmwiki/wiki\n\`\`\`\n\nBefore non-trivial changes, read the generated wiki entry points when available:\n\n1. .llmwiki/wiki/Agent-Context-Pack.md\n2. .llmwiki/wiki/Index.md\n3. The relevant module page\n4. .llmwiki/wiki/Documentation-Debt-Report.md when docs influenced an answer\n\nSource code at the current commit is authoritative if the wiki is stale.\n`;

export async function initProject({ repoPath = '.', force = false, writeAgents = false }) {
  const absoluteRepo = path.resolve(repoPath);
  const llmwikiDir = path.join(absoluteRepo, '.llmwiki');
  const configPath = path.join(llmwikiDir, 'config.json');
  const schemaPath = path.join(llmwikiDir, 'schema.md');
  const agentsPath = path.join(absoluteRepo, 'AGENTS.repo-wiki.md');
  const written = [];
  const skipped = [];

  await ensureDir(llmwikiDir);

  if (force || !await fileExists(configPath)) {
    await writeJson(configPath, DEFAULT_CONFIG);
    written.push(path.relative(absoluteRepo, configPath));
  } else {
    skipped.push(path.relative(absoluteRepo, configPath));
  }

  if (force || !await fileExists(schemaPath)) {
    await writeText(schemaPath, DEFAULT_SCHEMA);
    written.push(path.relative(absoluteRepo, schemaPath));
  } else {
    skipped.push(path.relative(absoluteRepo, schemaPath));
  }

  if (writeAgents) {
    if (force || !await fileExists(agentsPath)) {
      await writeText(agentsPath, AGENT_POINTER);
      written.push(path.relative(absoluteRepo, agentsPath));
    } else {
      skipped.push(path.relative(absoluteRepo, agentsPath));
    }
  }

  return {
    summary: {
      repoPath: absoluteRepo,
      written,
      skipped,
      next_step: 'Run repo-wiki run --mode bootstrap --repo . --scan .llmwiki/run --plan .llmwiki/bootstrap-plan.json --wiki .llmwiki/wiki'
    }
  };
}
