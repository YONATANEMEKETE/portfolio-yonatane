import { getPrisma } from '@/lib/prisma';

/** One featured row on the home page — serializable, so a server component can pass it down. */
export type FeaturedPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** Tiptap JSON body — only used to derive the "9 min read" label. */
  body: unknown;
  /** ISO date; the card renders "Mar 2026". Null when never published. */
  publishedAt: string | null;
};

const FEATURED_POST_COUNT = 3;

/**
 * The three newest published articles. Ordering is publishedAt (the post's
 * birthday), not updatedAt, so a typo fix never reshuffles the home page.
 * A null publishedAt (legacy rows published before the stamp existed) sorts
 * last — NULLS LAST is explicit because Postgres defaults nulls first on DESC.
 */
export async function getFeaturedPosts(): Promise<FeaturedPost[]> {
  const rows = await getPrisma().article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ publishedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
    take: FEATURED_POST_COUNT,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      publishedAt: true,
    },
  });

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  }));
}
