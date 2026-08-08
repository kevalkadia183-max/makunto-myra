# Demo Mode & Demo Data — Implementation Plan

**Purpose:** Apple/Google reviewers, marketing screenshots and demo videos need a fully-populated app **without ever exposing real personal data.**

## How it should work
- A dedicated Demo Mode, activated only by an admin-controlled mechanism (e.g. a reviewer demo account whose Clerk user id is on a DEMO_USER_IDS allowlist server-side).
- When a demo user signs in, the API serves fictional data from seeded tables instead of calling real platform APIs. Real users are never affected.
- Store submission then includes the demo account's credentials in the review notes (both stores require working credentials).

## Fictional creator personas (all data invented, realistic shapes)
| Persona | Platform mix | Scale | Story |
|---|---|---|---|
| **Alex Rivera — "Weekend Builders"** (DIY/tech) | YouTube + Instagram | 24.8K subs / 8.1K followers | Steady riser; one short went viral last week (+2.1K subs) |
| **Priya Shah — "Plates by Priya"** (food) | Instagram + Facebook + YouTube | 41K IG / 12K FB / 6.2K YT | IG-first creator expanding to video |
| **Marcus Lee — "Ctrl+Play"** (gaming) | YouTube | 88K subs | Big but plateauing — good "needs attention" storyline |
| Competitors | 2–3 per persona | comparable scale | For Radar/competitor screens |

Each persona needs: 60 days of daily stats snapshots (with plausible weekday/weekend rhythm), 8–12 recent posts/videos with titles & view counts, a daily brief, 2 saved conversations, creator goal + preferences.

## Rules
- Never mix demo and real data in the same account.
- Demo accounts clearly labeled internally; excluded from analytics.
- Credentials stored as secrets, shared only in store review notes — never in client code or repo.
