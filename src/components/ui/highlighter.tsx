'use client';

import { useLayoutEffect, useRef } from 'react';
import type React from 'react';
import { useInView } from 'motion/react';
import { annotate } from 'rough-notation';

type AnnotationAction =
  'highlight' | 'underline' | 'box' | 'circle' | 'strike-through' | 'crossed-off' | 'bracket';

interface HighlighterProps {
  children: React.ReactNode;
  action?: AnnotationAction;
  color?: string;
  strokeWidth?: number;
  animationDuration?: number;
  iterations?: number;
  padding?: number;
  multiline?: boolean;
  isView?: boolean;
}

export function Highlighter({
  children,
  action = 'highlight',
  color = '#ffd1dc',
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false,
}: HighlighterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);

  const isInView = useInView(elementRef, {
    once: true,
    margin: '-10%',
  });

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = !isView || isInView;

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!shouldShow || !element) return;

    // rough-notation observes the element itself and re-renders silently when
    // its rects change, so no ResizeObserver here — an extra one only doubles
    // the redraw and replays the draw animation.
    const annotation = annotate(element, {
      type: action,
      color,
      strokeWidth,
      animationDuration,
      iterations,
      padding,
      multiline,
    });
    annotation.show();

    return () => {
      annotation.remove();
    };
  }, [shouldShow, action, color, strokeWidth, animationDuration, iterations, padding, multiline]);

  return (
    <span ref={elementRef} className="relative inline-block bg-transparent">
      {children}
    </span>
  );
}
