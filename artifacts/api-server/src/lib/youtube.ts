/**
 * YouTube Data API v3 client (public data via API key).
 * Requires YOUTUBE_API_KEY. All calls are read-only public data.
 */

const BASE = "https://www.googleapis.com/youtube/v3";

function apiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new YouTubeNotConfiguredError();
  return key;
}

export class YouTubeNotConfiguredError extends Error {
  constructor() {
    super("YouTube API key is not configured");
    this.name = "YouTubeNotConfiguredError";
  }
}

async function yt<T>(path: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ ...params, key: apiKey() });
  const res = await fetch(`${BASE}/${path}?${qs}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API ${path} failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

export interface ResolvedChannel {
  externalId: string;
  handle: string;
  title: string;
  thumbnailUrl: string | null;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  uploadsPlaylistId: string | null;
}

interface ChannelListResponse {
  items?: Array<{
    id: string;
    snippet: { title: string; customUrl?: string; thumbnails?: { default?: { url?: string } } };
    statistics: { subscriberCount?: string; viewCount?: string; videoCount?: string };
    contentDetails?: { relatedPlaylists?: { uploads?: string } };
  }>;
}

/** Resolve a handle (@name), channel URL, or raw channel id to channel info + stats. */
export async function resolveChannel(input: string): Promise<ResolvedChannel | null> {
  let handle = input.trim();
  // Accept full URLs like https://youtube.com/@mkbhd or /channel/UC...
  const urlMatch = handle.match(/youtube\.com\/(?:@([\w.-]+)|channel\/([\w-]+))/i);
  let channelIdFromUrl: string | null = null;
  if (urlMatch) {
    if (urlMatch[1]) handle = urlMatch[1];
    else if (urlMatch[2]) channelIdFromUrl = urlMatch[2];
  }
  handle = handle.replace(/^@/, "");

  const params: Record<string, string> = {
    part: "snippet,statistics,contentDetails",
  };
  if (channelIdFromUrl || /^UC[\w-]{20,}$/.test(handle)) {
    params.id = channelIdFromUrl || handle;
  } else {
    params.forHandle = handle;
  }

  const data = await yt<ChannelListResponse>("channels", params);
  const item = data.items?.[0];
  if (!item) return null;
  return {
    externalId: item.id,
    handle: item.snippet.customUrl || `@${handle}`,
    title: item.snippet.title,
    thumbnailUrl: item.snippet.thumbnails?.default?.url ?? null,
    subscribers: Number(item.statistics.subscriberCount ?? 0),
    totalViews: Number(item.statistics.viewCount ?? 0),
    videoCount: Number(item.statistics.videoCount ?? 0),
    uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads ?? null,
  };
}

export interface RecentVideo {
  videoId: string;
  title: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
}

/** Fetch the channel's most recent uploads with per-video stats. */
export async function fetchRecentVideos(externalId: string, max = 10): Promise<RecentVideo[]> {
  // uploads playlist id is UU + channel suffix
  const uploads = "UU" + externalId.slice(2);
  const playlist = await yt<{
    items?: Array<{ contentDetails: { videoId: string } }>;
  }>("playlistItems", { part: "contentDetails", playlistId: uploads, maxResults: String(max) }).catch(() => ({ items: [] as Array<{ contentDetails: { videoId: string } }> }));

  const ids = (playlist.items ?? []).map((i) => i.contentDetails.videoId);
  if (ids.length === 0) return [];

  const videos = await yt<{
    items?: Array<{
      id: string;
      snippet: { title: string; publishedAt: string };
      statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
    }>;
  }>("videos", { part: "snippet,statistics", id: ids.join(",") });

  return (videos.items ?? []).map((v) => ({
    videoId: v.id,
    title: v.snippet.title,
    publishedAt: v.snippet.publishedAt,
    views: Number(v.statistics.viewCount ?? 0),
    likes: Number(v.statistics.likeCount ?? 0),
    comments: Number(v.statistics.commentCount ?? 0),
  }));
}

export interface TrendingVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  views: number;
  publishedAt: string;
}

/** Trending videos (optionally by category) — powers the Radar tab. */
export async function fetchTrending(regionCode = "US", videoCategoryId?: string, max = 12): Promise<TrendingVideo[]> {
  const params: Record<string, string> = {
    part: "snippet,statistics",
    chart: "mostPopular",
    regionCode,
    maxResults: String(max),
  };
  if (videoCategoryId) params.videoCategoryId = videoCategoryId;
  const data = await yt<{
    items?: Array<{
      id: string;
      snippet: { title: string; channelTitle: string; publishedAt: string };
      statistics: { viewCount?: string };
    }>;
  }>("videos", params);
  return (data.items ?? []).map((v) => ({
    videoId: v.id,
    title: v.snippet.title,
    channelTitle: v.snippet.channelTitle,
    views: Number(v.statistics.viewCount ?? 0),
    publishedAt: v.snippet.publishedAt,
  }));
}

export function isConfigured(): boolean {
  return Boolean(process.env.YOUTUBE_API_KEY);
}
