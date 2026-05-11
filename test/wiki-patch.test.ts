import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WikiPatchError,
  validateWikiPatch,
  parseWikiPatch,
  synthesizeWikiPage,
} from '../src/wiki-patch.js';
import type { WikiPatchIssue, WikiPatch } from '../src/wiki-patch.js';
import type { LLMProvider, LLMRequest, LLMResponse } from '../src/llm-provider.js';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Minimal valid patch that passes all error-level gates. */
function validPatch(overrides: {
  source_commit?: string;
  kind?: string;
  compiled_at?: string;
  source_paths?: string;
  body?: string;
} = {}): string {
  const fm = [
    '---',
    `source_commit: ${JSON.stringify(overrides.source_commit ?? 'abc123')}`,
    `kind: ${JSON.stringify(overrides.kind ?? 'module')}`,
    `compiled_at: ${JSON.stringify(overrides.compiled_at ?? '2026-01-01T00:00:00.000Z')}`,
    `source_paths: ${overrides.source_paths ?? '["src/example.ts"]'}`,
    '---',
  ].join('\n');
  const body = overrides.body ?? '\n# Example\n\nSome content.\n';
  return `${fm}\n${body}`;
}

/** Mock provider that returns fixed content. */
function fixedProvider(content: string): LLMProvider {
  return {
    name: 'fixed-mock',
    async complete(_request: LLMRequest): Promise<LLMResponse> {
      return { content, provider: 'fixed-mock' };
    },
  };
}

/** Mock provider that returns a sequence of responses in order. */
function sequenceProvider(responses: string[]): LLMProvider {
  let index = 0;
  return {
    name: 'sequence-mock',
    async complete(_request: LLMRequest): Promise<LLMResponse> {
      const content = responses[Math.min(index, responses.length - 1)];
      index++;
      return { content, provider: 'sequence-mock' };
    },
  };
}

function makeRequest(overrides: Partial<LLMRequest> = {}): LLMRequest {
  return {
    archetype: 'module',
    pageName: 'Module-Auth',
    pageTitle: 'Auth',
    systemPrompt: 'System.',
    userPrompt: 'User.',
    ...overrides,
  };
}

function codes(issues: WikiPatchIssue[]): string[] {
  return issues.map((i) => i.code);
}

// ── validateWikiPatch ──────────────────────────────────────────────────────

test('validateWikiPatch returns no issues for a valid patch', () => {
  const issues = validateWikiPatch(validPatch(), 'Module-Auth');
  assert.deepEqual(issues, []);
});

test('validateWikiPatch strips only a surrounding markdown fence when inner content starts with frontmatter', () => {
  const issues = validateWikiPatch(`\`\`\`markdown\n${validPatch()}\n\`\`\``, 'Module-Auth');
  assert.deepEqual(issues, []);
});

test('validateWikiPatch strips surrounding markdown fence without a final inner newline', () => {
  const issues = validateWikiPatch(`\`\`\`markdown\n${validPatch().trimEnd()}\`\`\``, 'Module-Auth');
  assert.deepEqual(issues, []);
});

test('validateWikiPatch still rejects fenced content when inner content lacks frontmatter', () => {
  const issues = validateWikiPatch('```markdown\n# No frontmatter\n```', 'Module-Auth');
  assert.ok(codes(issues).includes('missing-frontmatter'));
});

test('validateWikiPatch returns error for empty content', () => {
  const issues = validateWikiPatch('', 'Module-Auth');
  assert.ok(codes(issues).includes('empty-content'), 'should report empty-content');
  assert.ok(
    issues.find((i) => i.code === 'empty-content')?.level === 'error',
    'empty-content should be error level',
  );
});

test('validateWikiPatch returns error for whitespace-only content', () => {
  const issues = validateWikiPatch('   \n   ', 'Module-Auth');
  assert.ok(codes(issues).includes('empty-content'));
});

test('validateWikiPatch returns error when frontmatter is missing', () => {
  const issues = validateWikiPatch('# Just a heading\n\nNo frontmatter.', 'Module-Auth');
  assert.ok(codes(issues).includes('missing-frontmatter'));
  assert.equal(issues.find((i) => i.code === 'missing-frontmatter')?.level, 'error');
});

test('validateWikiPatch returns error for unclosed frontmatter', () => {
  const content = '---\nsource_commit: "abc"\nkind: "module"\n# no closing ---';
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('missing-frontmatter'));
});

