export function extractImports(content, language) {
  if (!['JavaScript', 'JavaScript React', 'TypeScript', 'TypeScript React'].includes(language)) {
    return [];
  }

  const imports = new Set();
  const patterns = [
    /import\s+(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g,
    /export\s+[^'";]+\s+from\s+['"]([^'"]+)['"]/g,
    /require\(['"]([^'"]+)['"]\)/g
  ];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      imports.add(match[1]);
    }
  }

  return [...imports].sort();
}

export function extractSymbols(content, language) {
  if (!['JavaScript', 'JavaScript React', 'TypeScript', 'TypeScript React'].includes(language)) {
    return [];
  }

  const symbols = new Set();
  const patterns = [
    /export\s+async\s+function\s+([A-Za-z_$][\w$]*)/g,
    /export\s+function\s+([A-Za-z_$][\w$]*)/g,
    /export\s+class\s+([A-Za-z_$][\w$]*)/g,
    /export\s+const\s+([A-Za-z_$][\w$]*)/g,
    /export\s+let\s+([A-Za-z_$][\w$]*)/g,
    /export\s+var\s+([A-Za-z_$][\w$]*)/g,
    /function\s+([A-Za-z_$][\w$]*)/g,
    /class\s+([A-Za-z_$][\w$]*)/g
  ];

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      symbols.add(match[1]);
    }
  }

  return [...symbols].sort().slice(0, 50);
}

export function detectRuntimeHints(filePath, content) {
  const hints = [];
  const lower = filePath.toLowerCase();

  if (/\b(app|get|post|put|patch|delete)\s*\.\s*(get|post|put|patch|delete|use)\s*\(/.test(content)) {
    hints.push('http-route');
  }

  if (/process\.env\.[A-Z0-9_]+/.test(content)) {
    hints.push('environment-variable');
  }

  if (/cron|schedule|queue|worker|job/i.test(filePath + '\n' + content.slice(0, 2000))) {
    hints.push('background-work');
  }

  if (lower.includes('dockerfile') || lower.includes('docker-compose') || lower.includes('/infra/')) {
    hints.push('deployment');
  }

  return [...new Set(hints)].sort();
}
