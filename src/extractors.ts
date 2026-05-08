import * as ts from 'typescript';

const JAVASCRIPT_LANGUAGES = new Set([
  'JavaScript',
  'JavaScript React',
  'TypeScript',
  'TypeScript React'
]);
const PYTHON_LANGUAGE = 'Python';
const SYMBOL_LIMIT = 50;

const GO_LANGUAGE = 'Go';
const RUST_LANGUAGE = 'Rust';

const ROUTE_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'all', 'use'];
const NEST_ROUTE_DECORATORS = ['Get', 'Post', 'Put', 'Patch', 'Delete', 'Options', 'Head', 'All'];
const MAX_GRAPHQL_RESOLVER_BODY_LENGTH = 2000;
const MAX_OPENAPI_REGISTER_BODY_LENGTH = 1000;

type RuntimeHintMetadata = {
  language?: string;
  routeSurfaces?: Array<{ kind?: string; framework?: string; target?: string; methods?: string[]; path?: string; handler?: string | null }>;
  environmentVariables?: string[];
  migrationSurfaces?: Array<{ kind: string; id: string | null; name: string | null }>;
  modelSurfaces?: Array<{ name: string; kind: string; framework: string }>;
};

type JavaScriptAstMetadata = {
  symbols: Set<string>;
  exported: Array<{ name: string; kind: string }>;
};

type GoDeclarations = {
  allSymbols: string[];
  exported: Array<{ name: string; kind: string }>;
};

type RustDeclarations = {
  imports: string[];
  allSymbols: string[];
  exported: Array<{ name: string; kind: string }>;
};

let lastJavaScriptAstMetadata: {
  content: string;
  language: string;
  metadata: JavaScriptAstMetadata | null;
} | null = null;

let lastGoDeclarations: {
  content: string;
  declarations: GoDeclarations;
} | null = null;

let lastRustDeclarations: {
  content: string;
  declarations: RustDeclarations;
} | null = null;

