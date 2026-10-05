import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Prisma } from '@/generated/prisma/client';

import { updateArticle } from './actions';

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

const validBody = { type: 'doc', content: [{ type: 'paragraph' }] };
const validInput = {
  title: 'Hello World',
  slug: 'hello-world',
  excerpt: 'A short excerpt.',
  category: 'TECH',
  cover: 'articles/covers/abc123.jpg',
  body: validBody,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('updateArticle', () => {
  it('rejects unauthenticated requests before touching the database', async () => {
    requireSessionMock.mockResolvedValue(null);

    const result = await updateArticle('a1', validInput);

    expect(result).toEqual({ ok: false, error: 'Sign in to save articles.', field: 'root' });
    expect(prismaMock.article.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.article.update).not.toHaveBeenCalled();
  });

  it('returns the first validation error without writing', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);

    const result = await updateArticle('a1', { ...validInput, title: '' });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('Enter a title.');
    expect(prismaMock.article.findUnique).not.toHaveBeenCalled();
  });

  it('returns not-found when the row is gone', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.findUnique.mockResolvedValue(null);

    const result = await updateArticle('missing', validInput);

    expect(result).toEqual({
      ok: false,
      error: 'That article no longer exists.',
      field: 'root',
    });
    expect(prismaMock.article.update).not.toHaveBeenCalled();
  });

  it('updates fields without touching status or publishedAt', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.findUnique.mockResolvedValue({
      status: 'PUBLISHED',
      publishedAt: new Date(),
    });
    prismaMock.article.update.mockResolvedValue({ slug: 'hello-world', status: 'PUBLISHED' });

    const result = await updateArticle('a1', validInput);

    expect(result).toEqual({ ok: true, slug: 'hello-world', status: 'PUBLISHED' });
    const data = prismaMock.article.update.mock.calls[0]![0].data;
    expect(data).toMatchObject({
      title: 'Hello World',
      slug: 'hello-world',
      excerpt: 'A short excerpt.',
      category: 'TECH',
      cover: 'articles/covers/abc123.jpg',
    });
    expect(data).not.toHaveProperty('status');
    expect(data).not.toHaveProperty('publishedAt');
  });

  it('maps a taken slug to a field error on slug', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.findUnique.mockResolvedValue({ status: 'DRAFT', publishedAt: null });
    prismaMock.article.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    const result = await updateArticle('a1', validInput);

    expect(result).toEqual({
      ok: false,
      error: '“hello-world” is already used. Pick another slug.',
      field: 'slug',
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

    const result = await updateArticle('a1', validInput);

    expect(result).toEqual({
      ok: false,
      error: 'That article no longer exists.',
      field: 'root',
    });
  });

  it('rejects a body with a pending image upload without writing', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);

    const result = await updateArticle('a1', {
      ...validInput,
      body: { type: 'doc', content: [{ type: 'imageUpload', attrs: { accept: 'image/*' } }] },
    });

    expect(result).toEqual({
      ok: false,
      error: 'Wait for image uploads to finish before saving.',
      field: 'body',
    });
    expect(prismaMock.article.findUnique).not.toHaveBeenCalled();
  });

  it('returns a generic error when the database fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.findUnique.mockResolvedValue({ status: 'DRAFT', publishedAt: null });
    prismaMock.article.update.mockRejectedValue(new Error('connection reset'));

    const result = await updateArticle('a1', validInput);

    expect(result).toEqual({
      ok: false,
      error: 'Could not save the article. Try again.',
      field: 'root',
    });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
