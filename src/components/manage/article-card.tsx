import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Star } from 'lucide-react';

import { cn } from '@/lib/utils';
import { DeleteArticleButton } from '@/components/manage/delete-article-button';
import { FeaturedToggleButton } from '@/components/manage/featured-toggle-button';
import { PublishToggleButton } from '@/components/manage/publish-toggle-button';

/** Plain row the manage page hands down — ISO dates keep it serializable. */
export type ManageArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: 'TECH' | 'PERSONAL';
  status: 'DRAFT' | 'PUBLISHED';
  featured: boolean;
  readTime: number;
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
 * category chips, edit/publish/delete icon buttons. Hover lifts the card; the
 * buttons fade in over the top-right corner without shifting layout.
 * The card itself stays a server component — the publish toggle is a small
 * client island so only that button ships JS.
 */
export function ArticleCard({ article }: { article: ManageArticle }) {
  const published = article.status === 'PUBLISHED';
  const dateLabel = published && article.publishedAt ? formatDate(article.publishedAt) : null;

  const iconButton =
    'text-muted-ink hover:text-ink hover:bg-ink/5 focus-visible:ring-ink/30 flex size-8 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none';

  return (
    <article className="border-line-soft group relative flex gap-4 rounded-[16px] border bg-white p-3 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
        <FeaturedToggleButton
          id={article.id}
          title={article.title}
          featured={article.featured}
          className={iconButton}
        />
        <Link
          href={`/manage/${article.id}/edit`}
          title="Edit article"
          aria-label={`Edit ${article.title}`}
          className={iconButton}
        >
          <Pencil aria-hidden className="size-4" />
        </Link>
        <PublishToggleButton
          id={article.id}
          title={article.title}
          published={published}
          className={iconButton}
        />
        <DeleteArticleButton id={article.id} title={article.title} className={iconButton} />
      </div>

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
          {article.featured && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] text-amber-600">
              <Star aria-hidden className="size-3 fill-current" />
              Featured
            </span>
          )}
          <span className="text-muted-ink rounded-full bg-[#f0f0f3] px-2 py-0.5 font-mono text-[11px]">
            {article.category === 'TECH' ? 'Tech' : 'Personal'}
          </span>
          <span className="text-muted-ink font-mono text-[11px]">{article.readTime} min read</span>
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
