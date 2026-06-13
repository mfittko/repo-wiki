---
source_repo: "https://github.com/mfittko/repo-wiki"
source_commit: "1defe58385a113a4dfca789e393deecf0d6135a8"
compiled_at: "2026-06-13T08:30:37.578Z"
kind: "dependency_map"
claim_status: "grounded"
source_paths: ["src/extractors.ts","test/extractors-go.test.ts","test/extractors-utils.test.ts","test/fixtures/compiler-e2e/basic-node-service/repo/packages/core/health.js","test/fixtures/compiler-e2e/basic-node-service/repo/services/api/routes.js","test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js","test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js","test/scanner.test.ts"]
confidence: "high"
page_state: "generated"
---
# Dependency Map

## Resolved internal dependency edges

- Edges detected: 17
- Importing files: 6
- Imported files: 3

| From | To | Specifier |
| --- | --- | --- |
| [src/extractors.ts](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/src/extractors.ts) | [package:typescript](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/package%3Atypescript) | `typescript` |
| [test/extractors-go.test.ts](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/extractors-go.test.ts) | [package:errors](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/package%3Aerrors) | `errors` |
| [test/extractors-go.test.ts](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/extractors-go.test.ts) | [package:fmt](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/package%3Afmt) | `fmt` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/extractors-utils.test.ts) | [package:@asteasolutions/zod-to-openapi](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/package%3A%40asteasolutions/zod-to-openapi) | `@asteasolutions/zod-to-openapi` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/extractors-utils.test.ts) | [package:@koa/router](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/package%3A%40koa/router) | `@koa/router` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/extractors-utils.test.ts) | [package:@trpc/server](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/package%3A%40trpc/server) | `@trpc/server` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/extractors-utils.test.ts) | [package:fmt](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/package%3Afmt) | `fmt` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/extractors-utils.test.ts) | [package:graphql](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/package%3Agraphql) | `graphql` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/extractors-utils.test.ts) | [package:koa](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/package%3Akoa) | `koa` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/extractors-utils.test.ts) | [package:lib](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/package%3Alib) | `lib` |
| [test/extractors-utils.test.ts](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/extractors-utils.test.ts) | [package:sequelize](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/package%3Asequelize) | `sequelize` |
| [test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js) | [test/fixtures/compiler-e2e/basic-node-service/repo/packages/core/health.js](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/fixtures/compiler-e2e/basic-node-service/repo/packages/core/health.js) | `../../packages/core/health.js` |
| [test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js) | [test/fixtures/compiler-e2e/basic-node-service/repo/services/api/routes.js](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/fixtures/compiler-e2e/basic-node-service/repo/services/api/routes.js) | `./routes.js` |
| [test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/fixtures/compiler-e2e/basic-node-service/repo/test/api/server.test.js) | [test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/fixtures/compiler-e2e/basic-node-service/repo/services/api/server.js) | `../../services/api/server.js` |
| [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/scanner.test.ts) | [package:express](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/package%3Aexpress) | `express` |
| [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/scanner.test.ts) | [package:sequelize](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/package%3Asequelize) | `sequelize` |
| [test/scanner.test.ts](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/test/scanner.test.ts) | [package:typeorm](https://github.com/mfittko/repo-wiki/blob/1defe58385a113a4dfca789e393deecf0d6135a8/package%3Atypeorm) | `typeorm` |
