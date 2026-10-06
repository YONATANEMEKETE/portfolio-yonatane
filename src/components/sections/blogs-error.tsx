import { AlertCircle } from 'lucide-react';

import { SoundLink } from '@/components/sound-link';

/**
 * Fallback displayed when the database or query fails to load featured posts.
 * Prevents the entire route from breaking while offering a graceful message and link.
 */
export function BlogsError() {
  return (
    <div className="flex flex-col">
      <div aria-hidden className="h-px w-full bg-[#ececf0]" />
      <div className="my-3 flex flex-col items-center justify-center gap-2 rounded-[16px] border border-[#ececf0] bg-white px-6 py-8 text-center">
        <div className="flex size-9 items-center justify-center rounded-full bg-[#f4f4f6] text-[#9ca3af]">
          <AlertCircle aria-hidden className="size-4.5" />
        </div>
        <p className="text-ink text-[14px] font-medium">Writing is unavailable right now</p>
        <p className="text-muted-ink max-w-sm font-mono text-[12px]">
          Could not load featured articles. You can still check out the rest of the archive.
        </p>
        <SoundLink
          href="/blogs"
          className="border-line-soft text-ink hover:bg-tile-start mt-1 rounded-full border bg-white px-3.5 py-1 font-mono text-[12px] transition-colors"
        >
          Browse archive
        </SoundLink>
      </div>
      <div aria-hidden className="h-px w-full bg-[#ececf0]" />
    </div>
  );
}
