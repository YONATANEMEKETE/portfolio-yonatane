import type { Activity } from 'react-github-calendar';

/** Five levels: 0 plus the four tones in the design's ramp. */
export const maxContributionLevel = 4;

// Parsed as UTC because activity dates are plain yyyy-MM-dd; formatting them in
// local time would show the previous day west of UTC.
const dayFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatContributionDay(date: string) {
  return dayFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function activityTooltip({ date, count }: Pick<Activity, 'date' | 'count'>) {
  if (count === 0) {
    return `No contributions on ${formatContributionDay(date)}`;
  }

  return `${count} contribution${count === 1 ? '' : 's'} on ${formatContributionDay(date)}`;
}

export function legendTooltip(level: number) {
  return `Level ${level} of ${maxContributionLevel}`;
}
