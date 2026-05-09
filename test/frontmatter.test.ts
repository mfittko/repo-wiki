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

test('applyFrontmatterPolicy strip is a no-op when content has no frontmatter', () => {
  const input = '# Page\n\nContent.\n';
  const result = applyFrontmatterPolicy(input, 'strip');
  assert.equal(result, input);
});

// ---------------------------------------------------------------------------
// isFrontmatterPolicy / parseFrontmatterPolicy
// ---------------------------------------------------------------------------

test('isFrontmatterPolicy narrows known policy values', () => {
  assert.equal(isFrontmatterPolicy('strip'), true);
  assert.equal(isFrontmatterPolicy('html-comment'), true);
  assert.equal(isFrontmatterPolicy('preserve'), true);
  assert.equal(isFrontmatterPolicy('STRIP'), false);
});

test('parseFrontmatterPolicy defaults undefined to strip', () => {
  assert.equal(parseFrontmatterPolicy(undefined), 'strip');
});

test('parseFrontmatterPolicy accepts all known policy values', () => {
  assert.equal(parseFrontmatterPolicy('strip'), 'strip');
  assert.equal(parseFrontmatterPolicy('html-comment'), 'html-comment');
  assert.equal(parseFrontmatterPolicy('preserve'), 'preserve');
});

test('parseFrontmatterPolicy defaults invalid values to strip', () => {
  assert.equal(parseFrontmatterPolicy('strp'), 'strip');
  assert.equal(parseFrontmatterPolicy('STRIP'), 'strip');
});
