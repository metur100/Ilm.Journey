import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { playRecitation, stopRecitation } from '@/features/learn/quests/services/recitation';
import { configureAudioSession } from '@/core/services/audioSession';

jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(), setAudioModeAsync: jest.fn() }));

describe('audio session', () => {
  it('configures audible playback before a Quran player starts', async () => {
    let resumeConfiguration!: () => void;
    const setMode = setAudioModeAsync as jest.Mock;
    const createPlayer = createAudioPlayer as jest.Mock;
    const player = {
      play: jest.fn(),
      pause: jest.fn(),
      remove: jest.fn(),
      seekTo: jest.fn(() => Promise.resolve()),
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      isLoaded: false,
      playing: false,
    } as unknown as AudioPlayer;
    setMode.mockImplementationOnce(
      () => new Promise<void>((resolve) => { resumeConfiguration = resolve; }),
    );
    createPlayer.mockReturnValueOnce(player);

    const ended = jest.fn();
    expect(playRecitation(1, ended)).toBe(true);
    expect(setMode).toHaveBeenCalledWith({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });
    expect(player.play).not.toHaveBeenCalled();

    resumeConfiguration();
    await configureAudioSession();
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(ended).not.toHaveBeenCalled();

    stopRecitation();
  });
});