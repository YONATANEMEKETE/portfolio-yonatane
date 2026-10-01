import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  findValidResetToken,
  issueResetToken,
  maskEmail,
  RESET_TOKEN_PURPOSE,
  RESET_TOKEN_TTL_MS,
} from '@/lib/recovery';
import { hashSessionToken } from '@/lib/session';

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  oneTimeToken: {
    updateMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ getPrisma: () => prismaMock }));

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => unknown) =>
    fn(prismaMock),
  );
});

describe('maskEmail', () => {
  it('matches the three examples in auth.md', () => {
    expect(maskEmail('yonatane@gmail.com')).toBe('y***e@g***l.com');
    expect(maskEmail('ym@outlook.com')).toBe('y*m@o***k.com');
    expect(maskEmail('a@proton.me')).toBe('a***@p***n.me');
  });

  it('keeps the TLD but masks a multi-label domain as one part', () => {
    expect(maskEmail('me@mail.yonatane.dev')).toBe('m*e@m***e.dev');
  });

  it('masks a single-char domain name without a dangling separator', () => {
    expect(maskEmail('a@x.com')).toBe('a***@x***.com');
  });

  it('handles a domain with no TLD', () => {
    expect(maskEmail('root@localhost')).toBe('r***t@l***t');
  });

  it('never leaks the raw address even for degenerate input', () => {
    expect(maskEmail('@')).toBe('@');
    expect(maskEmail('@broken')).toBe('@b***n');
    expect(maskEmail('no-at-sign')).toBe('n***n');
  });
});

describe('issueResetToken', () => {
  it('invalidates older unused tokens and creates the new one atomically', async () => {
    const result = await issueResetToken('email-1');

    expect(prismaMock.oneTimeToken.updateMany).toHaveBeenCalledWith({
      where: { purpose: RESET_TOKEN_PURPOSE, recipientEmailId: 'email-1', usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

    const createCall = prismaMock.oneTimeToken.create.mock.calls[0]![0]!;
    expect(createCall.data.purpose).toBe(RESET_TOKEN_PURPOSE);
    expect(createCall.data.recipientEmailId).toBe('email-1');
    expect(createCall.data.tokenHash).toBe(hashSessionToken(result.token));
    // 15 minutes, with tolerance for the clock ticking between calls.
    const ttl = createCall.data.expiresAt.getTime() - Date.now();
    expect(ttl).toBeGreaterThan(RESET_TOKEN_TTL_MS - 1000);
    expect(ttl).toBeLessThanOrEqual(RESET_TOKEN_TTL_MS);
  });

  it('returns the raw base64url token — never its hash — plus the expiry', async () => {
    const { token, expiresAt } = await issueResetToken('email-1');

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/); // 32 bytes, base64url, unpadded
    expect(token).not.toBe(hashSessionToken(token));
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('scopes invalidation to the chosen recipient', async () => {
    await issueResetToken('email-2');

    expect(prismaMock.oneTimeToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ recipientEmailId: 'email-2' }) }),
    );
  });
});

describe('findValidResetToken', () => {
  const validRow = {
    id: 't1',
    tokenHash: hashSessionToken('good-token'),
    purpose: RESET_TOKEN_PURPOSE,
    recipientEmailId: 'email-1',
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: null,
    createdAt: new Date(),
  };

  it('returns null without a database hit when the token is missing', async () => {
    await expect(findValidResetToken(undefined)).resolves.toBeNull();
    await expect(findValidResetToken('')).resolves.toBeNull();
    expect(prismaMock.oneTimeToken.findUnique).not.toHaveBeenCalled();
  });

  it('returns null for an unknown token', async () => {
    prismaMock.oneTimeToken.findUnique.mockResolvedValue(null);

    await expect(findValidResetToken('mystery')).resolves.toBeNull();
    expect(prismaMock.oneTimeToken.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashSessionToken('mystery') },
    });
  });

  it('returns null for a token of a different purpose', async () => {
    prismaMock.oneTimeToken.findUnique.mockResolvedValue({ ...validRow, purpose: 'email-verify' });

    await expect(findValidResetToken('good-token')).resolves.toBeNull();
  });

  it('returns null for an already-used token', async () => {
    prismaMock.oneTimeToken.findUnique.mockResolvedValue({
      ...validRow,
      usedAt: new Date(Date.now() - 1000),
    });

    await expect(findValidResetToken('good-token')).resolves.toBeNull();
  });

  it('returns null for an expired token', async () => {
    prismaMock.oneTimeToken.findUnique.mockResolvedValue({
      ...validRow,
      expiresAt: new Date(Date.now() - 1000),
    });

    await expect(findValidResetToken('good-token')).resolves.toBeNull();
  });

  it('returns the row when it exists, is unused and unexpired', async () => {
    prismaMock.oneTimeToken.findUnique.mockResolvedValue(validRow);

    await expect(findValidResetToken('good-token')).resolves.toEqual(validRow);
  });
});
