# Makunto Brand Guidelines

For the Horizon website team and any marketing production.

## Name & voice
- Product: **Makunto Myra** (first mention), then **Myra**. Company/family: **Makunto**.
- Never "VOX" (legacy internal name — retired).
- Tone: sharp, warm, human. Myra speaks like a senior strategist who's also a friend — confident, concrete, lightly playful. Avoid corporate filler and hype words like "revolutionary".
- Always "talk to Myra", never "use the chatbot".

## Color palette
| Role | Hex | Usage |
|---|---|---|
| Background (deep) | `#0b0714` | Page/app background |
| Panel | `#151021` | Cards, surfaces |
| Primary purple | `#7c3aed` | Buttons, links, brand accents |
| Light purple | `#a78bfa` | Hover states, secondary accents, link text |
| Glow violet | `#8b5cf6` | Orb glow, gradients |
| Text | `#f4f1fa` | Primary text on dark |
| Muted text | `#8a84a0` | Secondary text |
| Success | `#34d399` | Positive deltas |
| Warning/negative | `#f87171` | Drops, alerts |

Gradients: purple orb glow `#a78bfa → #7c3aed`, backgrounds fade `#151021 → #0b0714`. The brand is **dark-first**; light backgrounds only for documents.

## Typography
- App uses system UI stack (`-apple-system, Segoe UI, Roboto…`). Website may use a modern geometric sans (e.g. Inter, Space Grotesk) — headings semibold, generous letter-spacing on small caps labels.
- Numbers are heroes: display stats large, with green/red delta chips.

## The logo — the Makunto "M"
The gradient **M monogram** (purple → blue ribbon) is the master brand logo. Files in `launch/brand/`:
- `logo-m-mark-transparent.png` — the M alone, transparent background (use this on the website)
- `logo-m-mark-dark.png` — the M on the brand dark background
- `logo-lockup-dark.png` — M + "Makunto" wordmark + "CREATE · OPERATE · GROW" tagline (hero/press usage)
- `app-icon-1024.png` — app icon (M centered on `#0b0714`), plus exported sizes: `icon-512/192/180/48/32/16.png` and `favicon.ico`

Rules:
- Prefer dark backgrounds; on light backgrounds use the transparent M (the gradient holds up) with extra clear space.
- Clear space around the mark: at least 50% of its width.
- Don't recolor, outline, flip, squash, or add effects to the M.
- Minimum size: 20px (favicon sizes are pre-exported).
- Logo gradient: magenta-purple `#a855f7` → violet `#6d28d9` (left stroke), cyan `#22d3ee` → blue `#2563eb` (right stroke).
- Tagline "CREATE · OPERATE · GROW" appears only in the full lockup — never re-set it in another font.

## The orb — Myra's avatar
The glowing purple orb represents **Myra listening** — it is the product/voice avatar, not the company logo. Use it inside the app UI, the website hero, and screenshots. Rules:
- Always on dark backgrounds; keep the glow.
- Don't recolor, outline, flip, or add faces to the orb.
- Don't use the orb where a logo is expected (headers, favicons, store icons) — that's the M's job.
- PWA icons 192, 512 px
- monochrome white mark (for footers)

## Imagery style
Dark indigo scenes, soft neon purple glow, floating analytic lines/sparklines, subtle grain. No stock photos of people at laptops. Screenshots always in device frames on dark gradient backgrounds (see `launch/marketing/asset-checklist.md`).

## Writing the numbers (marketing accuracy rule)
All published screenshots and videos use **fictional Presentation Mode personas** — never real user data. Don't invent user counts or revenue claims in copy.
