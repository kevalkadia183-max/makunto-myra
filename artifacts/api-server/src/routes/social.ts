import { Router } from "express";
import { db, channels, channelSnapshots } from "@workspace/db";
import { eq, and, desc, lt } from "drizzle-orm";
import {
  resolveChannel,
  fetchRecentVideos,
  isConfigured,
  YouTubeNotConfiguredError,
  type RecentVideo,
} from "../lib/youtube";
import { fetchTrending } from "../lib/youtube";
import {
  isMetaConfigured,
  oauthUrl,
  exchangeCode,
  discoverAccounts,
  fetchFacebookStats,
  fetchInstagramStats,
} from "../lib/meta";
import crypto from "crypto";
import {
  isYtOauthConfigured,
  ytOauthUrl,
  exchangeYtCode,
  fetchOwnChannel,
  fetchYtAnalytics,
  type YtAnalytics,
} from "../lib/googleAuth";

const socialRouter = Router();

import { getClientId, requireVerifiedUser, sanitizeAnonymousId } from "../lib/identity";
import { getPersona } from "../lib/presentation";

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Fetch fresh stats for a channel (any platform) and upsert today's snapshot. */
async function snapshotChannel(channel: {
  id: number;
  externalId: string;
  platform?: string;
  accessToken?: string | null;
}) {
  let resolved: { subscribers: number; totalViews: number; videoCount: number } | null = null;
  let recent: RecentVideo[] = [];
  const platform = channel.platform ?? "youtube";
  if (platform === "facebook" && channel.accessToken) {
    const stats = await fetchFacebookStats(channel.externalId, channel.accessToken);
    resolved = { subscribers: stats.followers, totalViews: stats.totalViews, videoCount: stats.postCount };
    recent = stats.recentPosts;
  } else if (platform === "instagram" && channel.accessToken) {
    const stats = await fetchInstagramStats(channel.externalId, channel.accessToken);
    resolved = { subscribers: stats.followers, totalViews: stats.totalViews, videoCount: stats.postCount };
    recent = stats.recentPosts;
  } else {
    const yt = await resolveChannel(channel.externalId);
    if (!yt) return null;
    resolved = yt;
    recent = await fetchRecentVideos(channel.externalId, 10);
  }
  if (!resolved) return null;
  const date = todayUTC();
  const values = {
    channelId: channel.id,
    snapshotDate: date,
    subscribers: resolved.subscribers,
    totalViews: resolved.totalViews,
    videoCount: resolved.videoCount,
    recentVideos: JSON.stringify(recent),
  };
  // Atomic upsert — concurrent report builds can't create duplicate daily rows.
  await db
    .insert(channelSnapshots)
    .values(values)
    .onConflictDoUpdate({
      target: [channelSnapshots.channelId, channelSnapshots.snapshotDate],
      set: values,
    });
  return { resolved, recent };
}

/** Latest snapshot strictly before today (for "since last time" deltas). */
async function previousSnapshot(channelId: number) {
  const rows = await db
    .select()
    .from(channelSnapshots)
    .where(and(eq(channelSnapshots.channelId, channelId), lt(channelSnapshots.snapshotDate, todayUTC())))
    .orderBy(desc(channelSnapshots.snapshotDate))
    .limit(1);
  return rows[0] ?? null;
}

// Whether YouTube/Meta are configured (frontend uses this to guide setup)
socialRouter.get("/social/status", (_req, res) => {
  res.json({
    youtubeConfigured: isConfigured(),
    metaConfigured: isMetaConfigured(),
    ytOauthConfigured: isYtOauthConfigured(),
  });
});

