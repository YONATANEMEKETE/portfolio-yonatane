'use server';

import { Prisma } from '@/generated/prisma/client';

import { requireSession } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';

export type DeleteArticleResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Hard-delete one article row. Idempotent: deleting an already-gone row
 * reports success so a stale list self-heals on refresh instead of showing
 * an error for a row that is already gone.
 */
export async function deleteArticle(id: string): Promise<DeleteArticleResult> {
  if (!(await requireSession())) {
    return { ok: false, error: 'Sign in to delete articles.' };
  }

  if (typeof id !== 'string' || id.length === 0 || id.length > 64) {
    return { ok: false, error: 'That article no longer exists.' };
  }

  try {
    await getPrisma().article.delete({ where: { id }, select: { id: true } });

    return { ok: true, id };
  } catch (error) {
    // P2025 = already gone — treat as deleted so the list refresh cleans up.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return { ok: true, id };
    }
    console.error('deleteArticle failed', error);
    return { ok: false, error: 'Could not delete the article. Try again.' };
  }
}
