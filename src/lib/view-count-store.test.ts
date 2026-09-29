import { describe, expect, it, vi } from 'vitest';

import { getViewCountSnapshot, setViewCount, subscribeToViewCount } from './view-count-store';

describe('view count store', () => {
  it('notifies subscribers when the count changes', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToViewCount(listener);

    setViewCount(42);

    expect(getViewCountSnapshot()).toBe(42);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('stops notifying after unsubscribe', () => {
    const listener = vi.fn();
    subscribeToViewCount(listener)();

    setViewCount(43);

    expect(listener).not.toHaveBeenCalled();
  });

  it('ignores a repeated value', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToViewCount(listener);

    setViewCount(100);
    setViewCount(100);

    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });
});
