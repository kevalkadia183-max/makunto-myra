/**
 * Presentation Mode — admin-only fictional demo data.
 *
 * Used for App Store / Play Store previews, marketing videos, investor demos
 * and screenshots. Serves realistic FICTIONAL creator data instead of the
 * caller's real data. Never touches the database: activating a persona only
 * changes what the API returns to that one admin request, so production data
 * can never be modified or leaked.
 *
 * Activation requires BOTH:
 *   1. an `X-Demo-Persona` header naming a persona, AND
 *   2. the verified caller's Clerk email being listed in ADMIN_EMAILS.
 * Normal users can send the header all day — it does nothing for them.
 */
import { clerkClient } from "@clerk/express";
import type { Request } from "express";
import { getClientId } from "./identity";
import type { ChannelReport } from "../routes/social";

// ---------- Admin check ----------
const adminCache = new Map<string, { at: number; admin: boolean }>();
const ADMIN_TTL_MS = 10 * 60 * 1000;

export async function isAdminRequest(req: Request): Promise<boolean> {
  const clientId = getClientId(req);
  if (!clientId || !clientId.startsWith("user:")) return false;
  const userId = clientId.slice("user:".length);
  const hit = adminCache.get(userId);
  if (hit && Date.now() - hit.at < ADMIN_TTL_MS) return hit.admin;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  let admin = false;
  if (allow.length > 0) {
    try {
      const user = await clerkClient.users.getUser(userId);
      admin = user.emailAddresses.some((e) => allow.includes(e.emailAddress.toLowerCase()));
    } catch {
      admin = false; // Clerk lookup failed — fail closed
    }
  }
  adminCache.set(userId, { at: Date.now(), admin });
  return admin;
}

// ---------- Data shapes ----------
interface DemoChannelRow {
  id: number;
  clientId: string;
  platform: string;
  handle: string;
  externalId: string;
  title: string;
  thumbnailUrl: string | null;
  isCompetitor: boolean;
  createdAt: string;
}
interface DemoConversation { id: number; title: string; clientId: string; createdAt: string }
interface DemoMessage { id: number; conversationId: number; role: string; content: string; createdAt: string }

export interface Persona {
  key: string;
  label: string;
  channels: DemoChannelRow[];
  report: ChannelReport[];
  trending: Array<{ title: string; channelTitle: string; views: number }>;
  brief: Record<string, string>;
  conversations: DemoConversation[];
  messages: Record<number, DemoMessage[]>;
}

// ---------- Builders (stable, deterministic data — good for recording) ----------
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const dateOnly = (n: number) => daysAgo(n).slice(0, 10);

interface OwnSpec {
  id: number; platform: string; title: string; handle: string;
  subs: number; views: number; vids: number;
  dSubs: number; dViews: number;
  videos: Array<[string, number]>; // [title, views]
  analytics?: boolean;
}
interface CompSpec {
  id: number; platform: string; title: string; handle: string;
  subs: number; views: number; vids: number; dSubs: number;
  videos: Array<[string, number]>;
}

function reportRow(s: OwnSpec | CompSpec, isCompetitor: boolean): ChannelReport {
  const dViews = "dViews" in s ? s.dViews : Math.round(s.subs * 1.7);
  return {
    id: s.id,
    platform: s.platform,
    title: s.title,
    handle: s.handle,
    isCompetitor,
    thumbnailUrl: null,
    subscribers: s.subs,
    totalViews: s.views,
    videoCount: s.vids,
    deltas: { subscribers: s.dSubs, totalViews: dViews, videoCount: 0, sinceDate: dateOnly(1) },
    recentVideos: s.videos.map(([title, views], i) => ({
      videoId: `demo-${s.id}-${i}`,
      title,
      publishedAt: daysAgo(2 + i * 4),
      views,
      likes: Math.round(views * 0.047),
      comments: Math.round(views * 0.006),
    })),
    analytics: !isCompetitor && (s as OwnSpec).analytics
      ? {
          periodDays: 28,
          views: Math.round(s.views * 0.06),
          watchTimeMinutes: Math.round(s.views * 0.21),
          averageViewDurationSeconds: 247,
          averageViewPercentage: 46.3,
          subscribersGained: Math.round(s.dSubs * 22),
          subscribersLost: Math.round(s.dSubs * 3.1),
          likes: Math.round(s.views * 0.0031),
          comments: Math.round(s.views * 0.0004),
          shares: Math.round(s.views * 0.0007),
          trafficSources: [
            { source: "Browse features", views: Math.round(s.views * 0.024) },
            { source: "Suggested videos", views: Math.round(s.views * 0.019) },
            { source: "YouTube search", views: Math.round(s.views * 0.011) },
          ],
        }
      : null,
  };
}

