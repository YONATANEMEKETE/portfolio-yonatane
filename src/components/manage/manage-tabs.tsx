'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

import { pillSpring, usePills } from '@/lib/use-pills';
import { cn } from '@/lib/utils';

/**
 * The two roles of /manage: content (blogs) and auth (emails + passcode).
 * Route-based rather than client state so each tab is bookmarkable and the
 * real pages can grow independently.
 */
const tabs = [
  { href: '/manage', label: 'Blogs' },
  { href: '/manage/auth', label: 'Auth' },
] as const;

function isActiveTab(pathname: string, href: string) {
  // Exact for the index route so a future /manage/analytics doesn't light it up.
  return href === '/manage' ? pathname === href : pathname.startsWith(href);
}

export function ManageTabs() {
  const pathname = usePathname();
  const activeHref = tabs.find(({ href }) => isActiveTab(pathname, href))?.href ?? null;
  const { listRef, itemRefs, pills } = usePills<HTMLUListElement, HTMLLIElement>({
    activeHref,
  });

  return (
    <nav aria-label="Manage sections" className="border-line-soft rounded-full border bg-white p-1">
      <ul ref={listRef} className="relative flex items-center gap-1">
        {/* Same shared pill as the header nav, themed to the site's tile
            gradient instead of the glass plate. */}
        {pills.active && (
          <motion.span
            aria-hidden
            initial={false}
            animate={pills.active}
            transition={pillSpring}
            className="border-line-soft from-tile-start to-tile-end absolute top-0 left-0 rounded-full border bg-linear-to-b"
          />
        )}

        {tabs.map(({ href, label }) => {
          const isActive = href === activeHref;

          return (
            <li
              key={href}
              ref={(node) => {
                if (node) {
                  itemRefs.current.set(href, node);
                } else {
                  itemRefs.current.delete(href);
                }
              }}
              className="relative"
            >
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex items-center rounded-full px-4 py-1.5 font-mono text-[13px] transition-colors',
                  isActive ? 'text-ink' : 'text-muted-ink hover:text-ink',
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
