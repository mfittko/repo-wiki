/**
 * Utilities for handling YAML frontmatter in wiki pages at publish time.
 *
 * GitHub-hosted Wiki pages render top-of-file YAML frontmatter as a visible
 * metadata table, which is unwanted noise. These utilities allow stripping
 * frontmatter at publish time while keeping it in local wiki files for tooling.
 */

export type FrontmatterPolicy = 'strip' | 'html-comment' | 'preserve';

export const FRONTMATTER_POLICIES: readonly FrontmatterPolicy[] = ['strip', 'html-comment', 'preserve'];

/**
 * Validates a raw string as a FrontmatterPolicy, returning the default `'strip'`
 * if the value is undefined or not a recognised policy name.
 */
export function parseFrontmatterPolicy(value: string | undefined): FrontmatterPolicy {
  if (value !== undefined && (FRONTMATTER_POLICIES as readonly string[]).includes(value)) {
    return value as FrontmatterPolicy;
  }
  return 'strip';
}

/**
 * Strips a valid leading YAML frontmatter block from markdown content.
 *
 * A valid frontmatter block:
 *   - Starts with `---` (optionally trailing whitespace) on the very first line
 *   - Contains zero or more lines of YAML
 *   - Ends with `---` or `...` on a subsequent line
 *
 * If the block is unclosed (no closing delimiter) or there is no opening
 * `---` on line 1, the content is returned unchanged.
 *
 * `---` blocks that appear elsewhere in the document are never touched.
 */
export function stripFrontmatter(content: string): string {
  if (!content.startsWith('---')) {
    return content;
  }

  // The opening `---` must be the entire first line (allow trailing whitespace)
  const firstNewline = content.indexOf('\n');
  if (firstNewline === -1) {
    // Single-line document starting with `---` – treat as thematic break
    return content;
  }

  const firstLine = content.slice(0, firstNewline);
  if (firstLine.trimEnd() !== '---') {
    return content;
  }

  // Search for the closing `---` or `...` on a line by itself
  const rest = content.slice(firstNewline + 1);
  const lines = rest.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimEnd();
    if (trimmed === '---' || trimmed === '...') {
      // Found the closing delimiter; return everything after it
      const afterFm = lines.slice(i + 1).join('\n');
      // Strip a single leading blank line that was separating frontmatter from body
      return afterFm.startsWith('\n') ? afterFm.slice(1) : afterFm;
    }
  }

  // No closing delimiter – malformed / unclosed frontmatter; leave unchanged
  return content;
}

/**
 * Apply a frontmatter policy to page content.
 *
 * Policies:
 *   - `strip`        – Remove the frontmatter block entirely (default for GitHub Wiki).
 *   - `html-comment` – Same as `strip` for now; reserved for future wrapping in HTML comments.
 *   - `preserve`     – Return the content unchanged.
 */
export function applyFrontmatterPolicy(content: string, policy: FrontmatterPolicy): string {
  switch (policy) {
    case 'strip':
    case 'html-comment':
      return stripFrontmatter(content);
    case 'preserve':
      return content;
    default: {
      // Exhaustiveness guard – TypeScript will flag unhandled additions to FrontmatterPolicy
      const _exhaustive: never = policy;
      throw new Error(`Unknown frontmatter policy: ${_exhaustive}`);
    }
  }
}
