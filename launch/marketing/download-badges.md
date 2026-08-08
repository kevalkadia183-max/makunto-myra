# Download Badges — usage guide for the Horizon website

Apple and Google **require the official badge artwork** — never recreate or restyle their badges. Generated look-alikes violate their brand rules and can block store approval.

## Official sources (free, ready-to-use)
- **App Store badge:** https://developer.apple.com/app-store/marketing/guidelines/ — "Download on the App Store" (SVG/PNG, all locales)
- **Google Play badge:** https://play.google.com/intl/en_us/badges/ — "Get it on Google Play" (generator with locale + format)

## Rules that matter
- Keep the badges' original proportions and colors; minimum height ~40px on web.
- Badges must link to the live store listings (fill URLs when the apps are published):
  - App Store: `https://apps.apple.com/app/idXXXXXXXXX`
  - Google Play: `https://play.google.com/store/apps/details?id=app.makunto.myra` *(final package id TBD)*
- Google requires the attribution line "Google Play and the Google Play logo are trademarks of Google LLC." in the page footer.
- Do NOT show the badges before the apps are actually live — use a "Coming soon to iOS & Android" text pill in brand purple instead.

## Until the mobile apps ship
Use these buttons instead of store badges:
- Primary: **"Open Makunto Myra"** → https://makuntovoice.replit.app
- Secondary: **"Coming soon to the App Store & Google Play"** (non-clickable pill, muted text `#8a84a0` on panel `#151021`)
