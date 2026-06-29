import path from 'node:path';
import { promises as fs } from 'node:fs';
import { LLM_DEFAULTS } from './llm-provider.js';

export const DEFAULT_CONFIG = {
  source: {
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
    validation_strictness: 'standard',
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
      retries: LLM_DEFAULTS.retries,
      validation_retries: LLM_DEFAULTS.validationRetries,
      page_budgets: {
        architecture: {}
      }
    }
  },
  wiki: {
    max_pages: 500,
    preserve_human_sections: true
  },
  publish: {
    target: 'github-wiki',
    wiki: {
      branch: 'master',
      frontmatter: 'provenance'
    },
    pages: {
      branch: 'gh-pages',
      path: '.',
      frontmatter: 'preserve'
    }
  },
  lint: {
    broken_links: 'error',
    secret_like_content: 'error',
    stale_docs: 'warning',
    contradicted_docs: 'error',
    unvalidated_doc_claims: 'warning',
    unvalidated_route_claims: 'warning',
    broken_file_references: 'warning',
    unvalidated_env_vars: 'warning'
  }
};

export async function loadConfig(repoPath) {
  const configPath = path.join(path.resolve(repoPath), '.llmwiki', 'config.json');
  if (!((await fs.access(configPath).then(() => true).catch(() => false)))) {
    return { ...DEFAULT_CONFIG, config_path: null };
  }
  const userConfig = JSON.parse(await fs.readFile(configPath, 'utf8'));
  return deepMerge(DEFAULT_CONFIG, userConfig, { config_path: configPath });
}

function deepMerge(base, override, extra = {}) {
  const result = { ...base };
  for (const [key, value] of Object.entries(override || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge(base[key] || {}, value);
    } else {
      result[key] = value;
    }
  }
  return { ...result, ...extra };
}
