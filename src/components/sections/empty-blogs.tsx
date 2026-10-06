import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * Rendered when there are no featured articles on the home page.
 * Keeps the section balanced with friendly, engaging copy and an animated button.
 */
export function EmptyBlogs() {
  return (
    <div className="flex flex-col">
      <div aria-hidden className="h-px w-full bg-[#ececf0]" />
      <div className="my-3 flex flex-col items-center justify-center gap-2.5 rounded-[16px] border border-[#ececf0] bg-white px-6 py-10 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-[#f4f4f6] text-[#8a8a93]">
          <Sparkles aria-hidden className="size-5 text-amber-500" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-ink text-[16px] font-semibold">Cooking up something fresh</p>
          <p className="text-muted-ink max-w-sm font-mono text-[13px] leading-relaxed">
            New deep-dives on systems, code, and craft are simmering in the drafts. Hang tight, or
            take a detour through the archive in the meantime.
          </p>
        </div>
        <Link
          href="/blogs"
          className="group border-line-soft text-ink hover:bg-tile-start mt-2 inline-flex items-center gap-1.5 rounded-full border bg-white px-4 py-1.5 font-mono text-[12px] font-medium transition-colors"
        >
          <span>View all blogs</span>
          <ArrowRight
            aria-hidden
            className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1"
          />
        </Link>
      </div>
      <div aria-hidden className="h-px w-full bg-[#ececf0]" />
    </div>
  );
}
