import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  detectRuntimeHints,
  extractEnvironmentVariables,
  extractExportedSymbols,
  extractImports,
  extractRouteSurfaces,
  extractSymbols
} from '../src/extractors.js';
import { classifyPath, detectLanguage } from '../src/language.js';
import { getGitCommit, getGitRemote, getGitStatus, runGit } from '../src/utils/git.js';
import { lintDocs } from '../src/docs-linter.js';

const richSource = `
import lib from 'lib';
export { helper } from './helper.js';
const dep = require('../legacy.cjs');
export default function () {}
export default class {}
export async function runTask() {}
export class Service {}
export const value = 1;
export let count = 0;
export var flag = true;
export type Name = string;
export interface Shape { value: string }
export enum State { Ready }
export { value as renamed, type Name as Alias };
const { API_KEY, PORT: localPort = '3000', ...rest } = process.env;
const { VITE_HOST } = import.meta.env;
const router = Router();
router.get('/health', healthCheck);
const api = fastify();
api.route({ method: ['post', 'get'], url: '/items', handler: handleItems });
export async function GET() {}
`;

test('extractors cover imports, exports, env vars, routes, and runtime hints', () => {
  assert.deepEqual(extractImports('print(1)', 'Python'), []);
  assert.deepEqual(extractSymbols('print(1)', 'Python'), []);
  assert.deepEqual(extractExportedSymbols('print(1)', 'Python'), []);
  assert.deepEqual(extractEnvironmentVariables('print(1)', 'Python'), []);
  assert.deepEqual(extractRouteSurfaces('routes.py', 'print(1)', 'Python'), []);

  assert.deepEqual(extractImports(richSource, 'TypeScript'), ['../legacy.cjs', './helper.js', 'lib']);
  assert.deepEqual(extractSymbols(richSource, 'TypeScript'), ['GET', 'Name', 'Service', 'Shape', 'State', 'api', 'count', 'default', 'dep', 'flag', 'router', 'runTask', 'value']);
  const exported = extractExportedSymbols(richSource, 'TypeScript');
  assert.ok(exported.some((entry) => entry.name === 'default' && entry.kind === 'function'));
  assert.ok(exported.some((entry) => entry.name === 'default' && entry.kind === 'class'));
  assert.ok(exported.some((entry) => entry.name === 'helper' && entry.kind === 'named-export'));
  assert.ok(exported.some((entry) => entry.name === 'Alias' && entry.kind === 'named-export'));
  assert.ok(exported.some((entry) => entry.name === 'GET' && entry.kind === 'function'));
  assert.ok(exported.some((entry) => entry.name === 'Service' && entry.kind === 'class'));
  assert.ok(exported.some((entry) => entry.name === 'Name' && entry.kind === 'type'));
  assert.ok(exported.some((entry) => entry.name === 'Shape' && entry.kind === 'interface'));
  assert.ok(exported.some((entry) => entry.name === 'State' && entry.kind === 'enum'));
  assert.deepEqual(extractEnvironmentVariables(richSource, 'TypeScript'), ['API_KEY', 'PORT', 'VITE_HOST']);

  assert.deepEqual(extractRouteSurfaces('src/server.ts', richSource, 'TypeScript'), [
    {
      kind: 'http-route',
      framework: 'express',
      target: 'router',
      methods: ['GET'],
      path: '/health',
      handler: 'healthCheck'
    },
    {
      kind: 'http-route',
      framework: 'fastify',
      target: 'api',
      methods: ['GET', 'POST'],
      path: '/items',
      handler: 'handleItems'
    }
  ]);

  assert.deepEqual(extractRouteSurfaces('src/app/api/users/route.ts', 'export async function GET() {}\nexport const POST = () => {};', 'TypeScript'), [
    {
      kind: 'http-route',
      framework: 'route-handler',
      target: 'module',
      methods: ['GET'],
      path: '/api/users',
      handler: 'GET'
    },
    {
      kind: 'http-route',
      framework: 'route-handler',
      target: 'module',
      methods: ['POST'],
      path: '/api/users',
      handler: 'POST'
    }
  ]);

  assert.deepEqual(detectRuntimeHints('infra/Dockerfile', richSource + '\ncron.schedule()', {
    routeSurfaces: extractRouteSurfaces('src/server.ts', richSource, 'TypeScript'),
    environmentVariables: extractEnvironmentVariables(richSource, 'TypeScript')
  }), ['background-work', 'deployment', 'environment-variable', 'http-route']);
});