test('validateWikiPatch rejects malformed closing frontmatter delimiter', () => {
  const content = '---\nsource_commit: "abc"\nkind: "module"\n---not-a-delimiter\n# Body\n';
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('missing-frontmatter'));
});

test('validateWikiPatch returns error when source_commit is missing', () => {
  const content = '---\nkind: "module"\ncompiled_at: "2026-01-01T00:00:00.000Z"\nsource_paths: []\n---\n\n# Body\n';
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('missing-source-commit'));
  assert.equal(issues.find((i) => i.code === 'missing-source-commit')?.level, 'error');
});

test('validateWikiPatch returns error when source_commit is blank', () => {
  const content = '---\nsource_commit: ""\nkind: "module"\ncompiled_at: "2026-01-01T00:00:00.000Z"\nsource_paths: []\n---\n\n# Body\n';
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('missing-source-commit'));
});

test('validateWikiPatch rejects non-string YAML source_commit scalars', () => {
  for (const value of ['123', 'true', 'null']) {
    const content = `---\nsource_commit: ${value}\nkind: "module"\ncompiled_at: "2026-01-01T00:00:00.000Z"\nsource_paths: []\n---\n\n# Body\n`;
    const issues = validateWikiPatch(content, 'Module-Auth');
    assert.ok(codes(issues).includes('missing-source-commit'), `should reject source_commit: ${value}`);
  }
});

test('validateWikiPatch returns error when kind is missing', () => {
  const content = '---\nsource_commit: "abc123"\ncompiled_at: "2026-01-01T00:00:00.000Z"\nsource_paths: []\n---\n\n# Body\n';
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('missing-kind'));
  assert.equal(issues.find((i) => i.code === 'missing-kind')?.level, 'error');
});

test('validateWikiPatch rejects non-string YAML kind scalars', () => {
  for (const value of ['123', 'true', 'null']) {
    const content = `---\nsource_commit: "abc123"\nkind: ${value}\ncompiled_at: "2026-01-01T00:00:00.000Z"\nsource_paths: []\n---\n\n# Body\n`;
    const issues = validateWikiPatch(content, 'Module-Auth');
    assert.ok(codes(issues).includes('missing-kind'), `should reject kind: ${value}`);
  }
});

test('validateWikiPatch returns error when compiled_at is missing', () => {
  const content = '---\nsource_commit: "abc123"\nkind: "module"\nsource_paths: []\n---\n\n# Body\n';
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('missing-compiled-at'));
  assert.equal(issues.find((i) => i.code === 'missing-compiled-at')?.level, 'error');
});

test('validateWikiPatch returns error when compiled_at is blank', () => {
  const content = '---\nsource_commit: "abc123"\nkind: "module"\ncompiled_at: ""\nsource_paths: []\n---\n\n# Body\n';
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('missing-compiled-at'));
});

test('validateWikiPatch rejects non-string YAML compiled_at scalars', () => {
  for (const value of ['123', 'true', 'null']) {
    const content = `---\nsource_commit: "abc123"\nkind: "module"\ncompiled_at: ${value}\nsource_paths: []\n---\n\n# Body\n`;
    const issues = validateWikiPatch(content, 'Module-Auth');
    assert.ok(codes(issues).includes('missing-compiled-at'), `should reject compiled_at: ${value}`);
  }
});

test('validateWikiPatch returns error when body is empty after frontmatter', () => {
  const content = '---\nsource_commit: "abc123"\nkind: "module"\nsource_paths: []\n---\n';
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('empty-body'));
  assert.equal(issues.find((i) => i.code === 'empty-body')?.level, 'error');
});

test('validateWikiPatch returns error when body is whitespace-only', () => {
  const content = '---\nsource_commit: "abc123"\nkind: "module"\nsource_paths: []\n---\n   \n';
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('empty-body'));
});

test('validateWikiPatch returns warning when source_paths is missing', () => {
  const content = '---\nsource_commit: "abc123"\nkind: "module"\n---\n\n# Body\n';
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('missing-source-paths'));
  assert.equal(issues.find((i) => i.code === 'missing-source-paths')?.level, 'warning');
});

test('validateWikiPatch accepts empty source_paths array', () => {
  const content = '---\nsource_commit: "abc123"\nkind: "module"\nsource_paths: []\n---\n\n# Body\n';
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(!codes(issues).includes('missing-source-paths'), 'empty array is acceptable');
  assert.ok(!codes(issues).includes('empty-content'));
  assert.ok(!codes(issues).includes('missing-source-commit'));
});

