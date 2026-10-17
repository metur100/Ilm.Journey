import { type AudioPlayer, createAudioPlayer } from 'expo-audio';

import { audioSessionReady } from './audioSession';

export type SoundName = 'click' | 'success' | 'failure' | 'reward';

const SOURCES: Record<SoundName, number> = {
  click: require('../../../assets/sounds/click.wav'),
  success: require('../../../assets/sounds/success.wav'),
  failure: require('../../../assets/sounds/failure.wav'),
  reward: require('../../../assets/sounds/reward.wav'),
};

const VOLUME: Record<SoundName, number> = { click: 1, success: 1, failure: 1, reward: 1 };

const players = new Map<SoundName, AudioPlayer>();

function playerFor(name: SoundName): AudioPlayer | null {
  try {
    let player = players.get(name);
    if (!player) {
      player = createAudioPlayer(SOURCES[name]);
      player.volume = VOLUME[name];
      players.set(name, player);
    }
    return player;
  } catch {
    return null;
  }
}

function rewindAndPlay(player: AudioPlayer): void {
  try {
    // Rewind first (the player stays at the end after the previous play), but never let a failed seek swallow the sound.
    player
      .seekTo(0)
      .catch(() => undefined)
      .then(() => player.play())
      .catch(() => undefined);
  } catch {
    // Audio is optional.
  }
}

/**
 * Plays a short UI sound. Audio is optional: failures are ignored so the app keeps working, and a failed audio-mode
 * call does not prevent playback (see docs/AUDIO.md).
 */
export function playSound(name: SoundName): void {
  void audioSessionReady().then(() => {
    const player = playerFor(name);
    if (player) rewindAndPlay(player);
  });
}

/** Tests: drop the cached players. */
export function resetSoundsForTests(): void {
  players.clear();
}
