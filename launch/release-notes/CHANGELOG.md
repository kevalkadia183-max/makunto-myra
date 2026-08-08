# Changelog — Makunto Myra

## v65 — Aug 7, 2026
- Auto Listen: signed-in users with mic permission already granted go straight to listening after launch — no tap. New Settings toggle "Auto listen on open" (on by default). First-ever visits still need one tap to grant the mic (browser rule).
- The AI Core is alive at all times: slow rotating energy arc (amber and fast while thinking), two orbiting particles, breathing glow, speech ripples and the voice-reactive waveform ring.
- Animated aurora background with floating particles behind every screen; smooth 250ms page transitions on every tab switch; press feedback on every button.
- Status chip now has a FETCHING state (blue) while background data loads, alongside the animated standby/listening/thinking/speaking states.
- Bottom navigation rebuilt as a five-equal-columns grid — no tab can clip or push off-screen on any phone width; safe-area insets respected.
- All motion respects reduced-motion accessibility and is hidden in Recording Mode.

## v64 — Aug 7, 2026
- Smart greeting rotation: Myra remembers how she greeted you last time (privately, on the server) and always opens differently — time-of-day warmth, an interesting number, or a light quip.
- Faster greetings: the welcome message reuses the analytics pre-warmed at sign-in instead of waiting for a fresh YouTube fetch.
- Multi-question turns: "How's my channel? Compare my competitors. What's trending?" now gets each part answered in order in one reply — no re-asking.

## v63 — Aug 7, 2026
- Conversation and data fetching now run independently: greetings and small talk answer immediately without waiting for YouTube; channel numbers load in the background and are ready by the next turn.
- Multi-intent handling: "Hi Myra, how are you? Give me my analytics" gets an instant friendly greeting while the analytics fetch runs.
- Startup cache: right after sign-in the app pre-warms Myra's analytics and preloads Insights in the background, so first questions answer fast.

## v62 — Aug 7, 2026
- Production launch prep: OAuth callback URLs now come from a `PUBLIC_URL` environment variable (with `GOOGLE_REDIRECT_URI` / `FACEBOOK_REDIRECT_URI` overrides), plus standard `GOOGLE_WEB_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` credential names — the app runs identically on any host, no Replit dependency.
- **Fixed:** startup consistency — Myra never says "no account connected" while a signed-in session is still restoring; she says "I'm reconnecting to your accounts" and waits.
- Admin System Status panel (Settings → Developer): environment, API/database health, round-trip latency, and every provider's configuration at a glance.
- New deployment docs in `launch/deployment/`: production launch guide with full environment-variable reference, Google Cloud checklist, Meta setup checklist, Apple & Android store readiness.

## v61 — Aug 7, 2026
- Real-time conversation: topic-aware acknowledgments ("Sure, let me check your latest analytics"), staged progress narration while data loads, instant replies for greetings, friendly spoken error recovery.
- Insight cards are conversational: tap a card and follow-up questions like "why?" are understood in that card's context.
- Much faster follow-up answers via short-lived server-side caching of channel data (invalidated instantly when accounts change).

## v60 — Aug 7, 2026
- Radar replaced by AI Insights: 12 tappable insight cards (health, growth, trending, competitors, opportunities, warnings, recommendations, upload time, audience, recent uploads, monetization, reports) with full-page details and Myra voice explanations; platform filter chips when multiple platforms are connected.
- Bottom navigation renamed: Talk · Dashboard · Insights · Accounts · History.

## v59 — Aug 6, 2026
- In-app account deletion (App Store 5.1.1(v) / Play User Data requirement): Settings → Delete account permanently removes all personal data (connected accounts, snapshots, conversations, voice key) and closes the login account. Double confirmation; blocked in Presentation Mode.
- New brand: the Makunto "M" gradient monogram replaces the orb as app icon and logo (orb remains Myra's in-app avatar).

## v58 — Aug 6, 2026
- Presentation Mode (admin-only, Settings → Developer): six fictional creator personas — Creator, Gaming, Business, Food, Travel, Tech — with full analytics, competitors, briefs, trending and conversation history for store screenshots, demo videos and investor presentations. Completely isolated from real data: read-only, never saved, invisible to regular users.
- Recording Mode: hides debug text and loading skeletons for clean screen captures.

## v57 — Aug 6, 2026
- Legal, Help & About hub at `/legal.html`: Privacy Policy, Terms, Cookie Policy, Acceptable Use, Community Guidelines, AI Usage, Data Retention, GDPR, Account Deletion, DMCA, Security Overview, Accessibility, Licenses, FAQ, About, Support — linked from Settings and the Social Accounts page.

## v56 — Aug 6, 2026
- **Fixed:** signed-in users no longer greeted as guests — Myra now waits for authentication before greeting, and re-greets properly if sign-in completes late.
- Premium UI polish: real platform logos on glassy Social Accounts cards, per-state animated status indicator, breathing/rippling voice orb, glowing bottom nav with springy icons, skeleton loaders instead of blank screens, card entrance animations, press feedback, reduced-motion support.

## v55 — Aug 6, 2026
- Social Accounts page: platform cards for YouTube/Instagram/Facebook with connection status and account counts; Coming Soon cards for X, TikTok, LinkedIn, Threads, Pinterest.
- Myra understands platform scope: single-platform questions, "all accounts" summaries, per-account breakdowns.

## v54 — Aug 6, 2026
- Login is now required — full-screen sign-in before the app opens.

## v53 — Aug 6, 2026
- Server-side account protection: every personal-data endpoint requires a verified sign-in; guests can no longer access any user data.

## v52 — Aug 6, 2026
- iPhone hands-free listening made self-healing (watchdog restarts a stalled mic loop).