test('validateWikiPatch returns error when source_paths is present but not an array', () => {
  const content = validPatch({ source_paths: '"src/a.ts"' });
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('invalid-source-paths'));
  assert.equal(issues.find((i) => i.code === 'invalid-source-paths')?.level, 'error');
  assert.ok(!codes(issues).includes('missing-source-paths'));
});

test('validateWikiPatch returns error when source_paths contains non-strings', () => {
  const content = '---\nsource_commit: "abc123"\nkind: "module"\nsource_paths: ["src/a.ts", 123, true]\n---\n\n# Body\n';
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('invalid-source-paths'));
  assert.equal(issues.find((i) => i.code === 'invalid-source-paths')?.level, 'error');
});

test('validateWikiPatch returns error when source_paths contains blank strings', () => {
  const content = '---\nsource_commit: "abc123"\nkind: "module"\nsource_paths: ["src/a.ts", "   "]\n---\n\n# Body\n';
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('invalid-source-paths'));
});

test('validateWikiPatch returns error for AWS access key pattern', () => {
  const content = validPatch({ body: '\n# Body\n\nAKIAIOSFODNN7EXAMPLE\n' });
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('secret-like-content'));
  assert.equal(issues.find((i) => i.code === 'secret-like-content')?.level, 'error');
});

test('validateWikiPatch returns error for GitHub token pattern', () => {
  const syntheticToken = 'ghp_' + 'aAbBcCdDeEfFgGhHiIjJkKlLmMnNoO';
  const content = validPatch({ body: `\n# Body\n\n${syntheticToken}\n` });
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('secret-like-content'));
});

test('validateWikiPatch returns error for bearer token pattern', () => {
  const content = validPatch({ body: '\n# Body\n\nAuthorization: Bearer mysecrettoken123\n' });
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('secret-like-content'));
});

test('validateWikiPatch returns error for key=value credential pattern', () => {
  const content = validPatch({ body: '\n# Body\n\napi_key=super-secret-value-here\n' });
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.ok(codes(issues).includes('secret-like-content'));
});

test('validateWikiPatch includes pageName in issue messages', () => {
  const issues = validateWikiPatch('', 'My-Special-Page');
  assert.ok(issues.every((i) => i.message.includes('My-Special-Page')));
});

test('validateWikiPatch handles bare (non-JSON-quoted) scalar values', () => {
  const content = '---\nsource_commit: abc123\nkind: module\ncompiled_at: 2026-01-01T00:00:00.000Z\nsource_paths: []\n---\n\n# Body\n';
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.deepEqual(issues, []);
});

test('validateWikiPatch handles YAML block sequences for source_paths', () => {
  const content = [
    '---',
    'source_commit: "abc123"',
    'kind: "module"',
    'compiled_at: "2026-01-01T00:00:00.000Z"',
    'source_paths:',
    '  - "src/a.ts"',
    '  - "src/b.ts"',
    '---',
    '',
    '# Body',
    '',
    'Some content.',
    '',
  ].join('\n');
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.deepEqual(issues, []);
});

test('validateWikiPatch rejects non-string YAML block sequence source_paths entries', () => {
  for (const value of ['123', 'true', 'null']) {
    const content = [
      '---',
      'source_commit: "abc123"',
      'kind: "module"',
      'source_paths:',
      '  - "src/a.ts"',
      `  - ${value}`,
      '---',
      '',
      '# Body',
      '',
    ].join('\n');
    const issues = validateWikiPatch(content, 'Module-Auth');
    assert.ok(codes(issues).includes('invalid-source-paths'), `should reject source_paths entry: ${value}`);
  }
});

test('validateWikiPatch handles BOM-prefixed content', () => {
  const content = '\uFEFF' + validPatch();
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.deepEqual(issues, []);
});

test('validateWikiPatch handles CRLF line endings', () => {
  const content = validPatch().replace(/\n/g, '\r\n');
  const issues = validateWikiPatch(content, 'Module-Auth');
  assert.deepEqual(issues, []);
});

// ── parseWikiPatch ─────────────────────────────────────────────────────────

