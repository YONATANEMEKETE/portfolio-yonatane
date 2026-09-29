import Image from 'next/image';
import { Eye, MapPin } from 'lucide-react';

import { ViewCounter } from '@/components/sections/view-counter';

// Copy lives here until the content is wired to real data.
const profile = {
  name: 'YONATANE M',
  avatar: '/profile-image.png',
  subtitle: '23 | FULLSTACK TYPESCRIPT DEVELOPER',
  location: { country: 'ETHIOPIA', city: 'ADDIS ABABA' },
};

export function ProfileCard() {
  return (
    <div className="border-line-soft flex items-center gap-5 rounded-[16px] border bg-white p-5">
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
              <p className="text-ink text-[26px] leading-[34px]">{profile.name}</p>
              <Image src="/verified-badge.png" alt="Verified" width={20} height={20} />
            </div>

            <p className="text-muted-ink flex items-center gap-1.5 self-start text-[14px]">
              <Eye aria-hidden className="text-faint size-4" />
              <ViewCounter />
            </p>
          </div>

          <p className="text-muted-ink text-[15px] leading-5">{profile.subtitle}</p>
        </div>

        <p className="text-muted-ink flex items-center gap-1.5 text-[14px] leading-[18px]">
          <MapPin aria-hidden className="size-3.5" />
          {profile.location.country}
          <span aria-hidden className="size-[3px] rounded-full bg-current" />
          {profile.location.city}
        </p>
      </div>
    </div>
  );
}
