import test from 'node:test';
import assert from 'node:assert/strict';
import { detectPageState, extractHumanNotes, injectHumanNotes, preserveHumanNotes } from '../src/page-ownership.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generatedPage(notes = '') {
  return [
    '---',
    'source_repo: "owner/repo"',
    'source_commit: "abc123"',
    'compiled_at: "2026-01-01T00:00:00.000Z"',
    'page_state: "generated"',
    '---',
    '',
    '# Test Page',
    '',
    '<!-- HUMAN_NOTES_START -->',
    notes,
    '<!-- HUMAN_NOTES_END -->',
    ''
  ].join('\n');
}

function unmanagedPage() {
  return '# Hand-written page\n\nNo frontmatter at all.\n';
}

// ---------------------------------------------------------------------------
// detectPageState
// ---------------------------------------------------------------------------

test('detectPageState returns "generated" for a clean generated page', () => {
  const content = generatedPage('');
  assert.equal(detectPageState(content), 'generated');
});

test('detectPageState tolerates UTF-8 BOM and CRLF frontmatter', () => {
  const content = '\uFEFF---\r\nsource_repo: "owner/repo"\r\nsource_commit: "abc123"\r\npage_state: "generated"\r\n---\r\n\r\n# Test Page\r\n';
  assert.equal(detectPageState(content), 'generated');
});

test('detectPageState detects CRLF human-owned frontmatter', () => {
  const content = '---\r\nsource_commit: "abc123"\r\nowned_by: "human"\r\n---\r\n\r\n# Human-owned\r\n';
  assert.equal(detectPageState(content), 'human-owned');
});

test('detectPageState returns "mixed" when HUMAN_NOTES has non-empty content', () => {
  const content = generatedPage('\nSome human notes here.\n');
  assert.equal(detectPageState(content), 'mixed');
});

test('detectPageState returns "mixed" when notes contain non-whitespace content', () => {
  const content = generatedPage('\n## Extra section\n\nDetails.\n');
  assert.equal(detectPageState(content), 'mixed');
});

test('detectPageState returns "human-owned" when page_state frontmatter is "human-owned"', () => {
  const content = [
    '---',
    'source_repo: "owner/repo"',
    'source_commit: "abc123"',
    'page_state: "human-owned"',
    '---',
    '',
    '# Owned by a human',
    ''
  ].join('\n');
  assert.equal(detectPageState(content), 'human-owned');
});

test('detectPageState returns "human-owned" when owned_by is "human"', () => {
  const content = [
    '---',
    'source_repo: "owner/repo"',
    'source_commit: "abc123"',
    'owned_by: "human"',
    '---',
    '',
    '# Owned by a human',
    ''
  ].join('\n');
  assert.equal(detectPageState(content), 'human-owned');
});

test('detectPageState recognizes unquoted and single-quoted human ownership frontmatter', () => {
  const unquotedPageState = [
    '---',
    'source_commit: "abc123"',
    'page_state: human-owned',
    '---',
    ''
  ].join('\n');
  const singleQuotedOwner = [
    '---',
    'source_commit: "abc123"',
    "owned_by: 'human'",
    '---',
    ''
  ].join('\n');

  assert.equal(detectPageState(unquotedPageState), 'human-owned');
  assert.equal(detectPageState(singleQuotedOwner), 'human-owned');
});

test('detectPageState returns "unmanaged" when source_commit is absent', () => {
  assert.equal(detectPageState(unmanagedPage()), 'unmanaged');
});

test('detectPageState returns "unmanaged" for an empty page', () => {
  assert.equal(detectPageState(''), 'unmanaged');
});

test('detectPageState ignores ownership-like text outside frontmatter', () => {
  const content = [
    '---',
    'source_commit: "abc123"',
    'page_state: "generated"',
    '---',
    '',
    '# Page',
    '',
    'Body mentions page_state: "human-owned" for documentation purposes.',
    ''
  ].join('\n');
  assert.equal(detectPageState(content), 'generated');
});

test('detectPageState treats human-owned declaration as higher priority than non-empty notes', () => {
  const content = [
    '---',
    'source_commit: "abc123"',
    'page_state: "human-owned"',
    '---',
    '',
    '<!-- HUMAN_NOTES_START -->',
    'Some notes.',
    '<!-- HUMAN_NOTES_END -->',
    ''
  ].join('\n');
  assert.equal(detectPageState(content), 'human-owned');
});

// ---------------------------------------------------------------------------
// extractHumanNotes
// ---------------------------------------------------------------------------

test('extractHumanNotes returns empty string when no markers are present', () => {
  assert.equal(extractHumanNotes('# Page\n\nNo markers here.\n'), '');
});

test('extractHumanNotes returns empty string when markers are present but empty', () => {
  const content = '<!-- HUMAN_NOTES_START -->\n<!-- HUMAN_NOTES_END -->';
  assert.equal(extractHumanNotes(content).trim(), '');
});

test('extractHumanNotes returns the raw text between markers', () => {
  const inner = '\nSome **markdown** content.\n';
  const content = `<!-- HUMAN_NOTES_START -->${inner}<!-- HUMAN_NOTES_END -->`;
  assert.equal(extractHumanNotes(content), inner);
});

