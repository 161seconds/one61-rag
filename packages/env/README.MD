# @aqua-calendar/env

Environment and configuration package for the Aqua Calendar monorepo.

This package is the single source of truth for:
- loading environment variables into Nest apps
- resolving `.env` file paths
- providing typed runtime config via `envConfig()`
- validating env input with Zod helpers

## Purpose

Use this package when an app or library needs configuration.

Do not duplicate env-loading logic in app-level modules. Import from `@aqua-calendar/env` instead.

## Exports

`src/index.ts` exports:
- `SharedEnvModule`
- `ConfigurableModuleClass`, `MODULE_OPTIONS_TOKEN`, `OPTIONS_TYPE`
- `DEFAULT_ENV_FILE_PATH`, `getEnvFilePath`
- `createEnvValidator`
- `envConfig`
- shared env option types

## Core Pieces

### 1) `SharedEnvModule`

File: `src/env.module.ts`

`SharedEnvModule.forRoot(options?)` wraps Nest `ConfigModule.forRoot(...)`.

Default behavior:
- `isGlobal: true`
- `cache: true`
- `expandVariables: true`
- `ignoreEnvFile: false`
- `envFilePath: getEnvFilePath(process.env.NODE_ENV)`
- `load: []`

It returns a dynamic module and re-exports `ConfigModule`.

### 2) Env file path strategy

File: `src/env.constant.ts`

Constants:
- `DEFAULT_ENV_FILE_PATH = [".env", ".env.development", ".env.production"]`

Helper:
- `getEnvFilePath(environment)`

Behavior:
- `development` (or undefined) -> resolve absolute env paths from workspace root.
- non-development -> return relative default paths.

Workspace root detection:
- walks upward from `process.cwd()`
- stops when `pnpm-workspace.yaml` is found

This design ensures local development uses the root `.env` file even when apps run from subfolders.

### 3) Typed runtime config

File: `src/env.config.ts`

`envConfig()` returns grouped config sections:
- `app` (`apis.port`, `notificationWorker.port`, `environment`)
- `jwt` (access/refresh token settings)
- `database` (Postgres URL)
- `cors` (up to 10 origins)
- `redis` (`bullmq`, `cache`, `pubsub`)
- `google` OAuth settings

Consumers (apps/packages) should read config through this function instead of using `process.env` directly.

### 4) Validation helper

File: `src/env.validator.ts`

`createEnvValidator({ schema, onValidationError? })`
- accepts a Zod schema
- returns a function compatible with Nest env validation flow
- formats Zod issues into one error message
- throws by default if validation fails

Use this helper when an app needs strict env schema validation.

## Public Types

File: `src/env.type.ts`

- `SharedEnvModuleOptions`
  - `isGlobal?`
  - `envFilePath?`
  - `load?`
  - `cache?`
  - `expandVariables?`
  - `ignoreEnvFile?`

- `CreateEnvValidatorOptions<TSchema extends ZodSchema>`
  - `schema`
  - `onValidationError?`

## Usage Pattern

In app modules:

```ts
imports: [
  SharedEnvModule.forRoot({
    isGlobal: true,
    load: [envConfig],
  }),
]
```

In services/modules:

```ts
import { envConfig } from "@aqua-calendar/env"

const redisHost = envConfig().redis.cache.host
```

## Environment Model Notes

Current root env model expects keys such as:
- `NODE_ENV`
- `APIS_PORT`, `NOTIFICATION_WORKER_PORT`
- `DATABASE_URL`
- `REDIS_HOST`
- `REDIS_CACHE_PORT`, `REDIS_CACHE_PASS`
- `REDIS_BULLMQ_PORT`, `REDIS_BULLMQ_PASS`, `REDIS_BULLMQ_ATTEMPTS`, `REDIS_BULLMQ_DELAY`
- `REDIS_PUB_SUB_PORT`, `REDIS_PUB_SUB_PASS`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `GOOGLE_SUCCESS_REDIRECT_URL`
- `JWT_ACCESS_TOKEN_EXPIRES_IN`, `JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_EXPIRES_IN`, `JWT_REFRESH_TOKEN_SECRET`

## Caveats for AI Agents

- This package is foundational. Changes can break all apps.
- Keep backward compatibility for exported names and option types.
- Do not hardcode app-specific logic in `SharedEnvModule`.
- If you change env key names in `envConfig()`, update:
  - root `.env`
  - `.env.example`
  - Docker/K8s manifests
  - dependent packages (`infra-redis`, auth, etc.)
- `envConfig()` currently includes repeated fallback references for JWT `expiresIn` expressions. Preserve behavior unless intentionally refactoring.

## Build and Type-check

- `pnpm -C packages/env check-types`
- `pnpm -C packages/env build`

## Responsibility Boundaries

Keep this package focused on:
- env loading
- env path resolution
- env shaping and validation

Do not add:
- business logic
- transport logic
- app orchestration concerns
