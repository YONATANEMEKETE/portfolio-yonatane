'use client';

import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import type { Project } from '@/content/projects';
import { cn } from '@/lib/utils';
import { SoundLink } from '@/components/sound-link';
import { maximize007Sound } from '@/lib/maximize-007';
import { playSound } from '@/lib/sound-engine';

import { ToolCard } from '@/components/sections/tool-card';
import { Emphasise } from '@/components/emphasise';

type ProjectCardProps = {
  project: Project;
};

const statusLabel = { building: 'Building', live: 'Live' } as const;

/** GitHub mark copied from the social row — lucide no longer ships brand icons. */
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3.5 15.668q0.675 0.081 1 0.618c0.326 0.537 1.537 2.526 2.913 2.526h2.087m5.672-3.513q0.823 1.078 0.823 1.936v3.765m-5.625-5.609q-0.87 0.954-0.869 1.813v3.796m5.671-5.701c1.202-0.25 2.293-0.682 3.14-1.316 1.448-1.084 2.188-2.758 2.188-4.411 0-1.16-0.44-2.243-1.204-3.16-0.425-0.511 0.819-3.872-0.286-3.359-1.105 0.514-2.725 1.198-3.574 0.947-0.909-0.268-1.9-0.416-2.936-0.416-0.9 0-1.766 0.111-2.574 0.317-1.174 0.298-2.296-0.363-3.426-0.848-1.13-0.484-0.513 3.008-0.849 3.422-0.73 0.905-1.151 1.965-1.151 3.097 0 1.653 0.895 3.327 2.343 4.41 0.965 0.722 2.174 1.183 3.527 1.41" />
    </svg>
  );
}

/**
 * One project in the "Showcase of my work" grid. Follows the Pencil card:
 * cover, title row with status dot, tagline, description, first three stack
 * tools, divider, footer with live/GitHub links and a details link.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const { slug, name, status, tagline, description, stack, cover, links } = project;
  const chips = stack.slice(0, 3);

  return (
    <div className="rounded-[20px] border border-[#d8d8dc] bg-white/70 p-1 backdrop-blur-[12px]">
      <article className="border-line-soft hover:border-ghost relative flex h-full flex-col overflow-hidden rounded-[16px] border bg-white transition-colors duration-200">
        <div className="relative h-[190px] w-full shrink-0 overflow-hidden bg-[#ececf0]">
          <Image
            src={cover}
            alt={`${name} cover`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-ink text-[18px] leading-[22px] font-bold">{name}</h3>
            <span className="flex shrink-0 items-center gap-1.5">
              <span
                aria-hidden
                className={cn(
                  'size-2 rounded-full',
                  status === 'live' ? 'bg-success' : 'bg-warning',
                )}
              />
              <span className="text-muted-ink text-[13px] leading-4">{statusLabel[status]}</span>
            </span>
          </div>

          <p className="text-muted-ink text-[14px] leading-[17px]">
            <Emphasise text={tagline} />
          </p>
          <p className="text-body-soft text-[14px] leading-[1.5]">
            <Emphasise text={description} />
          </p>

          <ul className="flex flex-wrap gap-1.5">
            {chips.map((tool) => (
              <ToolCard key={tool.name} {...tool} />
            ))}
          </ul>

          <div className="mt-auto flex flex-col gap-2.5 pt-2.5">
            <div aria-hidden className="bg-line-soft h-px w-full" />

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {links.live && (
                  <a
                    href={links.live}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      void playSound(maximize007Sound.dataUri).catch(() => {});
                    }}
                    className="text-body hover:text-ink focus-visible:ring-ink/30 group relative z-10 flex items-center gap-1 text-[14px] leading-4 font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    Live link
                    <ArrowUpRight
                      aria-hidden
                      className="size-[14px] transition-transform duration-200 ease-out group-hover:translate-x-[1.5px] group-hover:-translate-y-[1.5px]"
                    />
                  </a>
                )}
                {links.live && links.repo && (
                  <span aria-hidden className="bg-faint size-1 rounded-full" />
                )}
                {links.repo && (
                  <a
                    href={links.repo}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      void playSound(maximize007Sound.dataUri).catch(() => {});
                    }}
                    className="text-body hover:text-ink focus-visible:ring-ink/30 group relative z-10 flex items-center gap-1.5 text-[14px] leading-4 font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    GitHub
                    <GithubIcon className="size-[14px] transition-transform duration-200 ease-out group-hover:scale-110" />
                  </a>
                )}
              </div>

              {/* A plain anchor here would reload the document, restarting the
                  header and stopping the music; Link keeps the navigation
                  client-side like every other internal link. */}
              <SoundLink
                href={`/projects/${slug}`}
                aria-label={`${name} details`}
                className="text-ink focus-visible:ring-ink/30 group flex shrink-0 items-center gap-1 text-[14px] leading-4 font-medium after:absolute after:inset-0 after:content-[''] focus-visible:ring-2 focus-visible:outline-none"
              >
                Details
                <ArrowRight
                  aria-hidden
                  className="size-[14px] transition-transform duration-200 ease-out group-hover:translate-x-1"
                />
              </SoundLink>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