test('parseWikiPatch returns a WikiPatch for valid content', () => {
  const content = validPatch();
  const patch = parseWikiPatch(content, 'Module-Auth');

  assert.equal(patch.pageName, 'Module-Auth');
  assert.equal(patch.frontmatter.source_commit, 'abc123');
  assert.equal(patch.frontmatter.kind, 'module');
  assert.deepEqual(patch.frontmatter.source_paths, ['src/example.ts']);
  assert.ok(patch.body.trim().length > 0, 'body must be non-empty');
  assert.ok(patch.content.startsWith('---'), 'content should include frontmatter');
});

test('parseWikiPatch throws WikiPatchError for invalid content', () => {
  assert.throws(
    () => parseWikiPatch('# No frontmatter', 'Module-Auth'),
    WikiPatchError,
  );
});

test('parseWikiPatch error contains all issues', () => {
  // Missing both source_commit and kind
  const content = '---\nsource_paths: []\n---\n\n# Body\n';
  try {
    parseWikiPatch(content, 'Module-Auth');
    assert.fail('expected WikiPatchError to be thrown');
  } catch (err) {
    assert.ok(err instanceof WikiPatchError);
    const issueCodes = codes(err.issues);
    assert.ok(issueCodes.includes('missing-source-commit'));
    assert.ok(issueCodes.includes('missing-kind'));
  }
});

test('parseWikiPatch error exposes pageName', () => {
  try {
    parseWikiPatch('', 'Specific-Page');
    assert.fail('expected WikiPatchError to be thrown');
  } catch (err) {
    assert.ok(err instanceof WikiPatchError);
    assert.equal(err.pageName, 'Specific-Page');
  }
});

test('parseWikiPatch error message includes error count', () => {
  try {
    parseWikiPatch('', 'Module-Auth');
    assert.fail('expected WikiPatchError');
  } catch (err) {
    assert.ok(err instanceof WikiPatchError);
    assert.match(err.message, /1 error/);
  }
});

test('parseWikiPatch parses source_paths as array', () => {
  const content = [
    '---',
    'source_commit: "abc123"',
    'kind: "module"',
    'compiled_at: "2026-01-01T00:00:00.000Z"',
    'source_paths:',
    '  - "src/a.ts"',
    '  - "src/b.ts"',
    '---',
    '',
    '# Module',
    '',
    'Content here.',
  ].join('\n');
  const patch = parseWikiPatch(content, 'Module-Auth');
  assert.deepEqual(patch.frontmatter.source_paths, ['src/a.ts', 'src/b.ts']);
});

test('parseWikiPatch passes through extra frontmatter fields', () => {
  const content = [
    '---',
    'source_commit: "abc123"',
    'kind: "module"',
    'source_paths: []',
    'compiled_at: "2026-01-01T00:00:00.000Z"',
    'page_state: "generated"',
    '---',
    '',
    '# Module',
    '',
    'Content.',
  ].join('\n');
  const patch = parseWikiPatch(content, 'Module-Auth');
  assert.equal(patch.frontmatter.compiled_at, '2026-01-01T00:00:00.000Z');
  assert.equal(patch.frontmatter.page_state, 'generated');
});

test('parseWikiPatch body does not include frontmatter', () => {
  const content = validPatch({ body: '\n# Title\n\nBody content.\n' });
  const patch = parseWikiPatch(content, 'Module-Auth');
  assert.ok(!patch.body.includes('source_commit'), 'body should not include frontmatter fields');
  assert.ok(patch.body.includes('# Title'));
});

test('parseWikiPatch includes warnings in error issues but still throws', () => {
  // Has secret + missing source_paths warning
  const content = [
    '---',
    'source_commit: "abc123"',
    'kind: "module"',
    // no source_paths → warning
    '---',
    '',
    '# Body',
    '',
    'AKIAIOSFODNN7EXAMPLE', // → error
  ].join('\n');

  try {
    parseWikiPatch(content, 'Module-Auth');
    assert.fail('expected WikiPatchError');
  } catch (err) {
    assert.ok(err instanceof WikiPatchError);
    const issueCodes = codes(err.issues);
    assert.ok(issueCodes.includes('secret-like-content'));
    assert.ok(issueCodes.includes('missing-source-paths'));
  }
});

