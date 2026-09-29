'use client';

import { useSyncExternalStore } from 'react';
import { GitHubCalendar } from 'react-github-calendar';
// Required by the calendar's hover tooltips.
import 'react-github-calendar/tooltips.css';

import { activityTooltip, legendTooltip, maxContributionLevel } from '@/lib/contributions';

// Detects hydration without an effect: the server snapshot is false, the client's
// is true, so the calendar only renders once hydrated.
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// The design's five contribution steps, identical to the --contrib-* tokens.
// A deliberately narrow grey band: even a zero day is mid-light, so the graph
// reads as one texture rather than bright paper with a few dark squares.
const contributionTheme = {
  light: ['#D9D9DE', '#C2C2C9', '#A6A6AE', '#8A8A93', '#6B7280'],
};

// The design's grid is 53 weeks of 10px squares; 4.58px gaps stretch it to the
// full 768px column while keeping the blocks square.
const blockSize = 10;
const blockMargin = 4.58;

export function ContributionsSection() {
  // The library's loading branch disagrees between server and client (it defaults
  // prefers-reduced-motion to true on the server), which breaks hydration. It
  // only ever fetched client-side anyway, so mount it after hydration and reserve
  // its footprint to avoid a layout shift.
  const hydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return (
    <section className="pt-7 font-mono">
      <div className="min-h-[143px]">
        {hydrated ? (
          <GitHubCalendar
            username="YONATANEMEKETE"
            year="last"
            colorScheme="light"
            blockSize={blockSize}
            blockMargin={blockMargin}
            blockRadius={0}
            fontSize={12}
            maxLevel={maxContributionLevel}
            theme={contributionTheme}
            labels={{
              // "year" would print the range's start year ("in 2025") while the graph
              // covers the last 12 months, so the wording stays range-accurate.
              totalCount: '{{count}} contributions in the last year',
              legend: { less: 'Less', more: 'More' },
            }}
            // Both tooltip variants: hovering a day, and hovering a legend swatch.
            tooltips={{
              activity: {
                text: activityTooltip,
                withArrow: true,
              },
              colorLegend: {
                text: legendTooltip,
              },
            }}
            errorMessage="Contribution graph is unavailable right now."
          />
        ) : null}
      </div>
    </section>
  );
}
