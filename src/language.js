const extensionMap = new Map([
  ['.js', 'JavaScript'],
  ['.mjs', 'JavaScript'],
  ['.cjs', 'JavaScript'],
  ['.jsx', 'JavaScript React'],
  ['.ts', 'TypeScript'],
  ['.tsx', 'TypeScript React'],
  ['.json', 'JSON'],
  ['.md', 'Markdown'],
  ['.yml', 'YAML'],
  ['.yaml', 'YAML'],
  ['.py', 'Python'],
  ['.go', 'Go'],
  ['.rs', 'Rust'],
  ['.java', 'Java'],
  ['.kt', 'Kotlin'],
  ['.rb', 'Ruby'],
  ['.php', 'PHP'],
  ['.cs', 'C#'],
  ['.sql', 'SQL'],
  ['.sh', 'Shell'],
  ['.dockerfile', 'Dockerfile']
]);

export function detectLanguage(filePath) {
  const lower = filePath.toLowerCase();

  if (lower.endsWith('dockerfile') || lower.includes('/dockerfile')) {
    return 'Dockerfile';
  }

  const ext = lower.includes('.') ? lower.slice(lower.lastIndexOf('.')) : '';
  return extensionMap.get(ext) || 'Text';
}

export function classifyPath(filePath) {
  const lower = filePath.toLowerCase();

  if (lower.includes('/test/') || lower.includes('/tests/') || /\.(test|spec)\.[mc]?[jt]sx?$/.test(lower)) {
    return 'test';
  }

  if (lower.startsWith('.github/workflows/') || lower.includes('/ci/') || lower.includes('/.github/')) {
    return 'ci';
  }

  if (lower.includes('/docs/') || lower.endsWith('readme.md') || lower.endsWith('.md')) {
    return 'docs';
  }

  if (lower.includes('/migrations/') || lower.endsWith('.sql')) {
    return 'data';
  }

  if (lower.includes('/infra/') || lower.includes('/terraform/') || lower.includes('/helm/') || lower.includes('/k8s/')) {
    return 'infra';
  }

  if (lower.endsWith('package.json') || lower.endsWith('pnpm-lock.yaml') || lower.endsWith('package-lock.json')) {
    return 'package';
  }

  return 'source';
}
