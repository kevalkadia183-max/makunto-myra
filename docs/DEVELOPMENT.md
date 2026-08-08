# Development guide

Myra is a Makunto product. This repo is a pnpm monorepo.

## Prerequisites
- Node.js 20+
- pnpm 9+ (`corepack enable`)
- PostgreSQL 15+

## Setup
```bash
pnpm install
cp .env.example .env   # fill in values — docs/ENVIRONMENT.md
createdb myra          # or point DATABASE_URL at any Postgres
```

## Run
```bash
pnpm --filter @workspace/api-server run dev    # API (reads PORT, default from env)
pnpm --filter @workspace/vox-console run dev   # frontend (Vite dev server, proxies /api)
```
Migrations apply automatically when the API starts.

## Everyday commands
| Task | Command |
|---|---|
| Typecheck everything | `pnpm run typecheck` |
| Build everything | `pnpm --filter @workspace/api-server run build && pnpm --filter @workspace/vox-console run build` |
| Generate a DB migration | edit `lib/db/src/schema/*` then `pnpm --filter @workspace/db exec drizzle-kit generate --config drizzle.config.ts` |
| Format | `pnpm exec prettier --write .` |

## Conventions
- Branching: `main` = production-ready, `develop` = integration, `feature/*` = individual work. Don't commit major changes directly to `main`.
- The frontend is intentionally a single vanilla-JS page (`artifacts/vox-console/index.html`) — keep changes inside the existing IIFE and run a syntax check (`node --check`) on the extracted script.
- Never hardcode hostnames. The client uses relative `/api` URLs; the server derives its public origin from `PUBLIC_URL`.
- Never commit secrets — see `docs/ENVIRONMENT.md`.
