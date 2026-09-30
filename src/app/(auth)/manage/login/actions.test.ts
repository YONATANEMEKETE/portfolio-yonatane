import { verify } from '@node-rs/argon2';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hashPasscode } from '@/lib/auth';
import { hashSessionToken, SESSION_COOKIE } from '@/lib/session';

import { login } from './actions';

const prismaMock = vi.hoisted(() => ({
  authConfig: {
    findUnique: vi.fn(),
  },
  session: {
    create: vi.fn(),
  },
}));

const cookieSet = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ getPrisma: () => prismaMock }));
vi.mock('next/headers', () => ({
  cookies: async () => ({ set: cookieSet, get: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('login', () => {
  it('rejects an empty passcode before touching the database', async () => {
    const result = await login({ passcode: '' });

    expect(result).toEqual({ ok: false, error: 'Enter the passcode.' });
    expect(prismaMock.authConfig.findUnique).not.toHaveBeenCalled();
  });

  it('returns a generic error for a wrong passcode and creates no session', async () => {
    prismaMock.authConfig.findUnique.mockResolvedValue({
      passcodeHash: await hashPasscode('correct'),
    });

    const result = await login({ passcode: 'wrong' });

    expect(result).toEqual({ ok: false, error: 'Wrong passcode.' });
    expect(prismaMock.session.create).not.toHaveBeenCalled();
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it('uses the same generic error when no passcode is configured at all', async () => {
    prismaMock.authConfig.findUnique.mockResolvedValue(null);

    const result = await login({ passcode: 'anything' });

    expect(result).toEqual({ ok: false, error: 'Wrong passcode.' });
    expect(prismaMock.session.create).not.toHaveBeenCalled();
  });

  it('stores only the SHA-256 of the token and sets an HttpOnly cookie on success', async () => {
    prismaMock.authConfig.findUnique.mockResolvedValue({
      passcodeHash: await hashPasscode('correct'),
    });
    prismaMock.session.create.mockImplementation(({ data }: { data: { tokenHash: string } }) =>
      Promise.resolve({ id: 's1', createdAt: new Date(), expiresAt: new Date(), ...data }),
    );

    const result = await login({ passcode: 'correct' });

    expect(result).toEqual({ ok: true });

    // Session row: 64-hex sha256, expiry ~30 days out.
    const row = prismaMock.session.create.mock.calls[0]![0].data;
    expect(row.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(row.expiresAt.getTime()).toBeGreaterThan(Date.now() + 29 * 24 * 60 * 60 * 1000);

    // Cookie: the raw token, HttpOnly, Lax, scoped to the site root — and the
    // raw token must hash to exactly what was stored.
    expect(cookieSet).toHaveBeenCalledTimes(1);
    const [name, token, options] = cookieSet.mock.calls[0]!;
    expect(name).toBe(SESSION_COOKIE);
    expect(hashSessionToken(token)).toBe(row.tokenHash);
    expect(token).not.toBe(row.tokenHash);
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: false, // NODE_ENV=test, not production
    });
  });

  it('does not leak verification details from the stored hash', async () => {
    const passcodeHash = await hashPasscode('correct');
    prismaMock.authConfig.findUnique.mockResolvedValue({ passcodeHash });

    const result = await login({ passcode: 'wrong' });

    expect(result).toEqual({ ok: false, error: 'Wrong passcode.' });
    await expect(verify(passcodeHash, 'wrong')).resolves.toBe(false);
  });

  it('returns a generic error when the database fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.authConfig.findUnique.mockResolvedValue({
      passcodeHash: await hashPasscode('correct'),
    });
    prismaMock.session.create.mockRejectedValue(new Error('connection reset'));

    const result = await login({ passcode: 'correct' });

    expect(result).toEqual({ ok: false, error: 'Could not sign in. Try again.' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
