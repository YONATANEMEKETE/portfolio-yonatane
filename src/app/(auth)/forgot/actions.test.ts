import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GENERIC_SENT_MESSAGE } from '@/lib/recovery';

import { requestResetLink } from './actions';

const prismaMock = vi.hoisted(() => ({
  recipientEmail: {
    findUnique: vi.fn(),
  },
  $transaction: vi.fn(),
  oneTimeToken: {
    updateMany: vi.fn(),
    create: vi.fn(),
  },
}));

const sendResetLinkMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/prisma', () => ({ getPrisma: () => prismaMock }));
vi.mock('@/lib/email', () => ({ sendResetLink: sendResetLinkMock }));
vi.mock('next/headers', () => ({
  headers: async () => ({ get: (name: string) => (name === 'host' ? 'localhost:3000' : null) }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => unknown) =>
    fn(prismaMock),
  );
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', undefined);
});

describe('requestResetLink', () => {
  it('rejects a missing id before touching the database', async () => {
    const result = await requestResetLink({ recipientEmailId: '' });

    expect(result).toEqual({ ok: false, error: 'Pick an address.' });
    expect(prismaMock.recipientEmail.findUnique).not.toHaveBeenCalled();
  });

  it('answers with the generic success for an unknown id — no token, no email', async () => {
    prismaMock.recipientEmail.findUnique.mockResolvedValue(null);

    const result = await requestResetLink({ recipientEmailId: 'nope' });

    expect(result).toEqual({ ok: true, message: GENERIC_SENT_MESSAGE });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(sendResetLinkMock).not.toHaveBeenCalled();
  });

  it('issues a token, invalidates older ones, and emails the real address', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://portfolio.example');
    prismaMock.recipientEmail.findUnique.mockResolvedValue({ email: 'me@real.example' });
    sendResetLinkMock.mockResolvedValue({ ok: true });

    const result = await requestResetLink({ recipientEmailId: 'email-1' });

    expect(result).toEqual({ ok: true, message: GENERIC_SENT_MESSAGE });

    // Invalidation ran for this recipient before the fresh token was created.
    expect(prismaMock.oneTimeToken.updateMany).toHaveBeenCalledWith({
      where: { purpose: 'passcode-reset', recipientEmailId: 'email-1', usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
    expect(prismaMock.oneTimeToken.create).toHaveBeenCalledTimes(1);

    // The email goes to the real address with a /reset?token=… link — token
    // raw (43-char base64url), origin from the env var.
    expect(sendResetLinkMock).toHaveBeenCalledTimes(1);
    const { to, url } = sendResetLinkMock.mock.calls[0]![0]!;
    expect(to).toBe('me@real.example');
    expect(url).toMatch(/^https:\/\/portfolio\.example\/reset\?token=[A-Za-z0-9_-]{43}$/);
  });

  it('falls back to the request origin when NEXT_PUBLIC_SITE_URL is unset', async () => {
    prismaMock.recipientEmail.findUnique.mockResolvedValue({ email: 'me@real.example' });
    sendResetLinkMock.mockResolvedValue({ ok: true });

    await requestResetLink({ recipientEmailId: 'email-1' });

    const { url } = sendResetLinkMock.mock.calls[0]![0]!;
    expect(url).toMatch(/^http:\/\/localhost:3000\/reset\?token=/);
  });

  it('answers with an error when the email could not be sent', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.recipientEmail.findUnique.mockResolvedValue({ email: 'me@real.example' });
    sendResetLinkMock.mockResolvedValue({ ok: false, error: 'Email is not configured.' });

    const result = await requestResetLink({ recipientEmailId: 'email-1' });

    expect(result).toEqual({ ok: false, error: 'Could not send the reset link. Try again.' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('answers with an error when the database fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.recipientEmail.findUnique.mockRejectedValue(new Error('connection reset'));

    const result = await requestResetLink({ recipientEmailId: 'email-1' });

    expect(result).toEqual({ ok: false, error: 'Could not send the reset link. Try again.' });
    expect(sendResetLinkMock).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