test('AST symbol extraction covers default exports, type-only declarations, and invalid source recovery', () => {
  const jsSource = `
const localValue = 1;
function helper() { return localValue; }
class Service {}
export default helper;
export const answer = 42;
`;

  assert.deepEqual(extractSymbols(jsSource, 'JavaScript'), ['Service', 'answer', 'default', 'helper', 'localValue']);
  assert.deepEqual(extractExportedSymbols(jsSource, 'JavaScript'), [
    { name: 'answer', kind: 'const' },
    { name: 'default', kind: 'function' }
  ]);

  const forwardDefaultSource = `
export default helper;
function helper() { return 1; }
`;
  assert.deepEqual(extractExportedSymbols(forwardDefaultSource, 'JavaScript'), [
    { name: 'default', kind: 'function' }
  ]);

  const namedDefaultFunctionSource = `
export default function createService() {}
`;
  assert.deepEqual(extractSymbols(namedDefaultFunctionSource, 'JavaScript'), ['createService']);
  assert.deepEqual(extractExportedSymbols(namedDefaultFunctionSource, 'JavaScript'), [
    { name: 'default', kind: 'function' }
  ]);

  const namedDefaultClassSource = `
export default class Service {}
`;
  assert.deepEqual(extractSymbols(namedDefaultClassSource, 'JavaScript'), ['Service']);
  assert.deepEqual(extractExportedSymbols(namedDefaultClassSource, 'JavaScript'), [
    { name: 'default', kind: 'class' }
  ]);

  const tsSource = `
type InternalType = { id: string };
interface InternalShape { value: number }
export type ApiType = InternalType;
export interface ApiShape extends InternalShape {}
`;

  assert.deepEqual(extractSymbols(tsSource, 'TypeScript'), ['ApiShape', 'ApiType', 'InternalShape', 'InternalType']);
  assert.deepEqual(extractExportedSymbols(tsSource, 'TypeScript'), [
    { name: 'ApiShape', kind: 'interface' },
    { name: 'ApiType', kind: 'type' }
  ]);

  const invalidSource = `
export function workingOne() {}
export const value = 1
export default (
`;
  assert.deepEqual(extractSymbols(invalidSource, 'TypeScript'), ['default', 'value', 'workingOne']);
  assert.deepEqual(extractExportedSymbols(invalidSource, 'TypeScript'), [
    { name: 'default', kind: 'default' },
    { name: 'value', kind: 'const' },
    { name: 'workingOne', kind: 'function' }
  ]);
});

test('language detection and classification cover the major path cases', () => {
  assert.equal(detectLanguage('Dockerfile'), 'Dockerfile');
  assert.equal(detectLanguage('src/component.tsx'), 'TypeScript React');
  assert.equal(detectLanguage('README'), 'Text');

  assert.equal(classifyPath('tests/foo.spec.ts'), 'test');
  assert.equal(classifyPath('.github/workflows/ci.yml'), 'ci');
  assert.equal(classifyPath('docs/guide.md'), 'docs');
  assert.equal(classifyPath('db/migrations/001.sql'), 'data');
  assert.equal(classifyPath('ops/infra/main.tf'), 'infra');
  assert.equal(classifyPath('package-lock.json'), 'package');
  assert.equal(classifyPath('src/index.ts'), 'source');
});

