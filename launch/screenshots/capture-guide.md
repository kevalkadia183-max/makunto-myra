# Screenshot Capture Guide (iPhone, Android & Tablet)

All captures use **Presentation Mode** (Settings → Developer, admin account only) so every screenshot shows rich fictional data — never real accounts. Turn **Recording Mode** on too: it hides debug text and loading skeletons.

## Setup (2 minutes)
1. Sign in with the admin account at the app.
2. Settings → Developer → Presentation: pick a persona (use **Creator — Luma Creates** for the hero set; **Food — Plates by Priya** shows 3 platforms at once).
3. Settings → Developer → Recording: **On**.
4. Use a Chromium browser → DevTools → Device toolbar to set the exact viewport, then capture screenshot (`Cmd/Ctrl+Shift+P` → "Capture screenshot").

## Required sizes
| Target | Viewport (portrait) | Store requirement |
|---|---|---|
| iPhone 6.9" (Pro Max) | 440 × 956 @3x | 1320 × 2868 px |
| iPhone 6.5" | 428 × 926 @3x | 1284 × 2778 px |
| Android phone | 412 × 915 @2.6 | 1080 × 2400 px |
| iPad Pro 13" | 1032 × 1376 @2x | 2064 × 2752 px |
| Android tablet | 800 × 1280 @2 | 1600 × 2560 px |

(DevTools: set the CSS viewport and DPR; "Capture screenshot" outputs full-resolution PNG.)

## The 8-shot set (per checklist in asset-checklist.md)
1. **Talk** — orb idle with greeting text visible ("Talk to your analytics")
2. **Talk while speaking** — orb in speaking state with an answer on screen
3. **Dashboard** — persona's channels with green deltas
4. **Daily Brief** — full 7-part brief card
5. **Radar** — trending list
6. **Social Accounts** — connected platforms grid
7. **History** — saved conversations list
8. **Settings/voices** — personality & voice pickers

## Rules
- Fictional personas only — never capture with Presentation off.
- Consistent persona within one store set.
- Status bar: capture in-browser (no OS chrome); device frames are added later per the asset checklist (dark purple-glow backgrounds, captions in `#f4f1fa`).
- Save raw captures to `launch/screenshots/raw/<device>/<nn>-<screen>.png`; framed finals to `launch/screenshots/final/`.
