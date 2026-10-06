'use client';

import { useEffect, useState } from 'react';
import LineSidebar from '@/components/LineSidebar';

export const HOME_SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'contributions', label: 'Activity' },
  { id: 'experience', label: 'Experience' },
  { id: 'tech-stack', label: 'Tech Stack' },
  { id: 'projects', label: 'Projects' },
  { id: 'blogs', label: 'Blogs' },
];

export function HomeSectionIndex() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    let ticking = false;

    function updateActiveSection() {
      const viewportMiddle = window.innerHeight / 2;
      let currentIdx = 0;

      for (let i = 0; i < HOME_SECTIONS.length; i++) {
        const item = HOME_SECTIONS[i];
        if (!item) continue;
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= viewportMiddle) {
            currentIdx = i;
          }
        }
      }

      // Check if user has scrolled near bottom of page
      const isBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (isBottom) {
        currentIdx = HOME_SECTIONS.length - 1;
      }

      setActiveIndex(currentIdx);
      ticking = false;
    }

    function handleScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateActiveSection);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    updateActiveSection();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  function handleItemClick(index: number) {
    const section = HOME_SECTIONS[index];
    if (!section) return;
    const el = document.getElementById(section.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState(null, '', `#${section.id}`);
    }
  }

  return (
    <aside
      aria-label="Section navigation"
      className="fixed top-1/2 left-6 z-30 hidden -translate-y-1/2 select-none xl:block"
    >
      <LineSidebar
        items={HOME_SECTIONS.map((s) => s.label)}
        activeIndex={activeIndex}
        onItemClick={handleItemClick}
        accentColor="var(--brand, #2f80ed)"
        textColor="var(--muted-ink, #6b7280)"
        markerColor="var(--ghost, #d1d1d6)"
        fontSize={0.85}
        itemGap={12}
        markerLength={28}
        maxShift={12}
        tickScale={0.5}
        proximityRadius={60}
      />
    </aside>
  );
}
