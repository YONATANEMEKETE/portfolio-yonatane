'use client';

import { useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from 'motion/react';

const track = {
  src: '/audio/lofi-loop.mp3',
  title: 'Lofi Chill Vlog Beats',
  artist: {
    name: 'Alex Morgan',
    href: 'https://pixabay.com/users/alex-morgan-54692529/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=573883',
  },
  source: {
    name: 'Pixabay',
    href: 'https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=573883',
  },
};

// Vinyl geometry, in the SVG's own 56x56 coordinate space.
const discCenter = 28;

// 33⅓ rpm, advanced only while playing, so pausing freezes the record exactly
// where it is instead of snapping back to 0.
const degreesPerMs = 360 / 1800;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);

  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

// An MP3 without a Xing/Info header makes browsers report `Infinity` for the
// duration, which would leave the progress bar stuck at 0. The seekable range
// usually knows the real length, so fall back to that before giving up.
function readDuration(audio: HTMLAudioElement) {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    return audio.duration;
  }

  try {
    if (audio.seekable.length > 0) {
      const end = audio.seekable.end(audio.seekable.length - 1);

      if (Number.isFinite(end) && end > 0) {
        return end;
      }
    }
  } catch {
    // Fall through and report an unknown duration.
  }

  return 0;
}

function Vinyl({ rotation }: { rotation: MotionValue<number> }) {
  return (
    <svg aria-hidden viewBox="0 0 56 56" className="size-14 shrink-0">
      <circle cx={discCenter} cy={discCenter} r="28" fill="#111111" />

      <motion.g
        style={{
          rotate: rotation,
          transformBox: 'view-box',
          transformOrigin: `${discCenter}px ${discCenter}px`,
        }}
      >
        <circle cx="28" cy="28" r="25" fill="none" stroke="#333336" strokeWidth="0.6" />
        <circle cx="28" cy="28" r="22" fill="none" stroke="#333336" strokeWidth="0.6" />
        <circle cx="28" cy="28" r="19" fill="none" stroke="#333336" strokeWidth="0.5" />
        <circle cx="28" cy="28" r="16" fill="none" stroke="#333336" strokeWidth="0.5" />
        <path d="M28 3a25 25 0 0 1 0 50Z" fill="#ffffff" fillOpacity="0.06" />
        <path d="M28 3a25 25 0 0 0 0 50Z" fill="#ffffff" fillOpacity="0.02" />
        <circle cx="28" cy="28" r="10" fill="#d97706" />
        <path d="M28 21v4.5" stroke="#111111" strokeOpacity="0.4" strokeWidth="1" />
      </motion.g>

      <circle cx="28" cy="28" r="2.2" fill="#ffffff" />
    </svg>
  );
}

export function MiniPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const spinRef = useRef(0);
  const rotation = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useAnimationFrame((_, delta) => {
    if (!playing || reduceMotion) {
      return;
    }

    spinRef.current = (spinRef.current + delta * degreesPerMs) % 360;
    rotation.set(spinRef.current);
  });

  const progress = duration > 0 ? Math.min((time / duration) * 100, 100) : 0;

  function syncDuration(audio: HTMLAudioElement) {
    const next = readDuration(audio);

    if (next > 0) {
      setDuration(next);
    }
  }

  async function togglePlayback() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      // Rejects when the file is missing or the browser blocks playback.
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  return (
    <div className="absolute top-[84px] left-1/2 flex w-fit -translate-x-1/2 items-center gap-2.5 rounded-[14px] bg-white/55 p-3 shadow-[0_4px_12px_rgba(0,0,0,0.09)] ring-1 ring-white/65 backdrop-blur-[20px]">
      <Vinyl rotation={rotation} />

      <div className="flex w-[150px] flex-col gap-1">
        <p className="text-ink truncate text-xs leading-4 font-semibold">{track.title}</p>
        <p className="text-muted-ink truncate text-[10px] leading-[13px]">
          <a
            href={track.artist.href}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink underline-offset-2 hover:underline"
          >
            {track.artist.name}
          </a>
          <span aria-hidden> · </span>
          <a
            href={track.source.href}
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink underline-offset-2 hover:underline"
          >
            {track.source.name}
          </a>
        </p>
        <div className="bg-line-soft h-[3px] w-full overflow-hidden rounded-full">
          <div className="bg-ink h-full rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-faint flex justify-between text-[9px] leading-[13px]">
          <span>{formatTime(time)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={togglePlayback}
        aria-label={playing ? 'Pause music' : 'Play music'}
        aria-pressed={playing}
        className="text-ink hover:bg-ink/5 focus-visible:ring-ink/30 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        {playing ? (
          <Pause className="size-3.5 fill-current" />
        ) : (
          <Play className="size-3.5 fill-current" />
        )}
      </button>

      <audio
        ref={audioRef}
        src={track.src}
        loop
        preload="metadata"
        onLoadedMetadata={(event) => syncDuration(event.currentTarget)}
        onDurationChange={(event) => syncDuration(event.currentTarget)}
        onCanPlay={(event) => syncDuration(event.currentTarget)}
        onTimeUpdate={(event) => {
          setTime(event.currentTarget.currentTime);
          syncDuration(event.currentTarget);
        }}
      />
    </div>
  );
}
