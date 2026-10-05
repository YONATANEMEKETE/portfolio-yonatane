'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

type BlogsRevealProps = {
  children: ReactNode;
  /** Stagger position — each row enters slightly after the one above. */
  index?: number;
};

/**
 * One soft entrance per featured row: fades up the first time it crosses
 * into view. Respects reduced motion by rendering children without animation.
 */
export function BlogsReveal({ children, index = 0 }: BlogsRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-64px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.07, 0.21), ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
