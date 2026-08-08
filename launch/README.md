# Makunto Myra — Launch Folder

Everything needed for store submission and public launch. **The marketing website is built in Horizon** — this folder is its asset & content supply, organized for direct copy-in.

> **Reminder:** store submission requires mobile packaging first (queued task
> "Let people install Makunto on their phone like a real app").

## Contents

| Folder | What's inside | Status |
|---|---|---|
| `website-content/` | Features copy, comparison tables, FAQ, About/Contact/Support copy, SEO & OG metadata | ✅ Ready to paste into Horizon |
| `website-components/` | Modular self-contained HTML sections (hero, features grid, FAQ accordion, footer) — scoped styles, copy the whole block | ✅ Ready |
| `brand/` | **Makunto "M" logo** (transparent, dark, full lockup), app icon 1024 (M mark), favicons (16/32/48/.ico), PWA icons (192/512), apple-touch 180, orb avatar, brand guidelines | ✅ Ready |
| `marketing/` | OG image 1200×630, Play feature graphic 1024×500, social banners (X 1500×500, Facebook 1640×924, LinkedIn 1128×191), download-badge rules, asset checklist | ✅ Ready |
| `press-kit/` | Boilerplate, fast facts, story angles, asset index, usage rules | ✅ Ready |
| `legal/` | Privacy Policy & Terms (website markdown versions; canonical lives in-app at `/legal.html`) | ✅ Ready |
| `store-assets/` | App name, subtitle, descriptions, keywords, privacy labels | ✅ Ready |
| `app-preview/` | 30-second App Store preview video storyboard | ✅ Ready |
| `screenshots/` | Capture guide (iPhone/Android/tablet sizes, 8-shot set) using Presentation Mode | 📸 Guide ready — captures pending (task queued) |
| `demo-data/` | Demo persona plan — **now implemented as Presentation Mode** (Settings → Developer, admin only, 6 personas + Recording Mode) | ✅ Built (app v58) |
| `release-notes/` | Changelog v52–v58 + What's New template | ✅ Ready |
| `test-checklists/` | Pre-release QA checklist | ✅ Ready |

## For the Horizon website team — quick start
1. Copy sections from `website-components/` (each block is self-contained; replace `ORB_IMG` in the hero).
2. Pull page copy from `website-content/` and legal pages from `legal/`.
3. Upload `marketing/og-image.png` to the site root and add tags from `website-content/seo-metadata.md`.
4. Use `brand/` icons for favicons/PWA; follow `brand/brand-guidelines.md` for colors (`#7c3aed` purple on `#0b0714` dark).
5. Store badges: **official artwork only** — see `marketing/download-badges.md`; until the apps ship, use the "Open Makunto Myra" button.
6. Screenshots: capture per `screenshots/capture-guide.md` with Presentation Mode + Recording Mode (fictional data only).

## Placeholders to resolve before launch
- `support@makunto.app` — set up this inbox or replace everywhere (legal, press kit, footer).
- Store listing URLs & Google Play package id — fill in `marketing/download-badges.md` once published.
- Press quotes attribution name in `press-kit/press-kit.md`.
