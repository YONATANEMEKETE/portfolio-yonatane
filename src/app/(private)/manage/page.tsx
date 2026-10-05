import Link from 'next/link';

import { getPrisma } from '@/lib/prisma';
import { coverPublicUrl } from '@/lib/r2';

import { ArticleCard, type ManageArticle } from '@/components/manage/article-card';

// The list reads live rows — without this, `next build` would prerender the
// page and freeze whatever the DB held at build time.
export const dynamic = 'force-dynamic';

async function loadArticles(): Promise<ManageArticle[]> {
  const rows = await getPrisma().article.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      status: true,
      cover: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    status: row.status,
    // Render-time prefix: a bucket/CDN move needs no data migration.
    coverUrl: coverPublicUrl(row.cover),
    publishedAt: row.publishedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

// Blogs role of /manage: article list, search, filters, editor (M6).
export default async function ManagePage() {
  const articles = await loadArticles();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-ink text-[26px] leading-[34px]">Blogs</h1>
          <p className="text-muted-ink font-mono text-[14px]">Articles, drafts and publishing.</p>
        </div>
        <Link
          href="/manage/new"
          className="border-line-soft text-muted-ink hover:text-ink rounded-full border bg-white px-4 py-1.5 font-mono text-[13px] transition-colors"
        >
          + New article
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="border-line-soft text-muted-ink flex items-center justify-center rounded-[16px] border bg-white py-20 font-mono text-[13px]">
          No articles yet — write your first one.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