export function extractImports(content: string, language: string): string[] {
  if (language === GO_LANGUAGE) {
    return extractGoImports(content);
  }

  if (language === RUST_LANGUAGE) {
    return getRustDeclarations(content).imports;
  }

  if (isPython(language)) {
    return extractPythonImports(content);
  }

  if (!isJavaScriptLike(language)) {
    return [];
  }

  const imports = new Set<string>();
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

export function extractSymbols(content: string, language: string): string[] {
  if (language === GO_LANGUAGE) {
    return getGoDeclarations(content).allSymbols;
  }

  if (language === RUST_LANGUAGE) {
    return getRustDeclarations(content).allSymbols;
  }

  if (isPython(language)) {
    return extractPythonSymbols(content);
  }

  if (!isJavaScriptLike(language)) {
    return [];
  }

  const ast = extractJavaScriptAstMetadata(content, language);
  if (ast) {
    return [...ast.symbols].sort().slice(0, SYMBOL_LIMIT);
  }

  /* c8 ignore start: retained for unexpected TypeScript parser failures */
  const fallbackSymbols = new Set<string>();
  const fallbackPatterns = [
    /export\s+async\s+function\s+([A-Za-z_$][\w$]*)/g,
    /export\s+function\s+([A-Za-z_$][\w$]*)/g,
    /export\s+class\s+([A-Za-z_$][\w$]*)/g,
    /export\s+const\s+([A-Za-z_$][\w$]*)/g,
    /export\s+let\s+([A-Za-z_$][\w$]*)/g,
    /export\s+var\s+([A-Za-z_$][\w$]*)/g,
    /function\s+([A-Za-z_$][\w$]*)/g,
    /class\s+([A-Za-z_$][\w$]*)/g
  ];

  for (const pattern of fallbackPatterns) {
    for (const match of content.matchAll(pattern)) {
      fallbackSymbols.add(match[1]);
    }
  }

  return [...fallbackSymbols].sort().slice(0, SYMBOL_LIMIT);
  /* c8 ignore stop */
}

export function extractExportedSymbols(content: string, language: string): Array<{ name: string; kind: string }> {
  if (language === GO_LANGUAGE) {
    return getGoDeclarations(content).exported;
  }

  if (language === RUST_LANGUAGE) {
    return getRustDeclarations(content).exported;
  }

  if (!isJavaScriptLike(language)) {
    return [];
  }

  const ast = extractJavaScriptAstMetadata(content, language);
  if (ast) {
    return [...ast.exported]
      .sort((left, right) => left.name.localeCompare(right.name) || left.kind.localeCompare(right.kind))
      .slice(0, SYMBOL_LIMIT);
  }

  /* c8 ignore start: retained for unexpected TypeScript parser failures */
  const exported: Array<{ name: string; kind: string }> = [];
  const seen = new Set<string>();
  const directPatterns = [
    { pattern: /export\s+default\s+async\s+function\s+([A-Za-z_$][\w$]*)/g, kind: 'function' },
    { pattern: /export\s+default\s+function(?:\s+([A-Za-z_$][\w$]*))?\s*\(/g, kind: 'function', allowDefaultName: true },
    { pattern: /export\s+default\s+class(?:\s+([A-Za-z_$][\w$]*))?/g, kind: 'class', allowDefaultName: true },
    { pattern: /export\s+async\s+function\s+([A-Za-z_$][\w$]*)/g, kind: 'function' },
    { pattern: /export\s+function\s+([A-Za-z_$][\w$]*)/g, kind: 'function' },
    { pattern: /export\s+class\s+([A-Za-z_$][\w$]*)/g, kind: 'class' },
    { pattern: /export\s+const\s+([A-Za-z_$][\w$]*)/g, kind: 'const' },
    { pattern: /export\s+let\s+([A-Za-z_$][\w$]*)/g, kind: 'let' },
    { pattern: /export\s+var\s+([A-Za-z_$][\w$]*)/g, kind: 'var' },
    { pattern: /export\s+type\s+([A-Za-z_$][\w$]*)/g, kind: 'type' },
    { pattern: /export\s+interface\s+([A-Za-z_$][\w$]*)/g, kind: 'interface' },
    { pattern: /export\s+enum\s+([A-Za-z_$][\w$]*)/g, kind: 'enum' }
  ];

  for (const { pattern, kind, allowDefaultName = false } of directPatterns) {
    for (const match of content.matchAll(pattern)) {
      const name = match[1] || (allowDefaultName ? 'default' : null);
      if (!name) {
        continue;
      }

      pushExportedSymbol(exported, seen, { name, kind });
    }
  }

  for (const match of content.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const name of parseNamedExports(match[1])) {
      pushExportedSymbol(exported, seen, { name, kind: 'named-export' });
    }
  }

  return exported
    .sort((left, right) => left.name.localeCompare(right.name) || left.kind.localeCompare(right.kind))
    .slice(0, SYMBOL_LIMIT);
  /* c8 ignore stop */
}

export function extractEnvironmentVariables(content: string, language: string): string[] {
  if (!isJavaScriptLike(language)) {
    return [];
  }

  const names = new Set<string>();
  const directPatterns = [
    /process\.env(?:\?\.|\.)\s*([A-Za-z_][A-Za-z0-9_]*)/g,
    /process\.env\s*\[\s*['"]([A-Za-z_][A-Za-z0-9_]*)['"]\s*\]/g,
    /import\.meta\.env(?:\?\.|\.)\s*([A-Za-z_][A-Za-z0-9_]*)/g,
    /import\.meta\.env\s*\[\s*['"]([A-Za-z_][A-Za-z0-9_]*)['"]\s*\]/g
  ];

  for (const pattern of directPatterns) {
    for (const match of content.matchAll(pattern)) {
      names.add(match[1]);
    }
  }

  collectDestructuredEnvNames(content, /(?:const|let|var)\s*\{([^}]+)\}\s*=\s*process\.env\b/g, names);
  collectDestructuredEnvNames(content, /(?:const|let|var)\s*\{([^}]+)\}\s*=\s*import\.meta\.env\b/g, names);

  return [...names].sort();
}

export function extractRouteSurfaces(filePath: string, content: string, language: string): Array<{ kind: string; framework: string; target: string; methods: string[]; path: string; handler: string | null }> {
  if (!isJavaScriptLike(language)) {
    return [];
  }

  const surfaces = [];
  const seen = new Set();
  const targets = inferRouteTargets(content);
  const callPattern = new RegExp(
    `([A-Za-z_$][\\w$]*)\\s*\\.\\s*(${ROUTE_METHODS.join('|')})\\s*\\(\\s*(['"\`])([^'"\`]+)\\3`,
    'g'
  );

  for (const match of content.matchAll(callPattern)) {
    const target = match[1];
    const handler = inferHandlerName(content, (match.index || 0) + match[0].length);
    pushRouteSurface(surfaces, seen, {
      kind: 'http-route',
      framework: inferRouteFramework(target, targets),
      target,
      methods: [match[2].toUpperCase()],
      path: match[4],
      handler
    });
  }

  for (const match of content.matchAll(/([A-Za-z_$][\w$]*)\s*\.\s*route\s*\(\s*\{([\s\S]{0,500}?)\}\s*\)/g)) {
    const methods = parseRouteMethods(match[2]);
    const routePath = match[2].match(/\b(?:url|path)\s*:\s*(['"`])([^'"`]+)\1/);

    if (!methods.length || !routePath) {
      continue;
    }

    const handler = match[2].match(/\bhandler\s*:\s*([A-Za-z_$][\w$]*)\b/)?.[1] || null;
    pushRouteSurface(surfaces, seen, {
      kind: 'http-route',
      framework: inferRouteFramework(match[1], targets),
      target: match[1],
      methods,
      path: routePath[2],
      handler
    });
  }

  extractNestRouteSurfaces(content, surfaces, seen);
  extractTrpcRouteSurfaces(content, surfaces, seen);
  extractGraphqlRouteSurfaces(content, surfaces, seen);
  extractOpenApiRouteSurfaces(content, surfaces, seen);

  const routeHandlerPath = inferFileRoutePath(filePath);
  if (routeHandlerPath) {
    const routeHandlerPatterns = [
      /export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s*\(/g,
      /export\s+const\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s*=/g
    ];

    for (const pattern of routeHandlerPatterns) {
      for (const match of content.matchAll(pattern)) {
        pushRouteSurface(surfaces, seen, {
          kind: 'http-route',
          framework: 'route-handler',
          target: 'module',
          methods: [match[1]],
          path: routeHandlerPath,
          handler: match[1]
        });
      }
    }
  }

  return surfaces.sort(compareRouteSurfaces);
}

export function extractMigrationSurfaces(filePath: string, language: string): Array<{ kind: string; id: string | null; name: string | null }> {
  const normalized = normalizePath(filePath);
  const lower = normalized.toLowerCase();
  const isSqlLike = language === 'SQL' || lower.endsWith('.sql');
  const inMigrationDirectory = /(^|\/)(?:db\/)?migrations?\//.test(lower) || /(^|\/)prisma\/migrations\//.test(lower);

  if (!isSqlLike) {
    return [];
  }

  const baseName = normalized.split('/').pop() || normalized;
  const extensionless = baseName.replace(/\.[^.]+$/, '');
  const looksLikeMigrationFile =
    /^v\d+(?:[._]\d+)*__.+$/i.test(extensionless) ||
    /^\d{3,}[._-].+$/i.test(extensionless) ||
    /^.+\.(?:up|down)$/i.test(extensionless) ||
    /^migration$/i.test(extensionless);

  if (!inMigrationDirectory && !looksLikeMigrationFile) {
    return [];
  }

  const prismaMigration = normalized.match(/(?:^|\/)prisma\/migrations\/([^/]+)\/migration\.sql$/i);
  if (prismaMigration) {
    const folder = prismaMigration[1];
    return [{
      kind: 'prisma-migration',
      id: extractMigrationId(folder),
      name: cleanMigrationName(folder)
    }];
  }

  const flywayMatch = extensionless.match(/^v([0-9][0-9._]*)__(.+)$/i);
  if (flywayMatch) {
    return [{
      kind: 'sql-migration',
      id: flywayMatch[1].replace(/_/g, '.'),
      name: cleanMigrationName(flywayMatch[2])
    }];
  }

  return [{
    kind: 'sql-migration',
    id: extractMigrationId(extensionless),
    name: cleanMigrationName(extensionless)
  }];
}

export function extractModelSurfaces(filePath: string, content: string, language: string): Array<{ name: string; kind: string; framework: string }> {
  const surfaces: Array<{ name: string; kind: string; framework: string }> = [];
  const seen = new Set<string>();
  const lower = filePath.toLowerCase();

  if (lower.endsWith('schema.prisma')) {
    for (const match of content.matchAll(/(?:^|\n)\s*model\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g)) {
      pushModelSurface(surfaces, seen, { name: match[1], kind: 'model', framework: 'prisma' });
    }
  }

  if (isJavaScriptLike(language)) {
    const hasSequelizeSignal = /\bfrom\s+['"]sequelize['"]|require\(\s*['"]sequelize['"]\s*\)|\bsequelize\s*\./.test(content);

    for (const match of content.matchAll(/@Entity(?:\s*\([^)]*\))?(?:\s*@[\w$]+(?:\s*\([^)]*\))?)*\s*(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/g)) {
      pushModelSurface(surfaces, seen, { name: match[1], kind: 'entity', framework: 'typeorm' });
    }

    if (hasSequelizeSignal) {
      for (const match of content.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)\s+extends\s+Model\b/g)) {
        pushModelSurface(surfaces, seen, { name: match[1], kind: 'model', framework: 'sequelize' });
      }
    }

    for (const match of content.matchAll(/sequelize\s*\.\s*define\s*\(\s*['"`]([A-Za-z_$][\w$]*)['"`]/g)) {
      pushModelSurface(surfaces, seen, { name: match[1], kind: 'model', framework: 'sequelize' });
    }

    for (const match of content.matchAll(/mongoose\s*\.\s*model\s*\(\s*['"`]([A-Za-z_$][\w$]*)['"`]/g)) {
      pushModelSurface(surfaces, seen, { name: match[1], kind: 'model', framework: 'mongoose' });
    }
  }

  return surfaces
    .sort((left, right) => left.name.localeCompare(right.name) || left.framework.localeCompare(right.framework) || left.kind.localeCompare(right.kind))
    .slice(0, 50);
}

export function detectRuntimeHints(filePath: string, content: string, metadata: RuntimeHintMetadata = {}): string[] {
  const hints = [];
  const lower = filePath.toLowerCase();
  const language = metadata.language || inferRuntimeHintLanguage(filePath);
  const routeSurfaces = metadata.routeSurfaces || extractRouteSurfaces(filePath, content, language);
  const environmentVariables = metadata.environmentVariables || extractEnvironmentVariables(content, language);
  const migrationSurfaces = metadata.migrationSurfaces || extractMigrationSurfaces(filePath, language);
  const modelSurfaces = metadata.modelSurfaces || extractModelSurfaces(filePath, content, language);

  if (routeSurfaces.length > 0) {
    hints.push('http-route');
  }

  if (environmentVariables.length > 0) {
    hints.push('environment-variable');
  }

  if (migrationSurfaces.length > 0) {
    hints.push('database-migration');
  }

  if (modelSurfaces.length > 0) {
    hints.push('orm-model');
  }

  if (migrationSurfaces.length > 0 || modelSurfaces.length > 0) {
    hints.push('data-model');
  }

  if (/cron|schedule|queue|worker|job/i.test(filePath + '\n' + content.slice(0, 2000))) {
    hints.push('background-work');
  }

  if (lower.includes('dockerfile') || lower.includes('docker-compose') || lower.includes('/infra/')) {
    hints.push('deployment');
  }

  return [...new Set(hints)].sort();
}

export function extractGoPackage(content: string, language: string): string | null {
  if (language !== GO_LANGUAGE) {
    return null;
  }

  const code = stripGoCommentsAndLiterals(content);
  const match = code.match(/^\s*package\s+([A-Za-z_]\w*)\b/m);
  return match ? match[1] : null;
}

function inferRuntimeHintLanguage(filePath: string) {
  return filePath.toLowerCase().endsWith('.sql') ? 'SQL' : 'JavaScript';
}

function isJavaScriptLike(language) {
  return JAVASCRIPT_LANGUAGES.has(language);
}

function isPython(language: string) {
  return language === PYTHON_LANGUAGE;
}

function extractPythonImports(content: string): string[] {
  const imports = new Set<string>();
  const lines = stripPythonTripleQuotedStrings(content).split(/\r?\n/);

  for (const rawLine of lines) {
    if (!isTopLevelLine(rawLine)) {
      continue;
    }

    const line = stripInlineComment(rawLine).trim();
    if (!line) {
      continue;
    }

    const importMatch = line.match(/^import\s+(.+)$/);
    if (importMatch) {
      for (const entry of importMatch[1].split(',')) {
        const specifier = entry.trim().split(/\s+as\s+/i)[0]?.trim();
        if (specifier && /^[A-Za-z_][\w.]*$/.test(specifier)) {
          imports.add(specifier);
        }
      }
      continue;
    }

    const fromMatch = line.match(/^from\s+([.\w]+)\s+import\s+/);
    if (fromMatch) {
      imports.add(fromMatch[1]);
    }
  }

  return [...imports].sort();
}

function extractPythonSymbols(content: string): string[] {
  const symbols = new Set<string>();
  const lines = stripPythonTripleQuotedStrings(content).split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const rawLine = lines[lineIndex];
    if (!isTopLevelLine(rawLine)) {
      continue;
    }

    const line = stripInlineComment(rawLine).trim();
    if (!line) {
      continue;
    }

    if (line.startsWith('async def ')) {
      const asyncSignature = collectPythonSignature(lines, lineIndex);
      const asyncFunction = findPythonFunctionName(asyncSignature.signature, true);
      if (asyncFunction) {
        symbols.add(asyncFunction);
        lineIndex = asyncSignature.endLineIndex;
      }
      continue;
    }

    if (line.startsWith('def ')) {
      const functionSignature = collectPythonSignature(lines, lineIndex);
      const functionName = findPythonFunctionName(functionSignature.signature, false);
      if (functionName) {
        symbols.add(functionName);
        lineIndex = functionSignature.endLineIndex;
      }
      continue;
    }

    const classMatch = line.match(/^class\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\([^)]*\))?\s*:/);
    if (classMatch) {
      symbols.add(classMatch[1]);
      continue;
    }

    const constantName = findPythonModuleConstant(line);
    if (constantName) {
      symbols.add(constantName);
    }
  }

  return [...symbols].sort().slice(0, SYMBOL_LIMIT);
}

function stripInlineComment(line: string) {
  let quote: '"' | "'" | null = null;
  for (let charIndex = 0; charIndex < line.length; charIndex += 1) {
    const current = line[charIndex];

    if (quote) {
      if (current === '\\') {
        charIndex += 1;
        continue;
      }
      if (current === quote) {
        quote = null;
      }
      continue;
    }

    if (current === '"' || current === "'") {
      quote = current;
      continue;
    }

    if (current === '#') {
      return line.slice(0, charIndex);
    }
  }

  return line;
}

function isTopLevelLine(line: string) {
  return /^\S/.test(line);
}

function stripPythonTripleQuotedStrings(content: string) {
  let result = '';
  let tripleQuote: "'''" | '"""' | null = null;
  let inlineQuote: '"' | "'" | null = null;

  for (let charIndex = 0; charIndex < content.length; charIndex += 1) {
    const current = content[charIndex];

    if (tripleQuote) {
      if (content.startsWith(tripleQuote, charIndex) && !isEscaped(content, charIndex)) {
        tripleQuote = null;
        charIndex += 2;
      } else if (current === '\n') {
        result += '\n';
      }
      continue;
    }

    if (inlineQuote) {
      result += current;
      if (current === '\\') {
        charIndex += 1;
        result += content[charIndex] || '';
        continue;
      }
      if (current === inlineQuote) {
        inlineQuote = null;
      }
      continue;
    }

    if (content.startsWith("'''", charIndex)) {
      tripleQuote = "'''";
      charIndex += 2;
      continue;
    }

    if (content.startsWith('"""', charIndex)) {
      tripleQuote = '"""';
      charIndex += 2;
      continue;
    }

    if (current === '"' || current === "'") {
      inlineQuote = current;
    }

    result += current;
  }

  return result;
}

function isEscaped(content: string, charIndex: number) {
  let slashCount = 0;
  for (let index = charIndex - 1; index >= 0 && content[index] === '\\'; index -= 1) {
    slashCount += 1;
  }
  return slashCount % 2 === 1;
}

function collectPythonSignature(lines: string[], startLineIndex: number) {
  const signatureParts: string[] = [];
  let lineIndex = startLineIndex;
  let consumedUntil = startLineIndex;
  let parenthesesDepth = 0;
  let sawColon = false;

  for (; lineIndex < lines.length; lineIndex += 1) {
    const sourceLine = lines[lineIndex];
    const currentLine = stripInlineComment(sourceLine).trim();
    if (!currentLine) {
      if (lineIndex > startLineIndex) {
        break;
      }
      continue;
    }

    if (lineIndex > startLineIndex && isTopLevelLine(sourceLine) && parenthesesDepth <= 0) {
      break;
    }

    signatureParts.push(currentLine);
    consumedUntil = lineIndex;
    parenthesesDepth += countParenthesisDelta(currentLine);
    sawColon = sawColon || hasTopLevelColon(currentLine);
    if (sawColon && parenthesesDepth <= 0) {
      break;
    }
  }

  return {
    signature: signatureParts.join(' '),
    endLineIndex: consumedUntil
  };
}

function findPythonFunctionName(line: string, isAsyncFunction: boolean) {
  const prefix = isAsyncFunction ? 'async def ' : 'def ';
  if (!line.startsWith(prefix)) {
    return null;
  }

  const rest = line.slice(prefix.length);
  const nameMatch = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*/);
  if (!nameMatch) {
    return null;
  }

  const name = nameMatch[1];
  const signatureStart = prefix.length + nameMatch[0].length;
  if (line[signatureStart] !== '(') {
    return null;
  }

  const signatureEnd = findMatchingParenthesis(line, signatureStart);
  if (signatureEnd < 0) {
    return null;
  }

  const suffix = line.slice(signatureEnd + 1).trim();
  if (suffix.startsWith(':')) {
    return name;
  }
  if (suffix.startsWith('->')) {
    return suffix.includes(':') ? name : null;
  }

  return null;
}

function findPythonModuleConstant(line: string): string | null {
  const assignmentOffset = findTopLevelAssignmentOffset(line);
  if (assignmentOffset < 0) {
    return null;
  }

  const lhs = line.slice(0, assignmentOffset).trim();
  const match = lhs.match(/^([A-Z][A-Z0-9_]*)(?:\s*:.+?)?$/);
  return match ? match[1] : null;
}

function findTopLevelAssignmentOffset(line: string) {
  let quote: '"' | "'" | null = null;
  let parenthesesDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;

  for (let charIndex = 0; charIndex < line.length; charIndex += 1) {
    const current = line[charIndex];

    if (quote) {
      if (current === '\\') {
        charIndex += 1;
        continue;
      }
      if (current === quote) {
        quote = null;
      }
      continue;
    }

    if (current === '"' || current === "'") {
      quote = current;
      continue;
    }

    if (current === '(') {
      parenthesesDepth += 1;
      continue;
    }
    if (current === ')' && parenthesesDepth > 0) {
      parenthesesDepth -= 1;
      continue;
    }
    if (current === '[') {
      bracketDepth += 1;
      continue;
    }
    if (current === ']' && bracketDepth > 0) {
      bracketDepth -= 1;
      continue;
    }
    if (current === '{') {
      braceDepth += 1;
      continue;
    }
    if (current === '}' && braceDepth > 0) {
      braceDepth -= 1;
      continue;
    }

    if (current !== '=' || parenthesesDepth > 0 || bracketDepth > 0 || braceDepth > 0) {
      continue;
    }

    const previous = line[charIndex - 1];
    const next = line[charIndex + 1];
    if (previous === '=' || previous === '!' || previous === '<' || previous === '>') {
      continue;
    }
    if (next === '=') {
      continue;
    }
    return charIndex;
  }

  return -1;
}

function findMatchingParenthesis(line: string, startOffset: number) {
  let quote: '"' | "'" | null = null;
  let depth = 0;

  for (let charIndex = startOffset; charIndex < line.length; charIndex += 1) {
    const current = line[charIndex];

    if (quote) {
      if (current === '\\') {
        charIndex += 1;
        continue;
      }
      if (current === quote) {
        quote = null;
      }
      continue;
    }

    if (current === '"' || current === "'") {
      quote = current;
      continue;
    }

    if (current === '(') {
      depth += 1;
      continue;
    }

    if (current === ')') {
      depth -= 1;
      if (depth === 0) {
        return charIndex;
      }
    }
  }

  return -1;
}

function countParenthesisDelta(line: string) {
  let quote: '"' | "'" | null = null;
  let depth = 0;

  for (let charIndex = 0; charIndex < line.length; charIndex += 1) {
    const current = line[charIndex];

    if (quote) {
      if (current === '\\') {
        charIndex += 1;
        continue;
      }
      if (current === quote) {
        quote = null;
      }
      continue;
    }

    if (current === '"' || current === "'") {
      quote = current;
      continue;
    }

    if (current === '(') {
      depth += 1;
    } else if (current === ')') {
      depth -= 1;
    }
  }

  return depth;
}

function hasTopLevelColon(line: string) {
  let quote: '"' | "'" | null = null;
  let parenthesesDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;

  for (let charIndex = 0; charIndex < line.length; charIndex += 1) {
    const current = line[charIndex];

    if (quote) {
      if (current === '\\') {
        charIndex += 1;
        continue;
      }
      if (current === quote) {
        quote = null;
      }
      continue;
    }

    if (current === '"' || current === "'") {
      quote = current;
      continue;
    }

    if (current === '(') {
      parenthesesDepth += 1;
      continue;
    }
    if (current === ')' && parenthesesDepth > 0) {
      parenthesesDepth -= 1;
      continue;
    }
    if (current === '[') {
      bracketDepth += 1;
      continue;
    }
    if (current === ']' && bracketDepth > 0) {
      bracketDepth -= 1;
      continue;
    }
    if (current === '{') {
      braceDepth += 1;
      continue;
    }
    if (current === '}' && braceDepth > 0) {
      braceDepth -= 1;
      continue;
    }

    if (current === ':' && parenthesesDepth === 0 && bracketDepth === 0 && braceDepth === 0) {
      return true;
    }
  }

  return false;
}

function extractJavaScriptAstMetadata(content: string, language: string): JavaScriptAstMetadata | null {
  if (lastJavaScriptAstMetadata?.content === content && lastJavaScriptAstMetadata.language === language) {
    return lastJavaScriptAstMetadata.metadata;
  }

  try {
    const sourceFile = ts.createSourceFile(
      language.startsWith('TypeScript') ? 'module.ts' : 'module.js',
      content,
      ts.ScriptTarget.Latest,
      true,
      language === 'TypeScript React'
        ? ts.ScriptKind.TSX
        : language === 'TypeScript'
          ? ts.ScriptKind.TS
          : language === 'JavaScript React'
            ? ts.ScriptKind.JSX
            : ts.ScriptKind.JS
    );

    const symbols = new Set<string>();
    const exported: Array<{ name: string; kind: string }> = [];
    const seenExported = new Set<string>();
    const declarationKinds = collectTopLevelDeclarationKinds(sourceFile);

    for (const statement of sourceFile.statements) {
      const modifierFlags = getModifierFlags(statement);

      if (ts.isFunctionDeclaration(statement)) {
        if (statement.name) {
          const name = statement.name.text;
          symbols.add(name);
          if (modifierFlags.defaultExport) {
            pushExportedSymbol(exported, seenExported, { name: 'default', kind: 'function' });
          } else if (modifierFlags.exported) {
            pushExportedSymbol(exported, seenExported, { name, kind: 'function' });
          }
        } else if (modifierFlags.defaultExport) {
          symbols.add('default');
          pushExportedSymbol(exported, seenExported, { name: 'default', kind: 'function' });
        }
        continue;
      }

      if (ts.isClassDeclaration(statement)) {
        if (statement.name) {
          const name = statement.name.text;
          symbols.add(name);
          if (modifierFlags.defaultExport) {
            pushExportedSymbol(exported, seenExported, { name: 'default', kind: 'class' });
          } else if (modifierFlags.exported) {
            pushExportedSymbol(exported, seenExported, { name, kind: 'class' });
          }
        } else if (modifierFlags.defaultExport) {
          symbols.add('default');
          pushExportedSymbol(exported, seenExported, { name: 'default', kind: 'class' });
        }
        continue;
      }

      if (ts.isInterfaceDeclaration(statement)) {
        const name = statement.name.text;
        symbols.add(name);
        if (modifierFlags.exported) {
          pushExportedSymbol(exported, seenExported, { name: statement.name.text, kind: 'interface' });
        }
        continue;
      }

      if (ts.isTypeAliasDeclaration(statement)) {
        const name = statement.name.text;
        symbols.add(name);
        if (modifierFlags.exported) {
          pushExportedSymbol(exported, seenExported, { name: statement.name.text, kind: 'type' });
        }
        continue;
      }

      if (ts.isEnumDeclaration(statement)) {
        const name = statement.name.text;
        symbols.add(name);
        if (modifierFlags.exported) {
          pushExportedSymbol(exported, seenExported, { name: statement.name.text, kind: 'enum' });
        }
        continue;
      }

      if (ts.isVariableStatement(statement)) {
        const kind = statement.declarationList.flags & ts.NodeFlags.Const
          ? 'const'
          : statement.declarationList.flags & ts.NodeFlags.Let
            ? 'let'
            : 'var';
        for (const declaration of statement.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) {
            const name = declaration.name.text;
            symbols.add(name);
            if (modifierFlags.exported) {
              pushExportedSymbol(exported, seenExported, { name, kind });
            }
          }
        }
        continue;
      }

      if (ts.isExportAssignment(statement) && !statement.isExportEquals) {
        symbols.add('default');
        pushExportedSymbol(exported, seenExported, {
          name: 'default',
          kind: inferDefaultExportKind(statement.expression, declarationKinds)
        });
        continue;
      }

      if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) {
          pushExportedSymbol(exported, seenExported, { name: element.name.text, kind: 'named-export' });
        }
      }
    }

    const metadata = { symbols, exported };
    lastJavaScriptAstMetadata = { content, language, metadata };
    return metadata;
  } catch {
    lastJavaScriptAstMetadata = { content, language, metadata: null };
    return null;
  }
}

function collectTopLevelDeclarationKinds(sourceFile: ts.SourceFile): Map<string, string> {
  const declarationKinds = new Map<string, string>();

  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      declarationKinds.set(statement.name.text, 'function');
      continue;
    }

    if (ts.isClassDeclaration(statement) && statement.name) {
      declarationKinds.set(statement.name.text, 'class');
      continue;
    }

    if (ts.isInterfaceDeclaration(statement)) {
      declarationKinds.set(statement.name.text, 'interface');
      continue;
    }

    if (ts.isTypeAliasDeclaration(statement)) {
      declarationKinds.set(statement.name.text, 'type');
      continue;
    }

    if (ts.isEnumDeclaration(statement)) {
      declarationKinds.set(statement.name.text, 'enum');
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      const kind = statement.declarationList.flags & ts.NodeFlags.Const
        ? 'const'
        : statement.declarationList.flags & ts.NodeFlags.Let
          ? 'let'
          : 'var';
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          declarationKinds.set(declaration.name.text, kind);
        }
      }
    }
  }

  return declarationKinds;
}

