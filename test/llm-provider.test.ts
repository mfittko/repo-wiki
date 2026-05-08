import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MockLLMProvider,
  OpenAICompatibleProvider,
  LLMProviderError,
  createProvider,
  resolveProviderConfig,
  buildRequest,
} from '../src/llm-provider.js';
import {
  buildPrompt,
  buildFoundationPrompt,
  buildModulePrompt,
  buildCrossCuttingPrompt,
} from '../src/prompts.js';
import type {
  LLMRequest,
  LLMProviderConfig,
} from '../src/llm-provider.js';
import type { PromptContext } from '../src/prompts.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeContext(overrides: Partial<PromptContext> = {}): PromptContext {
  return {
    pageName: 'Module-Auth',
    pageTitle: 'Auth',
    repoRemote: 'https://github.com/owner/repo',
    repoCommit: 'abc123',
    sourceCards: [
      {
        path: 'src/auth/index.ts',
        category: 'source',
        language: 'TypeScript',
        symbols: ['login', 'logout', 'refreshToken'],
        imports: ['./tokens.js', './session.js'],
        reasons: ['auth'],
      },
    ],
    docCards: [
      { path: 'docs/auth.md', status: 'validated', claims: ['JWT-based session'] },
    ],
    ...overrides,
  };
}

function makeRequest(overrides: Partial<LLMRequest> = {}): LLMRequest {
  return {
    archetype: 'module',
    pageName: 'Module-Auth',
    pageTitle: 'Auth',
    systemPrompt: 'System instructions.',
    userPrompt: 'User instructions.',
    ...overrides,
  };
}

// ── MockLLMProvider ────────────────────────────────────────────────────────

test('MockLLMProvider has name "mock"', () => {
  const provider = new MockLLMProvider();
  assert.equal(provider.name, 'mock');
});

test('MockLLMProvider returns a response without network calls', async () => {
  const provider = new MockLLMProvider();
  const response = await provider.complete(makeRequest());
  assert.equal(response.provider, 'mock');
  assert.ok(typeof response.content === 'string' && response.content.length > 0, 'content must be non-empty');
});

test('MockLLMProvider response includes frontmatter', async () => {
  const provider = new MockLLMProvider();
  const response = await provider.complete(makeRequest({ pageName: 'Module-Auth', pageTitle: 'Auth' }));
  assert.match(response.content, /^---/);
  assert.match(response.content, /page_type:/);
  assert.match(response.content, /page_name:/);
  assert.match(response.content, /compiled_at:/);
  assert.match(response.content, /source_commit:/);
});

