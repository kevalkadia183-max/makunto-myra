/**
 * Google OAuth for YouTube — unlocks the owner's private analytics
 * (watch time, traffic sources, subscriber gains) via the YouTube Analytics API.
 * We store the long-lived refresh token and mint access tokens on demand.
 */

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export class YouTubeOAuthNotConfiguredError extends Error {
  constructor() {
    super("YouTube OAuth client is not configured");
    this.name = "YouTubeOAuthNotConfiguredError";
  }
}

// Env aliases: GOOGLE_WEB_CLIENT_ID / GOOGLE_CLIENT_SECRET are the
// production-standard names (web flow); the YOUTUBE_OAUTH_* names remain
// supported for existing setups. Android/iOS client IDs live in the mobile
// build config, never here — the backend only runs the web/code flow.
function envClientId(): string | undefined {
  return process.env.GOOGLE_WEB_CLIENT_ID || process.env.YOUTUBE_OAUTH_CLIENT_ID;
}
function envClientSecret(): string | undefined {
  return process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_OAUTH_CLIENT_SECRET;
}
function clientId(): string {
  const v = envClientId();
  if (!v) throw new YouTubeOAuthNotConfiguredError();
  return v;
}
function clientSecret(): string {
  const v = envClientSecret();
  if (!v) throw new YouTubeOAuthNotConfiguredError();
  return v;
}

export function isYtOauthConfigured(): boolean {
  return Boolean(envClientId() && envClientSecret());
}

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

export function ytOauthUrl(redirectUri: string, state: string): string {
  const qs = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline", // get a refresh token
    prompt: "consent", // always re-issue the refresh token
    state,
  });
  return `${AUTH_URL}?${qs}`;
}

async function tokenRequest(params: Record<string, string>): Promise<{ access_token: string; refresh_token?: string }> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const body = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    refresh_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !body.access_token) {
    throw new Error(`Google token request failed (${res.status}): ${body.error ?? ""} ${body.error_description ?? ""}`.trim());
  }
  return { access_token: body.access_token, refresh_token: body.refresh_token };
}

/** Exchange the auth code; returns a refresh token (long-lived) + access token. */
export async function exchangeYtCode(code: string, redirectUri: string): Promise<{ refreshToken: string; accessToken: string }> {
  const t = await tokenRequest({
    code,
    client_id: clientId(),
    client_secret: clientSecret(),
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  if (!t.refresh_token) throw new Error("Google did not return a refresh token — remove the app's access at myaccount.google.com/permissions and reconnect.");
  return { refreshToken: t.refresh_token, accessToken: t.access_token };
}

export async function refreshYtAccessToken(refreshToken: string): Promise<string> {
  const t = await tokenRequest({
    refresh_token: refreshToken,
    client_id: clientId(),
    client_secret: clientSecret(),
    grant_type: "refresh_token",
  });
  return t.access_token;
}

/** The channel owned by the connected Google account. */
export async function fetchOwnChannel(accessToken: string): Promise<{
  externalId: string;
  handle: string;
  title: string;
  thumbnailUrl: string | null;
} | null> {
  const qs = new URLSearchParams({ part: "snippet", mine: "true" });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?${qs}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`YouTube channels?mine=true failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  const body = (await res.json()) as {
    items?: Array<{ id: string; snippet: { title: string; customUrl?: string; thumbnails?: { default?: { url?: string } } } }>;
  };
  const ch = body.items?.[0];
  if (!ch) return null;
  return {
    externalId: ch.id,
    handle: ch.snippet.customUrl ? (ch.snippet.customUrl.startsWith("@") ? ch.snippet.customUrl : `@${ch.snippet.customUrl}`) : ch.snippet.title,
    title: ch.snippet.title,
    thumbnailUrl: ch.snippet.thumbnails?.default?.url ?? null,
  };
}

export interface YtAnalytics {
  periodDays: number;
  views: number;
  watchTimeMinutes: number;
  averageViewDurationSeconds: number;
  averageViewPercentage: number;
  subscribersGained: number;
  subscribersLost: number;
  likes: number;
  comments: number;
  shares: number;
  trafficSources: Array<{ source: string; views: number }>;
}

/** Private channel analytics for the last `days` days (default 28). */
export async function fetchYtAnalytics(refreshToken: string, days = 28): Promise<YtAnalytics> {
  const accessToken = await refreshYtAccessToken(refreshToken);
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const base = "https://youtubeanalytics.googleapis.com/v2/reports";
  const common = {
    ids: "channel==MINE",
    startDate: fmt(start),
    endDate: fmt(end),
  };

  async function report(params: Record<string, string>): Promise<{ rows?: Array<Array<string | number>> }> {
    const qs = new URLSearchParams({ ...common, ...params });
    const res = await fetch(`${base}?${qs}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) throw new Error(`YouTube Analytics failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
    return (await res.json()) as { rows?: Array<Array<string | number>> };
  }

  const totals = await report({
    metrics:
      "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,likes,comments,shares",
  });
  const t = totals.rows?.[0] ?? [];
  const num = (i: number) => Number(t[i] ?? 0);

  let trafficSources: Array<{ source: string; views: number }> = [];
  try {
    const traffic = await report({
      metrics: "views",
      dimensions: "insightTrafficSourceType",
      sort: "-views",
    });
    trafficSources = (traffic.rows ?? []).slice(0, 6).map((r) => ({
      source: String(r[0]).replace(/_/g, " ").toLowerCase(),
      views: Number(r[1] ?? 0),
    }));
  } catch {
    // traffic breakdown is nice-to-have
  }

  return {
    periodDays: days,
    views: num(0),
    watchTimeMinutes: num(1),
    averageViewDurationSeconds: num(2),
    averageViewPercentage: num(3),
    subscribersGained: num(4),
    subscribersLost: num(5),
    likes: num(6),
    comments: num(7),
    shares: num(8),
    trafficSources,
  };
}
