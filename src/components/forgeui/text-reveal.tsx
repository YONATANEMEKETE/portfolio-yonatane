'use client';

import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { motion, stagger, useAnimate } from 'motion/react';

const defaultRevealText =
  'ForgeUI is a beautifully designed component library built with Tailwind CSS and Motion. It helps developers build modern, animated UIs faster, with consistent styling and production-ready components.';

export const TextReveal = ({
  text = defaultRevealText,
  className,
  filter = true,
  duration = 0.5,
  staggerDelay = 0.2,
  delay = 0,
}: {
  text?: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  staggerDelay?: number;
  delay?: number;
}) => {
  const [scope, animate] = useAnimate();
  const textArray = text.split(' ');

  useEffect(() => {
    animate(
      'span',
      {
        opacity: 1,
        filter: filter ? 'blur(0px)' : 'none',
      },
      {
        duration: duration,
        delay: stagger(staggerDelay, { startDelay: delay }),
        ease: 'easeOut',
      },
    );
  }, [animate, delay, duration, filter, staggerDelay]);

  return (
    <span className={cn('inline-flex flex-wrap items-baseline', className)}>
      <motion.span ref={scope} className="inline-flex flex-wrap items-baseline">
        {textArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="inline-block"
              style={{
                filter: filter ? 'blur(8px)' : 'none',
                marginRight: idx < textArray.length - 1 ? '0.28em' : undefined,
                opacity: 0,
              }}
            >
              {word}
            </motion.span>
          );
        })}
      </motion.span>
    </span>
  );
};

export default TextReveal;
