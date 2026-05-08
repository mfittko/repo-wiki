/**
 * LLM provider boundary for wiki synthesis.
 *
 * Defines provider request/response interfaces, structured error handling,
 * a deterministic mock provider for tests and local CI, and a factory that
 * selects the correct provider from configuration.
 *
 * Usage (tests / CI without network):
 *   const provider = createProvider();                  // defaults to mock
 *   const provider = createProvider({ provider: 'mock' });
 *
 * Usage (OpenAI-compatible hosted provider):
 *   const provider = createProvider({ provider: 'openai-compatible', apiKey: '...', model: '...' });
 */

import { readFileSync } from 'node:fs';
import { type PageArchetype, type PromptContext, buildPrompt } from './prompts.js';

export const LLM_DEFAULTS = {
  provider: 'mock',
  hostedProvider: 'openai-compatible',
  model: 'gpt-4.1-mini',
  baseUrl: 'https://api.openai.com/v1',
  apiKeyEnv: 'LLMWIKI_LLM_API_KEY',
  systemPrompt: 'You compile source-grounded GitHub Wiki pages.',
  temperature: 0.1,
  maxOutputTokens: 4000,
  timeoutMs: 60000,
  retries: 2
} as const;

export type { PageArchetype };
export type { PromptContext };

// ── Request / response shapes ──────────────────────────────────────────────

/** Input sent to an LLM provider for a single wiki page synthesis. */
export interface LLMRequest {
  /** Page archetype that selected the prompt template. */
  archetype: PageArchetype;
  /** Wiki page slug/filename without .md (e.g. "Module-Auth"). */
  pageName: string;
  /** Human-readable page title (e.g. "Auth"). */
  pageTitle: string;
  /** System-level instructions (authority rules, output contract). */
  systemPrompt: string;
  /** Page-specific user prompt including source cards and context. */
  userPrompt: string;
  /** Optional token budget for the completion. */
  maxTokens?: number;
  /** Optional sampling temperature. */
  temperature?: number;
}

/** Output returned by an LLM provider after synthesis. */
export interface LLMResponse {
  /** Generated markdown page content. */
  content: string;
  /** Identifier of the provider that produced the response. */
  provider: string;
  /** Prompt tokens consumed (informational; may be undefined for mock). */
  promptTokens?: number;
  /** Completion tokens consumed (informational; may be undefined for mock). */
  completionTokens?: number;
}

// ── Provider interface ─────────────────────────────────────────────────────

/** Common interface every LLM backend must implement. */
export interface LLMProvider {
  /** Stable identifier for logging and frontmatter. */
  readonly name: string;
  /**
   * Synthesise wiki page content for the given request.
   * Throws `LLMProviderError` on unrecoverable failure.
   */
  complete(request: LLMRequest): Promise<LLMResponse>;
}

// ── Structured error ───────────────────────────────────────────────────────

/**
 * Thrown by providers and the factory for all LLM-related failures.
 *
 *   try { … } catch (err) {
 *     if (err instanceof LLMProviderError && err.retryable) { … }
 *   }
 */
export class LLMProviderError extends Error {
  /** Identifier of the provider that raised the error. */
  readonly provider: string;
  /** Machine-readable code (e.g. 'MISSING_API_KEY', 'RATE_LIMIT'). */
  readonly code: string | undefined;
  /** True when the call may be retried after a short back-off. */
  readonly retryable: boolean;

  constructor(message: string, provider: string, code?: string, retryable = false) {
    super(message);
    this.name = 'LLMProviderError';
    this.provider = provider;
    this.code = code;
    this.retryable = retryable;
  }
}

// ── Mock provider (deterministic, no network) ──────────────────────────────

/**
 * Deterministic provider for tests and local CI.
 * Returns a minimal, reproducible markdown page for any request without
 * making network calls or requiring API credentials.
 */
export class MockLLMProvider implements LLMProvider {
  readonly name = 'mock';

  async complete(request: LLMRequest): Promise<LLMResponse> {
    return { content: buildMockContent(request), provider: this.name };
  }
}

/** OpenAI-compatible chat-completions provider. */
type OpenAIChatMessage = { role: 'system' | 'user'; content: string };

type OpenAIChatRequest = {
  model: string;
  messages: OpenAIChatMessage[];
  max_tokens?: number;
  temperature?: number;
};

type OpenAIChatResponse = {
  choices: Array<{ message?: { content?: unknown } }>;
  usage?: { prompt_tokens?: unknown; completion_tokens?: unknown };
};

export class OpenAICompatibleProvider implements LLMProvider {
  readonly name = 'openai-compatible';
  readonly baseUrl: string;
  readonly model: string;
  readonly timeoutMs: number;
  readonly retries: number;
  private readonly apiKey: string;

