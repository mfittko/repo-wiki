import * as ts from 'typescript';

const JAVASCRIPT_LANGUAGES = new Set([
  'JavaScript',
  'JavaScript React',
  'TypeScript',
  'TypeScript React'
]);

const ROUTE_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'all', 'use'];

type RuntimeHintMetadata = {
  routeSurfaces?: Array<{ kind?: string; framework?: string; target?: string; methods?: string[]; path?: string; handler?: string | null }>;
  environmentVariables?: string[];
};

export function extractImports(content: string, language: string): string[] {
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
  if (!isJavaScriptLike(language)) {
    return [];
  }

  const ast = extractJavaScriptAstMetadata(content, language);
  if (ast) {
    return [...ast.symbols].sort().slice(0, 50);
  }

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

  return [...fallbackSymbols].sort().slice(0, 50);
}

export function extractExportedSymbols(content: string, language: string): Array<{ name: string; kind: string }> {
  if (!isJavaScriptLike(language)) {
    return [];
  }

  const ast = extractJavaScriptAstMetadata(content, language);
  if (ast) {
    return [...ast.exported]
      .sort((left, right) => left.name.localeCompare(right.name) || left.kind.localeCompare(right.kind))
      .slice(0, 50);
  }

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
    .slice(0, 50);
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

export function detectRuntimeHints(filePath: string, content: string, metadata: RuntimeHintMetadata = {}): string[] {
  const hints = [];
  const lower = filePath.toLowerCase();
  const routeSurfaces = metadata.routeSurfaces || extractRouteSurfaces(filePath, content, 'JavaScript');
  const environmentVariables = metadata.environmentVariables || extractEnvironmentVariables(content, 'JavaScript');

  if (routeSurfaces.length > 0) {
    hints.push('http-route');
  }

  if (environmentVariables.length > 0) {
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

function isJavaScriptLike(language) {
  return JAVASCRIPT_LANGUAGES.has(language);
}

function extractJavaScriptAstMetadata(content: string, language: string) {
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
    const declarationKinds = new Map<string, string>();

    for (const statement of sourceFile.statements) {
      const modifierFlags = getModifierFlags(statement);

      if (ts.isFunctionDeclaration(statement)) {
        if (statement.name) {
          const name = statement.name.text;
          symbols.add(name);
          declarationKinds.set(name, 'function');
          if (modifierFlags.exported) {
            pushExportedSymbol(exported, seenExported, { name: statement.name.text, kind: 'function' });
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
          declarationKinds.set(name, 'class');
          if (modifierFlags.exported) {
            pushExportedSymbol(exported, seenExported, { name: statement.name.text, kind: 'class' });
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
        declarationKinds.set(name, 'interface');
        if (modifierFlags.exported) {
          pushExportedSymbol(exported, seenExported, { name: statement.name.text, kind: 'interface' });
        }
        continue;
      }

      if (ts.isTypeAliasDeclaration(statement)) {
        const name = statement.name.text;
        symbols.add(name);
        declarationKinds.set(name, 'type');
        if (modifierFlags.exported) {
          pushExportedSymbol(exported, seenExported, { name: statement.name.text, kind: 'type' });
        }
        continue;
      }

      if (ts.isEnumDeclaration(statement)) {
        const name = statement.name.text;
        symbols.add(name);
        declarationKinds.set(name, 'enum');
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
            declarationKinds.set(name, kind);
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

    return { symbols, exported };
  } catch {
    return null;
  }
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
  const patterns = [
    { pattern: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*express\s*\(/g, framework: 'express' },
    { pattern: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*express\s*\.\s*Router\s*\(/g, framework: 'express' },
    { pattern: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*Router\s*\(/g, framework: 'express' },
    { pattern: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:fastify|Fastify)\s*\(/g, framework: 'fastify' },
    { pattern: /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*new\s+Hono\s*\(/g, framework: 'hono' }
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