function inferDefaultExportKind(expression: ts.Expression, declarationKinds: Map<string, string>): string {
  if (ts.isIdentifier(expression)) {
    return declarationKinds.get(expression.text) || 'default';
  }

  if (ts.isFunctionExpression(expression) || ts.isArrowFunction(expression)) {
    return 'function';
  }

  if (ts.isClassExpression(expression)) {
    return 'class';
  }

  return 'default';
}

function getModifierFlags(node: ts.Node): { exported: boolean; defaultExport: boolean } {
  if (!ts.canHaveModifiers(node)) {
    return { exported: false, defaultExport: false };
  }

  const modifiers = ts.getModifiers(node) || [];
  return {
    exported: modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword),
    defaultExport: modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)
  };
}

function pushExportedSymbol(
  exported: Array<{ name: string; kind: string }>,
  seen: Set<string>,
  symbol: { name: string; kind: string }
) {
  const key = `${symbol.name}\u0000${symbol.kind}`;
  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  exported.push(symbol);
}

function parseNamedExports(specifierList) {
  return specifierList
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.replace(/^type\s+/, ''))
    .map((entry) => entry.split(/\s+as\s+/i).pop()?.trim() || '')
    .filter((name) => /^[A-Za-z_$][\w$]*$/.test(name));
}