// Canonical public callback URL — never derived from request headers.
// Portable across hosts: PUBLIC_URL wins everywhere (VPS, Docker, any cloud);
// the Replit-provided domains are only fallbacks for this workspace/deploy.
export function publicOauthDomain(): string {
  const fromPublic = process.env.PUBLIC_URL?.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const domain = fromPublic || process.env.REPLIT_DOMAINS?.split(",")[0] || process.env.REPLIT_DEV_DOMAIN;
  if (!domain) throw new Error("No public domain configured for OAuth callback — set PUBLIC_URL");
  return domain;
}
function metaRedirectUri(): string {
  // Explicit override for non-standard setups (e.g. a separate auth domain).
  if (process.env.FACEBOOK_REDIRECT_URI) return process.env.FACEBOOK_REDIRECT_URI;
  return `https://${publicOauthDomain()}/api/social/oauth/facebook/callback`;
}

// Single-use, short-lived OAuth transactions: state nonce -> clientId,
// bound to the initiating browser via an HttpOnly cookie so a third party
// can't complete a flow they didn't start.
const pendingOauth = new Map<string, { clientId: string; browserToken: string; expiresAt: number }>();
const OAUTH_TX_TTL_MS = 10 * 60 * 1000;
const OAUTH_COOKIE = "vox_oauth";

function readOauthCookie(req: { headers: Record<string, string | string[] | undefined> }): string | null {
  const raw = req.headers.cookie;
  const header = Array.isArray(raw) ? raw.join(";") : raw;
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === OAUTH_COOKIE) return rest.join("=") || null;
  }
  return null;
}

function beginOauthTx(
  clientId: string,
  res: { setHeader(name: string, value: string): unknown },
): string {
  const now = Date.now();
  for (const [k, v] of pendingOauth) if (v.expiresAt < now) pendingOauth.delete(k);
  const nonce = crypto.randomBytes(24).toString("base64url");
  const browserToken = crypto.randomBytes(24).toString("base64url");
  pendingOauth.set(nonce, { clientId, browserToken, expiresAt: now + OAUTH_TX_TTL_MS });
  // SameSite=Lax still sends the cookie on the top-level redirect back from the provider
  res.setHeader(
    "Set-Cookie",
    `${OAUTH_COOKIE}=${browserToken}; Path=/api/social/oauth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
  );
  return nonce;
}

function consumeOauthTx(
  nonce: string,
  req: { headers: Record<string, string | string[] | undefined> },
): string | null {
  const tx = pendingOauth.get(nonce);
  if (!tx) return null;
  pendingOauth.delete(nonce); // single-use
  if (tx.expiresAt < Date.now()) return null;
  const cookie = readOauthCookie(req);
  if (!cookie) return null;
  const a = Buffer.from(cookie);
  const b = Buffer.from(tx.browserToken);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null; // different browser
  return tx.clientId;
}

/**
 * Resolve the identity for a browser-navigation OAuth start request.
 * Prefers the verified Clerk session (cookie travels with the navigation);
 * falls back to the anonymous ?cid= query param, which may never claim the
 * reserved "user:" namespace.
 */
function oauthStartIdentity(req: Parameters<typeof getClientId>[0]): string | null {
  const authed = getClientId(req);
  if (authed && authed.startsWith("user:")) return authed;
  const cid = typeof (req as any).query?.cid === "string" ? (req as any).query.cid.trim() : "";
  return cid ? sanitizeAnonymousId(cid) : null;
}

// Start the Facebook/Instagram OAuth flow (browser navigation, so clientId comes via query)
socialRouter.get("/social/oauth/facebook/start", requireVerifiedUser, (req, res) => {
  if (!isMetaConfigured()) return void res.status(503).send("Facebook/Instagram connection is not configured yet.");
  const cid = oauthStartIdentity(req);
  if (!cid) return void res.status(400).send("Missing client id");
  res.redirect(oauthUrl(metaRedirectUri(), beginOauthTx(cid, res)));
});

// Start the YouTube (Google) OAuth flow — unlocks the owner's private analytics
socialRouter.get("/social/oauth/youtube/start", requireVerifiedUser, (req, res) => {
  if (!isYtOauthConfigured()) return void res.status(503).send("YouTube connection is not configured yet.");
  const cid = oauthStartIdentity(req);
  if (!cid) return void res.status(400).send("Missing client id");
  res.redirect(ytOauthUrl(ytRedirectUri(), beginOauthTx(cid, res)));
});

function ytRedirectUri(): string {
  // Explicit override for non-standard setups (e.g. a separate auth domain).
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  return `https://${publicOauthDomain()}/api/social/oauth/youtube/callback`;
}

// YouTube OAuth callback — saves the refresh token on the user's own channel row
socialRouter.get("/social/oauth/youtube/callback", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : null;
  const state = typeof req.query.state === "string" ? req.query.state : null;
  const clientId = state ? consumeOauthTx(state, req) : null;
  if (!code || !clientId) return void res.redirect("/?connect_error=invalid");
  try {
    const { refreshToken, accessToken } = await exchangeYtCode(code, ytRedirectUri());
    const own = await fetchOwnChannel(accessToken);
    if (!own) return void res.redirect("/?connected=none");
    const dup = await db
      .select({ id: channels.id })
      .from(channels)
      .where(and(eq(channels.clientId, clientId), eq(channels.externalId, own.externalId)));
    if (dup.length > 0) {
      await db
        .update(channels)
        .set({ accessToken: refreshToken, title: own.title, handle: own.handle, thumbnailUrl: own.thumbnailUrl, isCompetitor: false })
        .where(eq(channels.id, dup[0].id));
    } else {
      const [row] = await db
        .insert(channels)
        .values({
          clientId,
          platform: "youtube",
          handle: own.handle,
          externalId: own.externalId,
          title: own.title,
          thumbnailUrl: own.thumbnailUrl,
          isCompetitor: false,
          accessToken: refreshToken,
        })
        .returning();
      try {
        await snapshotChannel(row);
      } catch (err) {
        req.log.warn({ err }, "Baseline snapshot failed for connected YouTube channel");
      }
    }
    invalidateReportCache(clientId);
    res.redirect("/?connected=youtube");
  } catch (err) {
    req.log.error({ err }, "YouTube OAuth callback failed");
    res.redirect("/?connect_error=failed");
  }
});

