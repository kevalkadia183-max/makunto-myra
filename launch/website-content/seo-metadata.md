# SEO Metadata & Open Graph Tags

For the Horizon website. Replace `https://makunto.app` with the final production domain if different.

## Home page

```html
<title>Makunto Myra — Your Voice-First AI Growth Copilot for Creators</title>
<meta name="description" content="Talk to your analytics. Myra watches your YouTube, Instagram and Facebook, explains what changed and why, and tells you what to do next — out loud.">
<meta name="keywords" content="AI for creators, YouTube analytics, voice assistant, creator growth, social media analytics, competitor tracking, content strategy AI">
<link rel="canonical" href="https://makunto.app/">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="Makunto">
<meta property="og:title" content="Makunto Myra — Talk to Your Analytics">
<meta property="og:description" content="The voice-first AI copilot that watches your channels, explains every change, and tells you what to do next.">
<meta property="og:url" content="https://makunto.app/">
<meta property="og:image" content="https://makunto.app/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Makunto Myra — Talk to Your Analytics">
<meta name="twitter:description" content="Voice-first AI growth copilot for creators. Ask out loud, hear real answers from your live numbers.">
<meta name="twitter:image" content="https://makunto.app/og-image.png">

<meta name="theme-color" content="#0b0714">
```

## JSON-LD (SoftwareApplication)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Makunto Myra",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "description": "Voice-first AI growth copilot for content creators. Live YouTube, Instagram and Facebook analytics, daily AI briefs, competitor tracking and trend radar — all through spoken conversation.",
  "offers": { "@type": "Offer", "price": "0", "priceCategory": "free tier available" },
  "publisher": { "@type": "Organization", "name": "Makunto" }
}
</script>
```

## Per-page title/description suggestions

| Page | Title | Meta description |
|---|---|---|
| Features | Features — Makunto Myra | Voice conversations, live multi-platform analytics, daily AI briefs, competitor tracking and trend radar. See everything Myra does. |
| Pricing | Pricing — Makunto Myra | Start free. Upgrade for premium voices and full multi-platform analytics. |
| About | About Makunto | Why we built a growth copilot you talk to instead of a dashboard you decode. |
| FAQ | FAQ — Makunto Myra | Answers about platforms, privacy, pricing, voices and getting started. |
| Press | Press Kit — Makunto | Logos, screenshots, product facts and boilerplate for media. |
| Privacy | Privacy Policy — Makunto | How Makunto collects, uses and protects your data. |
| Terms | Terms of Service — Makunto | The terms that govern your use of Makunto Myra. |

## SEO notes for the Horizon build
- OG image lives at `launch/marketing/og-image.png` — upload to the site root and reference absolutely.
- Add `<link rel="icon">` set from `launch/brand/` favicons (16/32/180/512 — see brand guidelines).
- The app itself (`makuntovoice.replit.app`) should get a `robots` noindex on the login wall if the marketing site is the intended search entry point; keep the marketing domain canonical.
