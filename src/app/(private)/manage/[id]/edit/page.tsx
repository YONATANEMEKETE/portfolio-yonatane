import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getPrisma } from '@/lib/prisma';
import { coverPublicUrl } from '@/lib/r2';
import type { ArticleFormValues } from '@/components/manage/article-form';

import { EditArticleForm } from './edit-form';

// Live row — never prerender an editor around a stale snapshot.
export const dynamic = 'force-dynamic';

async function loadArticle(id: string) {
  const row = await getPrisma().article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      category: true,
      status: true,
      cover: true,
      body: true,
    },
  });
  if (!row) return null;

  // Tiptap state crosses to the client as plain JSON — the round-trip drops
  // anything the editor may have parked on node attrs server-side.
  const initial = JSON.parse(
    JSON.stringify({
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      category: row.category,
      cover: row.cover,
      body: row.body,
    }),
  ) as ArticleFormValues;

  return { initial, status: row.status, coverUrl: coverPublicUrl(row.cover) };
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await loadArticle(id);
  if (!article) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-ink text-[26px] leading-[34px]">Edit article</h1>
          <p className="text-muted-ink font-mono text-[14px]">
            {article.status === 'PUBLISHED' ? 'Published' : 'Draft'} · updating keeps its status.
          </p>
        </div>
        <Link
          href="/manage"
          className="border-line-soft text-muted-ink hover:text-ink rounded-full border bg-white px-4 py-1.5 font-mono text-[13px] transition-colors"
        >
          ← Back
        </Link>
      </div>

      <EditArticleForm
        id={id}
        initial={article.initial}
        status={article.status}
        coverUrl={article.coverUrl}
      />
    </div>
  );
}
