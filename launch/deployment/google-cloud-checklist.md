# Google Cloud Console — Production Checklist

Manual steps required in [console.cloud.google.com](https://console.cloud.google.com) before launch. Do this once per environment (staging, production).

## 1. Project & APIs
- [ ] Create a Google Cloud project (e.g. `makunto-prod`)
- [ ] Enable **YouTube Data API v3**
- [ ] Enable **YouTube Analytics API**
- [ ] (Future) Enable Google Drive API if report export to Drive ships
- [ ] Create an **API key**, restrict it to the two YouTube APIs → backend env `YOUTUBE_API_KEY`

## 2. OAuth consent screen
- [ ] User type: **External**
- [ ] App name: **Makunto Myra**; upload the app logo (`launch/brand/app-icon-1024.png`)
- [ ] Support email: your support address
- [ ] Authorized domains: your production domain (e.g. `makunto.com`)
- [ ] Links: Privacy Policy and Terms URLs (must be live public pages — Horizon site)
- [ ] Scopes: `youtube.readonly`, `yt-analytics.readonly`
- [ ] Publish status: **In production** (while "Testing", only listed test users can connect; sensitive YouTube scopes require Google's app verification — start it early, it can take weeks)

## 3. OAuth clients
### Web client (used by the backend)
- [ ] Create OAuth client → type **Web application**
- [ ] Authorized JavaScript origins: `https://app.makunto.com` (your `PUBLIC_URL`)
- [ ] Authorized redirect URIs: `https://app.makunto.com/api/social/oauth/youtube/callback`
- [ ] Copy client ID/secret → backend env `GOOGLE_WEB_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### Android client (native sign-in, when the mobile app ships)
- [ ] Create OAuth client → type **Android**
- [ ] Package name: `com.makunto.myra`
- [ ] SHA-1 fingerprint: from your Play App Signing key (Play Console → App integrity)
- [ ] Goes into the Android build config as `GOOGLE_ANDROID_CLIENT_ID` (not a backend var)

### iOS client
- [ ] Create OAuth client → type **iOS**
- [ ] Bundle ID: `com.makunto.myra`
- [ ] Goes into the iOS build config as `GOOGLE_IOS_CLIENT_ID` (not a backend var)

## 4. Verify
- [ ] Sign in on the deployed app, connect a YouTube channel end-to-end
- [ ] Check analytics data appears (Dashboard + Insights)
- [ ] Admin System Status shows Google OAuth: OK
