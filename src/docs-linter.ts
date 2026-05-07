import path from 'node:path';
import { promises as fs } from 'node:fs';
import { readJson } from './utils/fs.js';
import { loadConfig } from './config.js';

export async function lintDocs({ scanDir, repoPath = '.' }) {
  const manifest = await readJson(path.join(scanDir, 'manifest.json'));
  const config = await loadConfig(repoPath);
  const issues = [];
  const docs = manifest.documentation?.files || [];
  const repoRoot = path.resolve(repoPath);

  for (const doc of docs) {
    if (doc.stale) {
      issues.push(issue(config.lint?.stale_docs || 'warning', 'stale-documentation', `${doc.path} is ${doc.age_days} days old or contains stale-language markers.`));
    }
    if (doc.validation?.contradictions?.length) {
      issues.push(issue(config.lint?.contradicted_docs || 'error', 'contradicted-documentation', `${doc.path} contains ${doc.validation.contradictions.length} claims needing contradiction review.`));
    }
    if (doc.claims?.length && doc.status === 'unvalidated') {
      issues.push(issue(config.lint?.unvalidated_doc_claims || 'warning', 'unvalidated-documentation-claims', `${doc.path} has documentation claims with no validation signal.`));
    }

    for (const link of doc.links || []) {
      if (link.startsWith('http') || link.startsWith('#') || link.startsWith('mailto:')) continue;
      const target = link.split('#')[0];
      if (!target) continue;
      const absolute = path.resolve(path.dirname(path.join(repoRoot, doc.path)), target);
      try {
        await fs.access(absolute);
      } catch {
        issues.push(issue('warning', 'broken-documentation-link', `${doc.path} links to missing relative target ${link}.`));
      }
    }
  }

  const errors = issues.filter((item) => item.level === 'error').length;
  const warnings = issues.filter((item) => item.level === 'warning').length;

  return {
    manifest,
    issues,
    summary: {
      scanned_docs: docs.length,
      errors,
      warnings,
      issues
    }
  };
}

function issue(level, code, message) {
  const normalized = level === 'error' ? 'error' : 'warning';
  return { level: normalized, code, message };
}
