'use client';

import { LoaderCircle, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { toggleFeatured } from '@/app/(private)/manage/featured-actions';
import { cn } from '@/lib/utils';

/**
 * Featured ↔ unfeatured icon button for one manage card.
 * Filled Star when featured, outline Star when not.
 */
export function FeaturedToggleButton({
  id,
  title,
  featured,
  className,
}: {
  id: string;
  title: string;
  featured: boolean;
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
      const result = await toggleFeatured(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError('Could not change featured status. Try again.');
    } finally {
      setPending(false);
    }
  }

  const label = featured ? 'Unfeature' : 'Feature';

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
      ) : (
        <Star
          aria-hidden
          className={cn(
            'size-4 transition-colors',
            featured ? 'fill-amber-500 text-amber-500' : 'text-muted-ink hover:text-ink',
          )}
        />
      )}
    </button>
  );
}
