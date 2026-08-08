CREATE TABLE IF NOT EXISTS "channel_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"channel_id" integer NOT NULL,
	"snapshot_date" date NOT NULL,
	"subscribers" bigint DEFAULT 0 NOT NULL,
	"total_views" bigint DEFAULT 0 NOT NULL,
	"video_count" integer DEFAULT 0 NOT NULL,
	"recent_videos" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"platform" text DEFAULT 'youtube' NOT NULL,
	"handle" text NOT NULL,
	"external_id" text NOT NULL,
	"title" text NOT NULL,
	"thumbnail_url" text,
	"is_competitor" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "channel_snapshots" DROP CONSTRAINT IF EXISTS "channel_snapshots_channel_id_channels_id_fk";--> statement-breakpoint
ALTER TABLE "channel_snapshots" ADD CONSTRAINT "channel_snapshots_channel_id_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE cascade ON UPDATE no action;