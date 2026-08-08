/**
 * Meta Graph API client — Facebook Pages + Instagram Business/Creator accounts.
 * Uses the owner's Meta developer app (FACEBOOK_APP_ID / FACEBOOK_APP_SECRET).
 * End users connect via OAuth; we store per-page access tokens.
 */

const GRAPH = "https://graph.facebook.com/v21.0";

export class MetaNotConfiguredError extends Error {
  constructor() {
    super("Meta app credentials are not configured");
    this.name = "MetaNotConfiguredError";
  }
}

function appId(): string {
  const v = process.env.FACEBOOK_APP_ID;
  if (!v) throw new MetaNotConfiguredError();
  return v;
}
function appSecret(): string {
  const v = process.env.FACEBOOK_APP_SECRET;
  if (!v) throw new MetaNotConfiguredError();
  return v;
}

export function isMetaConfigured(): boolean {
  return Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
}

async function graph<T>(path: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${GRAPH}/${path}?${qs}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (body as { error?: { message?: string } })?.error?.message ?? JSON.stringify(body).slice(0, 300);
    throw new Error(`Meta API ${path} failed (${res.status}): ${msg}`);
  }
  return body as T;
}

// ---------- OAuth flow ----------

const SCOPES = ["pages_show_list", "pages_read_engagement", "instagram_basic", "read_insights", "instagram_manage_insights"];

export function oauthUrl(redirectUri: string, state: string): string {
  const qs = new URLSearchParams({
    client_id: appId(),
    redirect_uri: redirectUri,
    state,
    scope: SCOPES.join(","),
    response_type: "code",
  });
  return `https://www.facebook.com/v21.0/dialog/oauth?${qs}`;
}

/** Exchange the OAuth code for a long-lived user access token. */
export async function exchangeCode(code: string, redirectUri: string): Promise<string> {
  const shortLived = await graph<{ access_token: string }>("oauth/access_token", {
    client_id: appId(),
    client_secret: appSecret(),
    redirect_uri: redirectUri,
    code,
  });
  const longLived = await graph<{ access_token: string }>("oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: appId(),
    client_secret: appSecret(),
    fb_exchange_token: shortLived.access_token,
  });
  return longLived.access_token;
}

// ---------- Account discovery ----------

export interface ConnectedAccount {
  platform: "facebook" | "instagram";
  externalId: string;
  handle: string;
  title: string;
  thumbnailUrl: string | null;
  accessToken: string; // page access token (works for the linked IG account too)
}

/** List the user's Facebook Pages and any linked Instagram Business accounts. */
export async function discoverAccounts(userToken: string): Promise<ConnectedAccount[]> {
  const pages = await graph<{
    data?: Array<{
      id: string;
      name: string;
      access_token: string;
      username?: string;
      picture?: { data?: { url?: string } };
      instagram_business_account?: { id: string };
    }>;
  }>("me/accounts", {
    access_token: userToken,
    fields: "id,name,username,access_token,picture{url},instagram_business_account",
    limit: "50",
  });

  const out: ConnectedAccount[] = [];
  for (const p of pages.data ?? []) {
    out.push({
      platform: "facebook",
      externalId: p.id,
      handle: p.username ? `@${p.username}` : p.name,
      title: p.name,
      thumbnailUrl: p.picture?.data?.url ?? null,
      accessToken: p.access_token,
    });
    if (p.instagram_business_account?.id) {
      try {
        const ig = await graph<{ id: string; username?: string; name?: string; profile_picture_url?: string }>(
          p.instagram_business_account.id,
          { access_token: p.access_token, fields: "id,username,name,profile_picture_url" },
        );
        out.push({
          platform: "instagram",
          externalId: ig.id,
          handle: ig.username ? `@${ig.username}` : (ig.name ?? "instagram"),
          title: ig.name ?? ig.username ?? "Instagram account",
          thumbnailUrl: ig.profile_picture_url ?? null,
          accessToken: p.access_token,
        });
      } catch {
        // IG discovery failure shouldn't block connecting the page itself
      }
    }
  }
  return out;
}

// ---------- Stats ----------

export interface MetaStats {
  followers: number;
  totalViews: number; // 0 — Meta doesn't expose a lifetime view total
  postCount: number;
  recentPosts: Array<{
    videoId: string; // post/media id (kept as videoId for shared report shape)
    title: string;
    views: number;
    likes: number;
    comments: number;
    publishedAt: string;
  }>;
}

export async function fetchFacebookStats(pageId: string, token: string): Promise<MetaStats> {
  const page = await graph<{ followers_count?: number; fan_count?: number }>(pageId, {
    access_token: token,
    fields: "followers_count,fan_count",
  });
  const posts = await graph<{
    data?: Array<{
      id: string;
      message?: string;
      story?: string;
      created_time: string;
      likes?: { summary?: { total_count?: number } };
      comments?: { summary?: { total_count?: number } };
    }>;
  }>(`${pageId}/posts`, {
    access_token: token,
    fields: "id,message,story,created_time,likes.summary(true).limit(0),comments.summary(true).limit(0)",
    limit: "10",
  });
  const recent = (posts.data ?? []).map((p) => ({
    videoId: p.id,
    title: (p.message ?? p.story ?? "(no text)").slice(0, 120),
    views: 0,
    likes: p.likes?.summary?.total_count ?? 0,
    comments: p.comments?.summary?.total_count ?? 0,
    publishedAt: p.created_time,
  }));
  return {
    followers: page.followers_count ?? page.fan_count ?? 0,
    totalViews: 0,
    postCount: recent.length,
    recentPosts: recent,
  };
}

export async function fetchInstagramStats(igId: string, token: string): Promise<MetaStats> {
  const acct = await graph<{ followers_count?: number; media_count?: number }>(igId, {
    access_token: token,
    fields: "followers_count,media_count",
  });
  const media = await graph<{
    data?: Array<{
      id: string;
      caption?: string;
      like_count?: number;
      comments_count?: number;
      timestamp: string;
    }>;
  }>(`${igId}/media`, {
    access_token: token,
    fields: "id,caption,like_count,comments_count,timestamp",
    limit: "10",
  });
  const recent = (media.data ?? []).map((m) => ({
    videoId: m.id,
    title: (m.caption ?? "(no caption)").slice(0, 120),
    views: 0,
    likes: m.like_count ?? 0,
    comments: m.comments_count ?? 0,
    publishedAt: m.timestamp,
  }));
  return {
    followers: acct.followers_count ?? 0,
    totalViews: 0,
    postCount: acct.media_count ?? recent.length,
    recentPosts: recent,
  };
}
