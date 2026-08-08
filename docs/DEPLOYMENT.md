# Deployment

Myra (a Makunto product) runs on any Node.js host: VPS, Docker, Railway, Render, Fly.io, AWS, Google Cloud. A full walkthrough per platform is in `launch/deployment/self-hosting-guide.md`; production launch steps in `launch/deployment/production-launch-guide.md`.

## What gets deployed
1. **API server** — `artifacts/api-server`: `pnpm run build` → `node --enable-source-maps dist/index.mjs` (listens on `PORT`, applies DB migrations at startup).
2. **Frontend** — `artifacts/vox-console`: `BASE_PATH=/ pnpm run build` → static files in `dist/public/`. Serve them from a static host/CDN or the same reverse proxy, and route `/api/*` to the API server.

## Minimum production environment
`NODE_ENV=production`, `PORT`, `PUBLIC_URL`, `DATABASE_URL`, Clerk keys, AI provider keys, YouTube keys. Full list: `docs/ENVIRONMENT.md`.

## Checklist
- [ ] HTTPS in front (Myra needs a secure origin for mic access and OAuth)
- [ ] `PUBLIC_URL` set to the real domain
- [ ] OAuth redirect URIs updated at Google + Meta for that domain (docs/OAUTH_SETUP.md)
- [ ] Clerk production instance keys + domain added in Clerk dashboard
- [ ] Postgres reachable; first boot runs migrations (check logs: "DB migrations complete")
- [ ] Daily database backups scheduled
- [ ] Health check: `GET /api/health`

## CI/CD
GitHub Actions (`.github/workflows/ci.yml`) runs install, typecheck, build, and a frontend syntax check on every PR. Production deployment is intentionally **manual** — deploy only after CI is green and the release has been verified.