  constructor(config: Required<Pick<LLMProviderConfig, 'apiKey' | 'model' | 'baseUrl' | 'timeoutMs' | 'retries'>>) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.timeoutMs = config.timeoutMs;
    this.retries = config.retries;
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const body: OpenAIChatRequest = {
      model: this.model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt }
      ],
      ...(request.maxTokens !== undefined ? { max_tokens: request.maxTokens } : {}),
      ...(request.temperature !== undefined ? { temperature: request.temperature } : {})
    };

    const payload = assertOpenAIChatResponse(await this.postWithRetries(body), this.name);
    const content = payload.choices[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new LLMProviderError('OpenAI-compatible provider returned an empty completion.', this.name, 'EMPTY_RESPONSE');
    }

    return {
      content,
      provider: this.name,
      promptTokens: numberOrUndefined(payload?.usage?.prompt_tokens),
      completionTokens: numberOrUndefined(payload?.usage?.completion_tokens)
    };
  }

  private async postWithRetries(body: OpenAIChatRequest): Promise<unknown> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.retries; attempt += 1) {
      try {
        return await this.post(body);
      } catch (error) {
        lastError = error;
        if (!(error instanceof LLMProviderError) || !error.retryable || attempt === this.retries) {
          throw error;
        }
        await sleep(Math.min(1000 * 2 ** attempt, 8000));
      }
    }
    throw lastError;
  }

  private async post(body: OpenAIChatRequest): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      const text = await response.text();
      let json: any = null;
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          throw new LLMProviderError('OpenAI-compatible provider returned non-JSON response.', this.name, 'INVALID_JSON', response.status >= 500);
        }
      }

      if (!response.ok) {
        const retryable = response.status === 408 || response.status === 409 || response.status === 429 || response.status >= 500;
        throw new LLMProviderError(
          `OpenAI-compatible provider request failed with HTTP ${response.status}.`,
          this.name,
          `HTTP_${response.status}`,
          retryable
        );
      }

      return json;
    } catch (error) {
      if (error instanceof LLMProviderError) throw error;
      const retryable = error instanceof Error && error.name === 'AbortError';
      throw new LLMProviderError(
        retryable ? 'OpenAI-compatible provider request timed out.' : 'OpenAI-compatible provider request failed.',
        this.name,
        retryable ? 'TIMEOUT' : 'REQUEST_FAILED',
        retryable
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

function buildMockContent(request: LLMRequest): string {
  const lines: string[] = [
    '---',
    `kind: ${JSON.stringify(request.archetype)}`,
    `page_name: ${JSON.stringify(request.pageName)}`,
    `compiled_at: "mock"`,
    `source_commit: "mock"`,
    `source_paths: []`,
    '---',
    '',
    `# ${request.pageTitle}`,
    '',
    '> Generated by the mock LLM provider (deterministic, no network).',
    '',
    `**Archetype:** ${request.archetype}`,
    '',
  ];

  if (request.archetype === 'module') {
    lines.push('<!-- HUMAN_NOTES_START -->');
    lines.push('<!-- HUMAN_NOTES_END -->');
    lines.push('');
  }

  return lines.join('\n');
}

// ── Provider configuration ─────────────────────────────────────────────────

/** Configuration passed to `createProvider`. */
export interface LLMProviderConfig {
  /**
   * Provider identifier.
   * Defaults to `"mock"` so that tests and non-LLM runs work without any
   * further configuration.
   */
  provider?: string;
  /** API key required by hosted providers. Not used by the mock provider. */
  apiKey?: string;
  /** Environment variable that contains the hosted provider API key. */
  apiKeyEnv?: string;
  /** JSON config alias for `apiKeyEnv`. */
  api_key_env?: string;
  /** Model identifier passed to hosted providers. */
  model?: string;
  /** Optional base URL override for self-hosted or proxy endpoints. */
  baseUrl?: string;
  /** JSON config alias for `baseUrl`. */
  base_url?: string;
  /** Optional system prompt override. */
  systemPrompt?: string;
  /** JSON config alias for `systemPrompt`. */
  system_prompt?: string;
  /** Optional file containing a system prompt override. */
  systemPromptFile?: string;
  /** JSON config alias for `systemPromptFile`. */
  system_prompt_file?: string;
  /** Optional sampling temperature. */
  temperature?: number;
  /** Optional output-token budget. */
  maxOutputTokens?: number;
  /** JSON config alias for `maxOutputTokens`. */
  max_output_tokens?: number;
  /** Hosted provider request timeout in milliseconds. */
  timeoutMs?: number;
  /** JSON config alias for `timeoutMs`. */
  timeout_ms?: number;
  /** Number of retries for retryable hosted provider failures. */
  retries?: number;
  /** Compiler mode alias used when callers pass the whole compiler config. */
  mode?: string;
  /** Nested LLM settings used when callers pass the whole compiler config. */
  llm?: LLMProviderConfig;
}

export interface ResolvedLLMProviderConfig extends LLMProviderConfig {
  provider: string;
  model: string;
  baseUrl: string;
  apiKeyEnv: string;
  systemPrompt: string;
  temperature: number;
  maxOutputTokens: number;
  timeoutMs: number;
  retries: number;
}

// ── Factory ────────────────────────────────────────────────────────────────

/**
 * Create an `LLMProvider` from configuration resolved with environment overrides.
 *
 * - Omitting `config` (or setting `provider: "mock"`) returns the mock provider unless
 *   `LLMWIKI_LLM_PROVIDER` or `LLMWIKI_COMPILER_MODE` selects a hosted provider.
 * - Specifying an OpenAI-compatible provider without an API key throws
 *   `LLMProviderError` with `code: "MISSING_API_KEY"`.
 * - Specifying an unknown provider name throws
 *   `LLMProviderError` with `code: "UNKNOWN_PROVIDER"`.
 *
 * This makes missing configuration fail loudly rather than silently falling
 * back to an unexpected behaviour.
 */
export function createProvider(config: LLMProviderConfig = {}): LLMProvider {
  const resolved = resolveProviderConfig(config);
  const providerName = resolved.provider;

  if (providerName === 'mock') {
    return new MockLLMProvider();
  }

  if (providerName === 'openai-compatible' || providerName === 'openai') {
    if (!resolved.apiKey) {
      throw new LLMProviderError(
        `Provider "${providerName}" requires an API key. ` +
          `Set ${resolved.apiKeyEnv}, pass apiKey, or use provider="mock" for tests and CI.`,
        providerName,
        'MISSING_API_KEY',
      );
    }
    return new OpenAICompatibleProvider({
      apiKey: resolved.apiKey,
      model: resolved.model,
      baseUrl: resolved.baseUrl,
      timeoutMs: resolved.timeoutMs,
      retries: resolved.retries
    });
  }

  throw new LLMProviderError(
    `Unknown provider: "${providerName}". Supported providers: mock, openai-compatible.`,
    providerName,
    'UNKNOWN_PROVIDER',
  );
}

/** Resolve provider configuration from defaults, explicit config, and env vars. */
export function resolveProviderConfig(
  config: LLMProviderConfig = {},
  env: NodeJS.ProcessEnv = process.env,
): ResolvedLLMProviderConfig {
  const llmConfig = config.llm ? { ...config.llm, mode: config.mode } : config;
  const envApiKey = optionalEnv(env, 'LLMWIKI_LLM_API_KEY');
  const apiKeyEnv = envApiKey !== undefined ? 'LLMWIKI_LLM_API_KEY' : (nonBlank(llmConfig.apiKeyEnv) ?? nonBlank(llmConfig.api_key_env) ?? LLM_DEFAULTS.apiKeyEnv);
  const systemPromptFile = optionalEnv(env, 'LLMWIKI_LLM_SYSTEM_PROMPT_FILE') ?? nonBlank(llmConfig.systemPromptFile) ?? nonBlank(llmConfig.system_prompt_file);
  const systemPrompt = optionalEnv(env, 'LLMWIKI_LLM_SYSTEM_PROMPT') ?? readPromptFileIfSet(systemPromptFile) ?? nonBlank(llmConfig.systemPrompt) ?? nonBlank(llmConfig.system_prompt) ?? LLM_DEFAULTS.systemPrompt;
  const mode = optionalEnv(env, 'LLMWIKI_COMPILER_MODE') ?? nonBlank(llmConfig.mode);

  return {
    ...llmConfig,
    provider: optionalEnv(env, 'LLMWIKI_LLM_PROVIDER') ?? providerForMode(mode) ?? nonBlank(llmConfig.provider) ?? LLM_DEFAULTS.provider,
    apiKey: optionalEnv(env, apiKeyEnv) ?? nonBlank(llmConfig.apiKey),
    apiKeyEnv,
    model: optionalEnv(env, 'LLMWIKI_LLM_MODEL') ?? nonBlank(llmConfig.model) ?? LLM_DEFAULTS.model,
    baseUrl: optionalEnv(env, 'LLMWIKI_LLM_BASE_URL') ?? nonBlank(llmConfig.baseUrl) ?? nonBlank(llmConfig.base_url) ?? LLM_DEFAULTS.baseUrl,
    systemPrompt,
    systemPromptFile,
    temperature: parseNumber(optionalEnv(env, 'LLMWIKI_LLM_TEMPERATURE'), llmConfig.temperature ?? LLM_DEFAULTS.temperature, 'temperature'),
    maxOutputTokens: parseNonNegativeInteger(optionalEnv(env, 'LLMWIKI_LLM_MAX_OUTPUT_TOKENS'), llmConfig.maxOutputTokens ?? llmConfig.max_output_tokens ?? LLM_DEFAULTS.maxOutputTokens, 'maxOutputTokens'),
    timeoutMs: parseNonNegativeInteger(optionalEnv(env, 'LLMWIKI_LLM_TIMEOUT_MS'), llmConfig.timeoutMs ?? llmConfig.timeout_ms ?? LLM_DEFAULTS.timeoutMs, 'timeoutMs'),
    retries: parseNonNegativeInteger(optionalEnv(env, 'LLMWIKI_LLM_RETRIES'), llmConfig.retries ?? LLM_DEFAULTS.retries, 'retries')
  };
}

// ── Convenience builder ────────────────────────────────────────────────────

export interface BuildRequestOptions extends Pick<LLMProviderConfig, 'systemPrompt' | 'temperature' | 'maxOutputTokens'> {
  /** Optional completion-token budget for the provider. */
  maxTokens?: number;
}

/**
 * Assemble an `LLMRequest` from a `PromptContext` using the standard prompt
 * templates.  Callers can then pass the result directly to
 * `provider.complete(request)`.
 *
 * @param archetype - Page archetype that selects the prompt template.
 * @param context   - Assembled page context (source cards, doc cards, etc.).
 * @param options   - Optional request-level prompt and generation settings.
 */
export function buildRequest(
  archetype: PageArchetype,
  context: PromptContext,
  options?: BuildRequestOptions,
): LLMRequest;
export function buildRequest(
  archetype: PageArchetype,
  context: PromptContext,
  maxTokens?: number,
  config?: Pick<LLMProviderConfig, 'systemPrompt' | 'temperature' | 'maxOutputTokens'>,
): LLMRequest;
export function buildRequest(
  archetype: PageArchetype,
  context: PromptContext,
  maxTokensOrOptions?: number | BuildRequestOptions | null,
  config: Pick<LLMProviderConfig, 'systemPrompt' | 'temperature' | 'maxOutputTokens'> = {},
): LLMRequest {
  const prompt = buildPrompt(archetype, context);
  const options: BuildRequestOptions = maxTokensOrOptions !== null && typeof maxTokensOrOptions === 'object'
    ? maxTokensOrOptions
    : { ...config, maxTokens: typeof maxTokensOrOptions === 'number' ? maxTokensOrOptions : undefined };
  return {
    archetype,
    pageName: context.pageName,
    pageTitle: context.pageTitle,
    systemPrompt: options.systemPrompt ?? prompt.system,
    userPrompt: prompt.user,
    maxTokens: options.maxTokens ?? options.maxOutputTokens,
    temperature: options.temperature,
  };
}

function providerForMode(mode?: string): string | undefined {
  if (mode === 'llm') return LLM_DEFAULTS.hostedProvider;
  if (mode === 'deterministic') return LLM_DEFAULTS.provider;
  return undefined;
}

function parseNumber(value: string | undefined, fallback: number, field: string): number {
  const candidate = value === undefined ? fallback : Number(value);
  if (!Number.isFinite(candidate)) {
    throw new LLMProviderError(`Invalid numeric LLM config for ${field}.`, 'config', 'INVALID_CONFIG');
  }
  return candidate;
}

function parseNonNegativeInteger(value: string | undefined, fallback: number, field: string): number {
  const candidate = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(candidate) || candidate < 0) {
    throw new LLMProviderError(`Invalid non-negative integer LLM config for ${field}.`, 'config', 'INVALID_CONFIG');
  }
  return candidate;
}

function optionalEnv(env: NodeJS.ProcessEnv, key: string): string | undefined {
  return nonBlank(env[key]);
}

function nonBlank(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readPromptFileIfSet(filePath?: string): string | undefined {
  if (!filePath) return undefined;
  try {
    return readFileSync(filePath, 'utf8');
  } catch {
    return undefined;
  }
}

function assertOpenAIChatResponse(value: unknown, provider: string): OpenAIChatResponse {
  if (!value || typeof value !== 'object') {
    throw new LLMProviderError('OpenAI-compatible provider returned an invalid response object.', provider, 'INVALID_RESPONSE');
  }
  const response = value as { choices?: unknown };
  if (!Array.isArray(response.choices) || response.choices.length === 0) {
    throw new LLMProviderError('OpenAI-compatible provider returned no choices.', provider, 'MISSING_CHOICES');
  }
  return value as OpenAIChatResponse;
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
