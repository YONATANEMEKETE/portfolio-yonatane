import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Prisma } from '@/generated/prisma/client';

import { deleteArticle } from './delete-actions';

const prismaMock = vi.hoisted(() => ({
  article: {
    delete: vi.fn(),
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

describe('deleteArticle', () => {
  it('rejects unauthenticated requests before touching the database', async () => {
    requireSessionMock.mockResolvedValue(null);

    const result = await deleteArticle('a1');

    expect(result).toEqual({ ok: false, error: 'Sign in to delete articles.' });
    expect(prismaMock.article.delete).not.toHaveBeenCalled();
  });

  it('rejects a bad id without touching the database', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);

    const result = await deleteArticle('');

    expect(result).toEqual({ ok: false, error: 'That article no longer exists.' });
    expect(prismaMock.article.delete).not.toHaveBeenCalled();
  });

  it('deletes the row by id', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.delete.mockResolvedValue({ id: 'a1' });

    const result = await deleteArticle('a1');

    expect(result).toEqual({ ok: true, id: 'a1' });
    expect(prismaMock.article.delete).toHaveBeenCalledWith({
      where: { id: 'a1' },
      select: { id: true },
    });
    expect(revalidatePathMock).toHaveBeenCalledWith('/');
    expect(revalidatePathMock).toHaveBeenCalledWith('/blogs');
  });

  it('treats an already-gone row (P2025) as deleted', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: 'test',
      }),
    );

    const result = await deleteArticle('a1');

    expect(result).toEqual({ ok: true, id: 'a1' });
  });

  it('returns a generic error when the database fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.delete.mockRejectedValue(new Error('connection reset'));

    const result = await deleteArticle('a1');

    expect(result).toEqual({ ok: false, error: 'Could not delete the article. Try again.' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
