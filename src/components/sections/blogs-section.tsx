import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';

import { getFeaturedPosts } from '@/lib/featured-posts';

import { BlogCard } from '@/components/sections/blog-card';
import { BlogsReveal } from '@/components/sections/blogs-reveal';

/**
 * The `Blogs` id the nav link scrolls to. The home page only features the
 * three newest posts — `/blogs` is the full archive.
 */
export const blogsSectionId = 'blogs';

/** Skeleton rows that hold the section's footprint while the posts stream in. */
function BlogsSkeleton() {
  return (
    <div aria-hidden className="flex flex-col">
      <div className="h-px w-full bg-[#ececf0]" />
      {[0, 1, 2].map((row) => (
        <div key={row}>
          <div className="flex animate-pulse items-center gap-4 py-5">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="h-4 w-6 rounded bg-[#ececf0]" />
                <div className="h-5 min-w-0 flex-1 rounded bg-[#ececf0]" />
              </div>
              <div className="ml-9 h-4 w-4/5 rounded bg-[#f1f1f4]" />
              <div className="ml-9 h-3 w-32 rounded bg-[#f1f1f4]" />
            </div>
            <div className="border-line size-11 shrink-0 rounded-full border" />
          </div>
          <div className="h-px w-full bg-[#ececf0]" />
        </div>
      ))}
    </div>
  );
}

/**
 * The featured list itself, split out so the section chrome (heading, hairline)
 * paints instantly while only the rows stream in behind the skeleton.
 */
async function FeaturedPosts() {
  let posts;
  try {
    posts = await getFeaturedPosts();
  } catch (error) {
    // A DB outage must not blank the home page — the section degrades to a
    // quiet line and the archive link instead of throwing the whole route.
    console.error('FeaturedPosts failed', error);
    return (
      <p className="py-5 font-mono text-[13px] text-[#9ca3af]">Writing is unavailable right now.</p>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <div aria-hidden className="h-px w-full bg-[#ececf0]" />
      {posts.map((post, position) => (
        <div key={post.slug}>
          <BlogsReveal index={position}>
            <BlogCard post={post} index={position + 1} />
          </BlogsReveal>
          <div aria-hidden className="h-px w-full bg-[#ececf0]" />
        </div>
      ))}
    </div>
  );
}

/**
 * Home "Featured Blogs" section. Follows the Pencil design: kicker + title
 * with a "View all" link, then index rows separated by hairlines.
 */
export function BlogsSection() {
  return (
    // scroll-mt clears the sticky header, so the anchor lands the section just
    // below the banner rather than behind it.
    <section id={blogsSectionId} className="scroll-mt-44 pt-14">
      <div className="flex items-end justify-between gap-4 pb-2">
        <div className="flex flex-col gap-1">
          <p className="text-[15px] leading-[18px] text-[#9ca3af]">Writing</p>
          <h2 className="text-ink text-[28px] leading-[34px] font-bold">Featured Blogs</h2>
        </div>
        <Link
          href="/blogs"
          className="text-ink group flex shrink-0 items-center gap-1 text-[14px] leading-5 font-semibold"
        >
          View all
          <ArrowRight
            aria-hidden
            className="size-[14px] transition-transform duration-200 ease-out group-hover:translate-x-1"
          />
        </Link>
      </div>

      <Suspense fallback={<BlogsSkeleton />}>
        <FeaturedPosts />
      </Suspense>
    </section>
  );
}
