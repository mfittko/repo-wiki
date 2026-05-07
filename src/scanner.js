import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ensureDir, walkFiles, writeJson } from './utils/fs.js';
import { getGitCommit, getGitRemote } from './utils/git.js';
import { classifyPath, detectLanguage } from './language.js';
import { detectRuntimeHints, extractImports, extractSymbols } from './extractors.js';
import { loadConfig } from './config.js';
import { isDocumentationFile, createDocumentationCard } from './docs-ingestor.js';

const MAX_TEXT_BYTES = 512_000;

export async function scanRepository({ mode, repoPath, outDir, baseRef, headRef }) {
  const absoluteRepo = path.resolve(repoPath);
  const absoluteOut = path.resolve(outDir);
  await ensureDir(absoluteOut);
  await ensureDir(path.join(absoluteOut, 'cards'));

  const config = await loadConfig(absoluteRepo);
  const commit = headRef || await getGitCommit(absoluteRepo);
  const remote = await getGitRemote(absoluteRepo);
  const files = await walkFiles(absoluteRepo);
  const cards = [];
  const documentationCards = [];

  for (const file of files) {
    const buffer = await fs.readFile(file.absolute);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const language = detectLanguage(file.relative);
    const kind = classifyPath(file.relative);
    const isTextCandidate = isLikelyText(file.relative, buffer);
    const content = isTextCandidate && buffer.length <= MAX_TEXT_BYTES ? buffer.toString('utf8') : '';

    const card = {
      kind: 'source_card',
      path: file.relative,
      language,
      category: kind,
      bytes: buffer.length,
      lines: content ? countLines(content) : null,
      sha256: hash,
      imports: content ? extractImports(content, language) : [],
      symbols: content ? extractSymbols(content, language) : [],
      runtime_hints: content ? detectRuntimeHints(file.relative, content) : [],
      skipped_content: !content,
      reasons: inferReasons(file.relative, kind, content)
    };

    cards.push(card);
    await writeJson(path.join(absoluteOut, 'cards', `${safeFileName(file.relative)}.json`), card);

    if (content && isDocumentationFile(file.relative, config)) {
      const documentationCard = await createDocumentationCard({ file, content, config, repoPath: absoluteRepo });
      documentationCards.push(documentationCard);
      await writeJson(path.join(absoluteOut, 'docs', `${safeFileName(file.relative)}.json`), documentationCard);
    }
  }

  const manifest = {
    schema_version: 1,
    mode,
    repo_path: absoluteRepo,
    remote,
    commit,
    base_ref: baseRef || null,
    head_ref: headRef || commit,
    generated_at: new Date().toISOString(),
    config: { documentation: config.documentation, lint: config.lint, wiki: config.wiki },
    totals: summarize(cards, documentationCards),
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

function summarize(cards, documentationCards = []) {
  const languages = {};
  const categories = {};
  const runtimeHints = {};

  for (const card of cards) {
    languages[card.language] = (languages[card.language] || 0) + 1;
    categories[card.category] = (categories[card.category] || 0) + 1;

    for (const hint of card.runtime_hints) {
      runtimeHints[hint] = (runtimeHints[hint] || 0) + 1;
    }
  }

  return { languages, categories, runtime_hints: runtimeHints, documentation: summarizeDocumentation(documentationCards) };
}

function safeFileName(filePath) {
  return filePath.replace(/[^A-Za-z0-9._-]+/g, '__');
}

function countLines(content) {
  if (!content) {
    return 0;
  }
  return content.split('\n').length;
}

function isLikelyText(filePath, buffer) {
  const lower = filePath.toLowerCase();
  const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.zip', '.gz', '.tar', '.ico', '.woff', '.woff2', '.ttf', '.otf'];

  if (binaryExtensions.some((ext) => lower.endsWith(ext))) {
    return false;
  }

  const sample = buffer.subarray(0, Math.min(buffer.length, 4096));
  return !sample.includes(0);
}

function inferReasons(filePath, category, content) {
  const reasons = new Set([category]);
  const lower = filePath.toLowerCase();

  if (lower.endsWith('package.json')) reasons.add('package-manifest');
  if (lower.endsWith('readme.md')) reasons.add('readme');
  if (lower.includes('auth')) reasons.add('auth');
  if (lower.includes('billing') || lower.includes('payment')) reasons.add('billing-or-payment');
  if (lower.includes('route') || lower.includes('controller')) reasons.add('api-surface');
  if (lower.includes('migration') || lower.includes('schema')) reasons.add('data-model');
  if (content && /process\.env\.[A-Z0-9_]+/.test(content)) reasons.add('configuration');

  return [...reasons].sort();
}

function summarizeDocumentation(cards) {
  const statuses = {};
  let stale = 0;
  let claims = 0;
  let commands = 0;
  let envVars = 0;

  for (const card of cards || []) {
    statuses[card.status] = (statuses[card.status] || 0) + 1;
    if (card.stale) stale += 1;
    claims += card.claims?.length || 0;
    commands += card.validation?.commands?.length || 0;
    envVars += card.validation?.env_vars?.length || 0;
  }

  return { files: cards.length, statuses, stale, claims, commands, env_vars: envVars };
}
