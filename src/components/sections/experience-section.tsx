'use client';

import { useState } from 'react';

import { experiences } from '@/content/experience';

import { ExperienceCard } from '@/components/sections/experience-card';

// The content file is authored oldest first; the page reads newest first. Sorting
// on the start date keeps that independent of the order entries are added in.
const newestFirst = [...experiences].sort((a, b) => Date.parse(b.start) - Date.parse(a.start));

export function ExperienceSection() {
  // One card open at a time: opening one closes whichever was open. The newest
  // role starts open.
  const [openId, setOpenId] = useState<string | null>(newestFirst[0]?.id ?? null);

  return (
    <section className="pt-8">
      <h2 className="text-ink text-[28px] leading-[34px] font-bold">Experience</h2>

      <div className="mt-4 flex flex-col gap-4">
        {newestFirst.map((experience) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            open={openId === experience.id}
            onToggle={() =>
              setOpenId((current) => (current === experience.id ? null : experience.id))
            }
          />
        ))}
      </div>
    </section>
  );
}
