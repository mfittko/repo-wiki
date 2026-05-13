import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { DEFAULT_WALK_EXCLUDES, ensureDir, walkFiles, writeJson } from './utils/fs.js';
import { getGitCommit, getGitRemote } from './utils/git.js';
import { classifyPath, detectLanguage } from './language.js';
import {
  detectRuntimeHints,
  extractEnvironmentVariables,
  extractExportedSymbols,
  extractGoPackage,
  extractImports,
  extractMigrationSurfaces,
  extractModelSurfaces,
  extractRouteSurfaces,
  extractSymbols
} from './extractors.js';
import { buildRepositoryAnalysis, extractPackageMetadata } from './repository-analysis.js';
import { loadConfig } from './config.js';
import {
  isDocumentationFile,
  createDocumentationCard,
  extractCiCommandSources,
  extractMakeTargetSources,
  extractJustfileTargetSources,
  extractTaskfileTargetSources
} from './docs-ingestor.js';

const MAX_TEXT_BYTES = 512_000;

type ScannerOptions = {
  mode: string;
  repoPath: string;
  outDir: string;
  baseRef?: string;
  headRef?: string;
};

type AnalysisMetadata = {
  environmentVariables?: string[];
  routeSurfaces?: Array<{ kind?: string; framework?: string; target?: string; methods?: string[]; path?: string; handler?: string | null }>;
  migrationSurfaces?: Array<{ kind: string; id: string | null; name: string | null }>;
  modelSurfaces?: Array<{ name: string; kind: string; framework: string }>;
};

export async function scanRepository({ mode, repoPath, outDir, baseRef, headRef }: ScannerOptions) {
  const absoluteRepo = path.resolve(repoPath);
  const absoluteOut = path.resolve(outDir);
  await ensureDir(absoluteOut);
  await ensureDir(path.join(absoluteOut, 'cards'));

  const config = await loadConfig(absoluteRepo);
  const commit = headRef || await getGitCommit(absoluteRepo);
  const remote = await getGitRemote(absoluteRepo);
  const sourceExclude = Array.isArray(config?.source?.exclude) ? config.source.exclude : [];
  const suppressedNestedRepositories: string[] = [];
  const files = await walkFiles(absoluteRepo, {
    additionalExclude: sourceExclude,
    suppressNestedRepositories: config?.source?.suppress_nested_repositories !== false,
    onSuppressNestedRepository(relativePath) {
      suppressedNestedRepositories.push(relativePath);
    }
  });
  const cards: any[] = [];
  const documentationCards: any[] = [];

  for (const file of files) {
    const stat = await fs.stat(file.absolute);
    const language = detectLanguage(file.relative);
    const kind = classifyPath(file.relative);

    let hash: string;
    let content = '';
    let contentAvailable = false;

    if (stat.size <= MAX_TEXT_BYTES) {
      const buffer = await fs.readFile(file.absolute);
      hash = hashBuffer(buffer);
      contentAvailable = isLikelyText(file.relative, buffer);
      content = contentAvailable ? buffer.toString('utf8') : '';
    } else {
      hash = await hashFile(file.absolute);
    }
    const packageMetadata = contentAvailable ? extractPackageMetadata(file.relative, content) : null;
    const ciWorkflowCommandSources = contentAvailable && kind === 'ci' ? extractCiCommandSources(content) : [];
    const ciWorkflowCommands = [...new Set(ciWorkflowCommandSources.map((entry) => entry.command))];
    const lowerBaseName = path.basename(file.relative).toLowerCase();
    const makeTargetSources = contentAvailable && lowerBaseName === 'makefile' ? extractMakeTargetSources(content) : [];
    const makeTargets = [...new Set(makeTargetSources.map((entry) => entry.target))];
    const taskRunnerTargetSources = getTaskRunnerTargetSources(lowerBaseName, content, contentAvailable);
    const taskRunnerTargets = [...new Set(taskRunnerTargetSources.map((entry) => entry.target))];
    const goPackage = (language === 'Go' && contentAvailable) ? extractGoPackage(content, language) : null;
    const imports = contentAvailable ? extractImports(content, language) : [];
    const symbols = contentAvailable ? extractSymbols(content, language) : [];
    const exportedSymbols = contentAvailable ? extractExportedSymbols(content, language) : [];
    const environmentVariables = contentAvailable ? mergeEnvironmentVariables(
      extractEnvironmentVariables(content, language),
      extractConfiguredEnvironmentVariables(file.relative, content)
    ) : [];
    const routeSurfaces = contentAvailable ? extractRouteSurfaces(file.relative, content, language) : [];
    const migrationSurfaces = extractMigrationSurfaces(file.relative, language);
    const modelSurfaces = contentAvailable ? extractModelSurfaces(file.relative, content, language) : [];
    let runtimeHints: string[] = [];
    if (contentAvailable) {
      runtimeHints = detectRuntimeHints(file.relative, content, {
        language,
        environmentVariables,
        routeSurfaces,
        migrationSurfaces,
        modelSurfaces
      });
    } else if (migrationSurfaces.length > 0) {
      runtimeHints = detectRuntimeHints(file.relative, '', { language, migrationSurfaces, modelSurfaces });
    }

    const card = {
      kind: 'source_card',
      path: file.relative,
      language,
      category: kind,
      bytes: stat.size,
      lines: contentAvailable ? countLines(content) : null,
      sha256: hash,
      imports,
      symbols,
      exported_symbols: exportedSymbols,
      environment_variables: environmentVariables,
      route_surfaces: routeSurfaces,
      migration_surfaces: migrationSurfaces,
      model_surfaces: modelSurfaces,
      runtime_hints: runtimeHints,
      ...(packageMetadata || {}),
      ...(ciWorkflowCommands.length ? { ci_workflow_commands: ciWorkflowCommands } : {}),
      ...(ciWorkflowCommandSources.length ? { ci_workflow_command_sources: ciWorkflowCommandSources } : {}),
      ...(makeTargets.length ? { make_targets: makeTargets } : {}),
      ...(makeTargetSources.length ? { make_target_sources: makeTargetSources } : {}),
      ...(taskRunnerTargets.length ? { task_runner_targets: taskRunnerTargets } : {}),
      ...(taskRunnerTargetSources.length ? { task_runner_target_sources: taskRunnerTargetSources } : {}),
      ...(goPackage !== null ? { go_package: goPackage } : {}),
      skipped_content: !contentAvailable,
      reasons: inferReasons(file.relative, kind, content, { environmentVariables, routeSurfaces, migrationSurfaces, modelSurfaces })
    };

    cards.push(card);
    await writeJson(path.join(absoluteOut, 'cards', `${safeFileName(file.relative)}.json`), card);

    if (contentAvailable && isDocumentationFile(file.relative, config)) {
      const documentationCard = await createDocumentationCard({ file, content, config, repoPath: absoluteRepo });
      documentationCards.push(documentationCard);
      await writeJson(path.join(absoluteOut, 'docs', `${safeFileName(file.relative)}.json`), documentationCard);
    }
  }

  const analysis = buildRepositoryAnalysis(cards);

  const manifest = {
    schema_version: 1,
    mode,
    repo_path: absoluteRepo,
    remote,
    commit,
    base_ref: baseRef || null,
    head_ref: headRef || commit,
    generated_at: new Date().toISOString(),
    config: {
      source: {
        ...config.source,
        effective_exclude: [...new Set([...DEFAULT_WALK_EXCLUDES, ...sourceExclude])],
        suppressed_nested_repositories: [...new Set(suppressedNestedRepositories)].sort()
      },
      documentation: config.documentation,
      compiler: redactSecretConfig(config.compiler),
      lint: config.lint,
      wiki: config.wiki
    },
    totals: summarize(cards, documentationCards),
    analysis,
    documentation: {
      enabled: config.documentation?.ingest !== false,
      authority: config.documentation?.authority || 'secondary',
      files: documentationCards,
      summary: summarizeDocumentation(documentationCards)
    },
    files: cards
  };

  await writeJson(path.join(absoluteOut, 'manifest.json'), manifest);

  return {
    manifest,
    summary: {
      mode,
      commit,
      files: cards.length,
      languages: manifest.totals.languages,
      categories: manifest.totals.categories,
      documentation: manifest.documentation.summary,
      outDir: absoluteOut
    }
  };
}