// OAuth callback — discovers Pages + linked Instagram accounts and saves them
socialRouter.get("/social/oauth/facebook/callback", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : null;
  const state = typeof req.query.state === "string" ? req.query.state : null;
  const clientId = state ? consumeOauthTx(state, req) : null;
  if (!code || !clientId) return void res.redirect("/?connect_error=invalid");
  try {
    const userToken = await exchangeCode(code, metaRedirectUri());
    const accounts = await discoverAccounts(userToken);
    let added = 0;
    for (const acct of accounts) {
      const dup = await db
        .select({ id: channels.id })
        .from(channels)
        .where(and(eq(channels.clientId, clientId), eq(channels.externalId, acct.externalId)));
      if (dup.length > 0) {
        // Refresh the stored token and profile info
        await db
          .update(channels)
          .set({ accessToken: acct.accessToken, title: acct.title, handle: acct.handle, thumbnailUrl: acct.thumbnailUrl })
          .where(eq(channels.id, dup[0].id));
        continue;
      }
      const [row] = await db
        .insert(channels)
        .values({
          clientId,
          platform: acct.platform,
          handle: acct.handle,
          externalId: acct.externalId,
          title: acct.title,
          thumbnailUrl: acct.thumbnailUrl,
          isCompetitor: false,
          accessToken: acct.accessToken,
        })
        .returning();
      added++;
      try {
        await snapshotChannel(row);
      } catch (err) {
        req.log.warn({ err }, "Baseline snapshot failed for connected Meta account");
      }
    }
    invalidateReportCache(clientId);
    res.redirect(`/?connected=${added > 0 ? added : accounts.length > 0 ? "refreshed" : "none"}`);
  } catch (err) {
    req.log.error({ err }, "Facebook OAuth callback failed");
    res.redirect("/?connect_error=failed");
  }
});

