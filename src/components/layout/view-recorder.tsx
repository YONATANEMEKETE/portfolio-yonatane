'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { setViewCount } from '@/lib/view-count-store';

/**
 * Records one view per visited path. Lives in the root layout so every route
 * counts, and because that layout survives client-side navigation it also fires
 * on each route change (not just the entry page).
 */
export function ViewRecorder() {
  const pathname = usePathname();
  const recorded = useRef<string | null>(null);

  useEffect(() => {
    // Guards StrictMode's double mount, which would otherwise record twice.
    if (recorded.current === pathname) {
      return;
    }

    recorded.current = pathname;

    void (async () => {
      try {
        const response = await fetch('/api/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: pathname }),
          keepalive: true,
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { count: number | null };

        if (typeof data.count === 'number') {
          setViewCount(data.count);
        }
      } catch {
        // Counting is decorative: a failure should never surface to the visitor.
      }
    })();
  }, [pathname]);

  return null;
}
