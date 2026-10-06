'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface GooeyTextProps {
  text?: string;
  className?: string;
}

export function GooeyText({ text = 'YONATANE M', className }: GooeyTextProps) {
  const rawId = useId();
  const filterId = `gooey-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <span
      className={cn('relative inline-block tracking-tight select-none', className)}
      style={{
        filter: `url(#${filterId})`,
      }}
    >
      <span>{text}</span>

      <svg
        className="pointer-events-none fixed h-0 w-0"
        style={{ position: 'absolute', width: 0, height: 0 }}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 22 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
    </span>
  );
}

export default GooeyText;