// List tracked channels
socialRouter.get("/social/channels", requireVerifiedUser, async (req, res) => {
  const clientId = getClientId(req);
  if (!clientId) return void res.status(400).json({ error: "X-Client-Id header is required" });
  const demo = await getPersona(req);
  if (demo) return void res.json(demo.channels);
  const rows = await db.select().from(channels).where(eq(channels.clientId, clientId)).orderBy(channels.createdAt);
  // Never expose stored OAuth tokens to the client
  res.json(rows.map(({ accessToken: _token, ...rest }) => rest));
});

// Add a channel (own or competitor) by handle/URL
socialRouter.post("/social/channels", requireVerifiedUser, async (req, res) => {
  const clientId = getClientId(req);
  if (!clientId) return void res.status(400).json({ error: "X-Client-Id header is required" });
  if (await getPersona(req)) {
    return void res.status(403).json({ error: "Presentation Mode is read-only — turn it off in Developer settings to change real channels." });
  }
  // Manual adds are always competitors — the user's own channel is created
  // automatically when they connect their account via OAuth.
  const { handle } = req.body as { handle?: string };
  if (!handle || typeof handle !== "string" || !handle.trim()) {
    return void res.status(400).json({ error: "handle is required" });
  }
  try {
    const resolved = await resolveChannel(handle);
    if (!resolved) return void res.status(404).json({ error: "Channel not found. Check the handle or link." });
    // Prevent duplicates per client
    const dup = await db
      .select({ id: channels.id })
      .from(channels)
      .where(and(eq(channels.clientId, clientId), eq(channels.externalId, resolved.externalId)));
    if (dup.length > 0) return void res.status(409).json({ error: "That channel is already added." });

    const [row] = await db
      .insert(channels)
      .values({
        clientId,
        platform: "youtube",
        handle: resolved.handle,
        externalId: resolved.externalId,
        title: resolved.title,
        thumbnailUrl: resolved.thumbnailUrl,
        isCompetitor: true,
      })
      .returning();
    // Capture day-0 baseline immediately, but don't fail the add if it hiccups —
    // the next report request will snapshot again.
    try {
      await snapshotChannel(row);
    } catch (err) {
      req.log.warn({ err }, "Baseline snapshot failed after channel add");
    }
    invalidateReportCache(clientId);
    const { accessToken: _token, ...safeRow } = row;
    res.status(201).json(safeRow);
  } catch (err) {
    if (err instanceof YouTubeNotConfiguredError) {
      return void res.status(503).json({ error: "YouTube is not configured yet.", code: "NOT_CONFIGURED" });
    }
    req.log.error({ err }, "Failed to add channel");
    res.status(500).json({ error: "Failed to add channel" });
  }
});

// Remove a channel
socialRouter.delete("/social/channels/:id", requireVerifiedUser, async (req, res) => {
  if (await getPersona(req)) {
    return void res.status(403).json({ error: "Presentation Mode is read-only — turn it off in Developer settings to change real channels." });
  }
  const clientId = getClientId(req);
  if (!clientId) return void res.status(400).json({ error: "X-Client-Id header is required" });
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) return void res.status(400).json({ error: "Invalid id" });
  const deleted = await db
    .delete(channels)
    .where(and(eq(channels.id, id), eq(channels.clientId, clientId)))
    .returning({ id: channels.id });
  if (deleted.length === 0) return void res.status(404).json({ error: "Channel not found" });
  invalidateReportCache(clientId);
  res.json({ ok: true });
});

export interface ChannelReport {
  id: number;
  platform: string;
  title: string;
  handle: string;
  isCompetitor: boolean;
  thumbnailUrl: string | null;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  deltas: { subscribers: number; totalViews: number; videoCount: number; sinceDate: string } | null;
  recentVideos: RecentVideo[];
  /** Private analytics (last 28 days) — only for the user's own connected YouTube channel. */
  analytics?: YtAnalytics | null;
}

