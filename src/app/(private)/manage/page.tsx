import Link from 'next/link';
import { Suspense } from 'react';

import type { Prisma } from '@/generated/prisma/client';
import { getPrisma } from '@/lib/prisma';
import { coverPublicUrl } from '@/lib/r2';

import { ArticleCard, type ManageArticle } from '@/components/manage/article-card';
import { ArticleFilters } from '@/components/manage/article-filters';
import { ArticleListSkeleton } from '@/components/manage/article-list-skeleton';

// The list reads live rows — without this, `next build` would prerender the
// page and freeze whatever the DB held at build time.
export const dynamic = 'force-dynamic';

type ArticleFilter = {
  query: string;
  category: 'all' | 'TECH' | 'PERSONAL';
  status: 'all' | 'PUBLISHED' | 'DRAFT';
};

function parseFilters(searchParams: {
  q?: string | string[];
  category?: string | string[];
  status?: string | string[];
}): ArticleFilter {
  const query = typeof searchParams.q === 'string' ? searchParams.q.trim().slice(0, 100) : '';
  const category =
    searchParams.category === 'TECH' || searchParams.category === 'PERSONAL'
      ? searchParams.category
      : 'all';
  const status =
    searchParams.status === 'PUBLISHED' || searchParams.status === 'DRAFT'
      ? searchParams.status
      : 'all';

  return { query, category, status };
}

async function loadArticles(filter: ArticleFilter): Promise<ManageArticle[]> {
  // Unknown keys are ignored above — Prisma only ever sees valid enums.
  const where: Prisma.ArticleWhereInput = {
    ...(filter.category !== 'all' ? { category: filter.category } : {}),
    ...(filter.status !== 'all' ? { status: filter.status } : {}),
    ...(filter.query
      ? {
          OR: [
            { title: { contains: filter.query, mode: 'insensitive' } },
            { excerpt: { contains: filter.query, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  let rows;
  try {
    rows = await getPrisma().article.findMany({
      where,
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
  } catch (error) {
    // Thrown into the route error boundary (error.tsx) — the page chrome
    // (header, filters) still renders, only the list swaps for the panel.
    console.error('loadArticles failed', error);
    throw new Error('Could not load articles. The database didn’t answer — try again.');
  }

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

/**
 * The list itself, split out so the page can wrap it in Suspense: header +
 * filters paint instantly, rows stream in behind the skeleton. Filter
 * navigations re-suspend only this subtree — the chrome never flashes.
 */
async function ArticleList({ filter }: { filter: ArticleFilter }) {
  const articles = await loadArticles(filter);
  const filtering = filter.query !== '' || filter.category !== 'all' || filter.status !== 'all';

  // Empty has two voices: filtered-but-no-match (keep filtering hint + clear
  // link back to the unfiltered list) vs. genuinely no articles yet.
  if (articles.length === 0) {
    return (
      <div className="border-line-soft text-muted-ink flex flex-col items-center gap-2 rounded-[16px] border bg-white px-6 py-20 text-center">
        <p className="font-mono text-[13px]">
          {filtering
            ? 'No articles match these filters.'
            : 'No articles yet — write your first one.'}
        </p>
        {filtering ? (
          <Link
            href="/manage"
            className="border-line-soft text-muted-ink hover:text-ink rounded-full border bg-white px-4 py-1.5 font-mono text-[12px] transition-colors"
          >
            Clear filters
          </Link>
        ) : (
          <Link
            href="/manage/new"
            className="border-line-soft from-tile-start to-tile-end text-ink rounded-full border bg-linear-to-b px-4 py-1.5 font-mono text-[12px] transition-colors hover:from-white hover:to-white"
          >
            + New article
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

// Blogs role of /manage: article list with search, category and status filters.
export default async function ManagePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    status?: string | string[];
  }>;
}) {
  const filter = parseFilters(await searchParams);

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

      {/* useSearchParams needs a Suspense boundary in a prerendered tree. */}
      <Suspense>
        <ArticleFilters
          initialQuery={filter.query}
          initialCategory={filter.category}
          initialStatus={filter.status}
        />
      </Suspense>

      {/* List streams behind the skeleton; on filter navigation this subtree
          re-suspends with a key so the old rows don't linger stale. A throw
          inside ArticleList lands in error.tsx, not a blank page. */}
      <Suspense
        key={`${filter.query}|${filter.category}|${filter.status}`}
        fallback={<ArticleListSkeleton />}
      >
        <ArticleList filter={filter} />
      </Suspense>
    </div>
  );
}
