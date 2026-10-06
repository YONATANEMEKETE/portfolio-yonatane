import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

import { SoundLink } from '@/components/sound-link';

import { Container } from '@/components/layout/container';
import { BlogCard } from '@/components/sections/blog-card';
import { BlogsSkeleton } from '@/components/sections/blogs-skeleton';
import { getPublishedArticles } from '@/lib/articles';
import { cn } from '@/lib/utils';
import { GooeyText } from '@/components/ui/gooey-text';
import { TextReveal } from '@/components/forgeui/text-reveal';

export const metadata: Metadata = {
  title: 'Blogs',
  description: 'A little tech, a little heart, and things I probably shouldn’t say out loud.',
};

type CategoryFilter = 'all' | 'TECH' | 'PERSONAL';

function parseCategory(category?: string | string[]): CategoryFilter {
  if (category === 'TECH') return 'TECH';
  if (category === 'PERSONAL') return 'PERSONAL';
  return 'all';
}

const CATEGORY_TABS: { value: CategoryFilter; label: string; href: string }[] = [
  { value: 'all', label: 'All', href: '/blogs' },
  { value: 'TECH', label: 'Tech', href: '/blogs?category=TECH' },
  { value: 'PERSONAL', label: 'Personal', href: '/blogs?category=PERSONAL' },
];

/** Error card rendered when fetching articles fails. */
function BlogsArchiveError() {
  return (
    <div className="flex flex-col">
      <div aria-hidden className="h-px w-full bg-[#ececf0]" />
      <div className="my-6 flex flex-col items-center justify-center gap-2 rounded-[16px] border border-[#ececf0] bg-white px-6 py-10 text-center">
        <div className="flex size-9 items-center justify-center rounded-full bg-[#f4f4f6] text-[#9ca3af]">
          <AlertCircle aria-hidden className="size-4.5" />
        </div>
        <p className="text-ink text-[15px] font-medium">Writing is unavailable right now</p>
        <p className="text-muted-ink max-w-sm font-mono text-[13px]">
          Could not load the article archive. Please refresh the page or try again in a few moments.
        </p>
      </div>
      <div aria-hidden className="h-px w-full bg-[#ececf0]" />
    </div>
  );
}

/** Empty state rendered when there are no articles for the current filter. */
function BlogsArchiveEmpty({ category }: { category: CategoryFilter }) {
  const isFiltered = category !== 'all';
  const categoryLabel = category === 'TECH' ? 'tech' : 'personal';

  return (
    <div className="flex flex-col">
      <div aria-hidden className="h-px w-full bg-[#ececf0]" />
      <div className="my-6 flex flex-col items-center justify-center gap-2.5 rounded-[16px] border border-[#ececf0] bg-white px-6 py-12 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-[#f4f4f6] text-[#8a8a93]">
          <Sparkles aria-hidden className="size-5 text-amber-500" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-ink text-[16px] font-semibold">
            {isFiltered ? `No ${categoryLabel} articles yet` : 'Cooking up something fresh'}
          </p>
          <p className="text-muted-ink max-w-sm font-mono text-[13px] leading-relaxed">
            {isFiltered
              ? `There are no articles published under ${categoryLabel} right now. Check back soon or browse all writing.`
              : 'New deep-dives on systems, code, and craft are simmering in the drafts. Hang tight, or check back soon.'}
          </p>
        </div>
        {isFiltered ? (
          <SoundLink
            href="/blogs"
            className="group border-line-soft text-ink hover:bg-tile-start mt-2 inline-flex items-center gap-1.5 rounded-full border bg-white px-4 py-1.5 font-mono text-[12px] font-medium transition-colors"
          >
            <span>View all articles</span>
            <ArrowRight
              aria-hidden
              className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1"
            />
          </SoundLink>
        ) : (
          <SoundLink
            href="/"
            className="group border-line-soft text-ink hover:bg-tile-start mt-2 inline-flex items-center gap-1.5 rounded-full border bg-white px-4 py-1.5 font-mono text-[12px] font-medium transition-colors"
          >
            <ArrowLeft
              aria-hidden
              className="size-3.5 transition-transform duration-200 ease-out group-hover:-translate-x-1"
            />
            <span>Back to home</span>
          </SoundLink>
        )}
      </div>
      <div aria-hidden className="h-px w-full bg-[#ececf0]" />
    </div>
  );
}

/** The streamed list of articles for the selected filter. */
async function ArticleArchiveList({ category }: { category: CategoryFilter }) {
  let articles;
  try {
    articles = await getPublishedArticles(category === 'all' ? undefined : category);
  } catch (error) {
    console.error('getPublishedArticles failed', error);
    return <BlogsArchiveError />;
  }

  if (articles.length === 0) {
    return <BlogsArchiveEmpty category={category} />;
  }

  return (
    <div className="flex flex-col">
      <div aria-hidden className="h-px w-full bg-[#ececf0]" />
      {articles.map((article, index) => (
        <div key={article.slug}>
          <BlogCard post={article} index={index + 1} />
          <div aria-hidden className="h-px w-full bg-[#ececf0]" />
        </div>
      ))}
    </div>
  );
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category: rawCategory } = await searchParams;
  const category = parseCategory(rawCategory);

  const chipClass = (active: boolean) =>
    cn(
      'rounded-full border px-3.5 py-1 font-mono text-[12px] transition-colors',
      active
        ? 'border-line-soft from-tile-start to-tile-end text-ink bg-linear-to-b'
        : 'border-line-soft text-muted-ink hover:text-ink border bg-white',
    );

  return (
    <main>
      <Container className="pt-8 pb-16">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="text-body flex items-center gap-2 text-[14px] leading-5">
            <li>
              <SoundLink href="/" className="hover:text-ink font-medium transition-colors">
                Home
              </SoundLink>
            </li>
            <li aria-hidden className="text-[#d1d1d6]">
              /
            </li>
            <li aria-current="page" className="text-ink font-semibold">
              Blogs
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="flex flex-col gap-2 pt-6 pb-6">
          <p className="text-[15px] leading-[18px] text-[#9ca3af]">
            <TextReveal text="Writing" duration={0.4} />
          </p>
          <h1 className="text-ink text-[32px] leading-[38px] font-bold">
            <GooeyText text="All Blogs" className="text-ink text-[32px] leading-[38px] font-bold" />
          </h1>
          <p className="text-muted-ink max-w-xl text-[15px] leading-[22px]">
            <TextReveal
              text="A little tech, a little heart, and things I probably shouldn't say out loud. Stay a while, I don't bite."
              duration={0.45}
              staggerDelay={0.03}
              delay={0.15}
            />
          </p>
        </header>

        {/* Category Filter Tabs */}
        <div role="group" aria-label="Filter by category" className="flex items-center gap-2 pb-6">
          {CATEGORY_TABS.map((tab) => (
            <SoundLink
              key={tab.value}
              href={tab.href}
              className={chipClass(category === tab.value)}
              aria-current={category === tab.value ? 'page' : undefined}
            >
              {tab.label}
            </SoundLink>
          ))}
        </div>

        {/* Streamed Article List with Skeleton Fallback */}
        <Suspense key={category} fallback={<BlogsSkeleton />}>
          <ArticleArchiveList category={category} />
        </Suspense>
      </Container>
    </main>
  );
}