test('parseWikiPatch accepts mock provider output format', () => {
  // This mirrors what MockLLMProvider.buildMockContent produces
  const content = [
    '---',
    'kind: "module"',
    'page_name: "Module-Auth"',
    'compiled_at: "mock"',
    'source_commit: "mock"',
    'source_paths: []',
    '---',
    '',
    '# Auth',
    '',
    '> Generated by the mock LLM provider (deterministic, no network).',
    '',
    '**Archetype:** module',
    '',
    '<!-- HUMAN_NOTES_START -->',
    '<!-- HUMAN_NOTES_END -->',
    '',
  ].join('\n');

  const patch = parseWikiPatch(content, 'Module-Auth');
  assert.equal(patch.frontmatter.source_commit, 'mock');
  assert.equal(patch.frontmatter.kind, 'module');
  assert.ok(patch.body.includes('# Auth'));
});

// ── synthesizeWikiPage ─────────────────────────────────────────────────────

test('synthesizeWikiPage returns WikiPatch for valid provider output', async () => {
  const provider = fixedProvider(validPatch());
  const patch = await synthesizeWikiPage(provider, makeRequest());

  assert.ok(patch instanceof Object);
  assert.equal(patch.pageName, 'Module-Auth');
  assert.equal(patch.frontmatter.kind, 'module');
});

test('synthesizeWikiPage throws WikiPatchError when provider returns invalid content', async () => {
  const provider = fixedProvider('# Just markdown, no frontmatter');

  await assert.rejects(
    () => synthesizeWikiPage(provider, makeRequest()),
    WikiPatchError,
  );
});

test('synthesizeWikiPage succeeds on second attempt with maxRetries=1', async () => {
  const provider = sequenceProvider([
    '# Invalid - no frontmatter', // attempt 0 → fails
    validPatch(),                  // attempt 1 → succeeds
  ]);

  const patch = await synthesizeWikiPage(provider, makeRequest(), { maxRetries: 1 });
  assert.equal(patch.frontmatter.kind, 'module');
});

test('synthesizeWikiPage appends corrective validation feedback on retry without mutating original request', async () => {
  const seenPrompts: string[] = [];
  const request = makeRequest({ userPrompt: 'Original module prompt.' });
  const provider: LLMProvider = {
    name: 'feedback-aware-mock',
    async complete(nextRequest: LLMRequest): Promise<LLMResponse> {
      seenPrompts.push(nextRequest.userPrompt);
      if (nextRequest.userPrompt.includes('Previous response was rejected') && nextRequest.userPrompt.includes('missing-frontmatter')) {
        return { content: validPatch(), provider: 'feedback-aware-mock' };
      }
      return { content: 'I can write that page.\n\n# Missing frontmatter', provider: 'feedback-aware-mock' };
    },
  };

  const patch = await synthesizeWikiPage(provider, request, { maxRetries: 1 });

  assert.equal(patch.frontmatter.kind, 'module');
  assert.equal(request.userPrompt, 'Original module prompt.');
  assert.equal(seenPrompts.length, 2);
  assert.equal(seenPrompts[0], 'Original module prompt.');
  assert.match(seenPrompts[1], /Previous response was rejected by repo-wiki structured patch validation/);
  assert.match(seenPrompts[1], /error missing-frontmatter:/);
  assert.match(seenPrompts[1], /Output only raw markdown/);
  assert.match(seenPrompts[1], /first line must be exactly `---`/);
  assert.match(seenPrompts[1], /Do not include any preamble, commentary, or fenced code block wrapper/);
  assert.match(seenPrompts[1], /source_paths must be a non-empty array/);
});

test('synthesizeWikiPage throws after exhausting all corrective retries when output remains invalid', async () => {
  let callCount = 0;
  const provider: LLMProvider = {
    name: 'always-invalid-feedback-mock',
    async complete(_request: LLMRequest): Promise<LLMResponse> {
      callCount++;
      return { content: 'Prose without frontmatter despite feedback.', provider: 'always-invalid-feedback-mock' };
    },
  };

  await assert.rejects(
    () => synthesizeWikiPage(provider, makeRequest(), { maxRetries: 1 }),
    (err) => err instanceof WikiPatchError && codes(err.issues).includes('missing-frontmatter'),
  );
  assert.equal(callCount, 2);
});

test('synthesizeWikiPage throws after exhausting all retries', async () => {
  const provider = fixedProvider('# No frontmatter ever');

  await assert.rejects(
    () => synthesizeWikiPage(provider, makeRequest(), { maxRetries: 2 }),
    WikiPatchError,
  );
});

