# Environment variables

All configuration is environment-driven; nothing is hardcoded to a host. Copy `.env.example` to `.env` and fill in values. **Never commit `.env`, keys, tokens, or certificates.**

## Application
| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | yes | `development` / `staging` / `production` |
| `PORT` | yes | API server port |
| `BASE_PATH` | build-time | Frontend base path (usually `/`) |
| `PUBLIC_URL` | production | Public HTTPS origin, e.g. `https://myra.example.com`. Used for OAuth redirect URIs and links. Always wins over any platform-provided domain variable. |

## Database
| `DATABASE_URL` | yes | PostgreSQL connection string |

## Authentication (Clerk)
| `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | yes | Clerk API keys |
| `VITE_CLERK_PUBLISHABLE_KEY` | yes | Same publishable key, exposed to the frontend build |
| `SESSION_SECRET` | yes | Long random string |

## AI provider
| `AI_INTEGRATIONS_OPENAI_API_KEY` / `AI_INTEGRATIONS_OPENAI_BASE_URL` | yes | Any OpenAI-compatible endpoint (chat + STT + TTS fallback) |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` / `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | optional | Anthropic-compatible endpoint |

## Voice provider
| `ELEVENLABS_API_KEY` | optional | Server-level ElevenLabs key. Users can also save their own key in Settings (stored per-user in the DB — currently plain text; see docs/DATABASE.md). |

## Google / YouTube
| `YOUTUBE_API_KEY` | yes | YouTube Data API (public data, competitors) |
| `YOUTUBE_OAUTH_CLIENT_ID` / `YOUTUBE_OAUTH_CLIENT_SECRET` | yes | Google OAuth (connect your own channel + analytics) |
| `GOOGLE_REDIRECT_URI` | optional | Override; default `$PUBLIC_URL/api/social/oauth/youtube/callback` |

## Meta / Facebook / Instagram
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | yes for Meta | Meta app credentials (Facebook Pages + Instagram Business) |
| `FACEBOOK_REDIRECT_URI` | optional | Override; default `$PUBLIC_URL/api/social/oauth/facebook/callback` |

## Email / Notifications / Storage
Not used yet — planned features. Add variables here when implemented.

## URLs per environment
Set `PUBLIC_URL` per environment (development / staging / production); everything else derives from it. Development can omit it — the app falls back to the local/dev domain.

## Rules
- Placeholders only in `.env.example`.
- Anything prefixed `VITE_` ships to the browser — publishable values only.
- If a secret is ever committed or leaked, **rotate it at the provider** — removing it from git history is not enough.