test('git helpers cover success and fallback paths', async () => {
  const repoDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-git-'));
  const nonRepoDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-non-git-'));

  try {
    await writeFile(path.join(repoDir, 'README.md'), '# temp\n', 'utf8');
    await runGit(['init'], { cwd: repoDir });
    await runGit(['config', 'user.name', 'Repo Wiki'], { cwd: repoDir });
    await runGit(['config', 'user.email', 'repo-wiki@example.com'], { cwd: repoDir });
    await runGit(['remote', 'add', 'origin', 'https://example.com/repo.git'], { cwd: repoDir });
    await runGit(['add', 'README.md'], { cwd: repoDir });
    await runGit(['commit', '-m', 'init'], { cwd: repoDir });

    const commit = await getGitCommit(repoDir, 'fallback');
    assert.match(commit, /^[0-9a-f]{40}$/);
    assert.equal(await getGitRemote(repoDir, 'fallback'), 'https://example.com/repo.git');
    assert.equal(await getGitStatus(repoDir), '');

    assert.equal(await getGitCommit(nonRepoDir, 'fallback'), 'fallback');
    assert.equal(await getGitRemote(nonRepoDir, 'fallback'), 'fallback');
    assert.equal(await getGitStatus(nonRepoDir), '');
  } finally {
    await rm(repoDir, { recursive: true, force: true });
    await rm(nonRepoDir, { recursive: true, force: true });
  }
});

test('lintDocs reports stale, contradicted, unvalidated, and broken-link issues', async () => {
  const repoDir = await mkdtemp(path.join(os.tmpdir(), 'repo-wiki-lint-docs-'));
  const scanDir = path.join(repoDir, '.llmwiki', 'run');

  try {
    await mkdir(path.join(repoDir, 'docs'), { recursive: true });
    await mkdir(scanDir, { recursive: true });
    await writeFile(path.join(repoDir, 'docs', 'existing.md'), '# Existing\n', 'utf8');
    await writeFile(path.join(repoDir, '.llmwiki', 'config.json'), JSON.stringify({
      lint: {
        stale_docs: 'warning',
        contradicted_docs: 'error',
        unvalidated_doc_claims: 'warning'
      }
    }), 'utf8');

    const manifest = {
      documentation: {
        files: [
          {
            path: 'docs/stale.md',
            stale: true,
            age_days: 365,
            validation: { contradictions: [], commands: [], env_vars: [] },
            claims: [],
            status: 'stale',
            links: []
          },
          {
            path: 'docs/contradicted.md',
            stale: false,
            age_days: 1,
            validation: { contradictions: [{ text: 'deprecated' }], commands: [], env_vars: [] },
            claims: [{ text: 'deprecated' }],
            status: 'contradicted',
            links: ['missing.md', 'existing.md', '#local', 'https://example.com', 'mailto:test@example.com']
          },
          {
            path: 'docs/unvalidated.md',
            stale: false,
            age_days: 1,
            validation: { contradictions: [], commands: [], env_vars: [] },
            claims: [{ text: 'run npm test' }],
            status: 'unvalidated',
            links: []
          }
        ]
      }
    };

    await writeFile(path.join(scanDir, 'manifest.json'), JSON.stringify(manifest), 'utf8');

    const result = await lintDocs({ scanDir, repoPath: repoDir });
    assert.equal(result.summary.errors, 1);
    assert.equal(result.summary.warnings, 3);
    assert.deepEqual(result.issues.map((issue) => issue.code).sort(), [
      'broken-documentation-link',
      'contradicted-documentation',
      'stale-documentation',
      'unvalidated-documentation-claims'
    ]);
  } finally {
    await rm(repoDir, { recursive: true, force: true });
  }
});


