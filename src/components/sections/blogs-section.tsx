import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';

import { getFeaturedPosts } from '@/lib/featured-posts';

import { BlogCard } from '@/components/sections/blog-card';
import { BlogsError } from '@/components/sections/blogs-error';
import { BlogsSkeleton } from '@/components/sections/blogs-skeleton';
import { EmptyBlogs } from '@/components/sections/empty-blogs';

export { BlogsError, BlogsSkeleton, EmptyBlogs };

/**
 * The `Blogs` id the nav link scrolls to. The home page only features the
 * three newest posts — `/blogs` is the full archive.
 */
export const blogsSectionId = 'blogs';

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
    // quiet inline error card with an archive link instead of throwing the whole route.
    console.error('FeaturedPosts failed', error);
    return <BlogsError />;
  }

  if (posts.length === 0) {
    return <EmptyBlogs />;
  }

  return (
    <div className="flex flex-col">
      <div aria-hidden className="h-px w-full bg-[#ececf0]" />
      {posts.map((post, position) => (
        <div key={post.slug}>
          <BlogCard post={post} index={position + 1} />
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
