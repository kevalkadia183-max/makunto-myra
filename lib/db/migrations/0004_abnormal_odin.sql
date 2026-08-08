CREATE TABLE IF NOT EXISTS "voice_keys" (
	"client_id" text PRIMARY KEY NOT NULL,
	"elevenlabs_key" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
