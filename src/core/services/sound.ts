import { type AudioPlayer, createAudioPlayer } from 'expo-audio';

import { configureAudioSession } from './audioSession';

export type SoundName = 'click' | 'success' | 'failure' | 'reward';

const SOURCES: Record<SoundName, number> = {
  click: require('../../../assets/sounds/click.wav'),
  success: require('../../../assets/sounds/success.wav'),
  failure: require('../../../assets/sounds/failure.wav'),
  reward: require('../../../assets/sounds/reward.wav'),
};

const VOLUME: Record<SoundName, number> = { click: 0.7, success: 0.9, failure: 0.8, reward: 1 };

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

/** Plays a short UI sound. Audio is optional: failures are ignored so the app keeps working. */
export function playSound(name: SoundName): void {
  void configureAudioSession()
    .then(() => {
      const player = playerFor(name);
      if (!player) return;
      return player.seekTo(0).then(() => player.play());
    })
    .catch(() => undefined);
}
