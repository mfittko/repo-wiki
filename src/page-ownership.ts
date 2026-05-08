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
 * 1. Explicit `page_state: "human-owned"` or `owned_by: "human"` in frontmatter → human-owned.
 * 2. No `source_commit:` field in frontmatter → unmanaged.
 * 3. Non-empty content between HUMAN_NOTES markers → mixed.
 * 4. Otherwise → generated.
 */
export function detectPageState(content: string): PageState {
  const frontmatter = extractFrontmatter(content);

  // Explicit human-ownership declarations take the highest priority.
  if (/^page_state:\s*['"]?human-owned['"]?\s*$/m.test(frontmatter) || /^owned_by:\s*['"]?human['"]?\s*$/m.test(frontmatter)) {
    return 'human-owned';
  }

  // Must have a source_commit field in frontmatter to be considered a repo-wiki page.
  if (!/^source_commit:/m.test(frontmatter)) {
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
  if (start === -1) {
    return '';
  }

  const notesStart = start + HUMAN_NOTES_START.length;
  const end = content.indexOf(HUMAN_NOTES_END, notesStart);
  if (end === -1) {
    return '';
  }

  return content.slice(notesStart, end);
}

/**
 * Replace the empty slot between HUMAN_NOTES markers in `content` with `notes`.
 * If `content` does not contain both markers in the correct order the original
 * content is returned unchanged.
 */
export function injectHumanNotes(content: string, notes: string): string {
  const start = content.indexOf(HUMAN_NOTES_START);
  if (start === -1) {
    return content;
  }

  const notesStart = start + HUMAN_NOTES_START.length;
  const end = content.indexOf(HUMAN_NOTES_END, notesStart);
  if (end === -1) {
    return content;
  }

  return (
    content.slice(0, notesStart) +
    notes +
    content.slice(end)
  );
}

/**
 * Preserve notes in generated content. If the renderer did not include a human
 * notes block, append one so non-module pages can still retain human content.
 */
export function preserveHumanNotes(content: string, notes: string): string {
  if (content.includes(HUMAN_NOTES_START) && content.includes(HUMAN_NOTES_END)) {
    return injectHumanNotes(content, notes);
  }

  const suffix = content.endsWith('\n') ? '' : '\n';
  return `${content}${suffix}\n${HUMAN_NOTES_START}${notes}${HUMAN_NOTES_END}\n`;
}

function extractFrontmatter(content: string): string {
  if (!content.startsWith('---\n')) {
    return '';
  }
  const end = content.indexOf('\n---', 4);
  if (end === -1) {
    return '';
  }
  return content.slice(4, end);
}
