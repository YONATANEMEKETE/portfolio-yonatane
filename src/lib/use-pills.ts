'use client';

import { useLayoutEffect, useRef, useState } from 'react';

/** Where a nav pill sits, in the list's own coordinates. */
export type PillBox = { x: number; y: number; width: number; height: number };

/** Same spring the header nav uses, so every pill on the site moves alike. */
export const pillSpring = { type: 'spring', stiffness: 400, damping: 34, mass: 0.7 } as const;

/**
 * Measures the active (and optionally hovered) item so a background pill can
 * spring between them — the mechanism behind both the header nav and the
 * /manage tabs.
 *
 * Pills are positioned from the list's own geometry: a shared-layout pill
 * measures in document coordinates, so the scroll reset a navigation performs
 * becomes a vertical delta and the pill flies in from below the page. Measuring
 * against the list makes scroll irrelevant.
 *
 * Rects rather than offsetTop/offsetLeft: those round to whole pixels, which
 * leaves the pill visibly a pixel off when the row is centred.
 */
export function usePills<List extends HTMLElement, Item extends HTMLElement>({
  activeHref,
  hoverHref = null,
}: {
  activeHref: string | null;
  hoverHref?: string | null;
}) {
  const listRef = useRef<List>(null);
  const itemRefs = useRef(new Map<string, Item>());
  const [pills, setPills] = useState<{ active: PillBox | null; hover: PillBox | null }>({
    active: null,
    hover: null,
  });

  useLayoutEffect(() => {
    const measure = (href: string | null): PillBox | null => {
      const item = href ? itemRefs.current.get(href) : null;
      const list = listRef.current;
      if (!item || !list) {
        return null;
      }

      const itemRect = item.getBoundingClientRect();
      const listRect = list.getBoundingClientRect();

      return {
        x: itemRect.left - listRect.left,
        y: itemRect.top - listRect.top,
        width: itemRect.width,
        height: itemRect.height,
      };
    };

    const update = () => {
      setPills({
        active: measure(activeHref),
        hover: hoverHref && hoverHref !== activeHref ? measure(hoverHref) : null,
      });
    };

    update();

    // Item boxes change with the viewport, and once more when the webfont lands.
    const observer = new ResizeObserver(update);
    if (listRef.current) {
      observer.observe(listRef.current);
    }
    for (const item of itemRefs.current.values()) {
      observer.observe(item);
    }

    return () => observer.disconnect();
  }, [activeHref, hoverHref]);

  return { listRef, itemRefs, pills };
}
