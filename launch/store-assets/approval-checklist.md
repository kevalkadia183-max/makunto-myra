# App Store & Google Play — Approval Checklist

What reviewers actually check, and where Makunto stands. ✅ done · 🔲 needs you · ⏳ queued task.

## Apple App Store (App Review Guidelines)

| Requirement | Guideline | Status |
|---|---|---|
| **Sign in with Apple** — required because we offer Google login | 4.8 | 🔲 Enable "Apple" in the workspace **Auth pane → Configure → sign-in providers** (one toggle; for production you may add custom Apple OAuth credentials there) |
| **In-app account deletion** — must fully delete the account, not just deactivate | 5.1.1(v) | ✅ Built (v59): Settings → Delete account. Removes all data (channels, snapshots, conversations, messages, voice key) **and** the login account itself |
| Privacy Policy URL + in-app access | 5.1.1(i) | ✅ In-app at `/legal.html`; website copy in `launch/legal/` — needs a live public URL on the Horizon site |
| Privacy "Nutrition Label" (data collection disclosure) | — | ✅ Drafted in `store-assets/` privacy labels — enter into App Store Connect |
| Sign-in required only for account-based features | 5.1.1 | ✅ Login gates personal analytics (account-based by nature) |
| No placeholder content, broken links, or "beta" wording | 2.1 | 🔲 Replace `support@makunto.app` placeholder; verify all legal links live |
| Support URL + contact | — | 🔲 Needs live support page/email |
| Demo account or demo mode for reviewers | 2.1 | ✅ Presentation Mode — give reviewers the admin demo, or create a review account with pre-connected data |
| Screenshots must show the real app | 2.3 | ⏳ Capture via `screenshots/capture-guide.md` (task queued) |
| Age rating questionnaire | — | 🔲 Answer in App Store Connect (expect 4+, no objectionable content) |
| Microphone permission purpose string | 5.1.1 | ⏳ Part of mobile packaging: `NSMicrophoneUsageDescription` — "Makunto listens so you can talk to Myra, your analytics assistant." |
| Actual iOS build | — | ⏳ Queued task: mobile packaging ("install like a real app") must ship first |

## Google Play

| Requirement | Where | Status |
|---|---|---|
| **Data safety form** | Play Console | 🔲 Declare: email (account), social analytics data (app functionality), voice audio (processed, not stored). Matches privacy labels draft |
| **Account deletion** — in-app + a web link to request deletion | User Data policy | ✅ In-app done (v59). 🔲 Add a "Delete your account" page/anchor on the Horizon website pointing to the in-app flow (Play Console requires a URL) |
| Privacy Policy URL (live, public) | Play Console | 🔲 Publish `launch/legal/privacy-policy.md` on the website |
| Feature graphic 1024×500 | Listing | ✅ `marketing/play-feature-graphic.png` |
| App icon 512 | Listing | ✅ `brand/icon-512.png` |
| Screenshots (phone + tablet) | Listing | ⏳ Capture guide ready |
| Content rating questionnaire | Play Console | 🔲 Answer (expect Everyone) |
| Target API level & app bundle | — | ⏳ Mobile packaging task |
| Login permission (RECORD_AUDIO) rationale | — | ⏳ Mobile packaging: request mic at first use, with in-context explanation |

## Both stores — the critical path
1. 🔲 **You:** flip on Apple in the Auth pane (2 clicks) — Google + Apple + email then all work.
2. 🔲 **You / Horizon:** publish Privacy Policy, Terms, Support and "Delete account" pages at public URLs; replace the placeholder support email.
3. ⏳ **Queued:** mobile packaging (installable app) — the actual thing you submit.
4. ⏳ **Queued:** screenshot capture with Presentation Mode.
5. 🔲 **You:** fill store questionnaires (data safety, age/content rating) using the drafts in this folder.
