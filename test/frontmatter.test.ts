import test from 'node:test';
import assert from 'node:assert/strict';
import { stripFrontmatter, applyFrontmatterPolicy, isFrontmatterPolicy, parseFrontmatterPolicy } from '../src/frontmatter.js';

// ---------------------------------------------------------------------------
// stripFrontmatter
// ---------------------------------------------------------------------------

test('stripFrontmatter strips a valid YAML frontmatter block', () => {
  const input = [
    '---',
    'kind: "module"',
    'source_commit: "abc123"',
    'compiled_at: "2024-01-01T00:00:00.000Z"',
    '---',
    '# My Page',
    '',
    'Body content.'
  ].join('\n');

  const result = stripFrontmatter(input);
  assert.equal(result, '# My Page\n\nBody content.');
});

test('stripFrontmatter strips frontmatter closed by `...`', () => {
  const input = [
    '---',
    'kind: "foundation"',
    '...',
    '# Title',
    'Content.'
  ].join('\n');

  const result = stripFrontmatter(input);
  assert.equal(result, '# Title\nContent.');
});

test('stripFrontmatter handles empty frontmatter block', () => {
  const input = '---\n---\n# Heading\n';
  const result = stripFrontmatter(input);
  assert.equal(result, '# Heading\n');
});

test('stripFrontmatter returns content unchanged when there is no frontmatter', () => {
  const input = '# Just a heading\n\nSome content.\n';
  assert.equal(stripFrontmatter(input), input);
});

test('stripFrontmatter returns content unchanged when document begins with a thematic break (no closing delimiter)', () => {
  // A `---` at the start that is never closed is treated as a thematic break / malformed block
  const input = '---\n\nSome prose content that never closes the frontmatter block.\n';
  assert.equal(stripFrontmatter(input), input);
});

test('stripFrontmatter does not strip `---` blocks that appear mid-document', () => {
  // Document has no leading frontmatter but has a thematic break inside
  const input = '# Title\n\n---\n\nSection content.\n';
  assert.equal(stripFrontmatter(input), input);
});

test('stripFrontmatter does not strip when opening `---` has extra content on same line', () => {
  // `--- extra` is not a valid frontmatter opening
  const input = '--- extra\nkey: value\n---\nContent.';
  assert.equal(stripFrontmatter(input), input);
});

test('stripFrontmatter leaves single-line `---` unchanged', () => {
  const input = '---';
  assert.equal(stripFrontmatter(input), input);
});

test('stripFrontmatter strips trailing whitespace on opening delimiter', () => {
  const input = '---   \nkey: value\n---\nContent.';
  const result = stripFrontmatter(input);
  assert.equal(result, 'Content.');
});

test('stripFrontmatter strips BOM-prefixed frontmatter', () => {
  const input = '\uFEFF---\nkey: value\n---\nContent.';
  const result = stripFrontmatter(input);
  assert.equal(result, 'Content.');
});

test('stripFrontmatter does not strip a second blank line when no blank line follows frontmatter', () => {
  const input = '---\nkind: "x"\n---\nContent.\n';
  const result = stripFrontmatter(input);
  assert.equal(result, 'Content.\n');
});

test('stripFrontmatter strips a single blank line immediately after closing delimiter', () => {
  const input = '---\nkind: "x"\n---\n\nContent.\n';
  const result = stripFrontmatter(input);
  assert.equal(result, 'Content.\n');
});

test('stripFrontmatter strips a single CRLF blank line immediately after closing delimiter', () => {
  const input = '---\r\nkind: "x"\r\n---\r\n\r\nContent.\r\n';
  const result = stripFrontmatter(input);
  assert.equal(result, 'Content.\r\n');
});

// ---------------------------------------------------------------------------
// applyFrontmatterPolicy
// ---------------------------------------------------------------------------

test('applyFrontmatterPolicy strip removes frontmatter', () => {
  const input = '---\nkind: "module"\n---\n# Page\n';
  const result = applyFrontmatterPolicy(input, 'strip');
  assert.equal(result, '# Page\n');
});

test('applyFrontmatterPolicy preserve keeps frontmatter intact', () => {
  const input = '---\nkind: "module"\n---\n# Page\n';
  const result = applyFrontmatterPolicy(input, 'preserve');
  assert.equal(result, input);
});

