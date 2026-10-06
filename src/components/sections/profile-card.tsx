'use client';

import Image from 'next/image';
import { Eye, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

import { PronounceName } from '@/components/sections/pronounce-name';
import { ViewCounter } from '@/components/sections/view-counter';
import { TextMorph } from '@/components/forgeui/text-morph';
import { GooeyText } from '@/components/ui/gooey-text';
import { TextReveal } from '@/components/forgeui/text-reveal';

// Copy lives here until the content is wired to real data.
const profile = {
  name: 'YONATANE M',
  avatar: '/profile-image.png',
  // Respelling the pronunciation clip was generated from.
  phonetic: 'yo-na-TA-neh',
  age: '23',
  roles: ['FULLSTACK TYPESCRIPT DEVELOPER', 'FULLSTACK SOFTWARE ENGINEER'],
  location: { country: 'ETHIOPIA', city: 'ADDIS ABABA' },
};

// Hand-drawn doodle from the design ("Avatar Arrow"): a 150x80 path whose tip
// curves right onto the photo. Decorative only.
const avatarArrow =
  'M15 6c20 4 35 12 39 24 3 10 14 14 20 9 6-5 2-13-6-12-12 2-14 17-2 28 10 9 44 13 74 9m0 0l-10-4m10 4l-7-9';

export function ProfileCard() {
  return (
    <div className="border-line-soft relative flex items-center gap-5 rounded-[16px] border bg-white p-5">
      {/* Hidden below xl: it sits in the gutter beside the column, which only
          exists once the viewport is wide enough to hold it. */}
      <svg
        aria-hidden
        viewBox="0 0 150 80"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-ink pointer-events-none absolute top-[5px] -left-[135px] hidden h-20 w-[150px] xl:block"
      >
        <motion.path
          d={avatarArrow}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] },
            opacity: { duration: 0.2, delay: 0.2 },
          }}
        />
      </svg>
      <div className="group flex size-[136px] shrink-0 items-center justify-center rounded-[20px] border border-[#d8d8dc] bg-white/70 p-1 shadow-[0_2px_8px_rgba(0,0,0,0.08)] backdrop-blur-[12px] transition-colors hover:bg-white/90">
        <Image
          src={profile.avatar}
          alt=""
          width={128}
          height={128}
          preload
          className="border-ghost size-32 shrink-0 rounded-[16px] border bg-[#ececf0] object-cover transition-colors group-hover:bg-[#f5f5f7]"
        />
      </div>

      {/* Height of the photo itself (128px), so the column lines up with the image box. */}
      <div className="flex h-32 w-full flex-col justify-between gap-1.5 py-2 font-mono">
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <GooeyText
                text={profile.name}
                className="text-ink text-[26px] leading-[34px] font-bold"
              />
              <Image src="/verified-badge.png" alt="Verified" width={20} height={20} />
              <PronounceName name={profile.name} phonetic={profile.phonetic} />
            </div>

            <p className="text-muted-ink flex items-center gap-1.5 self-start text-[14px]">
              <Eye aria-hidden className="text-faint size-4" />
              <ViewCounter />
            </p>
          </div>

          <TextMorph
            prefix={`${profile.age} |`}
            words={profile.roles}
            className="text-muted-ink text-[15px] leading-5"
          />
        </div>

        <p className="text-muted-ink flex items-center gap-1.5 text-[14px] leading-[18px]">
          <MapPin aria-hidden className="size-3.5 shrink-0" />
          <TextReveal text={profile.location.country} duration={0.4} />
          <span aria-hidden className="size-[3px] rounded-full bg-current" />
          <TextReveal text={profile.location.city} duration={0.4} delay={0.25} />
        </p>
      </div>
    </div>
  );
}
