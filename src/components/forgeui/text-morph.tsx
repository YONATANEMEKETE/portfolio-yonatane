'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/lib/utils';

type TextMorphProps = {
  words?: string[];
  interval?: number;
  className?: string;
  charClassName?: string;
  prefix?: ReactNode;
};

const defaultWords = ['FULLSTACK TYPESCRIPT DEVELOPER', 'FULLSTACK SOFTWARE ENGINEER'];

export function TextMorph({
  words = defaultWords,
  interval = 3000,
  className,
  charClassName,
  prefix,
}: TextMorphProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!words.length) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [words, interval]);

  const chars = useMemo(() => {
    return Array.from(words[index] ?? '');
  }, [index, words]);

  if (!words.length) return null;

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {prefix !== null && prefix !== undefined && prefix !== '' ? <span>{prefix}</span> : null}
      <AnimatePresence mode="popLayout">
        <motion.span
          key={index}
          className="flex gap-[0.5px] overflow-hidden py-1"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.4 }}
        >
          {chars.map((char, i) => (
            <motion.span
              key={i}
              className={cn('inline-block whitespace-pre', charClassName)}
              initial={{ opacity: 0, y: 5, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -5, filter: 'blur(5px)' }}
              transition={{
                delay: i * 0.025,
                duration: 0.3,
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default TextMorph;
