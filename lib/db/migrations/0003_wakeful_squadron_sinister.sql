-- Deduplicate any existing same-day snapshots (keep the newest row) so the
-- unique index can be created safely; idempotent for re-runs.
DELETE FROM "channel_snapshots" a
USING "channel_snapshots" b
WHERE a."channel_id" = b."channel_id"
  AND a."snapshot_date" = b."snapshot_date"
  AND a."id" < b."id";
CREATE UNIQUE INDEX IF NOT EXISTS "channel_snapshots_channel_date_uq" ON "channel_snapshots" USING btree ("channel_id","snapshot_date");
