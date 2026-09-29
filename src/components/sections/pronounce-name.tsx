'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

import { duckMusic, unduckMusic } from '@/lib/music-ducking';

// The clip is generated from a phonetic respelling (see the design's name row),
// not from the written name, then trimmed so it starts on the first syllable.
const clipSrc = '/audio/name.mp3';

type PronounceNameProps = {
  name: string;
  phonetic: string;
};

export function PronounceName({ name, phonetic }: PronounceNameProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [speaking, setSpeaking] = useState(false);
  const reduceMotion = useReducedMotion();

  // Unmounting mid-word should still hand the music back.
  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      audio?.pause();
      unduckMusic();
    };
  }, []);

  async function toggle() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!audio.paused) {
      audio.pause();
      audio.currentTime = 0;

      return;
    }

    duckMusic();

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch {
      // Missing clip or blocked playback: stay silent and give the music back.
      setSpeaking(false);
      unduckMusic();
    }
  }

  function release() {
    setSpeaking(false);
    unduckMusic();
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={`Hear ${name} pronounced`}
        title={`${name} · ${phonetic}`}
        animate={
          speaking && !reduceMotion
            ? { scale: [1, 1.18, 1], opacity: [1, 0.7, 1] }
            : { scale: 1, opacity: 1 }
        }
        transition={
          speaking && !reduceMotion
            ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.15 }
        }
        className={`hover:text-ink focus-visible:ring-ink/30 -m-1 grid size-[26px] shrink-0 place-items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none ${
          speaking ? 'text-ink' : 'text-muted-ink'
        }`}
      >
        <Volume2 aria-hidden className="size-[18px]" />
      </motion.button>

      <audio
        ref={audioRef}
        src={clipSrc}
        preload="metadata"
        onPlay={() => setSpeaking(true)}
        onPause={release}
        onEnded={release}
      />
    </>
  );
}
