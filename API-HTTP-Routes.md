---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "0604877d3099270286da69c1cf111e77cb0f81b8"
compiled_at: "2026-05-10T08:42:10.998Z"
kind: "api_http_routes"
page_state: "generated"
---
# API: HTTP Routes

## Detected routes

- Route surfaces detected: 38

| Source file | Framework | Target | Methods | Path | Handler |
| --- | --- | --- | --- | --- | --- |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | trpc | `router` | MUTATION | `/addItem` | `addItem` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | nestjs | `ApiController` | DELETE | `/api/item` | `remove` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | nestjs | `ApiController` | PATCH | `/api/item` | `patch` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | nestjs | `ApiController` | PUT | `/api/item` | `update` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | nestjs | `ApiController` | GET | `/api/list` | `list` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | openapi | `reg` | POST | `/api/upload` | `uploadFile` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | trpc | `router` | MUTATION | `/createUser` | `createUser` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | fastify | `fastifyApi` | GET | `/fast` | `fastHandler` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | trpc | `router` | QUERY | `/getItems` | `getItems` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | graphql | `Mutation` | MUTATION | `/graphql` | `createPost` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | graphql | `Query` | QUERY | `/graphql` | `health` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | graphql | `Query` | QUERY | `/graphql` | `user` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | express | `app` | GET | `/health` | `healthCheck` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | koa | `r` | GET | `/health` | `healthCheck` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | koa | `router` | GET | `/health` | `healthCheck` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | trpc | `router` | QUERY | `/hello` | `hello` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | hono | `honoApp` | PUT | `/hono` | `honoHandler` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | fastify | `api` | GET, POST | `/items` | `handleItems` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | koa | `r` | POST | `/items` | `unknown` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | koa | `router` | POST | `/jobs` | `createJob` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | koa | `koaRouter` | GET | `/koa-health` | `koaHealth` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | koa | `koaApp` | USE | `/koa-middleware` | `koaMiddleware` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | express | `app` | USE | `/middleware` | `unknown` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | openapi | `registry` | GET | `/openapi/pets` | `listPets` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | unknown | `custom` | PATCH | `/patch` | `unknown` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | fastify | `fastify` | GET | `/ready` | `readyHandler` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | http-server | `server` | POST | `/server-post` | `unknown` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | nestjs | `UsersController` | POST | `/users` | `createUser` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/extractors-utils.test.ts) | nestjs | `UsersController` | GET | `/users/profile` | `getProfile` |
| [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/init-planner.test.ts) | unknown | `bySource` | GET | `apps/api/config.ts` | `unknown` |
| [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/init-planner.test.ts) | unknown | `bySource` | GET | `apps/api/routes.ts` | `unknown` |
| [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/init-planner.test.ts) | unknown | `bySource` | GET | `apps/api/server.ts` | `unknown` |
| [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/init-planner.test.ts) | unknown | `bySource` | GET | `apps/web/client.ts` | `unknown` |
| [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/init-planner.test.ts) | unknown | `bySource` | GET | `docs/guide.md` | `unknown` |
| [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/init-planner.test.ts) | unknown | `bySource` | GET | `prisma/schema.prisma` | `unknown` |
| [test/init-planner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/init-planner.test.ts) | unknown | `bySource` | GET | `test/server.test.ts` | `unknown` |
| [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/scanner.test.ts) | http-server | `napp` | GET | `/health` | `healthCheck` |
| [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/0604877d3099270286da69c1cf111e77cb0f81b8/test/scanner.test.ts) | router | `nrouter` | POST | `/users` | `createUser` |

## Next refinement

Add framework-specific extractors for Express, Fastify, NestJS, Next.js route handlers, Hono, Koa, tRPC, OpenAPI, and GraphQL.
