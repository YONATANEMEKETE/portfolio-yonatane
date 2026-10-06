'use client';

import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import type { Experience } from '@/content/experience';
import { cn } from '@/lib/utils';

import { ToolCard } from '@/components/sections/tool-card';
import { Emphasise } from '@/components/emphasise';
import { maximize007Sound } from '@/lib/maximize-007';
import { playSound } from '@/lib/sound-engine';

type ExperienceCardProps = {
  experience: Experience;
  /** Owned by the section, so only one card is ever open. */
  open: boolean;
  onToggle: () => void;
};

export function ExperienceCard({ experience, open, onToggle }: ExperienceCardProps) {
  const { id, company, role, logo, location, start, end, tools, done } = experience;
  const bodyId = `${id}-body`;

  function handleToggle() {
    void playSound(maximize007Sound.dataUri).catch(() => {});
    onToggle();
  }

  return (
    <article className="border-line-soft overflow-hidden rounded-[16px] border bg-white">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={handleToggle}
          className="focus-visible:ring-ink/30 flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[#fcfcfe] focus-visible:ring-2 focus-visible:outline-none sm:px-5 sm:py-5"
        >
          {logo ? (
            <Image
              src={logo}
              alt=""
              width={44}
              height={44}
              className="border-line size-10 shrink-0 rounded-[10px] border bg-white object-contain sm:size-11"
            />
          ) : (
            <span
              aria-hidden
              className="border-line text-muted-ink flex size-10 shrink-0 items-center justify-center rounded-[10px] border bg-white text-[13px] font-semibold sm:size-11"
            >
              {company.charAt(0)}
            </span>
          )}

          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-ink text-[15px] leading-[19px] font-semibold sm:text-[16px]">
              {company}
            </span>
            <span className="text-muted-ink text-[13px] leading-[17px] sm:text-[14px]">{role}</span>
            <span className="text-muted-ink mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] leading-4 sm:hidden">
              <span>{location}</span>
              <span aria-hidden className="bg-line h-2.5 w-px" />
              <span>
                {start} – {end}
              </span>
            </span>
          </span>

          <span className="text-muted-ink hidden shrink-0 items-center gap-3 text-[13px] leading-4 sm:flex">
            {location}
            <span aria-hidden className="bg-line h-3 w-px" />
            {start} – {end}
          </span>

          <ChevronDown
            aria-hidden
            className={cn(
              'text-muted-ink size-[18px] shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
              open && 'rotate-180',
            )}
          />
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
