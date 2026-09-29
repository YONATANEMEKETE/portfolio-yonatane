/**
 * Bridges the recorder (root layout) and the display (profile card) without a
 * second request. Module-level state is fine here: it lives for one document
 * load, which is exactly the scope of the count it holds.
 */
let count: number | null = null;

const listeners = new Set<() => void>();

export function setViewCount(next: number | null) {
  if (next === count) {
    return;
  }

  count = next;

  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToViewCount(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getViewCountSnapshot() {
  return count;
}
