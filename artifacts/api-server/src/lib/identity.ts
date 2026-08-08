import { getAuth } from "@clerk/express";
import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Resolve who this request belongs to.
 *
 * Signed-in users are identified by their Clerk user id (prefixed so it can
 * never collide with an anonymous device id). This makes their channels,
 * conversations, and briefs follow their account across devices.
 *
 * Signed-out visitors fall back to the anonymous per-device X-Client-Id the
 * app has always used, so the experience keeps working before sign-up.
 */
export function getClientId(req: Request): string | null {
  try {
    const auth = getAuth(req);
    const userId = (auth?.sessionClaims?.userId as string | undefined) || auth?.userId;
    if (userId) return "user:" + userId;
  } catch {
    // clerkMiddleware not mounted (e.g. unit context) — fall through to header
  }
  const raw = req.headers["x-client-id"];
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id || typeof id !== "string" || id.trim().length === 0) return null;
  return sanitizeAnonymousId(id.trim());
}

/**
 * The "user:" namespace is reserved for verified Clerk identities. An
 * anonymous caller must never be able to claim it (that would let anyone
 * read/modify another user's data by forging a header or query param).
 */
export function sanitizeAnonymousId(id: string): string | null {
  if (!id || id.startsWith("user:")) return null;
  return id;
}

/** True only for a verified, signed-in Clerk identity. */
export function isVerifiedUser(clientId: string | null): clientId is string {
  return !!clientId && clientId.startsWith("user:");
}

/**
 * Middleware for protected routes: guests get HTTP 401 and no data.
 * Guests may still use the public demo (chat, voice) — but anything that
 * stores or reads personal data requires a real signed-in account.
 */
export const requireVerifiedUser: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  if (isVerifiedUser(getClientId(req))) return void next();
  res.status(401).json({ error: "Sign in required", code: "AUTH_REQUIRED" });
};
