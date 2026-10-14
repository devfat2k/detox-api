# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install           # install dependencies
bun run start:dev     # dev server with hot reload (port 3001)
bun run build         # compile to dist/
bun run start:prod    # run compiled output

bun run lint          # oxlint with type-awareness over src/ and test/
bun run format        # prettier over src/ and test/

bun run test                          # run all unit tests (*.spec.ts)
bun run test -- --testPathPattern=media  # run a single spec file
bun run test:watch    # watch mode
bun run test:e2e      # e2e tests (test/jest-e2e.json config)
bun run test:cov      # coverage report
```

## Architecture

NestJS (v12) API for the "Ép Xanh Chữa Lành" detox-juice advisory system. Backend serves a frontend at `http://localhost:3000`; API prefix is `/api`; listens on `PORT` (default 3001).

**External integrations planned/present:**

- **Supabase** (`@supabase/supabase-js`) — database/auth
- **Cloudinary** (`cloudinary` + `streamifier`) — media upload (`src/media.controller.spec.ts` exists but `media.controller.ts` is not yet created)
- **TypeORM** + **pg** — PostgreSQL ORM
- **NestJS Observe** (`@nestjs/observe`) — distributed tracing/metrics; configure `appKey`/`appSecret` in `ObserveModule.forRoot()` inside `app.module.ts`

**Global setup (main.ts):**

- `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true` — all DTOs must use `class-validator` decorators
- CORS restricted to `http://localhost:3000`

**Module pattern:** standard NestJS feature modules — each domain gets its own `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.dto.ts` under `src/<feature>/`. Register each module in `AppModule`.

**Validation:** use `class-validator` + `class-transformer` DTOs; use `zod` only for internal/non-request data shapes.

**Linting:** oxlint (not ESLint). `typescript/no-floating-promises` is an error — always `void` or `await` promise-returning calls.

**Code style:** single quotes, trailing commas (see `.prettierrc`).

## Domain context

The system implements a personalized detox-juice recommendation workflow (see `docs/product-spec.md`):

1. Screen user health baseline
2. Define health goals
3. Assess experience & preferences
4. Safety validation & risk exclusion
5. Generate recommendation & open menu framework

No user authentication, no PII collected. All recommendation logic is session-scoped.
