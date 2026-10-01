'use server';

import { headers } from 'next/headers';

import { sendResetLink } from '@/lib/email';
import { getPrisma } from '@/lib/prisma';
import { GENERIC_SENT_MESSAGE, issueResetToken } from '@/lib/recovery';
import { forgotSchema } from '@/lib/validation';

export type RequestResetLinkResult = { ok: true; message: string } | { ok: false; error: string };

/**
 * NEXT_PUBLIC_SITE_URL is the canonical origin (architecture.md) — unset in
 * dev today, so fall back to the request's own host there instead of emailing
 * localhost links from the wrong machine.
 */
async function getSiteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;

  const headerList = await headers();
  const host = headerList.get('host') ?? 'localhost:3000';
  const proto =
    headerList.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function requestResetLink(input: unknown): Promise<RequestResetLinkResult> {
  // Re-validated server-side — same rule as every other action here.
  const parsed = forgotSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue?.message ?? 'Invalid input.' };
  }

  try {
    const recipient = await getPrisma().recipientEmail.findUnique({
      where: { id: parsed.data.recipientEmailId },
      select: { email: true },
    });

    // Unknown id → the same generic success as a known one. No token, no
    // email, no distinction.
    if (recipient) {
      const { token } = await issueResetToken(parsed.data.recipientEmailId);
      const origin = await getSiteOrigin();
      const result = await sendResetLink({
        to: recipient.email,
        url: `${origin}/reset?token=${token}`,
      });

      if (!result.ok) {
        console.error('requestResetLink: email was not sent.', result.error);
        return { ok: false, error: 'Could not send the reset link. Try again.' };
      }
    }

    return { ok: true, message: GENERIC_SENT_MESSAGE };
  } catch (error) {
    console.error('requestResetLink failed', error);
    return { ok: false, error: 'Could not send the reset link. Try again.' };
  }
}
