/**
 * Lets a short sound (the name pronunciation) borrow the music player's audio
 * output without the two components sharing a React tree: the mini player lives
 * in the header, the profile card in the page.
 *
 * The player registers its controls; whoever needs quiet calls duck() and then
 * unduck(), which only resumes if duck() was the thing that paused it.
 */
type MusicControls = {
  isPlaying: () => boolean;
  pause: () => void;
  resume: () => void;
};

let controls: MusicControls | null = null;
let pausedByUs = false;

export function registerMusicControls(next: MusicControls) {
  controls = next;
  // A fresh registrant means any previous duck state is stale.
  pausedByUs = false;

  return () => {
    if (controls === next) {
      controls = null;
      pausedByUs = false;
    }
  };
}

/** Pauses the music if it is playing. Safe to call when nothing is registered. */
export function duckMusic() {
  if (!controls || pausedByUs || !controls.isPlaying()) {
    return;
  }

  controls.pause();
  pausedByUs = true;
}

/** Resumes the music, but only if duckMusic paused it in the first place. */
export function unduckMusic() {
  if (!pausedByUs) {
    return;
  }

  pausedByUs = false;
  controls?.resume();
}
