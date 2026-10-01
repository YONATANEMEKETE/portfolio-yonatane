'use server';

import { cookies } from 'next/headers';

import { hashPasscode } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
import { findValidResetToken, INVALID_LINK_MESSAGE } from '@/lib/recovery';
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/lib/session';
import { resetPasscodeSchema } from '@/lib/validation';

export type ResetPasscodeResult = { ok: true } | { ok: false; error: string };

/**
 * Thrown inside the transaction when another request consumed the token first;
 * caught below so it maps to the link-invalid message instead of a 500.
 */
class TokenConsumedError extends Error {}

/**
 * Step 2 of recovery (auth.md): validate the one-time link, rotate the
 * passcode hash, kill every existing session, then sign the owner in fresh.
 */
export async function resetPasscode(input: unknown): Promise<ResetPasscodeResult> {
  // Re-validated server-side — same rule as every other action here.
  const parsed = resetPasscodeSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue?.message ?? 'Invalid input.' };
  }

  try {
    // Pre-check so a bad link fails before any hashing work happens; the
    // authoritative single-use check happens inside the transaction below.
    const tokenRow = await findValidResetToken(parsed.data.token);
    if (!tokenRow) return { ok: false, error: INVALID_LINK_MESSAGE };

    // Hash outside the transaction — argon2id is deliberately slow, and the
    // transaction should hold locks for microseconds, not hundreds of ms.
    const passcodeHash = await hashPasscode(parsed.data.passcode);

    await getPrisma().$transaction(async (tx) => {
      // Single-use under concurrency: the UPDATE only lands while usedAt is
      // still null. count 0 = another request got here first → rollback.
      const consumed = await tx.oneTimeToken.updateMany({
        where: { id: tokenRow.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (consumed.count === 0) throw new TokenConsumedError();

      await tx.authConfig.upsert({
        where: { id: 1 },
        update: { passcodeHash },
        create: { id: 1, passcodeHash },
      });

      // Every existing session dies with the old passcode (auth.md).
      await tx.session.deleteMany({});
    });

    // Fresh session — the owner lands signed in (auth.md step 2).
    const { token, tokenHash } = createSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    await getPrisma().session.create({ data: { tokenHash, expiresAt } });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: expiresAt,
    });

    return { ok: true };
  } catch (error) {
    if (error instanceof TokenConsumedError) {
      return { ok: false, error: INVALID_LINK_MESSAGE };
    }
    console.error('resetPasscode failed', error);
    return { ok: false, error: 'Could not reset the passcode. Try again.' };
  }
}
