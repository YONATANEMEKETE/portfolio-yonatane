'use client';

import { Globe, LoaderCircle, Unplug } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { togglePublish } from '@/app/(private)/manage/publish-actions';

/**
 * Publish ↔ unpublish icon button for one manage card. DRAFT shows Globe
 * (publish), PUBLISHED shows Unplug (unpublish) — the parent card already owns
 * the hover-reveal wrapper, this only owns the click behavior.
 *
 * While the action flies the button shows a spinner and locks; on failure it
 * unlocks with the reason as its tooltip. Success refreshes the server list
 * so the row re-renders with its new chip + icon.
 */
export function PublishToggleButton({
  id,
  title,
  published,
  className,
}: {
  id: string;
  title: string;
  published: boolean;
  className: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await togglePublish(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError('Could not change publishing. Try again.');
    } finally {
      setPending(false);
    }
  }

  const label = published ? 'Unpublish' : 'Publish';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      title={error ?? (pending ? `${label}ing…` : `${label} article`)}
      aria-label={`${label} ${title}`}
      aria-busy={pending}
      className={className}
    >
      {pending ? (
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
      ) : published ? (
        <Unplug aria-hidden className="size-4" />
      ) : (
        <Globe aria-hidden className="size-4" />
      )}
    </button>
  );
}
