/**
 * Page ownership detection and human-notes preservation for wiki pages.
 *
 * Four page states:
 *  - generated    : produced by the compiler, no human annotations yet.
 *  - mixed        : compiler-generated page that also contains non-empty HUMAN_NOTES.
 *  - human-owned  : page explicitly marked as human-owned (page_state: "human-owned" in
 *                   frontmatter), or carries owned_by: "human".  The compiler skips it.
 *  - unmanaged    : page that exists on disk but was not produced by repo-wiki
 *                   (no source_commit frontmatter field).
 */

export type PageState = 'generated' | 'mixed' | 'human-owned' | 'unmanaged';

const HUMAN_NOTES_START = '<!-- HUMAN_NOTES_START -->';
const HUMAN_NOTES_END = '<!-- HUMAN_NOTES_END -->';

/**
 * Inspect a wiki page's content and return its ownership state.
 *
 * Decision order:
 * 1. Explicit `page_state: "human-owned"` or `owned_by: "human"` → human-owned.
 * 2. No `source_commit:` field in content → unmanaged.
 * 3. Non-empty content between HUMAN_NOTES markers → mixed.
 * 4. Otherwise → generated.
 */
export function detectPageState(content: string): PageState {
  // Explicit human-ownership declarations take the highest priority.
  if (/^page_state:\s*"human-owned"/m.test(content) || /^owned_by:\s*"human"/m.test(content)) {
    return 'human-owned';
  }

  // Must have a source_commit field to be considered a repo-wiki page.
  if (!/^source_commit:/m.test(content)) {
    return 'unmanaged';
  }

  // Has source_commit – was produced by the compiler.  Check for human notes.
  if (extractHumanNotes(content).trim().length > 0) {
    return 'mixed';
  }

  return 'generated';
}

/**
 * Return the raw text between HUMAN_NOTES_START and HUMAN_NOTES_END markers.
 * Returns an empty string when neither or only one marker is present.
 */
export function extractHumanNotes(content: string): string {
  const start = content.indexOf(HUMAN_NOTES_START);
  const end = content.indexOf(HUMAN_NOTES_END);

  if (start === -1 || end === -1 || end <= start) {
    return '';
  }

  return content.slice(start + HUMAN_NOTES_START.length, end);
}

/**
 * Replace the empty slot between HUMAN_NOTES markers in `content` with `notes`.
 * If `content` does not contain both markers in the correct order the original
 * content is returned unchanged.
 */
export function injectHumanNotes(content: string, notes: string): string {
  const start = content.indexOf(HUMAN_NOTES_START);
  const end = content.indexOf(HUMAN_NOTES_END);

  if (start === -1 || end === -1 || end <= start) {
    return content;
  }

  return (
    content.slice(0, start + HUMAN_NOTES_START.length) +
    notes +
    content.slice(end)
  );
}
