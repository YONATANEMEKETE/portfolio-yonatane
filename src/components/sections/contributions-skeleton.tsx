const BLOCK_SIZE = 10;
const BLOCK_MARGIN = 4.58;
const WEEKS = 53;
const DAYS = 7;

export function ContributionsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading contribution graph"
      aria-busy="true"
      className="flex w-full max-w-full flex-col gap-2"
      style={{ fontSize: 12 }}
    >
      {/* Scroll container mirrors ActivityCalendar's scrollContainer */}
      <div className="max-w-full overflow-x-auto overflow-y-hidden pt-[1.2px]">
        {/* Reserve month-label height (fontSize + 8) even while loading — same as ActivityCalendar */}
        <div className="flex flex-col gap-[8px]">
          <div className="h-[12px] w-full" aria-hidden />
          <div className="flex" style={{ gap: BLOCK_MARGIN }}>
            {Array.from({ length: WEEKS }, (_, colIndex) => (
              <div key={colIndex} className="flex flex-col" style={{ gap: BLOCK_MARGIN }}>
                {Array.from({ length: DAYS }, (_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="contrib-wave-square shrink-0"
                    style={
                      {
                        width: BLOCK_SIZE,
                        height: BLOCK_SIZE,
                        backgroundColor: 'var(--contrib-0)',
                        animationDelay: `${colIndex * 28}ms`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer placeholder — matches ActivityCalendar's footer height (~20px) to avoid layout shift */}
      <div className="flex min-h-[20px] items-center justify-between gap-4 whitespace-nowrap">
        <span className="text-muted-ink text-[12px] opacity-0" aria-hidden>
          0 contributions in the last year
        </span>
        <span className="ml-auto flex items-center gap-[3px] opacity-0" aria-hidden>
          <span className="mr-[0.4em] text-[12px]">Less</span>
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                backgroundColor: 'var(--contrib-0)',
              }}
            />
          ))}
          <span className="ml-[0.4em] text-[12px]">More</span>
        </span>
      </div>
    </div>
  );
}
