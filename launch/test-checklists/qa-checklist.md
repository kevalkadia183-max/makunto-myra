# Pre-Release QA Checklist

Run on: iPhone Safari (primary) · Android Chrome · Desktop Chrome. Test both preview and the **published** app (they run different builds until republished).

## Authentication
- [ ] Sign up with a new email → verification works → lands signed in
- [ ] Google sign-in works (dev domain AND makuntovoice.replit.app redirect URIs configured)
- [ ] Refresh keeps the session; Myra greets by name — never "Guest Mode" after login
- [ ] Sign out returns to the login wall; no personal data visible afterwards
- [ ] Anonymous API calls to personal endpoints return 401 (spot-check with DevTools)

## Voice
- [ ] Myra's greeting plays out loud (iPhone may need first tap — known limitation, task queued)
- [ ] Ask "how are we doing?" → correct spoken answer with real numbers
- [ ] Interrupt Myra mid-sentence → she stops immediately and listens
- [ ] Hands-free loop survives 5+ exchanges without dying (VAD watchdog)
- [ ] Premium voice plays when selected; falls back gracefully if provider fails

## Data screens
- [ ] Dashboard loads with skeletons → real stats; deltas correct vs yesterday
- [ ] Daily Brief appears and matches spoken brief
- [ ] Radar loads trending + competitors
- [ ] Social Accounts: YouTube/Instagram/Facebook cards show correct status & counts
- [ ] Connect YouTube OAuth full round-trip works; account appears; Myra sees analytics
- [ ] Add + remove a competitor
- [ ] Conversation history persists across sessions; Clear History works

## Layout & accessibility
- [ ] No overflow/truncation on iPhone SE width (375px) and tablet
- [ ] All tap targets ≥ 40px; text readable at 200% zoom
- [ ] Reduced-motion setting disables animations
- [ ] Legal page loads signed-out; all 16 sections + footer links work

## Launch hygiene
- [ ] Build tag visible in SETUP (matches latest)
- [ ] No console errors on load
- [ ] No placeholder text anywhere user-visible
- [ ] Published app republished + smoke-tested after final build
