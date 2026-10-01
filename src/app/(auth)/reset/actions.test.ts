import { verify } from '@node-rs/argon2';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { INVALID_LINK_MESSAGE } from '@/lib/recovery';
import { hashSessionToken, SESSION_COOKIE } from '@/lib/session';

import { resetPasscode } from './actions';

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  oneTimeToken: {
    findUnique: vi.fn(),
    updateMany: vi.fn(),
  },
  authConfig: {
    upsert: vi.fn(),
  },
  session: {
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
}));

const cookieSet = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ getPrisma: () => prismaMock }));
vi.mock('next/headers', () => ({
  cookies: async () => ({ set: cookieSet, get: vi.fn() }),
}));

const validRow = {
  id: 't1',
  tokenHash: hashSessionToken('good-token'),
  purpose: 'passcode-reset',
  recipientEmailId: 'email-1',
  expiresAt: new Date(Date.now() + 60_000),
  usedAt: null,
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => unknown) =>
    fn(prismaMock),
  );
  prismaMock.oneTimeToken.findUnique.mockResolvedValue(validRow);
  prismaMock.oneTimeToken.updateMany.mockResolvedValue({ count: 1 });
  prismaMock.authConfig.upsert.mockResolvedValue({
    id: 1,
    passcodeHash: 'x',
    updatedAt: new Date(),
  });
  prismaMock.session.create.mockResolvedValue({ id: 's1' });
});

describe('resetPasscode', () => {
  it('rejects a too-short passcode before touching the database', async () => {
    const result = await resetPasscode({ token: 'good-token', passcode: 'ab', confirm: 'ab' });

    expect(result).toEqual({ ok: false, error: 'At least 4 characters' });
    expect(prismaMock.oneTimeToken.findUnique).not.toHaveBeenCalled();
  });

  it('rejects mismatched confirmation', async () => {
    const result = await resetPasscode({ token: 'good-token', passcode: 'abcd', confirm: 'abce' });

    expect(result).toEqual({ ok: false, error: 'Passcodes do not match.' });
    expect(prismaMock.oneTimeToken.findUnique).not.toHaveBeenCalled();
  });

  it('answers with the link-invalid message for an unknown token and writes nothing', async () => {
    prismaMock.oneTimeToken.findUnique.mockResolvedValue(null);

    const result = await resetPasscode({ token: 'mystery', passcode: 'abcd', confirm: 'abcd' });

    expect(result).toEqual({ ok: false, error: INVALID_LINK_MESSAGE });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it('answers with the link-invalid message for a used token', async () => {
    prismaMock.oneTimeToken.findUnique.mockResolvedValue({
      ...validRow,
      usedAt: new Date(Date.now() - 1000),
    });

    const result = await resetPasscode({ token: 'good-token', passcode: 'abcd', confirm: 'abcd' });

    expect(result).toEqual({ ok: false, error: INVALID_LINK_MESSAGE });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('consumes the token, rotates the hash, kills all sessions, and signs in', async () => {
    const result = await resetPasscode({
      token: 'good-token',
      passcode: 's3cret',
      confirm: 's3cret',
    });

    expect(result).toEqual({ ok: true });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

    // Token consumed exactly once, conditionally on still being unused.
    expect(prismaMock.oneTimeToken.updateMany).toHaveBeenCalledWith({
      where: { id: 't1', usedAt: null },
      data: { usedAt: expect.any(Date) },
    });

    // New argon2id PHC hash — verifiable against the new passcode, and never
    // the plaintext.
    const upsertCall = prismaMock.authConfig.upsert.mock.calls[0]![0]!;
    expect(upsertCall.where).toEqual({ id: 1 });
    const storedHash: string = upsertCall.update.passcodeHash;
    expect(storedHash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    expect(storedHash).not.toContain('s3cret');
    await expect(verify(storedHash, 's3cret')).resolves.toBe(true);
    await expect(verify(storedHash, 'old-passcode')).resolves.toBe(false);

    // Old sessions die with the old passcode; a fresh one is minted.
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({});
    const createdTokenHash: string = prismaMock.session.create.mock.calls[0]![0].data.tokenHash;
    expect(createdTokenHash).toMatch(/^[0-9a-f]{64}$/);

    // Cookie carries the raw token, which hashes to exactly what was stored.
    expect(cookieSet).toHaveBeenCalledTimes(1);
    const [name, token, options] = cookieSet.mock.calls[0]!;
    expect(name).toBe(SESSION_COOKIE);
    expect(hashSessionToken(token)).toBe(createdTokenHash);
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: false, // NODE_ENV=test, not production
    });
  });

  it('treats a concurrently-consumed token as an invalid link, rolling back', async () => {
    prismaMock.oneTimeToken.updateMany.mockResolvedValue({ count: 0 });

    const result = await resetPasscode({ token: 'good-token', passcode: 'abcd', confirm: 'abcd' });

    expect(result).toEqual({ ok: false, error: INVALID_LINK_MESSAGE });
    expect(prismaMock.authConfig.upsert).not.toHaveBeenCalled();
    expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.session.create).not.toHaveBeenCalled();
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it('returns a generic error when the database fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.oneTimeToken.findUnique.mockRejectedValue(new Error('connection reset'));

    const result = await resetPasscode({ token: 'good-token', passcode: 'abcd', confirm: 'abcd' });

    expect(result).toEqual({ ok: false, error: 'Could not reset the passcode. Try again.' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
