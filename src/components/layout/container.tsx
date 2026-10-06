import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type ContainerProps = ComponentProps<'div'>;

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-3xl px-4 sm:px-6 md:px-0', className)} {...props} />
  );
}
