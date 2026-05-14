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
  const makeTargets = manifest.analysis?.make_targets || [];
  const taskRunnerTargetSources: Array<{ target: string; runner: 'just' | 'taskfile' }> = manifest.analysis?.task_runner_target_sources || [];
  const taskRunnerTargetsByRunner = {
    just: [...new Set(taskRunnerTargetSources.filter((entry) => entry.runner === 'just').map((entry) => entry.target))],
    taskfile: [...new Set(taskRunnerTargetSources.filter((entry) => entry.runner === 'taskfile').map((entry) => entry.target))]
  };

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
    if (doc.adr?.detected && doc.adr?.superseded) {
      const supersededBy = doc.adr?.superseded_by ? ` superseded by ${doc.adr.superseded_by}.` : ' marked superseded.';
      pushIssue(issues, issue(undefined, strictness, 'standard', 'superseded-adr', `${doc.path} is a superseded ADR and should not be treated as current decision context.${supersededBy}`));
    }
    if (doc.adr?.detected && doc.stale && !doc.adr?.has_status_metadata) {
      pushIssue(issues, issue(undefined, strictness, 'standard', 'adr-without-status-metadata', `${doc.path} appears to be an older ADR without explicit status metadata. Add Status/Superseded by/Replaces metadata for recency review.`));
    }

    // Validate documented commands against package scripts and CI workflows
    const docCommands: string[] = doc.validation?.commands || [];
    if (docCommands.length > 0) {
      const classified = classifyDocumentedCommands(docCommands, allPackageScripts, [...ciCommands], {
        makeTargets,
        taskRunnerTargetsByRunner
      });
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
        if (cls.status === 'missing' && cls.source === 'makefile') {
          pushIssue(issues, issue(
            undefined,
            strictness,
            'standard',
            'missing-make-target',
            `${doc.path} documents '${cls.command}' but Makefile target '${cls.target_name}' is not defined.`
          ));
        }
        if (cls.status === 'missing' && cls.source === 'task_runner') {
          pushIssue(issues, issue(
            undefined,
            strictness,
            'standard',
            'missing-task-runner-target',
            `${doc.path} documents '${cls.command}' but task-runner target '${cls.target_name}' is not defined.`
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
        `${formatRouteClaimLocation(doc.path, result)} ${result.reason}`
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

function formatRouteClaimLocation(docPath: string, result: any) {
  const locations = Array.isArray(result.locations) ? result.locations.filter((line) => Number(line) > 0) : [];
  if (locations.length > 0) {
    return `${docPath}:${locations.join(',')}`;
  }
  return `${docPath}:${result.claim.line}`;
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
