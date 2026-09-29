'use client';

import { useSyncExternalStore } from 'react';

import { formatViewCount } from '@/lib/format';
import { getViewCountSnapshot, subscribeToViewCount } from '@/lib/view-count-store';

/**
 * Display only — the view is recorded by ViewRecorder in the root layout.
 * The server snapshot is null so hydration always matches.
 */
export function ViewCounter() {
  const count = useSyncExternalStore(subscribeToViewCount, getViewCountSnapshot, () => null);

  return (
    <span className="inline-block min-w-[3.5rem] tabular-nums">
      {count === null ? '—' : formatViewCount(count)}
    </span>
  );
}