test('extractHumanNotes returns empty string when END marker comes before START', () => {
  const content = '<!-- HUMAN_NOTES_END --><!-- HUMAN_NOTES_START -->';
  assert.equal(extractHumanNotes(content), '');
});

test('extractHumanNotes ignores END markers before the START marker', () => {
  const notes = '\nPreserve these notes.\n';
  const content = [
    '<!-- HUMAN_NOTES_END --> appears in earlier documentation.',
    '<!-- HUMAN_NOTES_START -->',
    notes,
    '<!-- HUMAN_NOTES_END -->'
  ].join('\n');

  assert.equal(extractHumanNotes(content), `\n${notes}\n`);
});

test('extractHumanNotes returns empty string when only START marker is present', () => {
  assert.equal(extractHumanNotes('<!-- HUMAN_NOTES_START -->some text'), '');
});

test('extractHumanNotes returns empty string when only END marker is present', () => {
  assert.equal(extractHumanNotes('some text<!-- HUMAN_NOTES_END -->'), '');
});

// ---------------------------------------------------------------------------
// injectHumanNotes
// ---------------------------------------------------------------------------

test('injectHumanNotes inserts notes between markers', () => {
  const template = '<!-- HUMAN_NOTES_START -->\n<!-- HUMAN_NOTES_END -->';
  const notes = '\nHello from a human.\n';
  const result = injectHumanNotes(template, notes);
  assert.equal(result, `<!-- HUMAN_NOTES_START -->${notes}<!-- HUMAN_NOTES_END -->`);
});

test('injectHumanNotes replaces existing notes with new ones', () => {
  const original = '<!-- HUMAN_NOTES_START -->\nOld notes.\n<!-- HUMAN_NOTES_END -->';
  const newNotes = '\nNew notes.\n';
  const result = injectHumanNotes(original, newNotes);
  assert.equal(result, `<!-- HUMAN_NOTES_START -->${newNotes}<!-- HUMAN_NOTES_END -->`);
});

test('injectHumanNotes returns content unchanged when START marker is absent', () => {
  const content = '# Page\n\n<!-- HUMAN_NOTES_END -->';
  assert.equal(injectHumanNotes(content, '\nnotes\n'), content);
});

test('injectHumanNotes returns content unchanged when END marker is absent', () => {
  const content = '# Page\n\n<!-- HUMAN_NOTES_START -->';
  assert.equal(injectHumanNotes(content, '\nnotes\n'), content);
});

test('injectHumanNotes returns content unchanged when END comes before START', () => {
  const content = '<!-- HUMAN_NOTES_END --><!-- HUMAN_NOTES_START -->';
  assert.equal(injectHumanNotes(content, '\nnotes\n'), content);
});

test('injectHumanNotes ignores END markers before the START marker', () => {
  const content = [
    '<!-- HUMAN_NOTES_END --> appears in earlier documentation.',
    '<!-- HUMAN_NOTES_START -->',
    'old notes',
    '<!-- HUMAN_NOTES_END -->',
    'footer'
  ].join('\n');
  const notes = '\nnew notes\n';
  const result = injectHumanNotes(content, notes);

  assert.equal(extractHumanNotes(result), notes);
  assert.match(result, /^<!-- HUMAN_NOTES_END --> appears in earlier documentation\./);
  assert.match(result, /footer$/);
});

test('injectHumanNotes preserves content outside the markers', () => {
  const template = [
    '---',
    'source_commit: "abc"',
    '---',
    '',
    '# Title',
    '',
    '<!-- HUMAN_NOTES_START -->',
    '<!-- HUMAN_NOTES_END -->',
    '',
    '## Footer',
    ''
  ].join('\n');
  const notes = '\nHuman content.\n';
  const result = injectHumanNotes(template, notes);
  assert.match(result, /# Title/);
  assert.match(result, /## Footer/);
  assert.match(result, /Human content\./);
});

test('preserveHumanNotes appends markers when generated content has no human notes block', () => {
  const content = '---\nsource_commit: "abc"\npage_state: "generated"\n---\n\n# Home\n';
  const notes = '\nKeep this home-page note.\n';
  const preserved = preserveHumanNotes(content, notes);

  assert.match(preserved, /# Home/);
  assert.match(preserved, /HUMAN_NOTES_START/);
  assert.equal(extractHumanNotes(preserved), notes);
});

test('extractHumanNotes round-trips through injectHumanNotes', () => {
  const notes = '\nSome notes.\n## A section\n\nContent.\n';
  // Construct the page without extra join-newlines so the markers are adjacent.
  const page =
    '---\nsource_commit: "abc"\npage_state: "generated"\n---\n\n# Title\n\n' +
    '<!-- HUMAN_NOTES_START -->' +
    notes +
    '<!-- HUMAN_NOTES_END -->\n';
  const extracted = extractHumanNotes(page);
  assert.equal(extracted, notes);

  // Inject the same notes into a clean page and verify they survive extraction.
  const cleanPage =
    '---\nsource_commit: "abc"\npage_state: "generated"\n---\n\n# Title\n\n' +
    '<!-- HUMAN_NOTES_START -->\n<!-- HUMAN_NOTES_END -->\n';
  const rebuilt = injectHumanNotes(cleanPage, notes);
  assert.equal(extractHumanNotes(rebuilt), notes);
});
