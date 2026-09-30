'use server';

import { cookies } from 'next/headers';

import { verifyPasscode } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/lib/session';
import { loginSchema } from '@/lib/validation';

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(input: unknown): Promise<LoginResult> {
  // Re-validated server-side — same rule as every other action here.
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue?.message ?? 'Invalid input.' };
  }

  try {
    const config = await getPrisma().authConfig.findUnique({ where: { id: 1 } });

    const valid = config ? await verifyPasscode(config.passcodeHash, parsed.data.passcode) : false;
    // One message for every failure mode: a stranger learns nothing about
    // whether a passcode exists or how close they were.
    if (!valid) {
      return { ok: false, error: 'Wrong passcode.' };
    }

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
    // TODO(M4): throttle — 5 failed tries / 15 min per auth.md (LoginAttempt
    // table) isn't in yet; until then failures are unlimited.
    console.error('login failed', error);
    return { ok: false, error: 'Could not sign in. Try again.' };
  }
}
