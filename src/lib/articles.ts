import { getPrisma } from '@/lib/prisma';
import { coverPublicUrl } from '@/lib/r2';

export type PublicArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: 'TECH' | 'PERSONAL';
  readTime: number;
  publishedAt: string | null;
};

export type PublicArticleDetail = PublicArticle & {
  coverUrl: string;
  body: unknown;
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

/** One published article by slug — null when missing or still a draft. */
export async function getPublishedArticleBySlug(slug: string): Promise<PublicArticleDetail | null> {
  const row = await getPrisma().article.findFirst({
    where: { slug, status: 'PUBLISHED' },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      cover: true,
      category: true,
      body: true,
      readTime: true,
      publishedAt: true,
    },
  });
  if (!row) return null;

  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    readTime: row.readTime,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    coverUrl: coverPublicUrl(row.cover),
    // Plain JSON across the server boundary — drops anything non-serializable.
    body: JSON.parse(JSON.stringify(row.body)),
  };
}
