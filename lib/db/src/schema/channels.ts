import { pgTable, serial, text, timestamp, boolean, bigint, integer, date, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// A social channel/account tracked by a user (own or competitor).
export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  clientId: text("client_id").notNull(),
  platform: text("platform").notNull().default("youtube"), // youtube | instagram | tiktok | x | facebook
  handle: text("handle").notNull(), // e.g. @mkbhd
  externalId: text("external_id").notNull(), // platform channel id (e.g. UC...)
  title: text("title").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  isCompetitor: boolean("is_competitor").notNull().default(false),
  // OAuth access token for connected accounts (Facebook Pages / Instagram Business).
  // Null for public-data platforms like YouTube.
  accessToken: text("access_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Daily stats snapshot per channel — powers "what changed since last time".
export const channelSnapshots = pgTable("channel_snapshots", {
  id: serial("id").primaryKey(),
  channelId: integer("channel_id")
    .notNull()
    .references(() => channels.id, { onDelete: "cascade" }),
  snapshotDate: date("snapshot_date").notNull(), // one per channel per day
  subscribers: bigint("subscribers", { mode: "number" }).notNull().default(0),
  totalViews: bigint("total_views", { mode: "number" }).notNull().default(0),
  videoCount: integer("video_count").notNull().default(0),
  recentVideos: text("recent_videos"), // JSON: [{videoId,title,views,likes,comments,publishedAt}]
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  // One snapshot per channel per day — concurrent report builds upsert instead of duplicating.
  uniqueIndex("channel_snapshots_channel_date_uq").on(t.channelId, t.snapshotDate),
]);

export const insertChannelSchema = createInsertSchema(channels).omit({ id: true, createdAt: true });
export const insertChannelSnapshotSchema = createInsertSchema(channelSnapshots).omit({ id: true, createdAt: true });

export type Channel = typeof channels.$inferSelect;
export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type ChannelSnapshot = typeof channelSnapshots.$inferSelect;
export type InsertChannelSnapshot = z.infer<typeof insertChannelSnapshotSchema>;
