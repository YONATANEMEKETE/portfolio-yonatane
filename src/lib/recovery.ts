import { getPrisma } from '@/lib/prisma';
import { createSessionToken, hashSessionToken } from '@/lib/session';

/**
 * auth.md: reset links expire after 15 minutes and are single-use. Requesting
 * a new link invalidates older unused ones.
 */
export const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
export const RESET_TOKEN_PURPOSE = 'passcode-reset';

/**
 * The one answer /forgot gives for any id, real or not (auth.md). Lives here
 * rather than in the actions file because "use server" files may only export
 * async functions.
 */
export const GENERIC_SENT_MESSAGE =
  'If that address is set up, a reset link is on its way. It expires in 15 minutes.';

/**
 * The one answer /reset gives for any bad link — unknown, expired, or already
 * used. Same "use server"-export constraint as GENERIC_SENT_MESSAGE.
 */
export const INVALID_LINK_MESSAGE =
  'This reset link is invalid or has expired. Request a fresh one.';

/**
 * Masking happens on the way out — raw addresses never reach an unauthenticated
 * client (auth.md). First + last char of each part, provider TLD kept:
 *
 *   yonatane@gmail.com → y***e@g***l.com
 *   ym@outlook.com     → y*m@o***k.com
 *   a@proton.me        → a***@p***n.me
 *
 * Enough for the owner to tell their own addresses apart, nothing more.
 * Server-side only: the pages that show masked emails compute this on the
 * server and hand the client `[{ id, masked }]`.
 */
export function maskEmail(email: string) {
  const at = email.lastIndexOf('@');
  if (at === -1) return maskPart(email);

  const local = maskPart(email.slice(0, at));
  const domain = email.slice(at + 1);
  const dot = domain.lastIndexOf('.');
  // No dot → no separable TLD; mask the whole domain as one part.
  if (dot === -1) return `${local}@${maskPart(domain)}`;

  return `${local}@${maskPart(domain.slice(0, dot))}${domain.slice(dot)}`;
}

/**
 * The masking unit, applied to the local part and to the domain name (the TLD
 * is exempt). Short parts get shorter fillers so a 2-char hint like `y*m`
 * stays distinguishable without revealing more than one middle character.
 */
function maskPart(part: string) {
  if (part.length === 0) return '';
  if (part.length === 1) return `${part}***`;
  if (part.length === 2) return `${part[0]}*${part[1]}`;
  return `${part[0]}***${part[part.length - 1]}`;
}

/**
 * DB half of "send me a reset link": in one transaction, mark every older
 * unused passcode-reset token for this recipient used (auth.md invalidation
 * rule), then insert the fresh one. Returns the raw token — it goes into the
 * emailed URL and is never stored plaintext; the DB keeps only its SHA-256
 * (same mechanics as session tokens, see src/lib/session.ts).
 */
export async function issueResetToken(recipientEmailId: string) {
  const { token, tokenHash } = createSessionToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await getPrisma().$transaction(async (tx) => {
    await tx.oneTimeToken.updateMany({
      where: { purpose: RESET_TOKEN_PURPOSE, recipientEmailId, usedAt: null },
      data: { usedAt: new Date() },
    });
    await tx.oneTimeToken.create({
      data: { tokenHash, purpose: RESET_TOKEN_PURPOSE, recipientEmailId, expiresAt },
    });
  });

  return { token, expiresAt };
}

/**
 * DB half of the reset-link check: raw ?token= value → SHA-256 → the
 * passcode-reset row, or null unless it exists, is unused and unexpired.
 * Mirrors findValidSession — used by /reset before showing the form.
 */
export async function findValidResetToken(token: string | undefined) {
  if (!token) return null;

  const row = await getPrisma().oneTimeToken.findUnique({
    where: { tokenHash: hashSessionToken(token) },
  });
  if (!row) return null;
  if (row.purpose !== RESET_TOKEN_PURPOSE) return null;
  if (row.usedAt) return null;
  if (row.expiresAt.getTime() <= Date.now()) return null;

  return row;
}
