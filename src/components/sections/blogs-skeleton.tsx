/**
 * Skeleton rows that hold the section's footprint while the posts stream in.
 * Includes accessible status role and matching row layout.
 */
export function BlogsSkeleton() {
  return (
    <div role="status" aria-label="Loading featured blogs…" className="flex flex-col">
      <div aria-hidden className="h-px w-full bg-[#ececf0]" />
      {[0, 1, 2].map((row) => (
        <div key={row} aria-hidden>
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
