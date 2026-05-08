import path from 'node:path';
import { fileExists, readJson } from './utils/fs.js';

export const DEFAULT_CONFIG = {
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
      provider: 'openai-compatible',
      base_url: 'https://api.openai.com/v1',
      model: 'gpt-4.1-mini',
      api_key_env: 'LLMWIKI_LLM_API_KEY',
      system_prompt: 'You compile source-grounded GitHub Wiki pages.',
      temperature: 0.1,
      max_output_tokens: 4000,
      timeout_ms: 60000,
      retries: 2
    }
  },
  wiki: {
    max_pages: 500,
    preserve_human_sections: true
  },
  lint: {
    broken_links: 'error',
    secret_like_content: 'error',
    stale_docs: 'warning',
    contradicted_docs: 'error',
    unvalidated_doc_claims: 'warning'
  }
};

export async function loadConfig(repoPath) {
  const configPath = path.join(path.resolve(repoPath), '.llmwiki', 'config.json');
  if (!(await fileExists(configPath))) {
    return { ...DEFAULT_CONFIG, config_path: null };
  }
  const userConfig = await readJson(configPath);
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
