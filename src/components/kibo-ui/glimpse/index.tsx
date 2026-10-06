'use client';

import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

export type GlimpseProps = ComponentProps<typeof HoverCard>;

export const Glimpse = (props: GlimpseProps) => {
  return <HoverCard {...props} />;
};

export type GlimpseContentProps = ComponentProps<typeof HoverCardContent>;

export const GlimpseContent = (props: GlimpseContentProps) => <HoverCardContent {...props} />;

export type GlimpseTriggerProps = ComponentProps<typeof HoverCardTrigger>;

export const GlimpseTrigger = (props: GlimpseTriggerProps) => <HoverCardTrigger {...props} />;

export type GlimpseTitleProps = ComponentProps<'p'>;

export const GlimpseTitle = ({ className, ...props }: GlimpseTitleProps) => {
  return <p className={cn('text-ink truncate text-[13px] font-semibold', className)} {...props} />;
};

export type GlimpseDescriptionProps = ComponentProps<'p'>;

export const GlimpseDescription = ({ className, ...props }: GlimpseDescriptionProps) => {
  return (
    <p
      className={cn('text-muted-ink mt-1 line-clamp-2 text-[12px] leading-relaxed', className)}
      {...props}
    />
  );
};

export type GlimpseImageProps = ComponentProps<'img'>;

export const GlimpseImage = ({ className, alt, ...props }: GlimpseImageProps) => (
  // biome-ignore lint/performance/noImgElement: "Kibo UI is framework agnostic"
  // eslint-disable-next-line @next/next/no-img-element
  <img
    alt={alt ?? ''}
    className={cn(
      'border-line-soft mb-2.5 aspect-[120/63] w-full rounded-[10px] border object-cover',
      className,
    )}
    {...props}
  />
);