function collectDestructuredEnvNames(content, pattern, names) {
  for (const match of content.matchAll(pattern)) {
    for (const entry of match[1].split(',')) {
      const trimmed = entry.trim();
      if (!trimmed || trimmed.startsWith('...')) {
        continue;
      }

      const withoutDefault = trimmed.split('=')[0].trim();
      const key = withoutDefault.split(':')[0].trim();
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
        names.add(key);
      }
    }
  }
}

function inferRouteTargets(content) {
  const targets = new Map();
  const routerFactoryFramework = inferRouterFactoryFramework(content);
  const patterns = [
    { pattern: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*express\s*\(/g, framework: 'express' },
    { pattern: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*express\s*\.\s*Router\s*\(/g, framework: 'express' },
    { pattern: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:new\s+)?Router\s*\(/g, framework: routerFactoryFramework },
    { pattern: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:fastify|Fastify)\s*\(/g, framework: 'fastify' },
    { pattern: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*new\s+Hono\s*\(/g, framework: 'hono' },
    { pattern: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*new\s+Koa\s*\(/g, framework: 'koa' }
  ];

  for (const { pattern, framework } of patterns) {
    for (const match of content.matchAll(pattern)) {
      targets.set(match[1], framework);
    }
  }

  return targets;
}

function inferRouteFramework(target, targets) {
  if (targets.has(target)) {
    return targets.get(target);
  }

  if (/koa/i.test(target)) {
    return 'koa';
  }

  if (/fastify/i.test(target)) {
    return 'fastify';
  }

  if (/router/i.test(target)) {
    return 'router';
  }

  if (/app|server/i.test(target)) {
    return 'http-server';
  }

  return 'unknown';
}

function inferHandlerName(content, offset) {
  const tail = content.slice(offset, offset + 160);
  return tail.match(/^\s*,\s*([A-Za-z_$][\w$]*)\b/)?.[1] || null;
}

function extractNestRouteSurfaces(content, surfaces, seen) {
  const controllers = [...content.matchAll(/@Controller\s*\(\s*(?:['"`]([^'"`]*)['"`])?\s*\)\s*(?:export\s+)?class\s+([A-Za-z_$][\w$]*)/g)];
  if (!controllers.length) {
    return;
  }

  for (let index = 0; index < controllers.length; index += 1) {
    const controller = controllers[index];
    const basePath = controller[1] || '';
    const className = controller[2];
    const segmentStart = (controller.index || 0) + controller[0].length;
    const segmentEnd = index + 1 < controllers.length ? (controllers[index + 1].index || content.length) : content.length;
    const segment = content.slice(segmentStart, segmentEnd);
    const methodPattern = new RegExp(
      `@(${NEST_ROUTE_DECORATORS.join('|')})\\s*\\(\\s*(?:['"\`]([^'"\`]*)['"\`])?\\s*\\)\\s*(?:public|private|protected)?\\s*(?:static\\s+)?(?:async\\s+)?([A-Za-z_$][\\w$]*)\\s*\\(`,
      'g'
    );

    for (const match of segment.matchAll(methodPattern)) {
      const routePath = combineRoutePath(basePath, match[2] || '');
      pushRouteSurface(surfaces, seen, {
        kind: 'http-route',
        framework: 'nestjs',
        target: className,
        methods: [match[1].toUpperCase()],
        path: routePath,
        handler: match[3]
      });
    }
  }
}

function extractTrpcRouteSurfaces(content, surfaces, seen) {
  if (!/\b(?:@trpc\/server|initTRPC|createTRPCRouter|t\s*\.\s*router)\b/.test(content)) {
    return;
  }

  const procedurePattern = /\b([A-Za-z_$][\w$]*)\s*:\s*(?:[A-Za-z_$][\w$]*Procedure|[A-Za-z_$][\w$]*\s*\.\s*procedure|procedure)\s*\.\s*(query|mutation|subscription)\s*\(/g;
  for (const match of content.matchAll(procedurePattern)) {
    pushRouteSurface(surfaces, seen, {
      kind: 'rpc-route',
      framework: 'trpc',
      target: 'router',
      methods: [match[2].toUpperCase()],
      path: `/${match[1]}`,
      handler: match[1]
    });
  }
}

function extractGraphqlRouteSurfaces(content, surfaces, seen) {
  if (!/\b(?:graphql|gql|apollo)\b/i.test(content)) {
    return;
  }

  for (const block of content.matchAll(/\b(Query|Mutation|Subscription)\s*:\s*\{/g)) {
    const openBraceIndex = (block.index || 0) + block[0].length - 1;
    const body = readBalancedObjectBody(content, openBraceIndex, MAX_GRAPHQL_RESOLVER_BODY_LENGTH);
    if (!body) {
      continue;
    }

    for (const field of body.matchAll(/\b([A-Za-z_$][\w$]*)\s*:/g)) {
      if (!isTopLevelObjectKey(body, field.index || 0)) {
        continue;
      }

      const valueStart = (field.index || 0) + field[0].length;
      const tail = body.slice(valueStart, valueStart + 220);
      if (!isLikelyGraphqlOperationValue(body, valueStart, tail)) {
        continue;
      }

      pushRouteSurface(surfaces, seen, {
        kind: 'graphql-operation',
        framework: 'graphql',
        target: block[1],
        methods: [block[1].toUpperCase()],
        path: '/graphql',
        handler: field[1]
      });
    }
  }
}

function extractOpenApiRouteSurfaces(content, surfaces, seen) {
  if (!/\b(?:openapi|swagger|registerPath)\b/i.test(content)) {
    return;
  }

  for (const match of content.matchAll(/([A-Za-z_$][\w$]*)\s*\.\s*registerPath\s*\(\s*\{/g)) {
    const openBraceIndex = (match.index || 0) + match[0].length - 1;
    const body = readBalancedObjectBody(content, openBraceIndex, MAX_OPENAPI_REGISTER_BODY_LENGTH);
    if (!body) {
      continue;
    }

    const method = body.match(/\bmethod\s*:\s*['"`]([A-Za-z]+)['"`]/)?.[1];
    const routePath = body.match(/\bpath\s*:\s*['"`]([^'"`]+)['"`]/)?.[1];
    if (!method || !routePath) {
      continue;
    }

    pushRouteSurface(surfaces, seen, {
      kind: 'openapi-operation',
      framework: 'openapi',
      target: match[1],
      methods: [method.toUpperCase()],
      path: routePath,
      handler: body.match(/\boperationId\s*:\s*['"`]([^'"`]+)['"`]/)?.[1] || null
    });
  }
}

/**
 * Normalize and merge controller-level and method-level route segments.
 */
function combineRoutePath(basePath, routePath) {
  const parts = [basePath, routePath]
    .map((value) => (value || '').trim())
    .filter((value) => value.length > 0)
    .map((value) => value.replace(/^\/+|\/+$/g, ''));
  return `/${parts.join('/')}`.replace(/\/+/g, '/');
}

function inferRouterFactoryFramework(content) {
  return /['"](?:@koa\/router|koa-router)['"]/.test(content) ? 'koa' : 'express';
}

/**
 * Read the body of a `{ ... }` object literal from source text with bounded scanning.
 */
function readBalancedObjectBody(content, openBraceIndex, maxBodyLength) {
  if (content[openBraceIndex] !== '{') {
    return null;
  }

  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  const scanLimit = Math.min(content.length, openBraceIndex + maxBodyLength + 500);
  for (let index = openBraceIndex; index < scanLimit; index += 1) {
    const token = content[index];

    if (inLineComment) {
      if (token === '\n') {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (token === '*' && content[index + 1] === '/') {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (inSingleQuote) {
      if (!escaped && token === '\'') {
        inSingleQuote = false;
      }
      escaped = !escaped && token === '\\';
      continue;
    }

    if (inDoubleQuote) {
      if (!escaped && token === '"') {
        inDoubleQuote = false;
      }
      escaped = !escaped && token === '\\';
      continue;
    }

    if (inTemplate) {
      if (!escaped && token === '`') {
        inTemplate = false;
      }
      escaped = !escaped && token === '\\';
      continue;
    }

    escaped = false;
    if (token === '/' && content[index + 1] === '/') {
      inLineComment = true;
      index += 1;
      continue;
    }
    if (token === '/' && content[index + 1] === '*') {
      inBlockComment = true;
      index += 1;
      continue;
    }
    if (token === '\'') {
      inSingleQuote = true;
      continue;
    }
    if (token === '"') {
      inDoubleQuote = true;
      continue;
    }
    if (token === '`') {
      inTemplate = true;
      continue;
    }

    if (token === '{') {
      depth += 1;
      continue;
    }
    if (token !== '}') {
      continue;
    }

    depth -= 1;
    if (depth !== 0) {
      continue;
    }

    const body = content.slice(openBraceIndex + 1, index);
    if (body.length > maxBodyLength) {
      return null;
    }

    return body;
  }

  return null;
}

/**
 * Heuristic: GraphQL resolver map entries should map field names to callable values.
 */
function isLikelyGraphqlResolverValue(value) {
  // Only treat resolver entries as API surfaces when the mapped value looks callable.
  return /^\s*(?:async\s*)?(?:function\b|\(|[A-Za-z_$][\w$]*\s*\()/m.test(value);
}

function isLikelyGraphqlOperationValue(body, valueStart, valueTail) {
  if (isLikelyGraphqlResolverValue(valueTail)) {
    return true;
  }

  const leadingOffset = valueTail.match(/^\s*/)?.[0]?.length || 0;
  const objectStart = valueStart + leadingOffset;
  if (body[objectStart] !== '{') {
    return false;
  }

  const configBody = readBalancedObjectBody(body, objectStart, 500);
  if (!configBody) {
    return false;
  }

  for (const field of configBody.matchAll(/\bresolve\s*:/g)) {
    if (!isTopLevelObjectKey(configBody, field.index || 0)) {
      continue;
    }

    const resolveTail = configBody.slice((field.index || 0) + field[0].length, (field.index || 0) + field[0].length + 220);
    if (isLikelyGraphqlResolverValue(resolveTail)) {
      return true;
    }
  }

  return false;
}

function isTopLevelObjectKey(content, index) {
  let braceDepth = 0;
  let bracketDepth = 0;
  let parenDepth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  for (let cursor = 0; cursor < index; cursor += 1) {
    const token = content[cursor];

    if (inLineComment) {
      if (token === '\n') {
        inLineComment = false;
      }
      continue;
    }
    if (inBlockComment) {
      if (token === '*' && content[cursor + 1] === '/') {
        inBlockComment = false;
        cursor += 1;
      }
      continue;
    }
    if (inSingleQuote) {
      if (!escaped && token === '\'') {
        inSingleQuote = false;
      }
      escaped = !escaped && token === '\\';
      continue;
    }
    if (inDoubleQuote) {
      if (!escaped && token === '"') {
        inDoubleQuote = false;
      }
      escaped = !escaped && token === '\\';
      continue;
    }
    if (inTemplate) {
      if (!escaped && token === '`') {
        inTemplate = false;
      }
      escaped = !escaped && token === '\\';
      continue;
    }

    escaped = false;
    if (token === '/' && content[cursor + 1] === '/') {
      inLineComment = true;
      cursor += 1;
      continue;
    }
    if (token === '/' && content[cursor + 1] === '*') {
      inBlockComment = true;
      cursor += 1;
      continue;
    }
    if (token === '\'') {
      inSingleQuote = true;
      continue;
    }
    if (token === '"') {
      inDoubleQuote = true;
      continue;
    }
    if (token === '`') {
      inTemplate = true;
      continue;
    }

    if (token === '{') {
      braceDepth += 1;
      continue;
    }
    if (token === '}') {
      braceDepth = Math.max(0, braceDepth - 1);
      continue;
    }
    if (token === '[') {
      bracketDepth += 1;
      continue;
    }
    if (token === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1);
      continue;
    }
    if (token === '(') {
      parenDepth += 1;
      continue;
    }
    if (token === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
    }
  }

  return braceDepth === 0 && bracketDepth === 0 && parenDepth === 0;
}

function parseRouteMethods(body) {
  const value = body.match(/\bmethod\s*:\s*(\[[^\]]+\]|['"`][^'"`]+['"`])/);
  if (!value) {
    return [];
  }

  if (value[1].startsWith('[')) {
    return [...value[1].matchAll(/['"`]([A-Za-z]+)['"`]/g)].map((match) => match[1].toUpperCase()).sort();
  }

  const method = value[1].match(/['"`]([A-Za-z]+)['"`]/)?.[1];
  return method ? [method.toUpperCase()] : [];
}

function inferFileRoutePath(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  const extensionless = normalized.replace(/\.[^.]+$/, '');

  if (/(^|\/)pages\/api\//.test(extensionless)) {
    return `/${extensionless.replace(/^.*?pages\/api\//, 'api/')}`.replace(/\/index$/, '');
  }

  if (/(^|\/)app\/api\//.test(extensionless) && /\/route$/i.test(extensionless)) {
    return `/${extensionless.replace(/^.*?app\//, '').replace(/\/route$/i, '')}`;
  }

  if (/\/(api|routes?)\//.test(extensionless) && /\/(index|route)$/i.test(extensionless)) {
    return `/${extensionless.replace(/^.*?\/(api|routes?)\//, '$1/').replace(/\/(index|route)$/i, '')}`;
  }

  return null;
}

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

function extractMigrationId(value: string): string | null {
  const match = value.match(/^(\d{3,})/);
  return match ? match[1] : null;
}

function cleanMigrationName(value: string): string | null {
  const readable = value
    .replace(/^v\d+(?:[._]\d+)*__/i, '')
    .replace(/^(\d{3,})(?:[._-]+)?/i, '')
    .replace(/\.(?:up|down)$/i, '')
    .replace(/^migration[._-]?/i, '')
    .replace(/[_-]+/g, ' ')
    .trim();

  return readable || null;
}

function pushModelSurface(
  surfaces: Array<{ name: string; kind: string; framework: string }>,
  seen: Set<string>,
  surface: { name: string; kind: string; framework: string }
) {
  const key = `${surface.framework}\u0000${surface.kind}\u0000${surface.name}`;
  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  surfaces.push(surface);
}

function pushRouteSurface(surfaces, seen, surface) {
  const normalizedSurface = {
    ...surface,
    methods: [...new Set(surface.methods)].sort(),
    handler: surface.handler || null
  };
  const key = [
    normalizedSurface.framework,
    normalizedSurface.target,
    normalizedSurface.path,
    normalizedSurface.methods.join(','),
    normalizedSurface.handler || ''
  ].join('\u0000');

  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  surfaces.push(normalizedSurface);
}

function compareRouteSurfaces(left, right) {
  if (left.path !== right.path) {
    return left.path.localeCompare(right.path);
  }

  const leftMethods = left.methods.join(',');
  const rightMethods = right.methods.join(',');
  if (leftMethods !== rightMethods) {
    return leftMethods.localeCompare(rightMethods);
  }

  if (left.framework !== right.framework) {
    return left.framework.localeCompare(right.framework);
  }

  if (left.target !== right.target) {
    return left.target.localeCompare(right.target);
  }

  return (left.handler || '').localeCompare(right.handler || '');
}

function stripGoComments(content: string): string {
  let output = '';
  let index = 0;

  while (index < content.length) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '/' && next === '/') {
      output += '  ';
      index += 2;
      while (index < content.length && content[index] !== '\n') {
        output += ' ';
        index += 1;
      }
      continue;
    }

    if (char === '/' && next === '*') {
      output += '  ';
      index += 2;
      while (index < content.length && !(content[index] === '*' && content[index + 1] === '/')) {
        output += content[index] === '\n' ? '\n' : ' ';
        index += 1;
      }
      if (index < content.length) {
        output += '  ';
        index += 2;
      }
      continue;
    }

    output += char;
    index += 1;
  }

  return output;
}

function stripGoCommentsAndLiterals(content: string): string {
  const withoutComments = stripGoComments(content);
  let output = '';
  let index = 0;

  while (index < withoutComments.length) {
    const char = withoutComments[index];

    if (char === '`') {
      output += ' ';
      index += 1;
      while (index < withoutComments.length && withoutComments[index] !== '`') {
        output += withoutComments[index] === '\n' ? '\n' : ' ';
        index += 1;
      }
      if (index < withoutComments.length) {
        output += ' ';
        index += 1;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      const quote = char;
      output += ' ';
      index += 1;
      while (index < withoutComments.length) {
        const current = withoutComments[index];
        if (current === '\\') {
          output += ' ';
          index += 1;
          if (index < withoutComments.length) {
            output += withoutComments[index] === '\n' ? '\n' : ' ';
            index += 1;
          }
          continue;
        }
        output += current === '\n' ? '\n' : ' ';
        index += 1;
        if (current === quote) {
          break;
        }
      }
      continue;
    }

    output += char;
    index += 1;
  }

  return output;
}

function extractGoImports(content: string): string[] {
  const imports = new Set<string>();
  const code = stripGoComments(content);

  // Single import: import "path"
  for (const match of code.matchAll(/^\s*import\s+"([^"]+)"/mg)) {
    imports.add(match[1]);
  }

  // Block import: import (\n  "path1"\n  alias "path2"\n)
  for (const match of code.matchAll(/^\s*import\s*\(([\s\S]*?)^\s*\)/mg)) {
    for (const pathMatch of match[1].matchAll(/"([^"]+)"/g)) {
      imports.add(pathMatch[1]);
    }
  }

  return [...imports].sort();
}

function getGoDeclarations(content: string): GoDeclarations {
  if (lastGoDeclarations?.content === content) {
    return lastGoDeclarations.declarations;
  }

  const declarations = computeGoDeclarations(content);
  lastGoDeclarations = { content, declarations };
  return declarations;
}

function computeGoDeclarations(content: string): GoDeclarations {
  const code = stripGoCommentsAndLiterals(content);
  const symbols = new Set<string>();
  const exported: Array<{ name: string; kind: string }> = [];
  const seenExported = new Set<string>();

  const addSymbol = (name: string, kind: string) => {
    symbols.add(name);
    if (/^[A-Z]/.test(name)) {
      pushExportedSymbol(exported, seenExported, { name, kind });
    }
  };

  // Functions and methods: func [(receiver)] Name( or Name[ or Name{
  for (const match of code.matchAll(/^func\s+(?:\([^)]*\)\s+)?([A-Za-z_]\w*)\s*[([{]/mg)) {
    addSymbol(match[1], 'func');
  }

  // Type declarations: type Name [TypeParams] struct / interface / other
  for (const match of code.matchAll(/^type\s+([A-Za-z_]\w*)(?:\[[^\]]*\])?\s+(struct|interface|[^\s{])/mg)) {
    const name = match[1];
    const typeWord = match[2];
    const kind = typeWord === 'struct' ? 'struct'
      : typeWord === 'interface' ? 'interface'
      : 'type';
    addSymbol(name, kind);
  }

  // Single const declaration: const Name1, Name2, ... [type] [= ...]
  // Skip block form (starts with `(`). Capture the full identifier list and parse it.
  for (const match of code.matchAll(/^const\s+(?!\()(.+)/mg)) {
    for (const name of parseGoNameList(match[1])) {
      addSymbol(name, 'const');
    }
  }

  // Single var declaration: var Name1, Name2, ... [type] [= ...]
  // Skip block form (starts with `(`). Capture the full identifier list and parse it.
  for (const match of code.matchAll(/^var\s+(?!\()(.+)/mg)) {
    for (const name of parseGoNameList(match[1])) {
      addSymbol(name, 'var');
    }
  }

  // Const block: const (\n  Name1, Name2, ...\n)
  // The lazy [\s\S]*? stops at the first ) that is at the start of a line (^, m flag),
  // which is gofmt's convention for closing parentheses.
  for (const match of code.matchAll(/^const\s*\(([\s\S]*?)^\s*\)/mg)) {
    for (const lineMatch of match[1].matchAll(/^[ \t]+(.+)/mg)) {
      for (const name of parseGoNameList(lineMatch[1])) {
        addSymbol(name, 'const');
      }
    }
  }

  // Var block: var (\n  Name1, Name2, ...\n)
  // Same lazy-stop-at-line-start-) strategy as the const block above.
  for (const match of code.matchAll(/^var\s*\(([\s\S]*?)^\s*\)/mg)) {
    for (const lineMatch of match[1].matchAll(/^[ \t]+(.+)/mg)) {
      for (const name of parseGoNameList(lineMatch[1])) {
        addSymbol(name, 'var');
      }
    }
  }

  return {
    allSymbols: [...symbols].sort().slice(0, 50),
    exported: exported
      .sort((a, b) => a.name.localeCompare(b.name) || a.kind.localeCompare(b.kind))
      .slice(0, 50)
  };
}

/**
 * Parse a comma-separated identifier list from the head of a Go const/var declaration.
 *
 * Examples:
 *   "Alpha, Beta int"       → ["Alpha", "Beta"]
 *   "Gamma, Delta = 1, 2"  → ["Gamma", "Delta"]
 *   "statusInternal = 500"  → ["statusInternal"]
 *
 * Only the declaration head before `=` is inspected, so commas in right-hand
 * side expressions such as `var A = foo(bar, baz)` are not interpreted as
 * additional declaration names.
 */
function parseGoNameList(segment: string): string[] {
  const names: string[] = [];
  const declarationHead = segment.split('=')[0];
  for (const part of declarationHead.split(',')) {
    const m = part.trimStart().match(/^([A-Za-z_]\w*)/);
    if (!m) {
      break;
    }
    names.push(m[1]);
  }
  return names;
}

function getRustDeclarations(content: string): RustDeclarations {
  if (lastRustDeclarations?.content === content) {
    return lastRustDeclarations.declarations;
  }

  const declarations = computeRustDeclarations(content);
  lastRustDeclarations = { content, declarations };
  return declarations;
}

function computeRustDeclarations(content: string): RustDeclarations {
  const code = stripRustCommentsAndLiterals(content);
  const imports = new Set<string>();
  const symbols = new Set<string>();
  const exported: Array<{ name: string; kind: string }> = [];
  const seenExported = new Set<string>();

  const addSymbol = (name: string, kind: string, isExported = false) => {
    symbols.add(name);
    if (isExported) {
      pushExportedSymbol(exported, seenExported, { name, kind });
    }
  };

  for (const match of code.matchAll(/^(?:pub(?:\([^)]*\))?\s+)?use\s+([\s\S]*?);/mg)) {
    for (const specifier of expandRustUseSpec(match[1])) {
      imports.add(specifier);
    }
  }

  for (const match of code.matchAll(/^pub(?:\([^)]*\))?\s+use\s+([\s\S]*?);/mg)) {
    for (const name of extractRustPublicUseNames(match[1])) {
      addSymbol(name, 're-export', true);
    }
  }

  for (const match of code.matchAll(/^(pub(?:\([^)]*\))?\s+)?(?:async\s+)?(?:unsafe\s+)?(?:const\s+)?fn\s+([A-Za-z_]\w*)\b/mg)) {
    addSymbol(match[2], 'fn', Boolean(match[1]));
  }

  for (const match of code.matchAll(/^(pub(?:\([^)]*\))?\s+)?struct\s+([A-Za-z_]\w*)\b/mg)) {
    addSymbol(match[2], 'struct', Boolean(match[1]));
  }

  for (const match of code.matchAll(/^(pub(?:\([^)]*\))?\s+)?enum\s+([A-Za-z_]\w*)\b/mg)) {
    addSymbol(match[2], 'enum', Boolean(match[1]));
  }

  for (const match of code.matchAll(/^(pub(?:\([^)]*\))?\s+)?(?:unsafe\s+)?trait\s+([A-Za-z_]\w*)\b/mg)) {
    addSymbol(match[2], 'trait', Boolean(match[1]));
  }

  for (const match of code.matchAll(/^(pub(?:\([^)]*\))?\s+)?mod\s+([A-Za-z_]\w*)\b/mg)) {
    addSymbol(match[2], 'mod', Boolean(match[1]));
  }

  for (const match of code.matchAll(/^(pub(?:\([^)]*\))?\s+)?const\s+([A-Za-z_]\w*)\b/mg)) {
    addSymbol(match[2], 'const', Boolean(match[1]));
  }

  for (const match of code.matchAll(/^(pub(?:\([^)]*\))?\s+)?static(?:\s+mut)?\s+([A-Za-z_]\w*)\b/mg)) {
    addSymbol(match[2], 'static', Boolean(match[1]));
  }

  for (const match of code.matchAll(/^impl(?:\s*<[^>{;]*>)?\s+([\s\S]*?)\{/mg)) {
    const implName = normalizeRustImplName(match[1]);
    if (implName) {
      addSymbol(implName, 'impl');
    }
  }

  return {
    imports: [...imports].sort(),
    allSymbols: [...symbols].sort().slice(0, SYMBOL_LIMIT),
    exported: exported
      .sort((left, right) => left.name.localeCompare(right.name) || left.kind.localeCompare(right.kind))
      .slice(0, SYMBOL_LIMIT)
  };
}

function stripRustCommentsAndLiterals(content: string): string {
  let output = '';
  let index = 0;
  let blockCommentDepth = 0;

  while (index < content.length) {
    const char = content[index];
    const next = content[index + 1];

    if (blockCommentDepth > 0) {
      if (char === '/' && next === '*') {
        blockCommentDepth += 1;
        output += '  ';
        index += 2;
        continue;
      }

      if (char === '*' && next === '/') {
        blockCommentDepth -= 1;
        output += '  ';
        index += 2;
        continue;
      }

      output += char === '\n' ? '\n' : ' ';
      index += 1;
      continue;
    }

    if (char === '/' && next === '/') {
      output += '  ';
      index += 2;
      while (index < content.length && content[index] !== '\n') {
        output += ' ';
        index += 1;
      }
      continue;
    }

    if (char === '/' && next === '*') {
      blockCommentDepth = 1;
      output += '  ';
      index += 2;
      continue;
    }

    if (char === '"' || (char === 'r' && isRustRawStringStart(content, index))) {
      const end = findRustStringEnd(content, index);
      output += ' ';
      for (let cursor = index + 1; cursor < end; cursor += 1) {
        output += content[cursor] === '\n' ? '\n' : ' ';
      }
      if (end < content.length) {
        output += ' ';
      }
      index = Math.min(end + 1, content.length);
      continue;
    }

    output += char;
    index += 1;
  }

  return output;
}

function isRustRawStringStart(content: string, index: number) {
  if (content[index] !== 'r') {
    return false;
  }

  let cursor = index + 1;
  while (cursor < content.length && content[cursor] === '#') {
    cursor += 1;
  }
  return content[cursor] === '"';
}

function findRustStringEnd(content: string, start: number) {
  if (content[start] === '"') {
    let cursor = start + 1;
    while (cursor < content.length) {
      if (content[cursor] === '\\') {
        cursor += 2;
        continue;
      }
      if (content[cursor] === '"') {
        return cursor;
      }
      cursor += 1;
    }
    return content.length;
  }

  if (!isRustRawStringStart(content, start)) {
    return start;
  }

  let cursor = start + 1;
  while (content[cursor] === '#') {
    cursor += 1;
  }
  const hashes = content.slice(start + 1, cursor);
  cursor += 1; // opening quote
  const endDelimiter = `"${hashes}`;
  const end = content.indexOf(endDelimiter, cursor);
  return end >= 0 ? end + endDelimiter.length - 1 : content.length;
}

function expandRustUseSpec(spec: string): string[] {
  const imports = new Set<string>();

  const expand = (segment: string, prefix = '') => {
    const trimmed = segment.trim();
    if (!trimmed) {
      return;
    }

    const groups = splitTopLevel(trimmed, ',');
    if (groups.length > 1) {
      for (const group of groups) {
        expand(group, prefix);
      }
      return;
    }

    const braceIndex = findTopLevelBrace(trimmed);
    if (braceIndex >= 0) {
      const beforeBrace = trimmed.slice(0, braceIndex).replace(/::\s*$/, '').trim();
      const inner = trimmed.slice(braceIndex + 1, findMatchingBrace(trimmed, braceIndex));
      const nextPrefix = beforeBrace ? joinRustPath(prefix, beforeBrace) : prefix;
      for (const child of splitTopLevel(inner, ',')) {
        expand(child, nextPrefix);
      }
      return;
    }

    const withoutAlias = trimmed.replace(/\s+as\s+(?:[A-Za-z_]\w*|_)\s*$/, '').trim();
    const value = withoutAlias === 'self'
      ? prefix
      : joinRustPath(prefix, withoutAlias);

    if (value) {
      imports.add(normalizeRustPath(value));
    }
  };

  expand(spec);
  return [...imports].sort();
}

function splitTopLevel(value: string, delimiter: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depthParen = 0;
  let depthBracket = 0;
  let depthBrace = 0;
  let depthAngle = 0;

  for (const char of value) {
    if (char === '(') depthParen += 1;
    else if (char === ')' && depthParen > 0) depthParen -= 1;
    else if (char === '[') depthBracket += 1;
    else if (char === ']' && depthBracket > 0) depthBracket -= 1;
    else if (char === '{') depthBrace += 1;
    else if (char === '}' && depthBrace > 0) depthBrace -= 1;
    else if (char === '<') depthAngle += 1;
    else if (char === '>' && depthAngle > 0) depthAngle -= 1;

    if (
      char === delimiter
      && depthParen === 0
      && depthBracket === 0
      && depthBrace === 0
      && depthAngle === 0
    ) {
      parts.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (current) {
    parts.push(current);
  }

  return parts;
}

function findTopLevelBrace(value: string) {
  let depthParen = 0;
  let depthBracket = 0;
  let depthAngle = 0;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (char === '(') depthParen += 1;
    else if (char === ')' && depthParen > 0) depthParen -= 1;
    else if (char === '[') depthBracket += 1;
    else if (char === ']' && depthBracket > 0) depthBracket -= 1;
    else if (char === '<') depthAngle += 1;
    else if (char === '>' && depthAngle > 0) depthAngle -= 1;
    else if (char === '{' && depthParen === 0 && depthBracket === 0 && depthAngle === 0) {
      return index;
    }
  }

  return -1;
}

function findMatchingBrace(value: string, openIndex: number) {
  let depth = 0;
  for (let index = openIndex; index < value.length; index += 1) {
    const char = value[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }
  return value.length - 1;
}

function joinRustPath(prefix: string, suffix: string) {
  const normalizedSuffix = normalizeRustPath(suffix);
  if (!normalizedSuffix) {
    return normalizeRustPath(prefix);
  }
  if (!prefix) {
    return normalizedSuffix;
  }
  if (normalizedSuffix.startsWith('::')) {
    return normalizedSuffix;
  }
  return normalizeRustPath(`${prefix}::${normalizedSuffix}`);
}

function normalizeRustPath(pathValue: string) {
  return pathValue
    .replace(/\s+/g, '')
    .replace(/:+/g, '::')
    .replace(/;+$/, '')
    .trim();
}

function normalizeRustImplName(raw: string) {
  const compact = raw.replace(/\s+/g, ' ').trim();
  if (!compact) {
    return null;
  }

  const withoutWhere = compact.replace(/\s+where\s+[\s\S]*$/, '').trim();
  const forIndex = withoutWhere.indexOf(' for ');
  if (forIndex >= 0) {
    const traitName = withoutWhere.slice(0, forIndex).trim();
    const typeName = withoutWhere.slice(forIndex + 5).trim();
    if (!traitName || !typeName) {
      return null;
    }
    return `impl ${traitName} for ${typeName}`;
  }

  return `impl ${withoutWhere}`;
}

function extractRustPublicUseNames(spec: string): string[] {
  const names = new Set<string>();

  const collect = (segment: string, prefix = '') => {
    const trimmed = segment.trim();
    if (!trimmed) {
      return;
    }

    const groups = splitTopLevel(trimmed, ',');
    if (groups.length > 1) {
      for (const group of groups) {
        collect(group, prefix);
      }
      return;
    }

    const braceIndex = findTopLevelBrace(trimmed);
    if (braceIndex >= 0) {
      const beforeBrace = trimmed.slice(0, braceIndex).replace(/::\s*$/, '').trim();
      const inner = trimmed.slice(braceIndex + 1, findMatchingBrace(trimmed, braceIndex));
      const nextPrefix = beforeBrace ? joinRustPath(prefix, beforeBrace) : prefix;
      for (const child of splitTopLevel(inner, ',')) {
        collect(child, nextPrefix);
      }
      return;
    }

    const aliasMatch = trimmed.match(/\s+as\s+([A-Za-z_]\w*|_)\s*$/);
    if (aliasMatch) {
      if (aliasMatch[1] !== '_') {
        names.add(aliasMatch[1]);
      }
      return;
    }

    if (trimmed === '*') {
      return;
    }

    if (trimmed === 'self') {
      const selfName = rustPathTerminal(prefix);
      if (selfName) {
        names.add(selfName);
      }
      return;
    }

    const full = joinRustPath(prefix, trimmed);
    const terminal = rustPathTerminal(full);
    if (terminal) {
      names.add(terminal);
    }
  };

  collect(spec);
  return [...names].sort();
}

function rustPathTerminal(pathValue: string) {
  const normalized = normalizeRustPath(pathValue).replace(/^::/, '');
  if (!normalized || normalized.endsWith('::')) {
    return null;
  }
  const terminal = normalized.split('::').pop() || '';
  if (!terminal || terminal === '*' || terminal === 'self') {
    return null;
  }
  return terminal;
}
