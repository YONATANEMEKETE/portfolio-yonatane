'use server';

import { Prisma } from '@/generated/prisma/client';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
import { articleSchema } from '@/lib/validation';

export type CreateArticleResult =
  | { ok: true; slug: string; status: 'DRAFT' | 'PUBLISHED' }
  | { ok: false; error: string; field?: 'slug' | 'body' | 'root' };

/** Slug conflict → field error on slug, so the form highlights the right input. */
function slugTaken(slug: string) {
  return {
    ok: false as const,
    error: `“${slug}” is already used. Pick another slug.`,
    field: 'slug' as const,
  };
}

export async function createArticle(input: unknown): Promise<CreateArticleResult> {
  if (!(await requireSession())) {
    return { ok: false, error: 'Sign in to save articles.', field: 'root' };
  }

  // status rides alongside the form values — the form schema covers the
  // article fields, status is checked separately below.
  const parsed = articleSchema.safeParse(input);
  // Re-read status separately: only the two real states, default DRAFT.
  const status =
    input && typeof input === 'object' && (input as { status?: unknown }).status === 'PUBLISHED'
      ? ('PUBLISHED' as const)
      : ('DRAFT' as const);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const top = issue?.path?.[0];
    return {
      ok: false,
      error: issue?.message ?? 'Check the highlighted fields.',
      field: top === 'slug' ? 'slug' : top === 'body' ? 'body' : 'root',
    };
  }

  try {
    const article = await getPrisma().article.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt,
        category: parsed.data.category,
        cover: parsed.data.cover,
        featured: parsed.data.featured,
        readTime: parsed.data.readTime,
        body: parsed.data.body as Prisma.InputJsonValue,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
      select: { slug: true, status: true },
    });

    revalidatePath('/');
    revalidatePath('/blogs');
    if (article.slug) {
      revalidatePath(`/blogs/${article.slug}`);
    }

    return { ok: true, slug: article.slug, status: article.status };
  } catch (error) {
    // P2002 = slug already taken (it's @unique) — surface on the slug field.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return slugTaken(parsed.data.slug);
    }
    console.error('createArticle failed', error);
    return { ok: false, error: 'Could not save the article. Try again.', field: 'root' };
  }
}
