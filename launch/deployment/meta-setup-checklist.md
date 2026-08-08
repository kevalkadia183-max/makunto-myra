# Meta (Facebook / Instagram) — Production Checklist

Manual steps in [developers.facebook.com](https://developers.facebook.com) before launch.

## 1. App setup
- [ ] Create a Meta app (type: **Business**) — e.g. "Makunto Myra"
- [ ] Add products: **Facebook Login** and **Instagram Graph API**
- [ ] App icon, privacy policy URL, terms URL, category, data deletion instructions URL (the account-deletion page on the Horizon site satisfies this)

## 2. Facebook Login settings
- [ ] Valid OAuth Redirect URIs: `https://app.makunto.com/api/social/oauth/facebook/callback`
- [ ] App domains: `makunto.com`
- [ ] Enforce HTTPS: on (default)

## 3. Permissions & review
Requested by the app: `pages_show_list`, `pages_read_engagement`, `instagram_basic`, `instagram_manage_insights` (page/IG stats). 
- [ ] Submit for **App Review** with a screen recording of the connect flow (use Presentation Mode + Recording Mode for a clean capture)
- [ ] Business verification if Meta requires it for these permissions

## 4. Go live
- [ ] Switch the app from **Development** to **Live** mode (until then, only app-role users can connect)
- [ ] Copy App ID/Secret per environment → backend env `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`

## 5. Verify
- [ ] Connect a Facebook Page and Instagram account on the deployed app
- [ ] Admin System Status shows Meta OAuth: OK
