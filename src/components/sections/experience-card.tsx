import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

import type { Experience } from '@/content/experience';
import { cn } from '@/lib/utils';

import { ToolCard } from '@/components/sections/tool-card';

type ExperienceCardProps = {
  experience: Experience;
  /** Owned by the section, so only one card is ever open. */
  open: boolean;
  onToggle: () => void;
};

/**
 * Bullets mark the phrase worth noticing with `**bold**`. The design draws that
 * emphasis as a grey wave underline rather than bold weight.
 */
function emphasise(line: string) {
  return line
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) =>
      part.startsWith('**') ? (
        <span key={index} className="underline-wave-muted">
          {part.slice(2, -2)}
        </span>
      ) : (
        <span key={index}>{part}</span>
      ),
    );
}

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
                'text-muted-ink size-[18px] transition-transform duration-300',
                open && 'rotate-180',
              )}
            />
          </span>
        </button>
      </h3>

      {/* Animating the grid track from 0fr to 1fr expands to the body's natural
          height, which a height transition cannot do without measuring it. */}
      <div
        id={bodyId}
        aria-hidden={!open}
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
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
                <li key={line} className="text-body-soft flex gap-2.5 text-[15px] leading-[1.5]">
                  <span
                    aria-hidden
                    className="bg-contrib-2 mt-2 size-[6px] shrink-0 rounded-[1px]"
                  />
                  <span>{emphasise(line)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
