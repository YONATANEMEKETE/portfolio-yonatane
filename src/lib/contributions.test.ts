import { describe, expect, it } from 'vitest';

import { activityTooltip, formatContributionDay, legendTooltip } from './contributions';

describe('formatContributionDay', () => {
  it('formats the date without shifting the day', () => {
    expect(formatContributionDay('2026-09-29')).toBe('Sep 29, 2026');
    expect(formatContributionDay('2026-01-01')).toBe('Jan 1, 2026');
  });
});

describe('activityTooltip', () => {
  it('pluralises contributions', () => {
    expect(activityTooltip({ date: '2026-09-29', count: 1 })).toBe(
      '1 contribution on Sep 29, 2026',
    );
    expect(activityTooltip({ date: '2026-09-29', count: 12 })).toBe(
      '12 contributions on Sep 29, 2026',
    );
  });

  it('reads naturally for empty days', () => {
    expect(activityTooltip({ date: '2026-09-29', count: 0 })).toBe(
      'No contributions on Sep 29, 2026',
    );
  });
});

describe('legendTooltip', () => {
  it('names the level out of the full range', () => {
    expect(legendTooltip(0)).toBe('Level 0 of 4');
    expect(legendTooltip(4)).toBe('Level 4 of 4');
  });
});
