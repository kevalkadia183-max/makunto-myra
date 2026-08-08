# Self-Hosting Guide — Makunto Myra

Myra runs anywhere Node.js 20+ and PostgreSQL run: your own VPS, Docker,
Railway, Render, Fly.io, AWS, or Google Cloud. Nothing in the codebase is
tied to Replit — every URL and key comes from environment variables.

## The one rule

Set **`PUBLIC_URL`** to your public HTTPS origin (e.g. `https://myra.app`).
It always takes priority over any platform-provided domain variables, and it
drives OAuth callback URLs. Optionally override callbacks individually with
`GOOGLE_REDIRECT_URI` / `FACEBOOK_REDIRECT_URI`.

## Steps (any host)

1. **Environment** — copy `.env.example` to `.env` and fill it in.
   `NODE_ENV` supports `development`, `staging`, and `production`.
2. **Database** — point `DATABASE_URL` at PostgreSQL. Journal migrations run
   automatically when the API server starts — no separate migrate step.
3. **Build & run**
   ```bash
   pnpm install
   # Frontend build needs PORT and BASE_PATH set (BASE_PATH=/ for root hosting):
   BASE_PATH=/ PORT=3000 pnpm --filter @workspace/vox-console run build
   pnpm --filter @workspace/api-server run build
   pnpm --filter @workspace/api-server run start    # serves the API on $PORT
   ```
   The frontend build output is `artifacts/vox-console/dist/public/` — serve
   that directory from any static host / CDN / nginx, and proxy `/api` to the
   API server.
4. **OAuth consoles** — register the production callback URLs
   (`$PUBLIC_URL/api/social/oauth/youtube/callback` for Google/YouTube,
   `$PUBLIC_URL/api/social/oauth/facebook/callback` for Meta) in Google Cloud
   Console and Meta Developer Portal. Details:
   `google-cloud-checklist.md` and `meta-setup-checklist.md`.
5. **Clerk** — switch to a production Clerk instance (live keys) and add your
   domain in the Clerk dashboard.

## Docker

A minimal `Dockerfile` example for the API server:

```dockerfile
FROM node:20-slim
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile \
 && BASE_PATH=/ PORT=3000 pnpm --filter @workspace/vox-console run build \
 && pnpm --filter @workspace/api-server run build
ENV NODE_ENV=production
EXPOSE 3001
CMD ["pnpm", "--filter", "@workspace/api-server", "run", "start"]
```

Provide the environment via `--env-file .env` (never bake secrets into the
image).

## Staging

Run a second deployment with `NODE_ENV=staging`, its own `PUBLIC_URL`
(e.g. `https://staging.myra.app`), its own database, and staging OAuth
credentials. No code changes required.