test('synthesizeWikiPage uses last error when retries exhausted', async () => {
  // All responses are invalid
  const provider = fixedProvider('');

  try {
    await synthesizeWikiPage(provider, makeRequest(), { maxRetries: 1 });
    assert.fail('expected WikiPatchError');
  } catch (err) {
    assert.ok(err instanceof WikiPatchError);
    assert.ok(codes(err.issues).includes('empty-content'));
  }
});

test('synthesizeWikiPage passes through LLMProviderError without retry', async () => {
  const { LLMProviderError } = await import('../src/llm-provider.js');

  const provider: LLMProvider = {
    name: 'failing',
    async complete() {
      throw new LLMProviderError('Network failure', 'failing', 'TIMEOUT', false);
    },
  };

  await assert.rejects(
    () => synthesizeWikiPage(provider, makeRequest(), { maxRetries: 2 }),
    (err) => err instanceof LLMProviderError,
  );
});

test('synthesizeWikiPage defaults to maxRetries=0 when not specified', async () => {
  let callCount = 0;
  const provider: LLMProvider = {
    name: 'counting',
    async complete(): Promise<LLMResponse> {
      callCount++;
      return { content: '# No frontmatter', provider: 'counting' };
    },
  };

  await assert.rejects(
    () => synthesizeWikiPage(provider, makeRequest()),
    WikiPatchError,
  );
  assert.equal(callCount, 1, 'default maxRetries=0 means exactly one attempt');
});

test('synthesizeWikiPage rejects negative maxRetries before provider call', async () => {
  let callCount = 0;
  const provider: LLMProvider = {
    name: 'counting',
    async complete(): Promise<LLMResponse> {
      callCount++;
      return { content: validPatch(), provider: 'counting' };
    },
  };

  await assert.rejects(
    () => synthesizeWikiPage(provider, makeRequest(), { maxRetries: -1 }),
    RangeError,
  );
  assert.equal(callCount, 0, 'invalid retry configuration should fail before synthesis');
});

test('synthesizeWikiPage rejects non-finite maxRetries before provider call', async () => {
  const provider = fixedProvider(validPatch());

  await assert.rejects(
    () => synthesizeWikiPage(provider, makeRequest(), { maxRetries: Number.NaN }),
    RangeError,
  );
});


// ── Architecture synthesis validation ─────────────────────────────────────

function validArchitecturePatch(overrides: {
  kind?: string;
  source_paths?: string;
  frontmatterExtra?: string[];
  bodyExtra?: string;
  omitHumanNotes?: boolean;
  omitHeading?: string;
} = {}): string {
  const headings = [
    '## Executive Architecture Summary',
    '## System and Repository Context',
    '## Major Modules and Responsibilities',
    '## Runtime, Data, and Control-Flow Relationships',
    '## Build, Test, Deployment, and Operational Surfaces',
    '## Cross-Cutting Concerns',
    '## Caveats and Open Questions',
  ].filter((heading) => heading !== overrides.omitHeading);
  const body = [
    '# Architecture',
    '',
    ...headings.flatMap((heading) => [heading, '', 'Grounded architecture content.', '']),
    overrides.bodyExtra ?? '',
    ...(overrides.omitHumanNotes ? [] : ['<!-- HUMAN_NOTES_START -->', '<!-- HUMAN_NOTES_END -->']),
    ''
  ].join('\n');

  return [
    '---',
    'source_commit: "abc123"',
    `kind: ${JSON.stringify(overrides.kind ?? 'architecture')}`,
    'compiled_at: "2026-01-01T00:00:00.000Z"',
    'confidence: "medium"',
    'claim_status: "grounded"',
    `source_paths: ${overrides.source_paths ?? '["src/example.ts"]'}`,
    ...(overrides.frontmatterExtra ?? []),
    '---',
    body
  ].join('\n');
}

test('synthesizeWikiPage accepts architecture patch with required metadata, headings, notes, and source paths', async () => {
  const patch = await synthesizeWikiPage(
    fixedProvider(validArchitecturePatch()),
    makeRequest({ archetype: 'architecture', pageName: 'Architecture', pageTitle: 'Architecture', sourcePaths: ['src/example.ts'] }),
  );

  assert.equal(patch.frontmatter.kind, 'architecture');
});

