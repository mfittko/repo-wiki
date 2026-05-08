import path from 'node:path';
import { promises as fs } from 'node:fs';
import { readJson } from './utils/fs.js';
import { loadConfig } from './config.js';
import { classifyDocumentedCommands, extractCiCommands, mergePackageScripts } from './docs-ingestor.js';

export async function lintDocs({ scanDir, repoPath = '.' }) {
  const manifest = await readJson(path.join(scanDir, 'manifest.json'));
  const config = await loadConfig(repoPath);
  const issues = [];
  const docs = manifest.documentation?.files || [];
  const repoRoot = path.resolve(repoPath);

  // Collect merged package scripts from manifest analysis
  const allPackageScripts = mergePackageScripts(manifest);

  // Collect CI commands from workflow YAML files
  const ciCommands: string[] = [];
  const workflowsDir = path.join(repoRoot, '.github', 'workflows');
  let workflowFiles: string[] = [];
  try {
    workflowFiles = await fs.readdir(workflowsDir);
  } catch {
    // No .github/workflows directory — acceptable
  }
  for (const wf of workflowFiles) {
    if (wf.endsWith('.yml') || wf.endsWith('.yaml')) {
      try {
        const content = await fs.readFile(path.join(workflowsDir, wf), 'utf8');
        ciCommands.push(...extractCiCommands(content));
      } catch {
        // Skip only the unreadable workflow; other workflows can still validate commands.
      }
    }
  }

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

    // Validate documented commands against package scripts and CI workflows
    const docCommands: string[] = doc.validation?.commands || [];
    if (docCommands.length > 0) {
      const classified = classifyDocumentedCommands(docCommands, allPackageScripts, ciCommands);
      for (const cls of classified) {
        if (cls.status === 'missing' && cls.source === 'package_scripts') {
          issues.push(issue(
            config.lint?.missing_package_scripts || 'warning',
            'missing-package-script',
            `${doc.path} documents 'npm run ${cls.script_name}' but script '${cls.script_name}' is not defined in package.json.`
          ));
        }
      }
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
