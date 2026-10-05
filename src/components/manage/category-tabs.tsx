'use client';

import { motion } from 'motion/react';

import { pillSpring, usePills } from '@/lib/use-pills';
import { ARTICLE_CATEGORIES, type ArticleForm } from '@/lib/validation';
import { cn } from '@/lib/utils';

type Category = ArticleForm['category'];

/**
 * Category picker for the article form — the same sliding pill as the header
 * nav and the /manage tabs (usePills measures, motion springs it across).
 * Radios stay under the hood so arrow-key navigation and form semantics keep
 * working; the pill is purely visual.
 */
export function CategoryTabs({
  value,
  onChange,
}: {
  value: Category;
  onChange: (value: Category) => void;
}) {
  const { listRef, itemRefs, pills } = usePills<HTMLUListElement, HTMLLIElement>({
    activeHref: value,
  });

  return (
    <ul
      ref={listRef}
      className="border-line-soft relative flex items-center gap-1 rounded-full border bg-white p-1"
    >
      {pills.active && (
        <motion.span
          aria-hidden
          initial={false}
          animate={pills.active}
          transition={pillSpring}
          className="border-line-soft from-tile-start to-tile-end absolute top-0 left-0 rounded-full border bg-linear-to-b"
        />
      )}

      {ARTICLE_CATEGORIES.map((category) => {
        const isActive = category === value;

        return (
          <li
            key={category}
            className="relative flex-1"
            ref={(node) => {
              if (node) {
                itemRefs.current.set(category, node);
              } else {
                itemRefs.current.delete(category);
              }
            }}
          >
            <label className="block cursor-pointer">
              <input
                type="radio"
                name="article-category"
                value={category}
                checked={isActive}
                onChange={() => onChange(category)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'relative flex items-center justify-center rounded-full px-4 py-1.5 font-mono text-[13px] transition-colors',
                  'peer-focus-visible:ring-brand peer-focus-visible:ring-2 peer-focus-visible:outline-none',
                  isActive ? 'text-ink' : 'text-muted-ink hover:text-ink',
                )}
              >
                {category === 'TECH' ? 'Tech' : 'Personal'}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
