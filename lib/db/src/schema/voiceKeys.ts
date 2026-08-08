import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Per-user premium voice credentials. Users who bring their own ElevenLabs
// API key get the premium ElevenLabs voice; everyone else uses the default
// OpenAI voice. Keyed by the same client identity used everywhere else
// (Clerk "user:..." ids or per-device anonymous ids).
export const voiceKeys = pgTable("voice_keys", {
  clientId: text("client_id").primaryKey(),
  elevenlabsKey: text("elevenlabs_key").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type VoiceKey = typeof voiceKeys.$inferSelect;