// Report cache — building a report hits the YouTube API for every channel,
// which is slow (seconds) and quota-hungry. Myra's chat, the greeting, and
// the dashboard all want the same data, so cache per client for a few
// minutes and invalidate on channel add/remove.
const REPORT_TTL_MS = 3 * 60 * 1000;
const reportCache = new Map<string, { at: number; data: ChannelReport[] }>();
const reportInFlight = new Map<string, Promise<ChannelReport[]>>();
// Other modules (e.g. the daily brief) can register to be told when a
// client's channel data changed, so their own caches invalidate in lockstep.
const channelChangeListeners: Array<(clientId: string) => void> = [];
export function onChannelsChanged(fn: (clientId: string) => void): void {
  channelChangeListeners.push(fn);
}
export function invalidateReportCache(clientId: string): void {
  reportCache.delete(clientId);
  for (const fn of channelChangeListeners) fn(clientId);
}

/** Build the full report for a client: fresh stats + deltas vs previous snapshot. */
export async function buildReport(clientId: string): Promise<ChannelReport[]> {
  const cached = reportCache.get(clientId);
  if (cached && Date.now() - cached.at < REPORT_TTL_MS) return cached.data;
  // Coalesce concurrent builds (dashboard + chat + brief all want the report)
  const inFlight = reportInFlight.get(clientId);
  if (inFlight) return inFlight;
  const promise = buildReportUncached(clientId).finally(() => reportInFlight.delete(clientId));
  reportInFlight.set(clientId, promise);
  const data = await promise;
  reportCache.set(clientId, { at: Date.now(), data });
  if (reportCache.size > 2000) {
    const now = Date.now();
    for (const [k, v] of reportCache) {
      if (now - v.at >= REPORT_TTL_MS) reportCache.delete(k);
    }
  }
  return data;
}

async function buildReportUncached(clientId: string): Promise<ChannelReport[]> {
  const rows = await db.select().from(channels).where(eq(channels.clientId, clientId));
  const report: ChannelReport[] = [];
  for (const ch of rows) {
    const prev = await previousSnapshot(ch.id);
    let snap: Awaited<ReturnType<typeof snapshotChannel>> = null;
    try {
      snap = await snapshotChannel(ch);
    } catch {
      snap = null; // keep going with stored data if the API hiccups
    }
    const latest = snap?.resolved;
    const stored = (
      await db
        .select()
        .from(channelSnapshots)
        .where(eq(channelSnapshots.channelId, ch.id))
        .orderBy(desc(channelSnapshots.snapshotDate))
        .limit(1)
    )[0];
    const subscribers = latest?.subscribers ?? stored?.subscribers ?? 0;
    const totalViews = latest?.totalViews ?? stored?.totalViews ?? 0;
    const videoCount = latest?.videoCount ?? stored?.videoCount ?? 0;
    const recentVideos: RecentVideo[] =
      snap?.recent ?? (stored?.recentVideos ? (JSON.parse(stored.recentVideos) as RecentVideo[]) : []);
    let analytics: YtAnalytics | null = null;
    if (ch.platform === "youtube" && ch.accessToken && !ch.isCompetitor) {
      try {
        analytics = await fetchYtAnalytics(ch.accessToken);
      } catch {
        analytics = null; // private analytics is best-effort
      }
    }
    report.push({
      id: ch.id,
      platform: ch.platform,
      title: ch.title,
      handle: ch.handle,
      isCompetitor: ch.isCompetitor,
      thumbnailUrl: ch.thumbnailUrl,
      subscribers,
      totalViews,
      videoCount,
      deltas: prev
        ? {
            subscribers: subscribers - prev.subscribers,
            totalViews: totalViews - prev.totalViews,
            videoCount: videoCount - prev.videoCount,
            sinceDate: String(prev.snapshotDate),
          }
        : null,
      recentVideos,
      analytics,
    });
  }
  return report;
}

