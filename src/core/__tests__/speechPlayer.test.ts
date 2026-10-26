import { createAudioPlayer } from 'expo-audio';

import { resetArabicVoiceForTests, speakArabic, stopSpeaking } from '@/core/services/speech';

jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn(), getAvailableVoicesAsync: jest.fn(), VoiceQuality: {} }));

jest.mock('../../../modules/audio-volume', () => ({
  canSynthesize: true,
  synthesizeSpeech: jest.fn((text: string) => Promise.resolve(`/cache/tts/${encodeURIComponent(text)}.wav`)),
  boostPlayer: jest.fn(() => Promise.resolve(true)),
  bindVolumeKeys: jest.fn(),
}));

type Listener = (status: { didJustFinish?: boolean; error?: string }) => void;

jest.mock('expo-audio', () => {
  const players: unknown[] = [];
  return {
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    createAudioPlayer: jest.fn(() => {
      const listeners: Listener[] = [];
      const player = {
        replace: jest.fn(),
        play: jest.fn(),
        pause: jest.fn(),
        remove: jest.fn(),
        addListener: jest.fn((_: string, l: Listener) => listeners.push(l)),
        finish: () => listeners.forEach((l) => l({ didJustFinish: true })),
      };
      players.push(player);
      return player;
    }),
    __players: players,
  };
});

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('speech player', () => {
  beforeEach(() => resetArabicVoiceForTests('available', 'ar-xa-x-arz-local'));

  it('plays every utterance through one reused player (no new media session per tap)', async () => {
    const onDone = jest.fn();
    for (const text of ['بَ', 'بِ', 'بُ', 'اَبْ', 'بَتْ', 'بَ']) {
      speakArabic(text, { onDone });
      await flush();
    }
    expect(createAudioPlayer).toHaveBeenCalledTimes(1);
    const [player] = (jest.requireMock('expo-audio') as { __players: { replace: jest.Mock; play: jest.Mock; remove: jest.Mock; finish: () => void }[] }).__players;
    expect(player.replace).toHaveBeenCalledTimes(6);
    expect(player.play).toHaveBeenCalledTimes(6);
    expect(player.remove).not.toHaveBeenCalled();
    // Each new utterance ended the one before it; the last one ends when the player finishes.
    expect(onDone).toHaveBeenCalledTimes(5);
    player.finish();
    expect(onDone).toHaveBeenCalledTimes(6);
    stopSpeaking();
    expect(onDone).toHaveBeenCalledTimes(6);
  });
});