function redactSecretConfig(value: any): any {
  if (Array.isArray(value)) {
    return value.map((entry) => redactSecretConfig(entry));
  }

  if (value && typeof value === 'object') {
    const redacted: Record<string, any> = {};
    for (const [key, entry] of Object.entries(value)) {
      redacted[key] = isSecretConfigKey(key) ? '[REDACTED]' : redactSecretConfig(entry);
    }
    return redacted;
  }

  return value;
}

function isSecretConfigKey(key: string) {
  if (/env$/i.test(key)) {
    return false;
  }
  if (/api[_-]?key/i.test(key)) {
    return true;
  }
  return /(?:^|[_-])(?:access[_-]?token|auth[_-]?token|refresh[_-]?token|id[_-]?token|client[_-]?secret|secret[_-]?key|private[_-]?key|password|credentials?|token|secret)(?:$|[_-](?:value|file|path))$/i.test(key);
}

function summarize(cards: Array<{ language: string; category: string; runtime_hints: string[] }>, documentationCards: any[] = []) {
  const languages: Record<string, number> = {};
  const categories: Record<string, number> = {};
  const runtimeHints: Record<string, number> = {};

  for (const card of cards) {
    languages[card.language] = (languages[card.language] || 0) + 1;
    categories[card.category] = (categories[card.category] || 0) + 1;

    for (const hint of card.runtime_hints) {
      runtimeHints[hint] = (runtimeHints[hint] || 0) + 1;
    }
  }

  return { languages, categories, runtime_hints: runtimeHints, documentation: summarizeDocumentation(documentationCards) };
}