test('extractors cover additional framework, route-shape, and fallback branches', () => {
  const routeContent = `
const app = express();
app.use('/middleware');
app.get('/health', healthCheck);
app.get('/health', healthCheck);
const server = createServer();
server.post('/server-post');
const fastifyApi = Fastify();
fastifyApi.get('/fast', fastHandler);
const honoApp = new Hono();
honoApp.put('/hono', honoHandler);
const custom = makeRouter();
custom.route({ path: '/skip-no-method' });
custom.route({ method: 'patch', path: '/patch' });
`;

  assert.deepEqual(extractRouteSurfaces('src/server.ts', routeContent, 'TypeScript'), [
    { kind: 'http-route', framework: 'fastify', target: 'fastifyApi', methods: ['GET'], path: '/fast', handler: 'fastHandler' },
    { kind: 'http-route', framework: 'express', target: 'app', methods: ['GET'], path: '/health', handler: 'healthCheck' },
    { kind: 'http-route', framework: 'hono', target: 'honoApp', methods: ['PUT'], path: '/hono', handler: 'honoHandler' },
    { kind: 'http-route', framework: 'express', target: 'app', methods: ['USE'], path: '/middleware', handler: null },
    { kind: 'http-route', framework: 'unknown', target: 'custom', methods: ['PATCH'], path: '/patch', handler: null },
    { kind: 'http-route', framework: 'http-server', target: 'server', methods: ['POST'], path: '/server-post', handler: null }
  ]);

  assert.deepEqual(extractRouteSurfaces('src/pages/api/status.ts', 'export const GET = async () => {};', 'TypeScript'), [
    { kind: 'http-route', framework: 'route-handler', target: 'module', methods: ['GET'], path: '/api/status', handler: 'GET' }
  ]);

  assert.deepEqual(extractRouteSurfaces('src/routes/orders/index.ts', 'export const POST = async () => {};', 'TypeScript'), [
    { kind: 'http-route', framework: 'route-handler', target: 'module', methods: ['POST'], path: '/routes/orders', handler: 'POST' }
  ]);

  assert.deepEqual(extractRouteSurfaces('src/feature.ts', "const custom = makeRouter(); custom.route({ path: '/missing-method' });", 'TypeScript'), []);
  assert.deepEqual(detectRuntimeHints('src/jobs/worker.ts', 'process.env.API_TOKEN\nqueue.add()', {}), ['background-work', 'environment-variable']);
  assert.deepEqual(detectRuntimeHints('src/plain.ts', 'const value = 1;', {}), []);
});

test('extractRouteSurfaces detects NestJS, Koa, tRPC, GraphQL, and OpenAPI patterns', () => {
  const frameworkContent = `
import Router from '@koa/router';
import { initTRPC } from '@trpc/server';
import { graphql } from 'graphql';
const koaRouter = new Router();
koaRouter.get('/koa-health', koaHealth);

@Controller('/users')
export class UsersController {
  @Get('/profile')
  getProfile() { return true; }

  @Post()
  createUser() { return true; }
}

const t = initTRPC.create();
const appRouter = t.router({
  hello: t.procedure.query(() => 'ok'),
  createUser: t.procedure.mutation(() => ({ id: 1 })),
  procedureWithoutQueryOrMutation: t.procedure
});

const resolvers = {
  Query: {
    health: () => 'ok',
    user: {
      type: UserType,
      resolve: () => ({ id: '1' })
    }
  },
  Mutation: {
    createPost: () => ({})
  }
};

registry.registerPath({
  method: 'get',
  path: '/openapi/pets',
  operationId: 'listPets'
});
registry.registerPath({ path: '/openapi/missing-method' });
`;

  assert.deepEqual(extractRouteSurfaces('src/server.ts', frameworkContent, 'TypeScript'), [
    { kind: 'rpc-route', framework: 'trpc', target: 'router', methods: ['MUTATION'], path: '/createUser', handler: 'createUser' },
    { kind: 'graphql-operation', framework: 'graphql', target: 'Mutation', methods: ['MUTATION'], path: '/graphql', handler: 'createPost' },
    { kind: 'graphql-operation', framework: 'graphql', target: 'Query', methods: ['QUERY'], path: '/graphql', handler: 'health' },
    { kind: 'graphql-operation', framework: 'graphql', target: 'Query', methods: ['QUERY'], path: '/graphql', handler: 'user' },
    { kind: 'rpc-route', framework: 'trpc', target: 'router', methods: ['QUERY'], path: '/hello', handler: 'hello' },
    { kind: 'http-route', framework: 'koa', target: 'koaRouter', methods: ['GET'], path: '/koa-health', handler: 'koaHealth' },
    { kind: 'openapi-operation', framework: 'openapi', target: 'registry', methods: ['GET'], path: '/openapi/pets', handler: 'listPets' },
    { kind: 'http-route', framework: 'nestjs', target: 'UsersController', methods: ['POST'], path: '/users', handler: 'createUser' },
    { kind: 'http-route', framework: 'nestjs', target: 'UsersController', methods: ['GET'], path: '/users/profile', handler: 'getProfile' }
  ]);

  assert.deepEqual(extractRouteSurfaces('src/plain.ts', `
import { graphql } from 'graphql';
const resolvers = {
  Query: {
    nonFunctionResolver: true
  }
};
const router = t.router({
  invalidOnly: t.procedure
});
registry.registerPath({ path: '/missing', operationId: 'missingMethod' });
`, 'TypeScript'), []);
});

