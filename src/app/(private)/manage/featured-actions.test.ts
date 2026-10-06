import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Prisma } from '@/generated/prisma/client';

import { toggleFeatured } from './featured-actions';

const prismaMock = vi.hoisted(() => ({
  article: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ getPrisma: () => prismaMock }));
vi.mock('@/lib/auth', () => ({ requireSession: vi.fn() }));

import { requireSession } from '@/lib/auth';

const requireSessionMock = vi.mocked(requireSession);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('toggleFeatured', () => {
  it('rejects unauthenticated requests before touching the database', async () => {
    requireSessionMock.mockResolvedValue(null);

    const result = await toggleFeatured('a1');

    expect(result).toEqual({ ok: false, error: 'Sign in to change featured status.' });
    expect(prismaMock.article.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a bad id without touching the database', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);

    const result = await toggleFeatured('');

    expect(result).toEqual({ ok: false, error: 'That article no longer exists.' });
    expect(prismaMock.article.findUnique).not.toHaveBeenCalled();
  });

  it('returns not-found when the row is gone', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.findUnique.mockResolvedValue(null);

    const result = await toggleFeatured('missing');

    expect(result).toEqual({ ok: false, error: 'That article no longer exists.' });
    expect(prismaMock.article.update).not.toHaveBeenCalled();
  });

  it('toggles featured from false to true', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.findUnique.mockResolvedValue({ featured: false });
    prismaMock.article.update.mockResolvedValue({ id: 'a1', featured: true });

    const result = await toggleFeatured('a1');

    expect(result).toEqual({ ok: true, id: 'a1', featured: true });
    expect(prismaMock.article.update).toHaveBeenCalledWith({
      where: { id: 'a1' },
      data: { featured: true },
      select: { id: true, featured: true },
    });
  });

  it('toggles featured from true to false', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.findUnique.mockResolvedValue({ featured: true });
    prismaMock.article.update.mockResolvedValue({ id: 'a1', featured: false });

    const result = await toggleFeatured('a1');

    expect(result).toEqual({ ok: true, id: 'a1', featured: false });
    expect(prismaMock.article.update).toHaveBeenCalledWith({
      where: { id: 'a1' },
      data: { featured: false },
      select: { id: true, featured: true },
    });
  });

  it('maps a vanished row (P2025) to not-found', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.findUnique.mockResolvedValue({ featured: false });
    prismaMock.article.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    const result = await toggleFeatured('a1');

    expect(result).toEqual({ ok: false, error: 'That article no longer exists.' });
  });

  it('returns a generic error when the database fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.findUnique.mockResolvedValue({ featured: false });
    prismaMock.article.update.mockRejectedValue(new Error('connection reset'));

    const result = await toggleFeatured('a1');

    expect(result).toEqual({ ok: false, error: 'Could not change featured status. Try again.' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
