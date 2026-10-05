'use server';

import { Prisma } from '@/generated/prisma/client';

import { requireSession } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';
import { articleSchema } from '@/lib/validation';

export type UpdateArticleResult =
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

export async function updateArticle(id: string, input: unknown): Promise<UpdateArticleResult> {
  if (!(await requireSession())) {
    return { ok: false, error: 'Sign in to save articles.', field: 'root' };
  }

  if (typeof id !== 'string' || id.length === 0 || id.length > 64) {
    return { ok: false, error: 'That article no longer exists.', field: 'root' };
  }

  const parsed = articleSchema.safeParse(input);

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
    const current = await getPrisma().article.findUnique({
      where: { id },
      select: { status: true, publishedAt: true },
    });

    if (!current) {
      return { ok: false, error: 'That article no longer exists.', field: 'root' };
    }

    const article = await getPrisma().article.update({
      where: { id },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt,
        category: parsed.data.category,
        cover: parsed.data.cover,
        body: parsed.data.body as Prisma.InputJsonValue,
        // Status + publishedAt are owned by the publish/unpublish buttons, not
        // the edit form — saving text must never silently (un)publish or move
        // a post's birthday.
      },
      select: { slug: true, status: true },
    });

    return { ok: true, slug: article.slug, status: article.status };
  } catch (error) {
    // P2002 = slug already taken (it's @unique) — surface on the slug field.
    // P2025 = the row vanished between load and save.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return slugTaken(parsed.data.slug);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return { ok: false, error: 'That article no longer exists.', field: 'root' };
    }
    console.error('updateArticle failed', error);
    return { ok: false, error: 'Could not save the article. Try again.', field: 'root' };
  }
}
