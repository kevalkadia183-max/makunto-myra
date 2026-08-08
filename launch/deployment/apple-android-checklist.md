# Apple & Android — Store Readiness Checklist

For the future native (Capacitor) builds. The web app is already PWA-ready and store assets live in `launch/brand/` and `launch/store-assets/`.

## Shared identity
- Bundle ID / package name: `com.makunto.myra` (register the same on both platforms)
- App name: **Makunto Myra**; icons from `launch/brand/app-icon-1024.png`

## Apple (developer.apple.com + App Store Connect)
- [ ] Apple Developer Program membership
- [ ] Register App ID `com.makunto.myra` with capabilities: Push Notifications, Associated Domains, Sign in with Apple (future)
- [ ] Associated Domains entitlement: `applinks:app.makunto.com` (deep links) and `webcredentials:app.makunto.com`
- [ ] Sign in with Apple: enable in Clerk (Auth pane → sign-in providers) — required by Apple if Google login is offered
- [ ] Privacy manifest (`PrivacyInfo.xcprivacy`) for any SDKs that require one
- [ ] App Privacy questionnaire: account info (email), usage data (channel analytics), audio (voice input — processed, not stored raw); account deletion is in-app (Settings → Delete account) ✓ (App Store 5.1.1(v))
- [ ] Microphone usage description string ("Myra listens when you talk to her")
- [ ] Screenshots (iPhone 6.7", 6.1", iPad 12.9") — capture guide in `launch/screenshots/capture-guide.md`
- [ ] App preview video — storyboard in `launch/app-preview/storyboard.md`

## Android (play.google.com/console)
- [ ] Play Console developer account
- [ ] Package `com.makunto.myra`; enroll in **Play App Signing**
- [ ] Record the app-signing SHA-1 and SHA-256 (needed for the Google Android OAuth client and App Links)
- [ ] `assetlinks.json` served at `https://app.makunto.com/.well-known/assetlinks.json` for App Links
- [ ] Play Integrity API readiness (no action until the app calls it — note only)
- [ ] Data safety form (matches the App Privacy answers above)
- [ ] Account deletion URL (Play requirement): public page on the Horizon site + in-app deletion ✓
- [ ] Adaptive icon (foreground `launch/brand/logo-m-mark-transparent.png` on `#0b0714` background), feature graphic `launch/marketing/play-feature-graphic.png`
- [ ] Screenshots phone + 7"/10" tablet

## Native OAuth note
Native Google sign-in uses `GOOGLE_ANDROID_CLIENT_ID` / `GOOGLE_IOS_CLIENT_ID` inside the app build. The backend keeps using the web client (`GOOGLE_WEB_CLIENT_ID`) for the YouTube-connect flow — tokens never live in the app.
