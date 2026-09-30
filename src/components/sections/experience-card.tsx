import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

import type { Experience } from '@/content/experience';
import { cn } from '@/lib/utils';

import { ToolCard } from '@/components/sections/tool-card';
import { Highlighter } from '@/components/ui/highlighter';

type ExperienceCardProps = {
  experience: Experience;
  /** Owned by the section, so only one card is ever open. */
  open: boolean;
  onToggle: () => void;
};

/**
 * Bullets mark the phrase worth noticing with `**bold**`. The design draws that
 * emphasis as a marker swipe rather than bold weight.
 */
function emphasise(line: string) {
  return line
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) =>
      part.startsWith('**') ? (
        // rough-notation draws the line `padding` px below the element's line
        // box, so a negative value lifts it off the 1.5 line-height gap and
        // tucks it under the text.
        <Highlighter key={index} action="underline" color="#8a8a93" padding={-4}>
          {part.slice(2, -2)}
        </Highlighter>
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
        {/* `relative` matters: rough-notation inserts its <svg> as an absolutely
            positioned sibling of the marked text, and only a containing block
            inside this overflow-hidden box is clipped while the card is
            collapsed — otherwise the lines paint over the closed card. */}
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
