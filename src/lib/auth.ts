import { hash, verify } from '@node-rs/argon2';

import { getPrisma } from '@/lib/prisma';
import { hashSessionToken } from '@/lib/session';

/**
 * @node-rs/argon2's defaults are the auth.md spec: Argon2id, m=19456 (19 MiB),
 * t=2, p=1 — confirmed by the `$argon2id$v=19$m=19456,t=2,p=1$` PHC prefix.
 * The PHC string records its own params, so they can be raised later without a
 * migration.
 */
export async function hashPasscode(passcode: string) {
  return hash(passcode);
}

export async function verifyPasscode(passcodeHash: string, passcode: string) {
  return verify(passcodeHash, passcode);
}

/**
 * DB half of the session check: raw cookie token → SHA-256 → live `Session`
 * row, or null for missing/expired. Used by the (private) layout (real gate)
 * and the login page (bounce when already signed in).
 */
export async function findValidSession(token: string | undefined) {
  if (!token) return null;

  const session = await getPrisma().session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
  });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;

  return session;
}
