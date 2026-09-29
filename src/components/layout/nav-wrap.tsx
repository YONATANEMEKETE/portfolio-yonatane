'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

// The glass shape + edge highlight live in the .nav-tab-mask utility (globals.css).
// 307px is the plate width from the design, kept as a minimum so the shape and its
// outline rasterize identically on every route.
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/blogs', label: 'Blogs' },
];

function isActivePath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

const pillSpring = { type: 'spring', stiffness: 400, damping: 34, mass: 0.7 } as const;

export function NavWrap() {
  const pathname = usePathname();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <nav
      aria-label="Main"
      className="absolute top-0 left-1/2 h-14 w-fit min-w-[307px] -translate-x-1/2"
    >
      <div
        aria-hidden
        className="absolute inset-x-[18px] top-[18px] bottom-0 rounded-b-[28px] shadow-[0_6px_20px_rgba(0,0,0,0.14)]"
      />
      <div aria-hidden className="nav-tab-mask absolute inset-0 bg-white backdrop-blur-[20px]" />

      <ul
        className="relative flex h-full items-center justify-center gap-1 px-7"
        onMouseLeave={() => setHoveredHref(null)}
      >
        {navLinks.map(({ href, label }) => {
          const isActive = isActivePath(pathname, href);
          const isHovered = hoveredHref === href && !isActive;

          return (
            <li key={href} className="relative" onMouseEnter={() => setHoveredHref(href)}>
              {isHovered && (
                <motion.span
                  aria-hidden
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 rounded-full bg-white/25"
                  transition={pillSpring}
                />
              )}
              {isActive && (
                <motion.span
                  aria-hidden
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-full bg-white/70 ring-1 ring-white/50 ring-inset"
                  transition={pillSpring}
                />
              )}
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex items-center rounded-full px-4 py-2 text-sm leading-[17px]',
                  isActive ? 'text-ink font-semibold' : 'font-medium text-[#3a3a3c]',
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
