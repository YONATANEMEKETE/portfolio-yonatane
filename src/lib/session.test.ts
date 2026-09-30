import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findValidSession } from '@/lib/auth';
import { createSessionToken, hashSessionToken, SESSION_MAX_AGE_SECONDS } from '@/lib/session';

const prismaMock = vi.hoisted(() => ({
  session: {
    findUnique: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ getPrisma: () => prismaMock }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createSessionToken', () => {
  it('mints a 32-byte base64url token whose SHA-256 is what we store', () => {
    const { token, tokenHash } = createSessionToken();

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/); // 32 bytes, base64url, unpadded
    expect(tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(hashSessionToken(token)).toBe(tokenHash);
    expect(SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 30);
  });

  it('never mints the same token twice', () => {
    const tokens = new Set(Array.from({ length: 20 }, () => createSessionToken().token));
    expect(tokens.size).toBe(20);
  });
});

describe('findValidSession', () => {
  it('returns null without a database hit when the cookie is missing', async () => {
    await expect(findValidSession(undefined)).resolves.toBeNull();
    await expect(findValidSession('')).resolves.toBeNull();
    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });

  it('returns null for an unknown token', async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    await expect(findValidSession('mystery')).resolves.toBeNull();
    expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashSessionToken('mystery') },
    });
  });

  it('returns null for an expired session', async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      id: 's1',
      tokenHash: hashSessionToken('old'),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() - 1000),
    });

    await expect(findValidSession('old')).resolves.toBeNull();
  });

  it('returns the session when it exists and has not expired', async () => {
    const session = {
      id: 's1',
      tokenHash: hashSessionToken('fresh'),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
    };
    prismaMock.session.findUnique.mockResolvedValue(session);

    await expect(findValidSession('fresh')).resolves.toEqual(session);
  });
});
