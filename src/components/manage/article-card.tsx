import Image from 'next/image';

import { cn } from '@/lib/utils';

/** Plain row the manage page hands down — ISO dates keep it serializable. */
export type ManageArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: 'TECH' | 'PERSONAL';
  status: 'DRAFT' | 'PUBLISHED';
  coverUrl: string;
  publishedAt: string | null;
  updatedAt: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * One row in the /manage blogs list: cover thumb, title + excerpt, status and
 * category chips, last-updated date. Static for now — the edit destination
 * doesn't exist yet, so no link until it does.
 */
export function ArticleCard({ article }: { article: ManageArticle }) {
  const published = article.status === 'PUBLISHED';
  const dateLabel = published && article.publishedAt ? formatDate(article.publishedAt) : null;

  return (
    <article className="border-line-soft flex gap-4 rounded-[16px] border bg-white p-3">
      <div className="relative h-[88px] w-[120px] shrink-0 overflow-hidden rounded-[10px] bg-[#ececf0]">
        <Image
          src={article.coverUrl}
          alt={`${article.title} cover`}
          fill
          sizes="120px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[11px]',
              published ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
            )}
          >
            <span
              aria-hidden
              className={cn('size-1.5 rounded-full', published ? 'bg-success' : 'bg-warning')}
            />
            {published ? 'Published' : 'Draft'}
          </span>
          <span className="text-muted-ink rounded-full bg-[#f0f0f3] px-2 py-0.5 font-mono text-[11px]">
            {article.category === 'TECH' ? 'Tech' : 'Personal'}
          </span>
          {dateLabel && <span className="text-muted-ink font-mono text-[11px]">{dateLabel}</span>}
        </div>

        <h2 className="text-ink truncate text-[16px] leading-[22px] font-medium">
          {article.title}
        </h2>
        <p className="text-muted-ink truncate text-[13px] leading-[18px]">{article.excerpt}</p>
      </div>
    </article>
  );
}
