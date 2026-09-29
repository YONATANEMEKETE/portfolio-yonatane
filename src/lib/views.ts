import { createHash } from 'node:crypto';

import { getPrisma } from '@/lib/prisma';

/** Client address, as seen through the proxy that terminated the request. */
export function getClientIp(headers: Headers) {
  const forwarded = headers.get('x-forwarded-for');

  if (forwarded) {
    return forwarded.split(',')[0]!.trim();
  }

  return headers.get('cf-connecting-ip')?.trim() ?? headers.get('x-real-ip')?.trim() ?? 'local';
}

/**
 * Salted so the database never holds an IP (they're enumerable, so an unsalted
 * digest would be reversible). The salt must stay constant for dedupe to work
 * across requests.
 */
export function hashVisitor(ip: string) {
  const salt = process.env.VIEW_HASH_SALT;

  if (!salt) {
    throw new Error('VIEW_HASH_SALT is not set');
  }

  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

/** Dedupe bucket: the UTC calendar day. */
export function utcDay(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Records a view unless this visitor already counted on this route today.
 * Returning count 0 means it was a repeat, so callers never see a double count
 * even under concurrent requests.
 */
export async function recordPageView({ path, ip }: { path: string; ip: string }) {
  const { count } = await getPrisma().pageView.createMany({
    data: [{ path, visitorHash: hashVisitor(ip), day: utcDay() }],
    skipDuplicates: true,
  });

  return count;
}

export async function getViewCount() {
  return getPrisma().pageView.count();
}
