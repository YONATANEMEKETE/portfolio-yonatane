import { getPrisma } from '@/lib/prisma';

export type PublicArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: 'TECH' | 'PERSONAL';
  readTime: number;
  publishedAt: string | null;
};

/**
 * Fetch all published articles, optionally filtered by category.
 * Ordered by publishedAt DESC (newest first).
 */
export async function getPublishedArticles(
  category?: 'TECH' | 'PERSONAL',
): Promise<PublicArticle[]> {
  const rows = await getPrisma().article.findMany({
    where: {
      status: 'PUBLISHED',
      ...(category ? { category } : {}),
    },
    orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      readTime: true,
      publishedAt: true,
    },
  });

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    readTime: row.readTime,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  }));
}