test('extractRouteSurfaces handles strings, comments, and template literals inside resolver maps', () => {
  // Exercise readBalancedObjectBody and isTopLevelObjectKey branches for
  // single-quoted strings, double-quoted strings, template literals,
  // line comments, and block comments with embedded braces.
  const content = `
import { graphql } from 'graphql';
const resolvers = {
  Query: {
    withStrings: () => {
      const a = "hello { world }";
      const b = 'curly { brace }';
      const c = \`template \${ '{' } literal\`;
      // line comment with { brace
      /* block comment with { brace } */
      return { ok: true };
    },
    simple: () => 'ok'
  },
  Mutation: {
    escaped: () => {
      const s = 'it\\'s a \\"test\\"';
      return {};
    }
  }
};
`;

  const surfaces = extractRouteSurfaces('src/resolvers.ts', content, 'TypeScript');
  const names = surfaces.map(s => s.handler).sort();
  assert.ok(names.includes('withStrings'), 'withStrings should be detected');
  assert.ok(names.includes('simple'), 'simple should be detected');
  assert.ok(names.includes('escaped'), 'escaped should be detected');
});

test('extractRouteSurfaces handles Koa middleware with inline comments', () => {
  const content = `
import Router from '@koa/router';
const r = new Router();
r.post('/items', /* auth middleware */ handleItems);
r.get('/health', healthCheck); // health route
`;
  const surfaces = extractRouteSurfaces('src/app.ts', content, 'TypeScript');
  assert.equal(surfaces.length, 2);
  assert.equal(surfaces[0].path, '/health');
  assert.equal(surfaces[1].path, '/items');
});

test('extractRouteSurfaces handles tRPC with nested router', () => {
  const content = `
import { initTRPC } from '@trpc/server';
const t = initTRPC.create();
const router = t.router({
  getItems: t.procedure.query(() => []),
  addItem: t.procedure.mutation(() => ({ id: 1 }))
});
`;
  const surfaces = extractRouteSurfaces('src/trpc.ts', content, 'TypeScript');
  assert.equal(surfaces.length, 2);
  assert.deepEqual(surfaces.map(s => s.handler).sort(), ['addItem', 'getItems']);
});

test('extractRouteSurfaces handles OpenAPI with array method', () => {
  const content = `
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
const reg = new OpenAPIRegistry();
reg.registerPath({
  method: 'post',
  path: '/api/upload',
  operationId: 'uploadFile'
});
`;
  const surfaces = extractRouteSurfaces('src/openapi.ts', content, 'TypeScript');
  assert.equal(surfaces.length, 1);
  assert.equal(surfaces[0].path, '/api/upload');
  assert.equal(surfaces[0].handler, 'uploadFile');
});

test('extractRouteSurfaces handles NestJS with multiple decorators', () => {
  const content = `
@Controller('/api')
export class ApiController {
  @Get('/list')
  list() { return []; }

  @Delete('/item')
  remove() { return null; }

  @Put('/item')
  update() { return {}; }

  @Patch('/item')
  patch() { return {}; }
}
`;
  const surfaces = extractRouteSurfaces('src/api.controller.ts', content, 'TypeScript');
  assert.ok(surfaces.length >= 4, `Expected at least 4 surfaces, got ${surfaces.length}`);
});

test('inferFileRoutePath detects Next.js app router and pages patterns', () => {
  // pages/api pattern
  const pages = extractRouteSurfaces('src/pages/api/users.ts', 'export async function GET() {}', 'TypeScript');
  assert.ok(pages.some(s => s.path === '/api/users'), 'pages/api pattern');

  // app/api/route pattern
  const app = extractRouteSurfaces('src/app/api/items/route.ts', 'export async function POST() {}', 'TypeScript');
  assert.ok(app.some(s => s.path === '/api/items'), 'app/api route pattern');
});
