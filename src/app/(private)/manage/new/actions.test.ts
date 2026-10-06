import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Prisma } from '@/generated/prisma/client';

import { createArticle } from './actions';

const prismaMock = vi.hoisted(() => ({
  article: {
    create: vi.fn(),
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
  featured: false,
  readTime: 6,
  body: validBody,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createArticle', () => {
  it('rejects unauthenticated requests before touching the database', async () => {
    requireSessionMock.mockResolvedValue(null);

    const result = await createArticle({ ...validInput, status: 'PUBLISHED' });

    expect(result).toEqual({ ok: false, error: 'Sign in to save articles.', field: 'root' });
    expect(prismaMock.article.create).not.toHaveBeenCalled();
  });

  it('returns the first validation error without writing', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);

    const result = await createArticle({ ...validInput, title: '', status: 'DRAFT' });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('Enter a title.');
    expect(prismaMock.article.create).not.toHaveBeenCalled();
  });

  it('saves as DRAFT with no publishedAt by default', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.create.mockResolvedValue({ slug: 'hello-world', status: 'DRAFT' });

    const result = await createArticle({ ...validInput });

    expect(result).toEqual({ ok: true, slug: 'hello-world', status: 'DRAFT' });
    expect(prismaMock.article.create).toHaveBeenCalledWith({
      data: { ...validInput, status: 'DRAFT', publishedAt: null },
      select: { slug: true, status: true },
    });
  });

  it('sets publishedAt when publishing', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.create.mockResolvedValue({ slug: 'hello-world', status: 'PUBLISHED' });

    const result = await createArticle({ ...validInput, status: 'PUBLISHED' });

    expect(result).toEqual({ ok: true, slug: 'hello-world', status: 'PUBLISHED' });
    const data = prismaMock.article.create.mock.calls[0]![0].data;
    expect(data.status).toBe('PUBLISHED');
    expect(data.publishedAt).toBeInstanceOf(Date);
  });

  it('maps a taken slug to a field error on slug', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    const result = await createArticle({ ...validInput, status: 'DRAFT' });

    expect(result).toEqual({
      ok: false,
      error: '“hello-world” is already used. Pick another slug.',
      field: 'slug',
    });
  });

  it('rejects a body with a pending image upload without writing', async () => {
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);

    const result = await createArticle({
      ...validInput,
      body: { type: 'doc', content: [{ type: 'imageUpload', attrs: { accept: 'image/*' } }] },
      status: 'DRAFT',
    });

    expect(result).toEqual({
      ok: false,
      error: 'Wait for image uploads to finish before saving.',
      field: 'body',
    });
    expect(prismaMock.article.create).not.toHaveBeenCalled();
  });

  it('returns a generic error when the database fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    requireSessionMock.mockResolvedValue({ id: 's1' } as never);
    prismaMock.article.create.mockRejectedValue(new Error('connection reset'));

    const result = await createArticle({ ...validInput, status: 'DRAFT' });

    expect(result).toEqual({
      ok: false,
      error: 'Could not save the article. Try again.',
      field: 'root',
    });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
