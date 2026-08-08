import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { pool } from "@workspace/db";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./logger";

/**
 * Run all pending Drizzle migrations from the migrations/ folder
 * (copied into dist/migrations/ at build time).
 * Safe to call on every startup — already-applied migrations are skipped.
 */
export async function runMigrations(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set before running migrations");
  }

  // In both dev and prod the compiled file is in dist/.
  // The build step copies lib/db/migrations → dist/migrations.
  const __filename = fileURLToPath(import.meta.url);
  const migrationsFolder = path.join(path.dirname(__filename), "migrations");

  // Re-use the shared pool from @workspace/db — no extra pg dependency needed.
  const db = drizzle(pool);

  logger.info({ migrationsFolder }, "Running DB migrations");
  await migrate(db, { migrationsFolder });
  logger.info("DB migrations complete");
}
