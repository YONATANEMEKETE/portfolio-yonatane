import { beforeEach, describe, expect, it, vi } from 'vitest';

import { duckMusic, registerMusicControls, unduckMusic } from './music-ducking';

function controls(isPlaying: boolean) {
  return {
    isPlaying: vi.fn(() => isPlaying),
    pause: vi.fn(),
    resume: vi.fn(),
  };
}

beforeEach(() => {
  // Unregistering between tests keeps the module-level state honest.
  registerMusicControls(controls(false))();
});

describe('music ducking', () => {
  it('pauses and resumes the music around a sound', () => {
    const music = controls(true);
    registerMusicControls(music);

    duckMusic();
    expect(music.pause).toHaveBeenCalledTimes(1);

    unduckMusic();
    expect(music.resume).toHaveBeenCalledTimes(1);
  });

  it('leaves paused music alone and does not resume it later', () => {
    const music = controls(false);
    registerMusicControls(music);

    duckMusic();
    unduckMusic();

    expect(music.pause).not.toHaveBeenCalled();
    expect(music.resume).not.toHaveBeenCalled();
  });

  it('only pauses once across overlapping ducks', () => {
    const music = controls(true);
    registerMusicControls(music);

    duckMusic();
    duckMusic();
    expect(music.pause).toHaveBeenCalledTimes(1);

    unduckMusic();
    unduckMusic();
    expect(music.resume).toHaveBeenCalledTimes(1);
  });

  it('does nothing when no player is registered', () => {
    registerMusicControls(controls(false))();

    expect(() => {
      duckMusic();
      unduckMusic();
    }).not.toThrow();
  });

  it('stops controlling a player once unregistered', () => {
    const music = controls(true);
    const unregister = registerMusicControls(music);

    unregister();
    duckMusic();

    expect(music.pause).not.toHaveBeenCalled();
  });
});
