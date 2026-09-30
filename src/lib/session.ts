import { createHash, randomBytes } from 'node:crypto';

/**
 * Cookie + token helpers, deliberately free of Prisma and argon2 so
 * `src/proxy.ts` can import the cookie name without dragging the database
 * (or a native module) into its bundle. Session *storage* lives in lib/auth.ts.
 *
 * The raw token is 32 random bytes, base64url — it exists only in the
 * HttpOnly cookie; the DB keeps only its SHA-256 (auth.md: a 256-bit random
 * token can't be guessed, so a fast hash at rest is enough).
 */
export const SESSION_COOKIE = 'pf_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function createSessionToken() {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashSessionToken(token) };
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