test('applyFrontmatterPolicy html-comment removes frontmatter (same as strip for now)', () => {
  const input = '---\nkind: "module"\n---\n# Page\n';
  const result = applyFrontmatterPolicy(input, 'html-comment');
  assert.equal(result, '# Page\n');
});

test('applyFrontmatterPolicy provenance renders a visible provenance block with GitHub links', () => {
  const input = [
    '---',
    'source_repo: "https://github.com/mfittko/repo-wiki.git"',
    'source_commit: "abc1234def5678"',
    'compiled_at: "2026-05-10T00:00:00.000Z"',
    'kind: "module"',
    'page_state: "generated"',
    'confidence: "medium"',
    'claim_status: "source-grounded"',
    'source_paths:',
    '  - "src/docs-validation.ts"',
    '---',
    '# Page',
    '',
    'Body.'
  ].join('\n');

  const result = applyFrontmatterPolicy(input, 'provenance');

  assert.equal(result.startsWith('---\n'), false);
  assert.match(result, /^> \*\*Generated from:\*\* `https:\/\/github\.com\/mfittko\/repo-wiki\.git`/);
  assert.match(result, /\*\*Source commit:\*\* \[`abc1234`\]\(https:\/\/github\.com\/mfittko\/repo-wiki\/tree\/abc1234def5678\)/);
  assert.match(result, /\*\*Compiled at:\*\* `2026-05-10T00:00:00\.000Z`/);
  assert.match(result, /\*\*Page kind:\*\* `module`/);
  assert.match(result, /\*\*Page state:\*\* `generated`/);
  assert.match(result, /\*\*Confidence:\*\* `medium`/);
  assert.match(result, /\*\*Claim status:\*\* `source-grounded`/);
  assert.match(result, /\*\*Primary sources:\*\* \[src\/docs-validation\.ts\]\(https:\/\/github\.com\/mfittko\/repo-wiki\/blob\/abc1234def5678\/src\/docs-validation\.ts\)/);
  assert.match(result, /\n\n# Page\n\nBody\.$/);
});

test('applyFrontmatterPolicy provenance falls back to code spans when GitHub link metadata is incomplete', () => {
  const input = [
    '---',
    'source_repo: "https://example.com/internal.git"',
    'source_paths: ["src/frontmatter.ts"]',
    '---',
    '# Page',
    ''
  ].join('\n');

  const result = applyFrontmatterPolicy(input, 'provenance');

  assert.match(result, /\*\*Generated from:\*\* `https:\/\/example\.com\/internal\.git`/);
  assert.match(result, /\*\*Primary sources:\*\* `src\/frontmatter\.ts`/);
  assert.doesNotMatch(result, /\/blob\//);
});

test('applyFrontmatterPolicy provenance truncates source paths after ten entries', () => {
  const sourcePaths = Array.from({ length: 12 }, (_, index) => `src/file-${index + 1}.ts`);
  const input = [
    '---',
    'source_paths:',
    ...sourcePaths.map((entry) => `  - "${entry}"`),
    '---',
    '# Page',
    ''
  ].join('\n');

  const result = applyFrontmatterPolicy(input, 'provenance');

  assert.match(result, /\*\*Primary sources:\*\* /);
  assert.match(result, /`src\/file-10\.ts`, \.\.\. and 2 more/);
  assert.doesNotMatch(result, /src\/file-11\.ts/);
});

test('applyFrontmatterPolicy provenance adds a secondary evidence note when all source paths are documentation files', () => {
  const input = [
    '---',
    'source_paths:',
    '  - "docs/guide.md"',
    '  - "README.md"',
    '---',
    '# Page',
    ''
  ].join('\n');

  const result = applyFrontmatterPolicy(input, 'provenance');

  assert.match(result, /\*\*Evidence note:\*\* This page is derived from markdown documentation/);
});

test('applyFrontmatterPolicy provenance does not add a secondary evidence note for mixed docs and code source paths', () => {
  const input = [
    '---',
    'source_paths:',
    '  - "docs/guide.md"',
    '  - "src/frontmatter.ts"',
    '---',
    '# Page',
    ''
  ].join('\n');

  const result = applyFrontmatterPolicy(input, 'provenance');

  assert.doesNotMatch(result, /\*\*Evidence note:\*\*/);
});

test('applyFrontmatterPolicy provenance adds a review note for review-oriented claim status with code sources', () => {
  const input = [
    '---',
    'claim_status: "review-needed"',
    'source_paths:',
    '  - "src/frontmatter.ts"',
    '---',
    '# Page',
    ''
  ].join('\n');

  const result = applyFrontmatterPolicy(input, 'provenance');

  assert.match(result, /\*\*Evidence note:\*\* This page has a review-oriented claim status/);
  assert.doesNotMatch(result, /This page is derived from markdown documentation/);
});

test('applyFrontmatterPolicy provenance omits secret-like metadata values', () => {
  const input = [
    '---',
    'source_repo: "https://x-access-token:super-secret@github.com/mfittko/repo-wiki.git"',
    'source_paths:',
    '  - "docs/token=supersecret12345.md"',
    '  - "src/frontmatter.ts"',
    '---',
    '# Page',
    ''
  ].join('\n');

  const result = applyFrontmatterPolicy(input, 'provenance');

  assert.equal(result.includes('super-secret'), false);
  assert.match(result, /\*\*Generated from:\*\* `https:\/\/\*\*\*:\*\*\*@github\.com\/mfittko\/repo-wiki\.git`/);
  assert.match(result, /\*\*Primary sources:\*\* `src\/frontmatter\.ts`/);
  assert.doesNotMatch(result, /docs\/token=supersecret12345\.md/);
});

test('applyFrontmatterPolicy provenance escapes markdown-special characters in linked source path labels', () => {
  const input = [
    '---',
    'source_repo: "https://github.com/mfittko/repo-wiki.git"',
    'source_commit: "abc1234def5678"',
    'source_paths:',
    '  - "src/weird[part](draft).ts"',
    '---',
    '# Page',
    ''
  ].join('\n');

  const result = applyFrontmatterPolicy(input, 'provenance');

  assert.match(result, /\*\*Primary sources:\*\* \[src\/weird\\\[part\\\]\\\(draft\\\)\.ts\]\(https:\/\/github\.com\/mfittko\/repo-wiki\/blob\/abc1234def5678\/src\/weird%5Bpart%5D%28draft%29\.ts\)/);
});

test('applyFrontmatterPolicy provenance leaves invalid leading frontmatter unchanged', () => {
  const input = '---\nsource_paths: ["src/frontmatter.ts",\n---\n# Page\n';
  const result = applyFrontmatterPolicy(input, 'provenance');
  assert.equal(result, input);
});

test('applyFrontmatterPolicy strip is a no-op when content has no frontmatter', () => {
  const input = '# Page\n\nContent.\n';
  const result = applyFrontmatterPolicy(input, 'strip');
  assert.equal(result, input);
});

test('applyFrontmatterPolicy provenance does not change non-frontmatter thematic breaks', () => {
  const input = '# Page\n\n---\n\nSection\n';
  const result = applyFrontmatterPolicy(input, 'provenance');
  assert.equal(result, input);
});

// ---------------------------------------------------------------------------
// isFrontmatterPolicy / parseFrontmatterPolicy
// ---------------------------------------------------------------------------

test('isFrontmatterPolicy narrows known policy values', () => {
  assert.equal(isFrontmatterPolicy('strip'), true);
  assert.equal(isFrontmatterPolicy('html-comment'), true);
  assert.equal(isFrontmatterPolicy('preserve'), true);
  assert.equal(isFrontmatterPolicy('provenance'), true);
  assert.equal(isFrontmatterPolicy('STRIP'), false);
});

test('parseFrontmatterPolicy defaults undefined to strip', () => {
  assert.equal(parseFrontmatterPolicy(undefined), 'strip');
});

test('parseFrontmatterPolicy accepts all known policy values', () => {
  assert.equal(parseFrontmatterPolicy('strip'), 'strip');
  assert.equal(parseFrontmatterPolicy('html-comment'), 'html-comment');
  assert.equal(parseFrontmatterPolicy('preserve'), 'preserve');
  assert.equal(parseFrontmatterPolicy('provenance'), 'provenance');
});

test('parseFrontmatterPolicy defaults invalid values to strip', () => {
  assert.equal(parseFrontmatterPolicy('strp'), 'strip');
  assert.equal(parseFrontmatterPolicy('STRIP'), 'strip');
});
