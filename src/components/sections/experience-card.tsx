'use client';

import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import type { Experience } from '@/content/experience';
import { cn } from '@/lib/utils';

import { ToolCard } from '@/components/sections/tool-card';
import { Emphasise } from '@/components/emphasise';

type ExperienceCardProps = {
  experience: Experience;
  /** Owned by the section, so only one card is ever open. */
  open: boolean;
  onToggle: () => void;
};

export function ExperienceCard({ experience, open, onToggle }: ExperienceCardProps) {
  const { id, company, role, logo, location, start, end, tools, done } = experience;
  const bodyId = `${id}-body`;

  return (
    <article className="border-line-soft overflow-hidden rounded-[16px] border bg-white">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={onToggle}
          className="focus-visible:ring-ink/30 flex w-full items-center gap-3 px-5 py-5 text-left transition-colors hover:bg-[#fcfcfe] focus-visible:ring-2 focus-visible:outline-none"
        >
          {logo ? (
            <Image
              src={logo}
              alt=""
              width={44}
              height={44}
              className="border-line size-11 shrink-0 rounded-[10px] border bg-white object-contain"
            />
          ) : (
            <span
              aria-hidden
              className="border-line text-muted-ink flex size-11 shrink-0 items-center justify-center rounded-[10px] border bg-white text-[13px] font-semibold"
            >
              {company.charAt(0)}
            </span>
          )}

          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-ink text-[16px] leading-[19px] font-semibold">{company}</span>
            <span className="text-muted-ink text-[14px] leading-[17px]">{role}</span>
          </span>

          <span className="text-muted-ink flex shrink-0 items-center gap-3 text-[13px] leading-4">
            {location}
            <span aria-hidden className="bg-line h-3 w-px" />
            {start} – {end}
            <ChevronDown
              aria-hidden
              className={cn(
                'text-muted-ink size-[18px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
                open && 'rotate-180',
              )}
            />
          </span>
        </button>
      </h3>

      {/* Motion measures the body's height and animates it directly, so the
          expand tracks the content frame-by-frame instead of easing a grid
          track the browser must re-resolve. Opacity rides the same curve. The
          inner overflow-hidden keeps the rough-notation SVGs clipped while
          collapsed — they are absolutely positioned siblings of the marked
          text, so without a containing block they would paint over the card. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            id={bodyId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="relative overflow-hidden">
              <div className="border-line-soft border-t px-5 pt-4 pb-5">
                <p className="text-ink text-[14px] leading-[17px] font-bold">
                  Technologies &amp; Tools
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <ToolCard key={tool.name} {...tool} />
                  ))}
                </ul>

                <p className="text-ink mt-5 text-[14px] leading-[17px] font-bold">
                  What I&apos;ve done
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {done.map((line) => (
                    <li
                      key={line}
                      className="text-body-soft flex gap-2.5 text-[15px] leading-[1.5]"
                    >
                      <span
                        aria-hidden
                        className="bg-contrib-2 mt-2 size-[6px] shrink-0 rounded-[1px]"
                      />
                      <span>
                        <Emphasise text={line} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
