import Image from 'next/image';

import type { ExperienceTool } from '@/content/experience';

/** First letters of the first two words, e.g. "React Hook Form" becomes "RH". */
function monogram(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}

/**
 * One tool in the experience card's tools row. The icon and the name are always
 * shown together — there is no collapsed or hover state, because the tile is not
 * interactive.
 *
 * The 18px box matters: five of the marks are not square (React, Tailwind CSS,
 * Zod, TanStack Query, PostgreSQL). An SVG with a viewBox and no width/height
 * letterboxes itself inside that box, so their proportions survive. next/image
 * skips optimization for `.svg` sources on its own.
 */
export function ToolCard({ name, icon }: ExperienceTool) {
  return (
    <li className="border-line from-tile-start to-tile-end text-body flex h-8 items-center gap-2 rounded-[5px] border bg-linear-to-b pr-2.5 pl-[7px] text-[12px] leading-none font-medium whitespace-nowrap">
      {icon ? (
        <Image src={icon} alt="" width={18} height={18} className="size-[18px] shrink-0" />
      ) : (
        <span
          aria-hidden
          className="text-muted-ink flex size-[18px] shrink-0 items-center justify-center text-[9px] font-semibold"
        >
          {monogram(name)}
        </span>
      )}
      {name}
    </li>
  );
}
