import { Resend } from 'resend';

/**
 * Thin wrapper around Resend for the recovery emails (auth.md M5). Deliberately
 * free of Prisma and Next imports so it stays unit-testable and reusable for
 * the dropped-then-maybe-back email-verification flow.
 *
 * Resend v6 never throws for API-level failures — `send()` resolves with
 * `{ data, error }` — but network failures still throw, so both paths are
 * handled. Callers decide what the user sees (the forgot flow always answers
 * generically); the returned error is for logging.
 */

export type EmailResult = { ok: true } | { ok: false; error: string };

const SUBJECT = 'Reset your passcode';

let client: Resend | null = null;

function getClient(apiKey: string) {
  client ??= new Resend(apiKey);
  return client;
}

export async function sendResetLink({
  to,
  url,
}: {
  to: string;
  url: string;
}): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === 'production') {
      // In prod a missing key is a deployment bug — say so loudly in the logs,
      // but the action still answers the visitor generically.
      console.error('sendResetLink: RESEND_API_KEY or EMAIL_FROM is not set — no email sent.');
      return { ok: false, error: 'Email is not configured.' };
    }

    // Dev fallback: the whole flow stays testable before a Resend key exists —
    // the link lands in the server console instead of an inbox.
    console.log(`[dev] RESEND_API_KEY not set — reset link for ${to} (not sent):\n  ${url}`);
    return { ok: true };
  }

  const text = [
    'A passcode reset was requested for the /manage area of your portfolio.',
    '',
    'Open this link to set a new passcode:',
    url,
    '',
    'The link works once and expires in 15 minutes.',
    "If you didn't request this, ignore this email — your current passcode still works.",
  ].join('\n');

  // Mail clients (Gmail et al.) strip clickable anchors that point at
  // localhost/private hosts, so the URL is also printed as plain text — the
  // recipient can copy it into a browser even when the button isn't clickable.
  const html = [
    '<p>A passcode reset was requested for the <code>/manage</code> area of your portfolio.</p>',
    `<p><a href="${url}">Set a new passcode</a></p>`,
    `<p style="word-break:break-all;font-family:monospace;font-size:12px">${url}</p>`,
    '<p style="color:#666">The link works once and expires in 15 minutes.<br>',
    "If you didn't request this, ignore this email — your current passcode still works.</p>",
  ].join('');

  try {
    const { data, error } = await getClient(apiKey).emails.send({
      from,
      to,
      subject: SUBJECT,
      text,
      html,
    });

    if (error) {
      console.error('sendResetLink: Resend rejected the send.', error);
      return { ok: false, error: error.message };
    }

    // The raw URL in the logs doubles as a debugging trail — you can always
    // recover a just-issued link from the server console.
    console.log(
      `[dev] reset link sent to ${to} (Resend id: ${(data as { id?: string }).id}):\n  ${url}`,
    );
    return { ok: true };
  } catch (error) {
    console.error('sendResetLink: request failed', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error.' };
  }
}
