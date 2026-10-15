import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { playRecitation, stopRecitation } from '@/features/learn/quests/services/recitation';
import { APP_AUDIO_MODE, configureAudioSession, resetAudioSessionForTests } from '@/core/services/audioSession';
import { playSound, resetSoundsForTests } from '@/core/services/sound';

jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(), setAudioModeAsync: jest.fn() }));

const setMode = setAudioModeAsync as jest.Mock;
const createPlayer = createAudioPlayer as jest.Mock;

function fakePlayer(): AudioPlayer {
  return {
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    isLoaded: false,
    playing: false,
    volume: 1,
  } as unknown as AudioPlayer;
}

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('audio session', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAudioSessionForTests();
    resetSoundsForTests();
    setMode.mockImplementation(() => Promise.resolve());
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    stopRecitation();
    jest.restoreAllMocks();
  });

  it('uses an audible, speaker, mix-with-others mode', () => {
    expect(APP_AUDIO_MODE).toEqual({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
      interruptionMode: 'mixWithOthers',
    });
  });

  it('configures the mode once and retries after a failure', async () => {
    setMode.mockImplementationOnce(() => Promise.reject(new Error('native')));
    await expect(configureAudioSession()).rejects.toThrow('native');
    await configureAudioSession();
    await configureAudioSession();
    expect(setMode).toHaveBeenCalledTimes(2);
    expect(setMode).toHaveBeenLastCalledWith(APP_AUDIO_MODE);
  });

  it('configures audible playback before a Quran player starts', async () => {
    let resumeConfiguration!: () => void;
    const player = fakePlayer();
    setMode.mockImplementationOnce(
      () => new Promise<void>((resolve) => { resumeConfiguration = resolve; }),
    );
    createPlayer.mockReturnValueOnce(player);

    const ended = jest.fn();
    expect(playRecitation(1, ended)).toBe(true);
    expect(setMode).toHaveBeenCalledWith(APP_AUDIO_MODE);
    expect(player.play).not.toHaveBeenCalled();

    resumeConfiguration();
    await configureAudioSession();
    await flush();
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(ended).not.toHaveBeenCalled();
  });

  it('still plays the recitation when the audio mode cannot be set', async () => {
    const player = fakePlayer();
    setMode.mockImplementation(() => Promise.reject(new Error('native')));
    createPlayer.mockReturnValueOnce(player);
    const ended = jest.fn();
    playRecitation(2, ended);
    await flush();
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(ended).not.toHaveBeenCalled();
  });

  it('plays UI sounds from the start, also when the audio mode or the rewind fails', async () => {
    const player = fakePlayer();
    (player.seekTo as jest.Mock).mockImplementation(() => Promise.reject(new Error('not loaded')));
    setMode.mockImplementation(() => Promise.reject(new Error('native')));
    createPlayer.mockReturnValue(player);

    playSound('click');
    await flush();
    playSound('click');
    await flush();

    expect(createPlayer).toHaveBeenCalledTimes(1); // players are cached per sound
    expect(player.seekTo).toHaveBeenCalledWith(0);
    expect(player.play).toHaveBeenCalledTimes(2);
  });
});
