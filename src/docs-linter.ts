import path from 'node:path';
import { promises as fs } from 'node:fs';
import { readJson } from './utils/fs.js';
import { loadConfig } from './config.js';
import { buildRouteSurfaceIndex, cleanDocumentedPathTarget, collectKnownEnvironmentVariables, dedupeRouteValidationFindings, resolveDocumentedPathOnDisk, validateRouteClaims } from './docs-validation.js';
import { classifyDocumentedCommands, extractCiCommands, extractRouteClaims, mergePackageScripts } from './docs-ingestor.js';

export async function lintDocs({ scanDir, repoPath = '.' }) {
  const manifest = await readJson(path.join(scanDir, 'manifest.json'));
  const config = await loadConfig(repoPath);
  const strictness = getDocumentationValidationStrictness(config.documentation?.validation_strictness);
  const issues = [];
  const docs = manifest.documentation?.files || [];
  const repoRoot = path.resolve(repoPath);
  const knownEnvVars = collectKnownEnvironmentVariables(manifest);
  const pathAccessCache = new Map<string, boolean>();
  const routeIndex = buildRouteSurfaceIndex(manifest);

  // Collect merged package scripts from manifest analysis
  const allPackageScripts = mergePackageScripts(manifest);

  // Collect CI commands from scan analysis and refresh workflow YAML files when available.
  const ciCommands = new Set<string>(manifest.analysis?.ci_workflow_commands || []);
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
        for (const command of extractCiCommands(content)) ciCommands.add(command);
      } catch {
        // Skip only the unreadable workflow; other workflows can still validate commands.
      }
    }
  }

  for (const doc of docs) {
    if (doc.stale) {
      pushIssue(issues, issue(config.lint?.stale_docs, strictness, 'standard', 'stale-documentation', `${doc.path} is ${doc.age_days} days old or contains stale-language markers.`));
    }
    if (doc.validation?.contradictions?.length) {
      pushIssue(issues, issue(config.lint?.contradicted_docs, strictness, 'strict', 'contradicted-documentation', `${doc.path} contains ${doc.validation.contradictions.length} claims needing contradiction review.`));
    }
    if (doc.claims?.length && doc.status === 'unvalidated') {
      pushIssue(issues, issue(config.lint?.unvalidated_doc_claims, strictness, 'standard', 'unvalidated-documentation-claims', `${doc.path} has documentation claims with no validation signal.`));
    }

    // Validate documented commands against package scripts and CI workflows
    const docCommands: string[] = doc.validation?.commands || [];
    if (docCommands.length > 0) {
      const classified = classifyDocumentedCommands(docCommands, allPackageScripts, [...ciCommands]);
      for (const cls of classified) {
        if (cls.status === 'missing' && cls.source === 'package_scripts') {
          pushIssue(issues, issue(
            config.lint?.missing_package_scripts,
            strictness,
            'standard',
            'missing-package-script',
            `${doc.path} documents '${cls.command}' but script '${cls.script_name}' is not defined in package.json.`
          ));
        }
      }
    }

    const routeClaims = doc.validation?.route_claims || extractRouteClaims((doc.claims || []).map((claim) => claim.text || '').join('\n'));
    const routeResults = dedupeRouteValidationFindings(validateRouteClaims(routeClaims, routeIndex), doc.path);
    const unvalidatedRouteClaims = routeResults.filter((result) => !result.valid);
    for (const result of unvalidatedRouteClaims) {
      pushIssue(issues, issue(
        config.lint?.unvalidated_route_claims,
        strictness,
        'standard',
        'unvalidated-route-claim',
        `${doc.path}:${result.claim.line} ${result.reason}`
      ));
    }

    const validatedLinkTargets = new Set<string>();
    for (const reference of doc.file_paths || []) {
      const resolved = await resolveDocumentedPathOnDisk(reference.path, doc.path, repoRoot, pathAccessCache, reference.source);
      if (reference.source === 'link') {
        validatedLinkTargets.add(cleanDocumentedPathTarget(reference.path));
      }
      if (!resolved.valid) {
        pushIssue(issues, issue(
          config.lint?.broken_file_references,
          strictness,
          'standard',
          'broken-documented-file-path',
          `${doc.path}:${reference.line} references missing repository path ${reference.path}.`
        ));
      }
    }

    for (const envVar of doc.validation?.env_vars || []) {
      if (!knownEnvVars.has(envVar)) {
        pushIssue(issues, issue(
          config.lint?.unvalidated_env_vars,
          strictness,
          'standard',
          'unvalidated-env-var',
          `${doc.path} mentions ${envVar}, but scanner/config analysis did not find matching source usage.`
        ));
      }
    }

    for (const link of doc.links || []) {
      if (link.startsWith('http') || link.startsWith('#') || link.startsWith('mailto:')) continue;
      const target = cleanDocumentedPathTarget(link);
      if (!target || validatedLinkTargets.has(target)) continue;
      const resolved = await resolveDocumentedPathOnDisk(target, doc.path, repoRoot, pathAccessCache);
      if (!resolved.valid) {
        pushIssue(issues, issue(undefined, strictness, 'standard', 'broken-documentation-link', `${doc.path} links to missing relative target ${link}.`));
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
      strictness,
      errors,
      warnings,
      issues
    }
  };
}

function issue(
  configuredLevel: string | undefined,
  strictness: 'strict' | 'standard' | 'lenient' | 'off',
  defaultSeverity: 'strict' | 'standard',
  code: string,
  message: string
) {
  const resolved = resolveIssueLevel(configuredLevel, strictness, defaultSeverity);
  if (!resolved) return null;
  const normalized = resolved === 'error' ? 'error' : 'warning';
  return { level: normalized, code, message };
}

function pushIssue(issues, candidate) {
  if (candidate) {
    issues.push(candidate);
  }
}

function resolveIssueLevel(configuredLevel: string | undefined, strictness: 'strict' | 'standard' | 'lenient' | 'off', defaultSeverity: 'strict' | 'standard') {
  if (strictness === 'off') return null;
  if (strictness === 'strict') return 'error';
  if (strictness === 'lenient') return 'warning';
  if (configuredLevel === 'error' || configuredLevel === 'warning') {
    return configuredLevel;
  }
  return defaultSeverity === 'strict' ? 'error' : 'warning';
}

function getDocumentationValidationStrictness(value: string | undefined): 'strict' | 'standard' | 'lenient' | 'off' {
  return value === 'strict' || value === 'lenient' || value === 'off' ? value : 'standard';
}
