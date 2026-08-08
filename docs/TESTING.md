# Testing

## Current state — honest summary
There is **no automated unit/integration test suite yet**. Quality is currently held by:

1. **Type checking** — `pnpm run typecheck` (TypeScript across server + shared libs).
2. **Frontend syntax gate** — the console is one large script in `artifacts/vox-console/index.html`; extract and check it:
   ```bash
   python3 - <<'EOF'
   import re
   html = open('artifacts/vox-console/index.html').read()
   open('/tmp/big.js','w').write(max(re.findall(r'<script>(.*?)</script>', html, re.S), key=len))
   EOF
   node --check /tmp/big.js
   ```
3. **Build test** — both packages must build cleanly (also run in CI).
4. **Scripted browser QA** — sign-in, all five tabs, insight cards, settings, competitor add/remove, and API status checks are exercised in a real browser before releases. Manual device checklist: `launch/test-checklists/qa-checklist.md` (voice/mic behavior can only be truly verified on real phones).

## What CI runs on every PR
Install → typecheck → frontend syntax check → production build. See `.github/workflows/ci.yml`.

## Known gaps (planned)
- Unit tests for server route logic (identity, OAuth callback handling, report caching)
- API contract tests for `/api/vox/*` and `/api/social/*`
- Fixture-based DB tests (use `tests/fixtures/` — fictional data only)

## Rules
- Never test against real user data; use fictional fixtures (`tests/fixtures/`).
- Voice features must be re-verified on a real iPhone after changes to the speech pipeline — simulators and headless browsers do not reproduce mobile audio rules.
