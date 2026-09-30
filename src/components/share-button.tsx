'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Link2 } from 'lucide-react';

/**
 * Copies the current page URL. The icon acknowledges with a check for two
 * seconds, and an aria-live region announces the copy for screen readers.
 */
export function ShareButton() {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Copy link to this page"
        onClick={() => {
          void navigator.clipboard
            .writeText(window.location.href)
            .then(() => {
              setCopied(true);
              if (timeout.current) {
                clearTimeout(timeout.current);
              }
              // Long enough to read, short enough to not sit in the "done" state.
              timeout.current = setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => {
              // Clipboard access can be denied; there is no fallback surface to
              // copy from, so a failure stays silent.
            });
        }}
        className="border-line text-body hover:border-ghost hover:text-ink focus-visible:ring-ink/30 flex size-8 shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        {copied ? (
          <Check aria-hidden className="text-success size-3.5" />
        ) : (
          <Link2 aria-hidden className="size-3.5" />
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? 'Link copied' : ''}
      </span>
    </>
  );
}
