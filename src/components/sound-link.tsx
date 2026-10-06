'use client';

import { type ComponentPropsWithoutRef } from 'react';
import Link from 'next/link';

import { maximize007Sound } from '@/lib/maximize-007';
import { playSound } from '@/lib/sound-engine';

export function SoundLink({ onClick, ...props }: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        void playSound(maximize007Sound.dataUri).catch(() => {});
        onClick?.(e);
      }}
    />
  );
}
