'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { annotate } from 'rough-notation';
import { type RoughAnnotation } from 'rough-notation/lib/model';

/**
 * Draws the same rough-notation underline the Highlighter component draws, but
 * across the `<strong>` elements of already-rendered markdown.
 *
 * Markdown arrives as an HTML string (dangerouslySetInnerHTML), so the marker
 * cannot ride along in JSX. Annotating after mount reproduces the look while
 * keeping the Markdown component server-rendered.
 */
export function ProseAnnotations({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const annotations: RoughAnnotation[] = [];
    const mark = () => {
      for (const annotation of annotations) annotation.remove();
      annotations.length = 0;

      for (const strong of element.querySelectorAll('strong')) {
        const annotation = annotate(strong, {
          type: 'underline',
          color: '#8a8a93',
          strokeWidth: 1.5,
          animationDuration: 600,
          iterations: 2,
          // Matches the Highlighter's -4: rough-notation measures from the line
          // box, so a negative value tucks the line under the baseline.
          padding: -4,
          multiline: true,
        });
        annotation.show();
        annotations.push(annotation);
      }
    };

    mark();

    // Line boxes move when the column resizes; redraw so the strokes follow.
    // Width-only: annotation SVGs can change the box's measured height, and a
    // naive resize handler would loop. Redraws are coalesced to one per frame.
    let lastWidth = element.clientWidth;
    let frame = 0;
    const resizeObserver = new ResizeObserver(() => {
      if (element.clientWidth === lastWidth) return;
      lastWidth = element.clientWidth;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(mark);
    });
    resizeObserver.observe(element);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      for (const annotation of annotations) annotation.remove();
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