function channelRow(s: OwnSpec | CompSpec, isCompetitor: boolean): DemoChannelRow {
  return {
    id: s.id, clientId: "demo", platform: s.platform, handle: s.handle,
    externalId: `DEMO${s.id}`, title: s.title, thumbnailUrl: null,
    isCompetitor, createdAt: daysAgo(45),
  };
}

function build(
  key: string, label: string,
  own: OwnSpec[], comps: CompSpec[],
  brief: Record<string, string>,
  trending: Array<[string, string, number]>,
  convo: { title: string; turns: Array<[string, string]> },
): Persona {
  const base = own[0].id * 10;
  const conversations: DemoConversation[] = [
    { id: base + 1, title: convo.title, clientId: "demo", createdAt: daysAgo(1) },
    { id: base + 2, title: "Weekly growth check-in", clientId: "demo", createdAt: daysAgo(6) },
  ];
  const messages: Record<number, DemoMessage[]> = {
    [base + 1]: convo.turns.map(([role, content], i) => ({
      id: base * 100 + i, conversationId: base + 1, role, content, createdAt: daysAgo(1),
    })),
    [base + 2]: [
      { id: base * 100 + 90, conversationId: base + 2, role: "user", content: "How did this week go overall?", createdAt: daysAgo(6) },
      { id: base * 100 + 91, conversationId: base + 2, role: "assistant", content: "Solid week. Subscribers up, watch time climbing, and your newest upload is outperforming your average by about forty percent. Keep this posting rhythm.", createdAt: daysAgo(6) },
    ],
  };
  return {
    key, label,
    channels: [...own.map((s) => channelRow(s, false)), ...comps.map((s) => channelRow(s, true))],
    report: [...own.map((s) => reportRow(s, false)), ...comps.map((s) => reportRow(s, true))],
    trending: trending.map(([title, channelTitle, views]) => ({ title, channelTitle, views })),
    brief,
    conversations,
    messages,
  };
}

