# Makunto Myra — Architecture

Myra is a Makunto product: a voice-first AI copilot for creators. Two deployable services plus a shared database library, in a pnpm monorepo.

```
Browser (vox-console SPA + PWA)
   │  HTTPS  /api/*
   ▼
Express API server (artifacts/api-server)
   ├── PostgreSQL (lib/db — Drizzle ORM)
   ├── Clerk (authentication)
   ├── OpenAI-compatible LLM (chat brain)
   ├── ElevenLabs / OpenAI TTS (premium voice) + Whisper-style STT
   ├── YouTube Data & Analytics APIs (Google OAuth)
   └── Meta Graph API (Facebook Pages / Instagram Business OAuth)
```

## Components

### Frontend — `artifacts/vox-console/`
- Vanilla-JS single-page app (`index.html`, one main script) built with Vite; `legal.html` for privacy/terms/FAQ.
- Views: Talk (voice orb), Dashboard, Insights, Accounts, Rivals (competitors); conversation History opens from Settings.
- Voice pipeline (client): mic capture → on iOS, MediaRecorder + server STT; on desktop, browser SpeechRecognition. Speech output goes through a provider chain — device voice (free) → cloud voice — that must never end in silence.
- Auth: Clerk browser SDK via `auth.js`; the client sends the Clerk session token to the API.
- PWA: installable to the home screen; mobile audio requires one tap to unlock (platform rule).

### Backend — `artifacts/api-server/`
- Express (TypeScript, esbuild bundle). All routes under `/api`.
- `src/routes/vox.ts` — chat, greeting, TTS/STT proxy, conversations, warm-up cache, client crash/voice telemetry.
- `src/routes/social.ts` — channel CRUD (own accounts + competitors), daily snapshots, reports, insights, Google & Meta OAuth callbacks.
- `src/lib/` — `youtube.ts` (Data/Analytics APIs), `meta.ts` (Graph API), `googleAuth.ts` (OAuth), `identity.ts` (verified `user:` ids from Clerk sessions; guest ids are sanitized), `presentation.ts` (admin-only demo personas — fictional data, read-only), `openaiVoice.ts` (TTS fallback), `migrate.ts` (runs SQL migrations at startup).
- Auth middleware verifies Clerk sessions; personal-data endpoints require a verified user.

### Database — `lib/db/`
Drizzle ORM + PostgreSQL. Tables: `conversations`, `messages`, `channels`, `channel_snapshots`, `voice_keys`. Migrations in `lib/db/migrations/`, copied into the server build and applied automatically at startup. See `docs/DATABASE.md`.

## How components communicate
- Frontend → API: same-origin `fetch` to `/api/...` with the Clerk token and an `X-Client-Id` header. URLs are relative — the SPA works behind any domain.
- API → Google/Meta: server-side OAuth (authorization-code flow); callback paths `/api/social/oauth/youtube/callback` and `/api/social/oauth/facebook/callback`. The public origin comes from `PUBLIC_URL`.
- API → AI/voice providers: server-side only; keys never reach the browser. Users may store their own ElevenLabs key (per-user, in `voice_keys`).
- Reports & insights: the server snapshots channel stats daily, caches report data, and the LLM narrates the numbers.

## Cross-cutting concerns
- **Presentation Mode:** admin-gated fictional personas for demos; demo requests short-circuit before touching real data and all mutations are blocked.
- **Notifications / email:** not yet implemented (planned; see project tasks).
- **Analytics:** no third-party analytics; server logs (pino) plus client voice-event beacons to `/api/vox/client-log`.
- **Tests:** no automated unit-test suite yet; verification is typecheck + build + scripted browser QA. See `docs/TESTING.md`.
