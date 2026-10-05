'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Error panel for the /manage blogs list. Next mounts this when the list
 * component throws (DB down, R2 misconfigured) instead of blanking the page.
 * Retry re-runs the server tree from the client — no full page reload.
 */
export default function ManageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  function onRetry() {
    if (retrying) return;
    setRetrying(true);
    router.refresh();
    reset();
    // If the retry itself fails, the boundary re-renders with the same
    // `error` object — release the spinner on a beat so it can be hit again.
    setTimeout(() => setRetrying(false), 3000);
  }

  return (
    <div
      role="alert"
      className="border-destructive/40 flex flex-col items-center gap-2 rounded-[16px] border bg-white px-6 py-20 text-center"
    >
      <p className="text-ink font-mono text-[14px]">Couldn’t load articles.</p>
      <p className="text-muted-ink max-w-md font-mono text-[12px]">
        {error.message || 'The database didn’t answer. Check your connection and try again.'}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        aria-busy={retrying}
        className="border-line-soft text-muted-ink hover:text-ink mt-2 rounded-full border bg-white px-4 py-1.5 font-mono text-[13px] transition-colors disabled:cursor-wait disabled:opacity-50"
      >
        {retrying ? 'Retrying…' : 'Try again'}
      </button>
    </div>
  );
}
