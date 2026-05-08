import path from 'node:path';
import { readJson, writeJson } from './utils/fs.js';

export async function createBootstrapPlan({ scanDir, outFile }) {
  const manifest = await readJson(path.join(scanDir, 'manifest.json'));
  const modules = groupIntoModules(manifest.files);
  const pages = createPagePlan(manifest, modules);

  const plan = {
    schema_version: 1,
    mode: manifest.mode || 'bootstrap',
    repo_path: manifest.repo_path,
    remote: manifest.remote,
    commit: manifest.commit,
    generated_at: new Date().toISOString(),
    phases: [
      {
        name: 'foundation',
        purpose: 'Create core navigation and agent entry points.',
        pages: pages.filter((page) => page.phase === 'foundation').map((page) => page.path)
      },
      {
        name: 'modules',
        purpose: 'Create module/service/package pages from top-level source groupings.',
        pages: pages.filter((page) => page.phase === 'modules').map((page) => page.path)
      },
      {
        name: 'cross-cutting',
        purpose: 'Create API, data, infrastructure, testing, and security pages.',
        pages: pages.filter((page) => page.phase === 'cross-cutting').map((page) => page.path)
      },
      {
        name: 'link-and-lint',
        purpose: 'Update navigation pages, verify links, flag gaps, and prepare publication.',
        pages: ['Index.md', '_Sidebar.md', 'Open-Questions.md', 'Documentation-Debt-Report.md', 'Log.md']
      }
    ],
    modules,
    pages
  };

  await writeJson(outFile, plan);

  return {
    plan,
    summary: {
      pages: pages.length,
      modules: modules.length,
      outFile
    }
  };
}

function groupIntoModules(files) {
  const groups = new Map();

  for (const file of files) {
    if (file.skipped_content && file.bytes > 1_000_000) {
      continue;
    }

    const groupName = inferGroupName(file.path);
    const existing = groups.get(groupName) || {
      name: groupName,
      slug: slugify(groupName),
      files: [],
      categories: {},
      languages: {},
      runtime_hints: {},
      important_reasons: new Set()
    };

    existing.files.push(file.path);
    existing.categories[file.category] = (existing.categories[file.category] || 0) + 1;
    existing.languages[file.language] = (existing.languages[file.language] || 0) + 1;

    for (const hint of file.runtime_hints || []) {
      existing.runtime_hints[hint] = (existing.runtime_hints[hint] || 0) + 1;
    }

    for (const reason of file.reasons || []) {
      existing.important_reasons.add(reason);
    }

    groups.set(groupName, existing);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      important_reasons: [...group.important_reasons].sort(),
      files: group.files.sort()
    }))
    .sort((a, b) => b.files.length - a.files.length || a.name.localeCompare(b.name));
}

function inferGroupName(filePath) {
  const parts = filePath.split('/');

  if (parts[0] === 'apps' && parts[1]) return `Service ${parts[1]}`;
  if (parts[0] === 'services' && parts[1]) return `Service ${parts[1]}`;
  if (parts[0] === 'packages' && parts[1]) return `Package ${parts[1]}`;
  if (parts[0] === 'src' && parts[1]) return `Module ${parts[1]}`;
  if (parts[0] === 'lib' && parts[1]) return `Module ${parts[1]}`;
  if (parts[0] === 'infra') return 'Infrastructure';
  if (parts[0] === 'docs') return 'Documentation';
  if (parts[0] === '.github') return 'CI and Automation';

  return 'Repository Root';
}

function createPagePlan(manifest, modules) {
  const foundation = [
    page('Home.md', 'foundation', 'Human and agent entry point.'),
    page('_Sidebar.md', 'foundation', 'GitHub Wiki navigation sidebar.'),
    page('Index.md', 'foundation', 'Full page index and routing map.'),
    page('Log.md', 'foundation', 'Chronological compilation log.'),
    page('Agent-Context-Pack.md', 'foundation', 'Small, high-signal entry page for coding agents.'),
    page('Repository-Overview.md', 'foundation', 'Repository purpose, languages, and structure.'),
    page('Architecture.md', 'foundation', 'Architecture summary inferred from source layout.'),
    page('Build-Test-and-Run.md', 'foundation', 'Detected build, test, and run commands.'),
    page('Open-Questions.md', 'foundation', 'Known gaps and uncertain inferences.'),
    page('Documentation-Debt-Report.md', 'foundation', 'Markdown documentation validation, staleness, and claim-confidence report.')
  ];

  const modulePages = modules
    .filter((module) => module.files.length >= 1)
    .slice(0, 50)
    .map((module) => page(`${module.slug}.md`, 'modules', `Compiled page for ${module.name}.`, module.name));

  const crossCutting = [
    page('Dependency-Map.md', 'cross-cutting', 'Internal and external dependency overview.'),
    page('Testing-Strategy.md', 'cross-cutting', 'Detected tests and verification strategy.'),
    page('Configuration-and-Environment.md', 'cross-cutting', 'Environment variables and configuration surfaces.'),
    page('Security-and-Secrets.md', 'cross-cutting', 'Security-sensitive areas and secret-handling policy.'),
    page('Operational-Runbook.md', 'cross-cutting', 'Operational commands, deployment, and troubleshooting notes.')
  ];

  if (manifest.totals.runtime_hints?.['http-route']) {
    crossCutting.push(page('API-HTTP-Routes.md', 'cross-cutting', 'Detected HTTP routing surfaces.'));
  }

  if (hasDataModelSignals(manifest)) {
    crossCutting.push(page('Data-Model-and-Migrations.md', 'cross-cutting', 'Data models, migrations, and schema-related files.'));
  }

  return [...foundation, ...modulePages, ...crossCutting];
}

function page(path, phase, purpose, moduleName = null) {
  return { path, phase, purpose, moduleName };
}

function hasDataModelSignals(manifest: any) {
  if (manifest.totals.categories?.data) {
    return true;
  }

  if (manifest.totals.runtime_hints?.['data-model'] || manifest.totals.runtime_hints?.['orm-model'] || manifest.totals.runtime_hints?.['database-migration']) {
    return true;
  }

  return (manifest.files || []).some((file) =>
    file.reasons?.includes('data-model') ||
    (file.migration_surfaces || []).length > 0 ||
    (file.model_surfaces || []).length > 0
  );
}

function slugify(value) {
  return value
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'Page';
}
