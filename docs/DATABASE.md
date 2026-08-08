# Database

- **Provider:** PostgreSQL 15+ (any host: managed Postgres, RDS, Neon, Supabase-as-plain-Postgres, self-hosted).
- **ORM:** Drizzle. Schema source: `lib/db/src/schema/`. Migrations: `lib/db/migrations/` (SQL, journaled).

## Tables
| Table | Purpose | Key relationships |
|---|---|---|
| `conversations` | A chat/voice session per user (`client_id`) | has many `messages` |
| `messages` | Individual user/assistant messages | `conversation_id` → conversations (cascade) |
| `channels` | Tracked social accounts — own and competitors (`is_competitor`) | has many `channel_snapshots` |
| `channel_snapshots` | One stats snapshot per channel per day (subs, views, recent videos JSON) | `channel_id` → channels (cascade); unique index `(channel_id, snapshot_date)` |
| `voice_keys` | Per-user encrypted ElevenLabs API key | keyed by `client_id` |

User identity is Clerk's user id in the form `user:<clerk_id>` (`client_id` columns). The `user:` namespace is reserved for verified sessions.

## Migrations
- Generated with drizzle-kit from the schema: `pnpm --filter @workspace/db exec drizzle-kit generate --config drizzle.config.ts` (run from `lib/db/`; the config uses relative paths).
- **Applied automatically at API server startup** (`src/lib/migrate.ts`) — there is no separate migrate command. Migrations must stay idempotent.
- The build copies `lib/db/migrations/` into `artifacts/api-server/dist/migrations/`.

## Seed data
None required — a fresh database starts empty and works. Demo/presentation personas are fictional and generated in code (`src/lib/presentation.ts`), not stored as user rows.

## Backup / restore
```bash
pg_dump "$DATABASE_URL" --format=custom --file=myra-$(date +%F).dump   # backup
pg_restore --clean --no-owner --dbname "$DATABASE_URL" myra-YYYY-MM-DD.dump  # restore
```
Schedule daily dumps in production. **Never commit dumps or any real user data to the repository.**
