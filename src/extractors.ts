import * as ts from 'typescript';

const JAVASCRIPT_LANGUAGES = new Set([
  'JavaScript',
  'JavaScript React',
  'TypeScript',
  'TypeScript React'
]);

const ROUTE_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'all', 'use'];
const NEST_ROUTE_DECORATORS = ['Get', 'Post', 'Put', 'Patch', 'Delete', 'Options', 'Head', 'All'];
const MAX_GRAPHQL_RESOLVER_BODY_LENGTH = 2000;
const MAX_OPENAPI_REGISTER_BODY_LENGTH = 1000;

type RuntimeHintMetadata = {
  routeSurfaces?: Array<{ kind?: string; framework?: string; target?: string; methods?: string[]; path?: string; handler?: string | null }>;
  environmentVariables?: string[];
};

type JavaScriptAstMetadata = {
  symbols: Set<string>;
  exported: Array<{ name: string; kind: string }>;
};

let lastJavaScriptAstMetadata: {
  content: string;
  language: string;
  metadata: JavaScriptAstMetadata | null;
} | null = null;

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

  return [...fallbackSymbols].sort().slice(0, 50);
  /* c8 ignore stop */
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
    .slice(0, 50);
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
  if (!/\b(?:@trpc\/server|initTRPC|createTRPCRouter|t\s*\.\s*router|router\s*\(\s*\{)/.test(content)) {
    return;
  }

  for (const match of content.matchAll(/\b([A-Za-z_$][\w$]*)\s*:\s*[A-Za-z_$][\w$.]*\s*\.\s*(query|mutation|subscription)\s*\(/g)) {
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
      const tail = body.slice((field.index || 0) + field[0].length, (field.index || 0) + field[0].length + 220);
      if (!isLikelyGraphqlResolverValue(tail)) {
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