test('synthesizeWikiPage rejects architecture patch missing required heading', async () => {
  await assert.rejects(
    () => synthesizeWikiPage(
      fixedProvider(validArchitecturePatch({ omitHeading: '## Caveats and Open Questions' })),
      makeRequest({ archetype: 'architecture', pageName: 'Architecture', pageTitle: 'Architecture', sourcePaths: ['src/example.ts'] }),
    ),
    (err: unknown) => {
      assert.ok(err instanceof WikiPatchError);
      assert.ok(err.issues.some((issue) => issue.code === 'missing-architecture-heading'));
      return true;
    }
  );
});

test('synthesizeWikiPage rejects architecture patch missing human notes block', async () => {
  await assert.rejects(
    () => synthesizeWikiPage(
      fixedProvider(validArchitecturePatch({ omitHumanNotes: true })),
      makeRequest({ archetype: 'architecture', pageName: 'Architecture', pageTitle: 'Architecture', sourcePaths: ['src/example.ts'] }),
    ),
    (err: unknown) => {
      assert.ok(err instanceof WikiPatchError);
      assert.ok(err.issues.some((issue) => issue.code === 'missing-human-notes-block'));
      return true;
    }
  );
});

test('synthesizeWikiPage rejects architecture patch that writes inside the human notes block', async () => {
  await assert.rejects(
    () => synthesizeWikiPage(
      fixedProvider(validArchitecturePatch({ bodyExtra: '<!-- HUMAN_NOTES_START -->\nDo not synthesize human notes.\n<!-- HUMAN_NOTES_END -->' })),
      makeRequest({ archetype: 'architecture', pageName: 'Architecture', pageTitle: 'Architecture', sourcePaths: ['src/example.ts'] }),
    ),
    (err: unknown) => {
      assert.ok(err instanceof WikiPatchError);
      assert.ok(err.issues.some((issue) => issue.code === 'non-empty-human-notes-block'));
      return true;
    }
  );
});

test('synthesizeWikiPage rejects architecture patch with out-of-context source_paths', async () => {
  await assert.rejects(
    () => synthesizeWikiPage(
      fixedProvider(validArchitecturePatch({ source_paths: '["src/other.ts"]' })),
      makeRequest({ archetype: 'architecture', pageName: 'Architecture', pageTitle: 'Architecture', sourcePaths: ['src/example.ts'] }),
    ),
    (err: unknown) => {
      assert.ok(err instanceof WikiPatchError);
      assert.ok(err.issues.some((issue) => issue.code === 'out-of-context-source-paths'));
      return true;
    }
  );
});

test('synthesizeWikiPage rejects architecture patch missing confidence metadata', async () => {
  const content = validArchitecturePatch().replace('confidence: "medium"\n', '');

  await assert.rejects(
    () => synthesizeWikiPage(
      fixedProvider(content),
      makeRequest({ archetype: 'architecture', pageName: 'Architecture', pageTitle: 'Architecture', sourcePaths: ['src/example.ts'] }),
    ),
    (err: unknown) => {
      assert.ok(err instanceof WikiPatchError);
      assert.ok(err.issues.some((issue) => issue.code === 'missing-confidence'));
      return true;
    }
  );
});

test('synthesizeWikiPage rejects architecture patch missing source_paths', async () => {
  const content = validArchitecturePatch().replace('source_paths: ["src/example.ts"]\n', '');

  await assert.rejects(
    () => synthesizeWikiPage(
      fixedProvider(content),
      makeRequest({ archetype: 'architecture', pageName: 'Architecture', pageTitle: 'Architecture', sourcePaths: ['src/example.ts'] }),
    ),
    (err: unknown) => {
      assert.ok(err instanceof WikiPatchError);
      assert.ok(err.issues.some((issue) => issue.code === 'missing-source-paths' && issue.level === 'error'));
      return true;
    }
  );
});

// ── WikiPatchError ─────────────────────────────────────────────────────────

test('WikiPatchError has correct name', () => {
  const err = new WikiPatchError('msg', 'Page', []);
  assert.equal(err.name, 'WikiPatchError');
});

test('WikiPatchError is instanceof Error', () => {
  const err = new WikiPatchError('msg', 'Page', []);
  assert.ok(err instanceof Error);
});

test('WikiPatchError exposes pageName and issues', () => {
  const issues: WikiPatchIssue[] = [
    { level: 'error', code: 'empty-content', message: 'empty' },
  ];
  const err = new WikiPatchError('Failed', 'My-Page', issues);
  assert.equal(err.pageName, 'My-Page');
  assert.deepEqual(err.issues, issues);
});
