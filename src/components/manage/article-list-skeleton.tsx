/**
 * Skeleton rows for the /manage blogs list — same footprint as ArticleCard
 * (thumb + two text lines + chips) so the layout doesn't jump when rows land.
 * `aria-hidden` + screen-reader label: AT hears "loading", not six+"x"s.
 */
export function ArticleListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading articles…" className="flex animate-pulse flex-col gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          aria-hidden
          className="border-line-soft flex gap-4 rounded-[16px] border bg-white p-3"
        >
          <div className="h-[88px] w-[120px] shrink-0 rounded-[10px] bg-[#ececf0]" />
          <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
            <div className="flex items-center gap-1.5">
              <div className="h-[18px] w-20 rounded-full bg-[#f0f0f3]" />
              <div className="h-[18px] w-14 rounded-full bg-[#f0f0f3]" />
            </div>
            <div className="h-[20px] w-3/4 rounded-full bg-[#f0f0f3]" />
            <div className="h-[16px] w-1/2 rounded-full bg-[#f0f0f3]" />
          </div>
        </div>
      ))}
    </div>
  );
}
