import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Prisma } from '@/generated/prisma/client';

import { togglePublish } from './publish-actions';

const prismaMock = vi.hoisted(() => ({
  article: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

const revalidatePathMock = vi.fn();
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => revalidatePathMock(path),
}));

vi.mock('@/lib/prisma', () => ({ getPrisma: () => prismaMock }));
vi.mock('@/lib/auth', () => ({ requireSession: vi.fn() }));

import { requireSession } from '@/lib/auth';

const requireSessionMock = vi.mocked(requireSession);

beforeEach(() => {
  vi.clearAllMocks();
  revalidatePathMock.mockClear();
});

describe('togglePublish', () => {
  it('rejects unauthenticated requests before touching the database', async () => {
    requireSessionMock.mockResolvedValue(null);

    const result = await togglePublish('a1');

    expect(result).toEqual({ ok: false, error: 'Sign in to change publishing.' });
    expect(prismaMock.article.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a bad id without touching the database', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);

    const result = await togglePublish('');

    expect(result).toEqual({ ok: false, error: 'That article no longer exists.' });
    expect(prismaMock.article.findUnique).not.toHaveBeenCalled();
  });

  it('returns not-found when the row is gone', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.findUnique.mockResolvedValue(null);

    const result = await togglePublish('missing');

    expect(result).toEqual({ ok: false, error: 'That article no longer exists.' });
    expect(prismaMock.article.update).not.toHaveBeenCalled();
  });

  it('publishes a draft and stamps publishedAt on first publish', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.findUnique.mockResolvedValue({ status: 'DRAFT', publishedAt: null });
    prismaMock.article.update.mockResolvedValue({ id: 'a1', status: 'PUBLISHED', slug: 'a1-slug' });

    const result = await togglePublish('a1');

    expect(result).toEqual({ ok: true, id: 'a1', status: 'PUBLISHED' });
    expect(revalidatePathMock).toHaveBeenCalledWith('/');
    expect(revalidatePathMock).toHaveBeenCalledWith('/blogs');
    expect(revalidatePathMock).toHaveBeenCalledWith('/blogs/a1-slug');
    const data = prismaMock.article.update.mock.calls[0]![0].data;
    expect(data.status).toBe('PUBLISHED');
    expect(data.publishedAt).toBeInstanceOf(Date);
  });

  it('keeps the original publishedAt on re-publish after unpublish', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    const birthday = new Date('2024-01-01T00:00:00Z');
    prismaMock.article.findUnique.mockResolvedValue({ status: 'DRAFT', publishedAt: birthday });
    prismaMock.article.update.mockResolvedValue({ id: 'a1', status: 'PUBLISHED' });

    const result = await togglePublish('a1');

    expect(result).toEqual({ ok: true, id: 'a1', status: 'PUBLISHED' });
    expect(prismaMock.article.update.mock.calls[0]![0].data).toEqual({
      status: 'PUBLISHED',
      publishedAt: birthday,
    });
  });

  it('unpublishes without moving publishedAt', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    const birthday = new Date('2024-01-01T00:00:00Z');
    prismaMock.article.findUnique.mockResolvedValue({ status: 'PUBLISHED', publishedAt: birthday });
    prismaMock.article.update.mockResolvedValue({ id: 'a1', status: 'DRAFT' });

    const result = await togglePublish('a1');

    expect(result).toEqual({ ok: true, id: 'a1', status: 'DRAFT' });
    expect(prismaMock.article.update.mock.calls[0]![0].data).toEqual({
      status: 'DRAFT',
      publishedAt: birthday,
    });
  });

  it('maps a vanished row (P2025) to not-found', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.findUnique.mockResolvedValue({ status: 'DRAFT', publishedAt: null });
    prismaMock.article.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    const result = await togglePublish('a1');

    expect(result).toEqual({ ok: false, error: 'That article no longer exists.' });
  });

  it('returns a generic error when the database fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.findUnique.mockResolvedValue({ status: 'DRAFT', publishedAt: null });
    prismaMock.article.update.mockRejectedValue(new Error('connection reset'));

    const result = await togglePublish('a1');

    expect(result).toEqual({ ok: false, error: 'Could not change publishing. Try again.' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
