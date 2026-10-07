'use server';

import { Prisma } from '@/generated/prisma/client';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';

export type ToggleFeaturedResult =
  { ok: true; id: string; featured: boolean } | { ok: false; error: string };

function badId() {
  return { ok: false as const, error: 'That article no longer exists.' };
}

/**
 * Toggle featured flag for an article in the manage view.
 */
export async function toggleFeatured(id: string): Promise<ToggleFeaturedResult> {
  if (!(await requireSession())) {
    return { ok: false, error: 'Sign in to change featured status.' };
  }

  if (typeof id !== 'string' || id.length === 0 || id.length > 64) {
    return badId();
  }

  try {
    const current = await getPrisma().article.findUnique({
      where: { id },
      select: { featured: true },
    });

    if (!current) return badId();

    const article = await getPrisma().article.update({
      where: { id },
      data: {
        featured: !current.featured,
      },
      select: { id: true, featured: true },
    });

    revalidatePath('/');
    revalidatePath('/blogs');

    return { ok: true, id: article.id, featured: article.featured };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return badId();
    }
    console.error('toggleFeatured failed', error);
    return { ok: false, error: 'Could not change featured status. Try again.' };
  }
}