function mergeEnvironmentVariables(...groups: string[][]) {
  return [...new Set(groups.flat())].sort();
}

function extractConfiguredEnvironmentVariables(filePath: string, content: string) {
  const lower = filePath.toLowerCase();
  const names = new Set<string>();

  if (/(^|\/)\.env(?:\.|$)/.test(lower) || lower.endsWith('/.env') || lower === '.env') {
    for (const line of content.split('\n')) {
      const match = /^\s*(?:export\s+)?([A-Z][A-Z0-9_]{2,})\s*=/.exec(line);
      if (match) names.add(match[1]);
    }
  }

  if (lower.endsWith('dockerfile') || lower.includes('/dockerfile')) {
    for (const line of content.split('\n')) {
      const instruction = /^\s*(ENV|ARG)\s+(.+)$/i.exec(line);
      if (!instruction) continue;
      for (const token of tokenizeDockerEnvInstruction(instruction[2])) {
        const match = /^([A-Z][A-Z0-9_]{2,})(?:=.*)?$/.exec(token);
        if (match) names.add(match[1]);
      }
    }
  }

  if (/\.(ya?ml|json|toml)$/.test(lower) || lower.includes('schema') || lower.includes('config')) {
    for (const match of content.matchAll(/\b(?:env|env_var|env_vars|environment_variable|environment_variables)\b\s*[:=]\s*['"]?([A-Z][A-Z0-9_]{2,})['"]?/gi)) {
      names.add(match[1]);
    }
  }

  return [...names].sort();
}

function tokenizeDockerEnvInstruction(value: string) {
  return value.match(/"[^"]*"|'[^']*'|\S+/g)?.map((token) => token.replace(/^['"]|['"]$/g, '')) || [];
}

function hashBuffer(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function hashFile(filePath: string): Promise<string> {
  const hash = crypto.createHash('sha256');
  await pipeline(
    createReadStream(filePath),
    new Writable({
      write(chunk, encoding, callback) {
        hash.update(typeof chunk === 'string' ? Buffer.from(chunk, encoding) : chunk);
        callback();
      }
    })
  );
  return hash.digest('hex');
}

function safeFileName(filePath: string) {
  return filePath.replace(/[^A-Za-z0-9._-]+/g, '__');
}

function countLines(content: string) {
  if (!content) {
    return 0;
  }
  return content.split('\n').length;
}

function isLikelyText(filePath: string, buffer: Buffer) {
  const lower = filePath.toLowerCase();
  const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.zip', '.gz', '.tar', '.ico', '.woff', '.woff2', '.ttf', '.otf'];

  if (binaryExtensions.some((ext) => lower.endsWith(ext))) {
    return false;
  }

  const sample = buffer.subarray(0, Math.min(buffer.length, 4096));
  return !sample.includes(0);
}

function inferReasons(filePath: string, category: string, content: string, metadata: AnalysisMetadata = {}) {
  const reasons = new Set([category]);
  const lower = filePath.toLowerCase();

  if (lower.endsWith('package.json')) reasons.add('package-manifest');
  if (lower.endsWith('readme.md')) reasons.add('readme');
  if (lower.includes('auth')) reasons.add('auth');
  if (lower.includes('billing') || lower.includes('payment')) reasons.add('billing-or-payment');
  if (lower.includes('route') || lower.includes('controller') || (metadata.routeSurfaces || []).length > 0) reasons.add('api-surface');
  if (lower.includes('migration') || lower.includes('schema') || (metadata.migrationSurfaces || []).length > 0 || (metadata.modelSurfaces || []).length > 0) reasons.add('data-model');
  if ((metadata.migrationSurfaces || []).length > 0) reasons.add('database-migration');
  if ((metadata.modelSurfaces || []).length > 0) reasons.add('orm-model');
  if ((metadata.environmentVariables || []).length > 0 || (content && /process\.env\.[A-Z0-9_]+/.test(content))) reasons.add('configuration');

  return [...reasons].sort();
}

function summarizeDocumentation(cards: any[]) {
  const statuses: Record<string, number> = {};
  let stale = 0;
  let claims = 0;
  let commands = 0;
  let envVars = 0;
  let filePaths = 0;

  for (const card of cards || []) {
    statuses[card.status] = (statuses[card.status] || 0) + 1;
    if (card.stale) stale += 1;
    claims += card.claims?.length || 0;
    commands += card.validation?.commands?.length || 0;
    envVars += card.validation?.env_vars?.length || 0;
    filePaths += card.file_paths?.length || 0;
  }

  return { files: cards.length, statuses, stale, claims, commands, env_vars: envVars, file_paths: filePaths };
}

function getTaskRunnerTargetSources(lowerBaseName: string, content: string, contentAvailable: boolean) {
  if (!contentAvailable) return [];
  if (lowerBaseName === 'justfile') return extractJustfileTargetSources(content);
  if (lowerBaseName === 'taskfile.yml' || lowerBaseName === 'taskfile.yaml') return extractTaskfileTargetSources(content);
  return [];
}
