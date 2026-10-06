import { getPrisma } from '@/lib/prisma';

/** One featured row on the home page — serializable, so a server component can pass it down. */
export type FeaturedPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** Read time in minutes. */
  readTime: number;
  /** ISO date; the card renders "Mar 2026". Null when never published. */
  publishedAt: string | null;
};

const FEATURED_POST_COUNT = 3;

/**
 * The three newest published featured articles. Ordering is publishedAt (the post's
 * birthday), not updatedAt, so a typo fix never reshuffles the home page.
 * A null publishedAt (legacy rows published before the stamp existed) sorts
 * last — NULLS LAST is explicit because Postgres defaults nulls first on DESC.
 */
export async function getFeaturedPosts(): Promise<FeaturedPost[]> {
  const rows = await getPrisma().article.findMany({
    where: {
      status: 'PUBLISHED',
      featured: true,
    },
    orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    take: FEATURED_POST_COUNT,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      readTime: true,
      publishedAt: true,
    },
  });

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    readTime: row.readTime,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  }));
}
