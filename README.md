# Makunto Myra

**Myra** is a **Makunto** product — a voice-first AI growth copilot for content creators. Talk to Myra like a person: she greets you with a daily brief, tracks your YouTube / Facebook / Instagram accounts and your competitors, surfaces insights, and answers questions out loud.

## What's in this repository

| Path | What it is |
|---|---|
| `artifacts/vox-console/` | Frontend — the Myra voice console (vanilla JS single-page app + Clerk auth) |
| `artifacts/api-server/` | Backend — Express API (chat, voice, social data, OAuth) |
| `lib/db/` | Shared database layer — Drizzle ORM schema + SQL migrations (PostgreSQL) |
| `docs/` | Architecture, environment, OAuth, database, deployment, testing docs |
| `launch/` | Launch collateral: store assets, checklists, deployment guides |
| `tests/fixtures/` | Fictional demo data only — never real user data |

`artifacts/mockup-sandbox/` is a development-only design sandbox; it is not part of the shipped product.

## Quick start

```bash
# Prerequisites: Node.js 20+, pnpm 9+, PostgreSQL 15+
pnpm install
cp .env.example .env       # fill in your values — see docs/ENVIRONMENT.md

# Development
pnpm --filter @workspace/api-server run dev     # API on $PORT (default 3001)
pnpm --filter @workspace/vox-console run dev    # frontend dev server

# Production build
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/vox-console run build  # outputs to dist/public/
```

Database migrations run automatically when the API server starts (see `docs/DATABASE.md`).

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — components and how they communicate
- [Development](docs/DEVELOPMENT.md) — local setup and workflow
- [Environment variables](docs/ENVIRONMENT.md) — every variable, by category
- [OAuth setup](docs/OAUTH_SETUP.md) — Google/YouTube and Meta (Facebook/Instagram)
- [Database](docs/DATABASE.md) — schema, migrations, backup/restore
- [Deployment](docs/DEPLOYMENT.md) — production hosting on any platform
- [Testing](docs/TESTING.md) — verification steps and gaps
- [Mobile](docs/MOBILE_BUILD.md) — PWA / home-screen install
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Security

Never commit `.env`, API keys, OAuth secrets, tokens, certificates, or real user data. `.env.example` contains placeholders only. See `docs/ENVIRONMENT.md`.

---

© Makunto. Myra is a Makunto product.
