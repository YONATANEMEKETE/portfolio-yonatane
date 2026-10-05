'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import { cn } from '@/lib/utils';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'TECH', label: 'Tech' },
  { value: 'PERSONAL', label: 'Personal' },
] as const;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Draft' },
] as const;

/**
 * Search + category + status filters for the /manage blogs list. URL-driven
 * (?q=&category=&status=) so a filtered view is bookmarkable and shareable —
 * same instinct as the route-based ManageTabs. Typing debounces into the URL;
 * chips navigate immediately.
 */
export function ArticleFilters({
  initialQuery,
  initialCategory,
  initialStatus,
}: {
  initialQuery: string;
  initialCategory: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  function navigate(next: { q?: string; category?: string; status?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const q = next.q ?? query;
    const category = next.category ?? initialCategory;
    const status = next.status ?? initialStatus;

    if (q.trim()) {
      params.set('q', q.trim());
    } else {
      params.delete('q');
    }
    if (category && category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    if (status && status !== 'all') {
      params.set('status', status);
    } else {
      params.delete('status');
    }

    const url = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    startTransition(() => router.replace(url, { scroll: false }));
  }

  function onQueryChange(value: string) {
    setQuery(value);
    if (timer) clearTimeout(timer);
    // Debounce keystrokes into the URL so each keypress isn't a navigation.
    setTimer(setTimeout(() => navigate({ q: value }), 300));
  }

  function chipClass(active: boolean) {
    return cn(
      'rounded-full border px-3 py-1 font-mono text-[12px] transition-colors',
      active
        ? 'border-line-soft from-tile-start to-tile-end text-ink bg-linear-to-b'
        : 'border-line-soft text-muted-ink hover:text-ink border bg-white',
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label htmlFor="article-search" className="sr-only">
          Search articles
        </label>
        <input
          id="article-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search title or excerpt…"
          className="border-line-soft placeholder:text-faint focus:border-brand w-full rounded-full border bg-white px-4 py-2 font-mono text-[13px] transition-colors focus:outline-none"
        />
        {isPending && (
          <span aria-hidden className="text-faint shrink-0 font-mono text-[12px]">
            …
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Filter by category" className="flex items-center gap-1.5">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => navigate({ category: option.value })}
              aria-pressed={initialCategory === option.value}
              className={chipClass(initialCategory === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <span aria-hidden className="bg-line-soft h-4 w-px" />

        <div role="group" aria-label="Filter by status" className="flex items-center gap-1.5">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => navigate({ status: option.value })}
              aria-pressed={initialStatus === option.value}
              className={chipClass(initialStatus === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
