'use server';

import { Prisma } from '@/generated/prisma/client';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';

export type TogglePublishResult =
  { ok: true; id: string; status: 'DRAFT' | 'PUBLISHED' } | { ok: false; error: string };

function badId() {
  return { ok: false as const, error: 'That article no longer exists.' };
}

/**
 * Publish ↔ unpublish for one card button. Status is the only thing that
 * moves — title/body/cover are the edit form's job. publishedAt is a
 * birthday: stamped on first publish, never moved after (a typo fix or a
 * re-publish after unpublish must not rewrite history).
 */
export async function togglePublish(id: string): Promise<TogglePublishResult> {
  if (!(await requireSession())) {
    return { ok: false, error: 'Sign in to change publishing.' };
  }

  if (typeof id !== 'string' || id.length === 0 || id.length > 64) {
    return badId();
  }

  try {
    const current = await getPrisma().article.findUnique({
      where: { id },
      select: { status: true, publishedAt: true },
    });

    if (!current) return badId();

    const toPublished = current.status === 'DRAFT';

    const article = await getPrisma().article.update({
      where: { id },
      data: {
        status: toPublished ? 'PUBLISHED' : 'DRAFT',
        // First publish stamps the birthday; every other transition keeps it.
        publishedAt: toPublished ? (current.publishedAt ?? new Date()) : current.publishedAt,
      },
      select: { id: true, status: true, slug: true },
    });

    revalidatePath('/');
    revalidatePath('/blogs');
    if (article.slug) {
      revalidatePath(`/blogs/${article.slug}`);
    }

    return { ok: true, id: article.id, status: article.status };
  } catch (error) {
    // P2025 = the row vanished between list render and click.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return badId();
    }
    console.error('togglePublish failed', error);
    return { ok: false, error: 'Could not change publishing. Try again.' };
  }
}
