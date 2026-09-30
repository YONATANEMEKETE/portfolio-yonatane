'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

// The glass shape + edge highlight live in the .nav-tab-mask utility (globals.css).
// 307px is the plate width from the design, kept as a minimum so the shape and its
// outline rasterize identically on every route.
//
// Projects is a section of the home page rather than a route: its link scrolls
// there, and a scroll spy marks it active while the section is on screen.
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#projects', label: 'Projects' },
  { href: '/blogs', label: 'Blogs' },
];

const projectsSectionId = 'projects';

function isActivePath(pathname: string, href: string, projectsInView: boolean) {
  if (href === '/') {
    return pathname === '/' && !projectsInView;
  }

  // The details pages are part of the projects area, so the link is already home.
  if (href === `/#${projectsSectionId}`) {
    return projectsInView || pathname.startsWith('/projects/');
  }

  return pathname.startsWith(href);
}

const pillSpring = { type: 'spring', stiffness: 400, damping: 34, mass: 0.7 } as const;

export function NavWrap() {
  const pathname = usePathname();
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [projectsInView, setProjectsInView] = useState(false);

  useEffect(() => {
    if (pathname !== '/') {
      return;
    }

    const section = document.getElementById(projectsSectionId);
    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => setProjectsInView(entries.some((entry) => entry.isIntersecting)),
      // A thin band across the middle of the viewport: the section counts as
      // active while it crosses the centre of the screen, however tall it is.
      { rootMargin: '-45% 0px -45% 0px' },
    );
    observer.observe(section);

    return () => observer.disconnect();
  }, [pathname]);

  // Gated on the pathname so a stale observation from the home page cannot mark
  // the link active on another route.
  const projectsActive = pathname === '/' && projectsInView;

  // Section links need their own scroll: once the hash is in the URL the browser
  // treats another click as a no-op, so clicking again after scrolling away
  // would do nothing. Scrolling here means the click always lands on the
  // section; the CSS `scroll-behavior` decides whether it animates.
  function handleNavClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (pathname !== '/' || !href.startsWith('/#')) {
      return;
    }

    const section = document.getElementById(href.slice(2));
    if (!section) {
      return;
    }

    event.preventDefault();
    section.scrollIntoView({ block: 'start' });
    window.history.replaceState(null, '', href);
  }

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
          const isActive = isActivePath(pathname, href, projectsActive);
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
                onClick={(event) => handleNavClick(event, href)}
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
