# Troubleshooting

## Myra is silent on the phone
1. One tap is required after opening the app (platform rule) — the orb says "TAP TO START".
2. Check mic permission for the site in browser settings.
3. Premium voice failing? The provider chain falls back to the device voice; the reply text always appears in Settings → Conversation history. Server logs show `CLIENT-VOICE` events (`cloud-play-fail`, `cloud-audio-error`) explaining phone-side playback failures.
4. ElevenLabs quota exhausted → the app switches to the free device voice and says so.

## Sign-in loops or 401s
- Clerk keys mismatch between environment and Clerk dashboard, or the domain isn't registered in Clerk. Check `CLERK_*` variables.

## OAuth "redirect_uri_mismatch"
- The redirect URI registered at Google/Meta must exactly equal `$PUBLIC_URL/api/social/oauth/<provider>/callback`. Update the provider console after any domain change.

## Blank page after deploy
- Frontend built with the wrong `BASE_PATH`, or `/api/*` isn't routed to the API server. Check the reverse-proxy config.
- Check for a `boot-error` beacon in server logs — the app reports client startup crashes to `/api/vox/client-log`.

## API won't start
- `DATABASE_URL` unreachable, or a migration failed — the log shows "Running DB migrations" and the failing SQL. Migrations are idempotent; re-running after fixing connectivity is safe.

## Stale app on phones
- Home-screen PWAs cache aggressively: close the app fully and reopen, or reinstall the shortcut after big releases.