test('MockLLMProvider response includes page title as h1', async () => {
  const provider = new MockLLMProvider();
  const response = await provider.complete(makeRequest({ pageTitle: 'My Module' }));
  assert.match(response.content, /^# My Module/m);
});

test('MockLLMProvider includes HUMAN_NOTES block for module archetype', async () => {
  const provider = new MockLLMProvider();
  const response = await provider.complete(makeRequest({ archetype: 'module' }));
  assert.match(response.content, /HUMAN_NOTES_START/);
  assert.match(response.content, /HUMAN_NOTES_END/);
});

test('MockLLMProvider omits HUMAN_NOTES block for foundation archetype', async () => {
  const provider = new MockLLMProvider();
  const response = await provider.complete(makeRequest({ archetype: 'foundation' }));
  assert.doesNotMatch(response.content, /HUMAN_NOTES_START/);
});

test('MockLLMProvider omits HUMAN_NOTES block for cross-cutting archetype', async () => {
  const provider = new MockLLMProvider();
  const response = await provider.complete(makeRequest({ archetype: 'cross-cutting' }));
  assert.doesNotMatch(response.content, /HUMAN_NOTES_START/);
});

test('MockLLMProvider is deterministic: same input produces same output', async () => {
  const provider = new MockLLMProvider();
  const req = makeRequest({ archetype: 'foundation', pageName: 'Architecture', pageTitle: 'Architecture' });
  const r1 = await provider.complete(req);
  const r2 = await provider.complete(req);
  assert.equal(r1.content, r2.content);
});

// ── LLMProviderError ───────────────────────────────────────────────────────

test('LLMProviderError has correct name, message, provider, and code', () => {
  const err = new LLMProviderError('bad key', 'openai', 'MISSING_API_KEY');
  assert.equal(err.name, 'LLMProviderError');
  assert.equal(err.message, 'bad key');
  assert.equal(err.provider, 'openai');
  assert.equal(err.code, 'MISSING_API_KEY');
  assert.equal(err.retryable, false);
  assert.ok(err instanceof Error);
});

test('LLMProviderError retryable defaults to false', () => {
  const err = new LLMProviderError('timeout', 'mock');
  assert.equal(err.retryable, false);
});

test('LLMProviderError retryable can be set to true', () => {
  const err = new LLMProviderError('timeout', 'openai', 'RATE_LIMIT', true);
  assert.equal(err.retryable, true);
});

// ── createProvider ─────────────────────────────────────────────────────────

test('createProvider with no config returns MockLLMProvider', () => {
  const provider = createProvider();
  assert.equal(provider.name, 'mock');
  assert.ok(provider instanceof MockLLMProvider);
});

test('createProvider with provider="mock" returns MockLLMProvider', () => {
  const provider = createProvider({ provider: 'mock' });
  assert.equal(provider.name, 'mock');
  assert.ok(provider instanceof MockLLMProvider);
});

test('createProvider with unknown provider and no apiKey throws MISSING_API_KEY', () => {
  const config: LLMProviderConfig = { provider: 'openai' };
  assert.throws(
    () => createProvider(config),
    (err: unknown) => {
      assert.ok(err instanceof LLMProviderError);
      assert.equal(err.code, 'MISSING_API_KEY');
      assert.equal(err.provider, 'openai');
      return true;
    },
  );
});

test('createProvider with openai-compatible and apiKey returns hosted provider', () => {
  const provider = createProvider({ provider: 'openai-compatible', apiKey: 'key-123' });
  assert.equal(provider.name, 'openai-compatible');
  assert.ok(provider instanceof OpenAICompatibleProvider);
});

test('createProvider accepts openai alias for OpenAI-compatible provider', () => {
  const provider = createProvider({ provider: 'openai', apiKey: 'key-123' });
  assert.equal(provider.name, 'openai-compatible');
});

test('createProvider with unknown provider and apiKey throws UNKNOWN_PROVIDER', () => {
  const config: LLMProviderConfig = { provider: 'unknown-llm', apiKey: 'key-123' };
  assert.throws(
    () => createProvider(config),
    (err: unknown) => {
      assert.ok(err instanceof LLMProviderError);
      assert.equal(err.code, 'UNKNOWN_PROVIDER');
      assert.equal(err.provider, 'unknown-llm');
      return true;
    },
  );
});

test('resolveProviderConfig applies CI environment overrides without exposing api key', () => {
  const resolved = resolveProviderConfig(
    {
      provider: 'mock',
      base_url: 'https://config.example/v1',
      model: 'config-model',
      api_key_env: 'CONFIG_KEY',
      system_prompt: 'config prompt',
      temperature: 0.2,
      max_output_tokens: 1000,
      timeout_ms: 10000,
      retries: 1,
    },
    {
      LLMWIKI_COMPILER_MODE: 'llm',
      LLMWIKI_LLM_BASE_URL: 'https://env.example/v1',
      LLMWIKI_LLM_MODEL: 'env-model',
      LLMWIKI_LLM_API_KEY: 'secret-key',
      LLMWIKI_LLM_SYSTEM_PROMPT: 'env prompt',
      LLMWIKI_LLM_TEMPERATURE: '0.3',
      LLMWIKI_LLM_MAX_OUTPUT_TOKENS: '2000',
    },
  );

  assert.equal(resolved.provider, 'openai-compatible');
  assert.equal(resolved.baseUrl, 'https://env.example/v1');
  assert.equal(resolved.model, 'env-model');
  assert.equal(resolved.apiKey, 'secret-key');
  assert.equal(resolved.apiKeyEnv, 'LLMWIKI_LLM_API_KEY');
  assert.equal(resolved.systemPrompt, 'env prompt');
  assert.equal(resolved.temperature, 0.3);
  assert.equal(resolved.maxOutputTokens, 2000);
  assert.equal(resolved.timeoutMs, 10000);
  assert.equal(resolved.retries, 1);
});

test('OpenAICompatibleProvider posts chat-completions request', async () => {
  const originalFetch = globalThis.fetch;
  let captured: { url?: string; body?: any; authorization?: string } = {};
  globalThis.fetch = (async (url: string, init: any) => {
    captured = {
      url,
      body: JSON.parse(String(init.body)),
      authorization: init.headers.authorization,
    };
    return new Response(JSON.stringify({
      choices: [{ message: { content: '# Generated' } }],
      usage: { prompt_tokens: 10, completion_tokens: 2 },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;

  try {
    const provider = createProvider({ provider: 'openai-compatible', apiKey: 'key-123', model: 'test-model', baseUrl: 'https://llm.example/v1' });
    const response = await provider.complete(makeRequest({ maxTokens: 123, temperature: 0.4 }));
    assert.equal(captured.url, 'https://llm.example/v1/chat/completions');
    assert.equal(captured.authorization, 'Bearer key-123');
    assert.equal(captured.body.model, 'test-model');
    assert.equal(captured.body.max_tokens, 123);
    assert.equal(captured.body.temperature, 0.4);
    assert.equal(response.content, '# Generated');
    assert.equal(response.promptTokens, 10);
    assert.equal(response.completionTokens, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

// ── buildRequest ───────────────────────────────────────────────────────────

test('buildRequest sets archetype, pageName, pageTitle on the request', () => {
  const ctx = makeContext();
  const req = buildRequest('module', ctx);
  assert.equal(req.archetype, 'module');
  assert.equal(req.pageName, 'Module-Auth');
  assert.equal(req.pageTitle, 'Auth');
});

test('buildRequest populates systemPrompt and userPrompt', () => {
  const ctx = makeContext();
  const req = buildRequest('module', ctx);
  assert.ok(req.systemPrompt.length > 0);
  assert.ok(req.userPrompt.length > 0);
});

test('buildRequest passes maxTokens through', () => {
  const ctx = makeContext();
  const req = buildRequest('foundation', ctx, 4096);
  assert.equal(req.maxTokens, 4096);
});

test('buildRequest user prompt includes source card paths', () => {
  const ctx = makeContext();
  const req = buildRequest('module', ctx);
  assert.match(req.userPrompt, /src\/auth\/index\.ts/);
});

// ── Prompt templates ───────────────────────────────────────────────────────

test('buildPrompt foundation returns system + user prompts', () => {
  const ctx = makeContext({ pageName: 'Architecture', pageTitle: 'Architecture' });
  const prompt = buildPrompt('foundation', ctx);
  assert.ok(prompt.system.length > 0);
  assert.ok(prompt.user.length > 0);
  assert.match(prompt.system, /authoritative/);
  assert.match(prompt.user, /Architecture/);
});

test('buildPrompt module includes module name and source files', () => {
  const ctx = makeContext({
    moduleInfo: {
      name: 'Auth',
      slug: 'Module-Auth',
      files: ['src/auth/index.ts', 'src/auth/tokens.ts'],
      categories: { source: 2 },
      languages: { TypeScript: 2 },
      important_reasons: ['auth'],
    },
  });
  const prompt = buildPrompt('module', ctx);
  assert.match(prompt.user, /Auth/);
  assert.match(prompt.user, /src\/auth\/index\.ts/);
  assert.match(prompt.user, /HUMAN_NOTES/);
});

test('buildPrompt cross-cutting references the page title', () => {
  const ctx = makeContext({ pageName: 'Dependency-Map', pageTitle: 'Dependency Map' });
  const prompt = buildPrompt('cross-cutting', ctx);
  assert.match(prompt.user, /Dependency Map/);
});

test('buildPrompt includes existing content when provided', () => {
  const ctx = makeContext({ existingContent: '# Old content\n\nSome previous text.' });
  const prompt = buildPrompt('module', ctx);
  assert.match(prompt.user, /Old content/);
});

test('buildPrompt indicates bootstrap mode when no existing content', () => {
  const ctx = makeContext({ existingContent: undefined });
  const prompt = buildPrompt('foundation', ctx);
  assert.match(prompt.user, /bootstrap mode/i);
});

test('buildPrompt system prompt includes authority and output contract', () => {
  const ctx = makeContext();
  const prompt = buildPrompt('module', ctx);
  assert.match(prompt.system, /authoritative/);
  assert.match(prompt.system, /HUMAN_NOTES_START/);
  assert.match(prompt.system, /frontmatter/);
});

test('buildFoundationPrompt includes repoRemote and repoCommit', () => {
  const ctx = makeContext({ repoRemote: 'https://github.com/test/repo', repoCommit: 'deadbeef' });
  const prompt = buildFoundationPrompt(ctx);
  assert.match(prompt.user, /https:\/\/github\.com\/test\/repo/);
  assert.match(prompt.user, /deadbeef/);
});

test('buildModulePrompt shows file count when moduleInfo is set', () => {
  const ctx = makeContext({
    moduleInfo: {
      name: 'Payments',
      slug: 'Module-Payments',
      files: ['src/pay/charge.ts', 'src/pay/refund.ts'],
      categories: { source: 2 },
      languages: { TypeScript: 2 },
      important_reasons: ['billing-or-payment'],
    },
  });
  const prompt = buildModulePrompt(ctx);
  assert.match(prompt.user, /Files: 2/);
});

test('buildCrossCuttingPrompt includes source card count', () => {
  const ctx = makeContext({ pageName: 'Security-and-Secrets', pageTitle: 'Security and Secrets' });
  const prompt = buildCrossCuttingPrompt(ctx);
  assert.match(prompt.user, /Source cards \(1 files\)/);
});

test('buildPrompt doc cards are included in user prompt', () => {
  const ctx = makeContext({
    docCards: [{ path: 'docs/security.md', status: 'stale', claims: ['Uses bcrypt'] }],
  });
  const prompt = buildPrompt('cross-cutting', ctx);
  assert.match(prompt.user, /docs\/security\.md/);
  assert.match(prompt.user, /stale/);
});

// ── End-to-end pipeline: buildRequest + MockLLMProvider ───────────────────

test('pipeline: buildRequest + MockLLMProvider produces valid content', async () => {
  const provider = new MockLLMProvider();
  const ctx = makeContext();
  const req = buildRequest('module', ctx);
  const resp = await provider.complete(req);
  assert.equal(resp.provider, 'mock');
  assert.match(resp.content, /^---/);
  assert.match(resp.content, /# Auth/m);
  assert.match(resp.content, /HUMAN_NOTES_START/);
});
