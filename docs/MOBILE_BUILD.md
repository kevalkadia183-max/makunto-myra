# Mobile — PWA build

Myra ships as a **Progressive Web App**: users install it from the browser to their home screen. There is no native iOS/Android binary yet (store checklists for a future native wrapper live in `launch/deployment/apple-android-checklist.md`).

## How it works
- The frontend (`artifacts/vox-console`) is installable: users open the production URL in Safari/Chrome → Share → **Add to Home Screen**.
- Requirements for full functionality on phones:
  - HTTPS origin (mic + audio APIs require it)
  - One first tap to unlock audio/mic (platform rule on iOS/Android — cannot be bypassed)
  - Microphone permission granted for the site

## Platform notes (hard-won)
- **iOS Safari:** speech synthesis needs a tap-gesture unlock; recognition uses MediaRecorder + server STT; the audio session lingers after playback, so the mic reopen retries with backoff. Do not "simplify" these code paths without device testing.
- Home-screen links must point at the **production** domain — not a temporary development URL.

## Building
Same as the web build:
```bash
BASE_PATH=/ pnpm --filter @workspace/vox-console run build   # → dist/public/
```
Serve over HTTPS and the app is installable as-is.
