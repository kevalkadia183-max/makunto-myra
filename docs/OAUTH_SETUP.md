# OAuth setup

Myra (a Makunto product) uses two OAuth providers. Detailed click-by-click checklists live in `launch/deployment/google-cloud-checklist.md` and `launch/deployment/meta-setup-checklist.md`; this is the summary.

## Google / YouTube
1. Google Cloud Console → create a project → enable **YouTube Data API v3** and **YouTube Analytics API**.
2. Create an **API key** → `YOUTUBE_API_KEY` (public data & competitor tracking).
3. Create an **OAuth 2.0 Client ID** (web application):
   - Authorized redirect URI: `https://<your-domain>/api/social/oauth/youtube/callback`
   - → `YOUTUBE_OAUTH_CLIENT_ID`, `YOUTUBE_OAUTH_CLIENT_SECRET`
4. OAuth consent screen: external, scopes `youtube.readonly` + `yt-analytics.readonly`. Publish the app (or add testers while in testing mode).

## Meta (Facebook Pages + Instagram Business)
1. developers.facebook.com → create an app (Business type).
2. Add **Facebook Login** product; Valid OAuth Redirect URI: `https://<your-domain>/api/social/oauth/facebook/callback`
3. → `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`.
4. Permissions: `pages_show_list`, `pages_read_engagement`, `instagram_basic`, `instagram_manage_insights` (App Review required for public launch).

## Authentication (Clerk)
User sign-in is Clerk, not OAuth you configure per-platform. Create an application at clerk.com → copy the publishable + secret keys into the environment. Add your production domain in Clerk's dashboard.

## Redirect URI rules
- The server builds redirect URIs from `PUBLIC_URL`; overrides: `GOOGLE_REDIRECT_URI`, `FACEBOOK_REDIRECT_URI`.
- The URIs registered at Google/Meta must match **exactly** (scheme, domain, path).
- When the domain changes (e.g. moving off a temporary domain), update both provider consoles and `PUBLIC_URL`.
