'use client';

import { ArrowUpRight } from 'lucide-react';

import { SoundLink } from '@/components/sound-link';
import { formatArticleDate, formatReadTime } from '@/lib/format';

export type BlogCardPost = {
  slug: string;
  title: string;
  excerpt: string;
  readTime: number;
  publishedAt: string | null;
  category?: 'TECH' | 'PERSONAL';
};

type BlogCardProps = {
  post: BlogCardPost;
  /** 1-based position — the design numbers rows 01, 02, 03. */
  index: number;
};

/**
 * One row in the "Blogs" list. Follows the Pencil row: index +
 * title, excerpt, mono meta, and a circular open button on the right. The
 * whole row is one link (stretched via after:inset-0), so the button is
 * decorative — screen readers get a single named link per post.
 */
export function BlogCard({ post, index }: BlogCardProps) {
  const categoryLabel = post.category ? (post.category === 'TECH' ? 'Tech' : 'Personal') : null;
  const dateStr = post.publishedAt ? formatArticleDate(post.publishedAt) : null;
  const timeStr = formatReadTime(post.readTime);
  const meta = [categoryLabel, dateStr, timeStr].filter(Boolean).join(' · ');

  return (
    <article className="group relative flex items-center gap-4 py-5 transition-colors duration-200">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline gap-3">
          <span aria-hidden className="font-mono text-[13px] leading-5 text-[#d1d1d6]">
            {String(index).padStart(2, '0')}
          </span>
          <h3 className="text-ink min-w-0 flex-1 text-[19px] leading-[24px] font-bold">
            {post.title}
          </h3>
        </div>
        <p className="text-muted-ink line-clamp-2 pl-9 text-[14px] leading-[20px]">
          {post.excerpt}
        </p>
        <p className="pl-9 font-mono text-[12px] leading-4 text-[#9ca3af]">{meta}</p>
      </div>

      <span
        aria-hidden
        className="border-line flex size-11 shrink-0 items-center justify-center rounded-full border bg-transparent transition-all duration-300 ease-in-out group-hover:border-[#111111] group-hover:bg-[#111111] group-hover:[&>svg]:text-white"
      >
        <ArrowUpRight className="text-ink size-[18px] transform-gpu transition-all duration-300 ease-in-out group-hover:translate-x-1 group-hover:-translate-y-1" />
      </span>

      <SoundLink
        href={`/blogs/${post.slug}`}
        aria-label={`Read ${post.title}`}
        className="focus-visible:ring-ink/30 absolute inset-0 rounded-[8px] focus-visible:ring-2 focus-visible:outline-none"
      />
    </article>
  );
}
