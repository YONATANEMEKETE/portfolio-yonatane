'use client';

import { useEffect, useRef, useState } from 'react';

import { formatViewCount } from '@/lib/format';

export function ViewCounter() {
  const [count, setCount] = useState<number | null>(null);
  const recorded = useRef(false);

  useEffect(() => {
    // StrictMode mounts effects twice in dev; without this a single page load
    // would record two views.
    if (recorded.current) {
      return;
    }

    recorded.current = true;

    void (async () => {
      try {
        const response = await fetch('/api/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: window.location.pathname }),
          keepalive: true,
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { count: number | null };

        if (typeof data.count === 'number') {
          setCount(data.count);
        }
      } catch {
        // Counting is decorative: a failure should never surface to the visitor.
      }
    })();
  }, []);

  return (
    <span className="inline-block min-w-[3.5rem] tabular-nums">
      {count === null ? '—' : formatViewCount(count)}
    </span>
  );
}
