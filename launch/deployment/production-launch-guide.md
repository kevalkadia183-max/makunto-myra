# Makunto Myra — Production Launch Guide

This guide covers running Makunto Myra outside the Replit workspace: VPS, Docker, or any cloud host, plus what the mobile (Capacitor) builds need from the backend.

## Architecture

```
Web (PWA) / iOS app / Android app
        │  HTTPS (same-origin /api or configured base URL)
        ▼
Makunto Backend API  (Express, artifacts/api-server)
        │
        ├── PostgreSQL (conversations, channels, snapshots, voice keys)
        ├── Clerk (authentication — sessions, Google/Apple sign-in)
        ├── Google APIs (YouTube Data + Analytics, OAuth)
        ├── Meta APIs (Facebook Login, Instagram Graph)
        ├── Anthropic (Myra's reasoning)
        └── ElevenLabs / OpenAI (natural voice TTS/STT)
```

Secrets live **only** on the backend. The web/mobile clients never see API keys, OAuth client secrets, or refresh tokens — they talk to `/api/*` and the backend does the rest.

## Environment variables

All configuration comes from environment variables. Nothing is hardcoded.

### Required
| Variable | Purpose |
|---|---|
| `PORT` | Port the API/web server listens on |
| `DATABASE_URL` | PostgreSQL connection string |
| `PUBLIC_URL` | Public origin of the deployed app (e.g. `https://app.makunto.com`). Used to build OAuth callback URLs. On Replit this falls back to the platform-provided domain automatically. |
| `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Authentication (Clerk) |
| `SESSION_SECRET` | Session/cookie signing |
| `ANTHROPIC_API_KEY` (or `AI_INTEGRATIONS_ANTHROPIC_*` on Replit) | Myra's chat intelligence |

### Google / YouTube
| Variable | Purpose |
|---|---|
| `GOOGLE_WEB_CLIENT_ID` (alias: `YOUTUBE_OAUTH_CLIENT_ID`) | Web OAuth client ID |
| `GOOGLE_CLIENT_SECRET` (alias: `YOUTUBE_OAUTH_CLIENT_SECRET`) | Web OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Optional explicit override; default is `https://<PUBLIC_URL>/api/social/oauth/youtube/callback` |
| `YOUTUBE_API_KEY` | YouTube Data API key (public data, trending) |

`GOOGLE_ANDROID_CLIENT_ID` and `GOOGLE_IOS_CLIENT_ID` are **not** backend variables — native client IDs belong in the mobile build configuration (see apple-android-checklist.md). The backend only runs the web/authorization-code flow.

### Meta
| Variable | Purpose |
|---|---|
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | Meta app credentials |
| `FACEBOOK_REDIRECT_URI` | Optional override; default `https://<PUBLIC_URL>/api/social/oauth/facebook/callback` |

### Voice
| Variable | Purpose |
|---|---|
| `ELEVENLABS_API_KEY` | Primary natural voice (TTS) |
| `OPENAI_API_KEY` (or `AI_INTEGRATIONS_OPENAI_*`) | Backup voice + speech-to-text |

### Admin
| Variable | Purpose |
|---|---|
| `ADMIN_EMAILS` | Comma-separated emails allowed to use Presentation Mode, Recording Mode, and the System Status panel |

## Environments (dev / staging / production)

Run three deployments of the same code, each with its own:
- `PUBLIC_URL` (e.g. `dev.makunto.com`, `staging.makunto.com`, `app.makunto.com`)
- Database (`DATABASE_URL`)
- OAuth clients (separate Google + Meta apps per environment — never share redirect URIs)
- Clerk instance (Clerk supports development vs production instances; production requires your own domain)

## Replit-specific pieces (and what replaces them)

| On Replit | Elsewhere |
|---|---|
| `REPLIT_DOMAINS` / `REPLIT_DEV_DOMAIN` for OAuth callbacks | Set `PUBLIC_URL` |
| Replit PostgreSQL | Any PostgreSQL 15+ (`DATABASE_URL`) |
| Replit deploy | Any Node 20+ host; `pnpm install && pnpm --filter @workspace/api-server build && start` behind a TLS proxy |
| Replit Vite dev plugins | Only active in development; excluded from production builds |

The app has **no runtime dependency** on Replit APIs, storage, or auth.

## Boot sequence (client)

1. Restore Clerk session (auth overlay while loading)
2. Boot gate: any question asked before the session is restored waits (Myra says "I'm reconnecting to your accounts") — she never wrongly answers "no account connected" during startup
3. Restore connected accounts + cached analytics (server-side, per-request)
4. Restore preferences (localStorage: voice, personality)
5. Greeting/daily brief

## Deploy checklist

1. Provision PostgreSQL; set `DATABASE_URL`; migrations run automatically on API start
2. Set every required env var above; verify with the admin **System Status** panel (Settings → Developer → System status)
3. Set `PUBLIC_URL` and register the two OAuth callback URLs with Google and Meta (see the per-platform checklists in this folder)
4. Point your domain at the host with HTTPS (OAuth requires it)
5. Sign in as an admin and run System Status — everything should read OK
6. Walk `launch/test-checklists/` before announcing
