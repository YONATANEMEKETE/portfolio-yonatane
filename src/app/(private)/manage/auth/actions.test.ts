import { Prisma } from '@/generated/prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { addRecipientEmail, removeRecipientEmail } from './actions';

const prismaMock = vi.hoisted(() => ({
  recipientEmail: {
    count: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ getPrisma: () => prismaMock }));

function uniqueViolation() {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: '7.10.0',
  });
}

function notFoundViolation() {
  return new Prisma.PrismaClientKnownRequestError('Record not found', {
    code: 'P2025',
    clientVersion: '7.10.0',
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('addRecipientEmail', () => {
  it('rejects invalid input before touching the database', async () => {
    const result = await addRecipientEmail({ email: 'not-an-email' });

    expect(result).toEqual({ ok: false, error: 'Enter a valid email address.' });
    expect(prismaMock.recipientEmail.count).not.toHaveBeenCalled();
  });

  it('enforces the cap server-side even if the UI did not', async () => {
    prismaMock.recipientEmail.count.mockResolvedValue(5);

    const result = await addRecipientEmail({ email: 'a@b.co' });

    expect(result).toEqual({
      ok: false,
      error: 'Limit reached — 5 addresses max.',
    });
    expect(prismaMock.recipientEmail.create).not.toHaveBeenCalled();
  });

  it('maps a unique violation to a friendly duplicate message', async () => {
    prismaMock.recipientEmail.count.mockResolvedValue(1);
    prismaMock.recipientEmail.create.mockRejectedValue(uniqueViolation());

    const result = await addRecipientEmail({ email: 'a@b.co' });

    expect(result).toEqual({ ok: false, error: 'Already on the list.' });
  });

  it('creates the row and returns it on success', async () => {
    prismaMock.recipientEmail.count.mockResolvedValue(0);
    prismaMock.recipientEmail.create.mockResolvedValue({
      id: 'email-1',
      email: 'a@b.co',
    });

    const result = await addRecipientEmail({ email: '  a@b.co ' });

    expect(result).toEqual({ ok: true, email: { id: 'email-1', email: 'a@b.co' } });
    expect(prismaMock.recipientEmail.create).toHaveBeenCalledWith({
      data: { email: 'a@b.co' },
      select: { id: true, email: true },
    });
  });

  it('returns a generic error on unexpected failures', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.recipientEmail.count.mockResolvedValue(0);
    prismaMock.recipientEmail.create.mockRejectedValue(new Error('connection reset'));

    const result = await addRecipientEmail({ email: 'a@b.co' });

    expect(result).toEqual({
      ok: false,
      error: 'Could not save the address. Try again.',
    });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('removeRecipientEmail', () => {
  it('treats an already-missing row as success', async () => {
    prismaMock.recipientEmail.delete.mockRejectedValue(notFoundViolation());

    await expect(removeRecipientEmail('gone')).resolves.toEqual({ ok: true });
  });

  it('surfaces unexpected failures as a server error message', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.recipientEmail.delete.mockRejectedValue(new Error('boom'));

    await expect(removeRecipientEmail('x')).resolves.toEqual({
      ok: false,
      error: 'Could not remove the address. Try again.',
    });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