// ---------- The six personas (all data fictional) ----------
export const PERSONAS: Record<string, Persona> = {
  creator: build(
    "creator", "Creator — Luma Creates (lifestyle)",
    [
      { id: -101, platform: "youtube", title: "Luma Creates", handle: "@lumacreates", subs: 24800, views: 3160000, vids: 142, dSubs: 312, dViews: 48200, analytics: true, videos: [
        ["I redesigned my tiny studio for $150", 89400], ["My honest morning routine (no aesthetic lies)", 41200], ["30 days of posting daily — results", 36800], ["Studio tour Q&A", 18900],
      ]},
      { id: -102, platform: "instagram", title: "Luma Creates", handle: "@luma.creates", subs: 9100, views: 0, vids: 214, dSubs: 84, dViews: 0, videos: [
        ["Behind the redesign — reel", 22600], ["Desk setup details", 9800],
      ]},
    ],
    [
      { id: -111, platform: "youtube", title: "Studio & Story", handle: "@studioandstory", subs: 31200, views: 4020000, vids: 188, dSubs: 145, videos: [["Why I quit my 9-5 for YouTube", 102000], ["My editing workflow", 33500]] },
      { id: -112, platform: "youtube", title: "The Maker Diary", handle: "@makerdiary", subs: 18400, views: 2110000, vids: 96, dSubs: 92, videos: [["Building my dream desk", 64300], ["Small studio, big ideas", 27100]] },
    ],
    {
      health: "Strong week — 312 new subscribers and the studio redesign video is your best performer this month.",
      competitors: "Studio & Story grew slower than you this week; you're closing the gap by about 170 subs a week.",
      trend: "Budget studio makeovers are trending — your $150 redesign video is riding exactly that wave.",
      opportunity: "A follow-up 'what broke after 30 days' video could capture the redesign audience again.",
      warning: "Instagram growth slowed to 84 this week — reels tied to your YouTube uploads usually double that.",
      upload: "Post Tuesday around 5pm — your last three Tuesday uploads outperformed other days by 28 percent.",
      quickWin: "Pin a comment on the redesign video linking your desk setup reel — easy cross-platform boost.",
    },
    [["Room makeovers under $200 that look expensive", "Casa Vida", 891000], ["I built a home studio in a closet", "TinySpace", 442000], ["Aesthetic desk setups 2026", "DeskDreams", 367000], ["Why everyone is redesigning their room right now", "TrendLens", 254000]],
    { title: "Studio video breakdown", turns: [
      ["user", "How is the studio redesign video doing?"],
      ["assistant", "It's your star this month — 89,400 views and climbing, with a 4.7 percent like rate. It's pulling in about a third of your new subscribers this week."],
      ["user", "Should I make a follow-up?"],
      ["assistant", "Absolutely. A 'one month later — what actually held up' video would ride the same search traffic. I'd film it while the momentum is hot."],
    ]},
  ),

  gaming: build(
    "gaming", "Gaming — Ctrl+Play",
    [
      { id: -201, platform: "youtube", title: "Ctrl+Play", handle: "@ctrlplay", subs: 88300, views: 14800000, vids: 421, dSubs: 197, dViews: 96400, analytics: true, videos: [
        ["I beat the new soulslike without leveling", 214000], ["100 hours in the new open world — verdict", 156000], ["Speedrunning my comfort game", 88700], ["Ranking every boss (tier list)", 61200],
      ]},
    ],
    [
      { id: -211, platform: "youtube", title: "PixelForge", handle: "@pixelforge", subs: 152000, views: 28400000, vids: 610, dSubs: 640, videos: [["The hardest challenge run yet", 480000], ["New patch broke everything", 210000]] },
      { id: -212, platform: "youtube", title: "RespawnRick", handle: "@respawnrick", subs: 64100, views: 9100000, vids: 380, dSubs: 118, videos: [["Casual playthrough ep. 12", 42000], ["My honest review", 71500]] },
    ],
    {
      health: "Steady but plateauing — 197 new subs is below your 300 average; views held up thanks to the soulslike video.",
      competitors: "PixelForge is pulling away with challenge-run content — 640 subs this week to your 197.",
      trend: "No-leveling and restriction runs are surging; your soulslike video proves your audience wants them.",
      opportunity: "A restriction-run series could become your signature format — commit to three episodes.",
      warning: "Your upload gap hit 9 days last month and views dipped 20 percent right after — consistency matters more in gaming.",
      upload: "Friday evening is your slot — gaming watch time peaks on weekends and your Friday uploads average 35 percent more.",
      quickWin: "Turn the boss tier list into three Shorts — tier lists clip beautifully and Shorts are your discovery gap.",
    },
    [["World record attempt goes wrong at the last second", "SpeedZone", 1240000], ["The new patch tier list", "MetaWatch", 693000], ["I played the worst-rated game of 2026", "TrashOrTreasure", 511000], ["No-hit run finale", "GhostRun", 388000]],
    { title: "Beating the plateau", turns: [
      ["user", "Why am I stuck at 88K?"],
      ["assistant", "Your views are healthy but they're coming from existing subscribers. Discovery is the gap — you're barely on Shorts and your challenge content, which travels furthest, is only one video a month."],
      ["user", "So more challenge runs?"],
      ["assistant", "Yes — make them a series with a name and a schedule. PixelForge grew 40 percent in six months doing exactly that. Your no-leveling video already proved your version works."],
    ]},
  ),

  business: build(
    "business", "Business — The Growth Ledger",
    [
      { id: -301, platform: "youtube", title: "The Growth Ledger", handle: "@growthledger", subs: 41600, views: 3890000, vids: 167, dSubs: 288, dViews: 41100, analytics: true, videos: [
        ["The pricing mistake killing small agencies", 96300], ["I audited a failing store live", 74800], ["5 boring businesses that print money", 68100], ["Client red flags I ignored", 44900],
      ]},
      { id: -302, platform: "facebook", title: "The Growth Ledger", handle: "growthledger", subs: 12800, views: 0, vids: 89, dSubs: 41, dViews: 0, videos: [["Weekly office hours recap", 8400], ["Pricing cheat sheet post", 15200]] },
    ],
    [
      { id: -311, platform: "youtube", title: "Margin Notes", handle: "@marginnotes", subs: 58900, views: 6100000, vids: 240, dSubs: 310, videos: [["How I'd start over with $1,000", 188000], ["The consulting ladder", 59000]] },
    ],
    {
      health: "Excellent week — 288 new subscribers and the live audit format just became your second-best performer.",
      competitors: "Margin Notes matches your weekly growth but posts twice as often — your per-video efficiency is double theirs.",
      trend: "Live teardowns and audits are the hot format in business content right now.",
      opportunity: "Turn the live audit into a monthly series — viewers can submit their own businesses.",
      warning: "Facebook engagement is drifting down; the cheat-sheet posts work, the recaps don't.",
      upload: "Wednesday noon — your professional audience watches at lunch, and your Wednesday videos retain 8 percent better.",
      quickWin: "Add a one-line CTA to the audit video inviting submissions — it seeds next month's episode for free.",
    },
    [["I analyzed 100 failed startups", "Postmortem", 720000], ["The $10K/month boring business blueprint", "CashflowCo", 495000], ["Live: roasting your landing pages", "ConvertLab", 301000], ["Why most agencies die at 10 clients", "AgencyOS", 227000]],
    { title: "Audit series planning", turns: [
      ["user", "The live audit did well, right?"],
      ["assistant", "74,800 views — second best this month, and it converted subscribers at nearly twice your channel average. The format clearly resonates."],
      ["user", "Make it monthly?"],
      ["assistant", "Yes, and let viewers submit their businesses. Submission-driven formats compound — the audience becomes your content pipeline. Announce it in this week's video."],
    ]},
  ),

  food: build(
    "food", "Food — Plates by Priya",
    [
      { id: -401, platform: "instagram", title: "Plates by Priya", handle: "@platesbypriya", subs: 41300, views: 0, vids: 486, dSubs: 356, dViews: 0, videos: [
        ["15-minute paneer that tastes like 3 hours", 148000], ["Rating my followers' dal recipes", 96500], ["One pan, five dinners", 77300],
      ]},
      { id: -402, platform: "youtube", title: "Plates by Priya", handle: "@platesbypriya", subs: 6400, views: 412000, vids: 38, dSubs: 58, dViews: 9800, analytics: true, videos: [
        ["My grandmother's chai, properly", 31200], ["Meal prep for people who hate meal prep", 24700],
      ]},
      { id: -403, platform: "facebook", title: "Plates by Priya", handle: "platesbypriya", subs: 12100, views: 0, vids: 203, dSubs: 33, dViews: 0, videos: [["Sunday thali photo dump", 6900]] },
    ],
    [
      { id: -411, platform: "instagram", title: "Spice Route Kitchen", handle: "@spiceroutekitchen", subs: 67800, views: 0, vids: 590, dSubs: 410, videos: [["Street food at home series", 220000], ["Masala dabba tour", 88000]] },
    ],
    {
      health: "Instagram is on fire — 356 new followers and the paneer reel crossed 148K views.",
      competitors: "Spice Route Kitchen grows a touch faster but your engagement rate is nearly double theirs.",
      trend: "Quick 'tastes-like-slow-food' recipes are peaking — your 15-minute paneer nailed the moment.",
      opportunity: "Your YouTube is tiny compared to your Instagram — funnel reel viewers to the chai video with a story link.",
      warning: "Facebook has become a photo archive — 33 followers a week won't grow; repost your reels there instead.",
      upload: "Reels at 6pm weekdays — your audience cooks dinner with you; that slot outperforms mornings by half.",
      quickWin: "Pin the paneer reel and add 'full recipe on YouTube' — cheapest cross-platform bridge you have.",
    },
    [["I cooked only from street vendors' recipes for a week", "CurbsideEats", 980000], ["The 20-minute dinner matrix", "WeekdayChef", 604000], ["Grandma reacts to viral food hacks", "HeritageTable", 517000], ["One dough, seven breads", "FlourHour", 350000]],
    { title: "Cross-platform strategy", turns: [
      ["user", "How do I grow YouTube using Instagram?"],
      ["assistant", "You have 41,300 followers watching your reels and only 6,400 YouTube subscribers — that gap is your opportunity. Put a story link on every recipe reel pointing to the full version on YouTube."],
      ["user", "Will that annoy people?"],
      ["assistant", "Not if the YouTube version genuinely adds something — the full technique, the family story behind it. Tease what Instagram doesn't get. Your chai video is exactly that kind of content."],
    ]},
  ),

  travel: build(
    "travel", "Travel — Wander Atlas",
    [
      { id: -501, platform: "youtube", title: "Wander Atlas", handle: "@wanderatlas", subs: 33500, views: 4700000, vids: 118, dSubs: 264, dViews: 52300, analytics: true, videos: [
        ["48 hours in Lisbon on $80", 132000], ["The overnight train nobody takes", 97600], ["I moved to a town of 400 people", 84100], ["Packing after 40 countries", 39800],
      ]},
      { id: -502, platform: "instagram", title: "Wander Atlas", handle: "@wander.atlas", subs: 15900, views: 0, vids: 340, dSubs: 121, dViews: 0, videos: [["Lisbon alleys — reel", 44700], ["Train window views", 19300]] },
    ],
    [
      { id: -511, platform: "youtube", title: "Detour Diaries", handle: "@detourdiaries", subs: 51200, views: 7900000, vids: 205, dSubs: 380, videos: [["I let locals plan my whole trip", 290000], ["Cheapest country in Europe?", 130000]] },
    ],
    {
      health: "Great momentum — 264 new subscribers and the Lisbon video is your fastest starter ever.",
      competitors: "Detour Diaries wins on 'locals decide' formats — participation hooks are their edge.",
      trend: "Budget city guides with exact numbers are surging; '$80 in Lisbon' is the exact formula.",
      opportunity: "Make the budget format a series — same $80, different city, recognizable thumbnail style.",
      warning: "Your uploads cluster around trips then go quiet for weeks — schedule evergreen packing/planning videos between trips.",
      upload: "Sunday morning — travel viewers plan on weekends; your Sunday uploads get 30 percent more first-day views.",
      quickWin: "Reply to the top 20 comments on the Lisbon video asking which city is next — instant series validation.",
    },
    [["I traveled Europe with no phone", "OfflineOdyssey", 1100000], ["$50 a day in Japan — honest test", "YenAndBack", 830000], ["The world's shortest international flight", "AirborneMinutes", 466000], ["Living in an overnight train for a week", "RailLife", 392000]],
    { title: "Budget series launch", turns: [
      ["user", "Is the Lisbon video actually my best?"],
      ["assistant", "Fastest start you've ever had — 132,000 views in under two weeks, and it's converting subscribers at 1.8 times your average. The budget-with-exact-numbers format is your unlock."],
      ["user", "Which city next?"],
      ["assistant", "Your comments are already voting — Porto and Kraków lead. Kraków gives you a bigger 'that cheap, really?' hook, which is the emotion this series sells."],
    ]},
  ),

  tech: build(
    "tech", "Tech — Bitwise Reviews",
    [
      { id: -601, platform: "youtube", title: "Bitwise Reviews", handle: "@bitwisereviews", subs: 56700, views: 8300000, vids: 264, dSubs: 231, dViews: 61900, analytics: true, videos: [
        ["This $99 phone embarrasses flagships", 178000], ["I used only open-source apps for a month", 121000], ["The laptop everyone got wrong", 93400], ["Budget audio actually worth buying", 47600],
      ]},
    ],
    [
      { id: -611, platform: "youtube", title: "SpecSheet", handle: "@specsheet", subs: 94800, views: 15600000, vids: 402, dSubs: 350, videos: [["Every flagship, one winner", 410000], ["Why benchmarks lie", 176000]] },
      { id: -612, platform: "youtube", title: "Circuit & Co", handle: "@circuitandco", subs: 39400, views: 5200000, vids: 190, dSubs: 150, videos: [["The repairability report", 88000], ["Modular phones are back", 60100]] },
    ],
    {
      health: "Healthy week — 231 new subscribers with the budget phone video leading discovery.",
      competitors: "SpecSheet dominates flagship coverage; your edge is budget-vs-flagship narratives — don't fight on their turf.",
      trend: "Value-tech and 'cheap beats expensive' angles are outperforming spec-dump reviews across YouTube.",
      opportunity: "An annual 'budget beats flagship' awards video could own the niche you already lead.",
      warning: "Your open-source video brought a new audience that hasn't seen a follow-up in three weeks — they'll drift.",
      upload: "Thursday 4pm — tech buyers research before weekend purchases; your Thursday videos convert best.",
      quickWin: "Add chapter markers to the laptop video — its retention dips exactly where viewers scrub for the verdict.",
    },
    [["The $200 phone I'd actually use", "ValueVolts", 1500000], ["Why your next laptop should be last year's", "RefurbLab", 760000], ["De-Googling my life: 6 months later", "PrivacyPath", 542000], ["E-waste gold mining", "TeardownTown", 401000]],
    { title: "Niche positioning", turns: [
      ["user", "Should I review the new flagship everyone's covering?"],
      ["assistant", "Only through your lens — 'what the $99 phone does better than this $1,200 one.' A straight review drowns among fifty bigger channels; the value angle is yours alone."],
      ["user", "That's the brand now?"],
      ["assistant", "It already is — your top three videos this quarter are all value-versus-premium stories. Lean in. I'd even rename the series so viewers recognize it instantly."],
    ]},
  ),
};

export const PERSONA_KEYS = Object.keys(PERSONAS);

/** Resolve the active demo persona for this request, or null. Admin-only. */
export async function getPersona(req: Request): Promise<Persona | null> {
  const raw = req.headers["x-demo-persona"];
  const key = (Array.isArray(raw) ? raw[0] : raw)?.toLowerCase().trim();
  if (!key || !(key in PERSONAS)) return null;
  return (await isAdminRequest(req)) ? PERSONAS[key] : null;
}
