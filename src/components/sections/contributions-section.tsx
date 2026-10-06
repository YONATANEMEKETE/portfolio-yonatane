'use client';

import { useSyncExternalStore } from 'react';
import { GitHubCalendar } from 'react-github-calendar';
// Required by the calendar's hover tooltips.
import 'react-github-calendar/tooltips.css';

import type { Activity } from 'react-github-calendar';

import { activityTooltip, legendTooltip, maxContributionLevel } from '@/lib/contributions';
import { ContributionsSkeleton } from './contributions-skeleton';

// GitHub grades levels on quartiles of *your* active days — with 1900+ commits
// spread over 182 days, most days land at level 0-1 and the graph reads dead.
// Floor every contributing day to at least level 2 and bump the rest up one,
// so real activity actually shows color. Level 0 stays level 0 (a true rest
// day), it just sits close to level 1 in the theme.
function boostLevels(activities: Activity[]) {
  return activities.map((activity) => ({
    ...activity,
    level: Math.min(4, activity.level === 0 ? 0 : activity.level + 1) as Activity['level'],
  }));
}

// Detects hydration without an effect: the server snapshot is false, the client's
// is true, so the calendar only renders once hydrated.
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// Light-blue quiet days, brighter-blue active days: levels 0-4 climb from a
// very pale blue to the brand blue so quiet days blend smoothly into
// contributing days.
const contributionTheme = {
  light: ['#E8F1FF', '#D0E5FF', '#93C2FF', '#54A0FF', '#2F80ED'],
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
            transformData={boostLevels}
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
        ) : (
          <ContributionsSkeleton />
        )}
      </div>
    </section>
  );
}