// Full report (dashboard)
socialRouter.get("/social/report", requireVerifiedUser, async (req, res) => {
  const clientId = getClientId(req);
  if (!clientId) return void res.status(400).json({ error: "X-Client-Id header is required" });
  const demo = await getPersona(req);
  if (demo) return void res.json({ channels: demo.report });
  try {
    res.json({ channels: await buildReport(clientId) });
  } catch (err) {
    if (err instanceof YouTubeNotConfiguredError) {
      return void res.status(503).json({ error: "YouTube is not configured yet.", code: "NOT_CONFIGURED" });
    }
    req.log.error({ err }, "Failed to build report");
    res.status(500).json({ error: "Failed to build report" });
  }
});

// CSV download of the full report
socialRouter.get("/social/report.csv", requireVerifiedUser, async (req, res) => {
  const clientId = getClientId(req);
  if (!clientId) return void res.status(400).json({ error: "X-Client-Id header is required" });
  try {
    // Presentation Mode: the CSV must be fictional too — never the caller's
    // real report while a demo persona is on screen.
    const demoCsv = await getPersona(req);
    const report = demoCsv ? demoCsv.report : await buildReport(clientId);
    // Quote and neutralize spreadsheet formula injection (=, +, -, @ leading chars)
    const csvCell = (v: string | number): string => {
      const s = String(v);
      const safe = /^[=+\-@]/.test(s) ? "'" + s : s;
      return /[",\n]/.test(safe) ? '"' + safe.replace(/"/g, '""') + '"' : safe;
    };
    const lines = ["type,channel,handle,subscribers,subs_change,total_views,views_change,videos,video_title,video_views,video_likes,video_comments,video_published"];
    for (const ch of report) {
      const base = [
        ch.isCompetitor ? "competitor" : "own",
        csvCell(ch.title),
        csvCell(ch.handle),
        ch.subscribers,
        ch.deltas?.subscribers ?? "",
        ch.totalViews,
        ch.deltas?.totalViews ?? "",
        ch.videoCount,
      ];
      if (ch.recentVideos.length === 0) {
        lines.push([...base, "", "", "", "", ""].join(","));
      } else {
        for (const v of ch.recentVideos) {
          lines.push([...base, csvCell(v.title), v.views, v.likes, v.comments, v.publishedAt].join(","));
        }
      }
    }
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="vox-report-${todayUTC()}.csv"`);
    res.send(lines.join("\n"));
  } catch (err) {
    req.log.error({ err }, "Failed to build CSV report");
    res.status(500).json({ error: "Failed to build report" });
  }
});

// Trending videos (Radar tab) — cached: trending moves slowly and the
// YouTube quota doesn't need to pay for every tab switch.
const TRENDING_TTL_MS = 10 * 60 * 1000;
const trendingCache = new Map<string, { at: number; data: Awaited<ReturnType<typeof fetchTrending>> }>();
socialRouter.get("/social/trending", async (req, res) => {
  const demo = await getPersona(req);
  if (demo) return void res.json({ videos: demo.trending });
  try {
    const region = typeof req.query.region === "string" ? req.query.region : "US";
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const key = region + "|" + (category ?? "");
    const hit = trendingCache.get(key);
    if (hit && Date.now() - hit.at < TRENDING_TTL_MS) {
      res.json({ videos: hit.data });
      return;
    }
    const videos = await fetchTrending(region, category);
    trendingCache.set(key, { at: Date.now(), data: videos });
    res.json({ videos });
  } catch (err) {
    if (err instanceof YouTubeNotConfiguredError) {
      return void res.status(503).json({ error: "YouTube is not configured yet.", code: "NOT_CONFIGURED" });
    }
    req.log.error({ err }, "Failed to fetch trending");
    res.status(500).json({ error: "Failed to fetch trending videos" });
  }
});

export default socialRouter;
