import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

/**
 * Rendered when there are no featured articles on the home page.
 * Keeps the section balanced without awkward blank space, providing
 * clear context and a link to the archive.
 */
export function EmptyBlogs() {
  return (
    <div className="flex flex-col">
      <div aria-hidden className="h-px w-full bg-[#ececf0]" />
      <div className="my-3 flex flex-col items-center justify-center gap-2.5 rounded-[16px] border border-[#ececf0] bg-white px-6 py-10 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-[#f4f4f6] text-[#8a8a93]">
          <BookOpen aria-hidden className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-ink text-[15px] font-semibold">No featured blogs yet</p>
          <p className="text-muted-ink max-w-sm font-mono text-[13px] leading-relaxed">
            There are currently no articles featured on the home page. Check back soon or browse the
            full archive.
          </p>
        </div>
        <Link
          href="/blogs"
          className="border-line-soft text-ink hover:bg-tile-start mt-1.5 inline-flex items-center gap-1.5 rounded-full border bg-white px-4 py-1.5 font-mono text-[12px] font-medium transition-colors"
        >
          View all blogs
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </div>
      <div aria-hidden className="h-px w-full bg-[#ececf0]" />
    </div>
  );
}
