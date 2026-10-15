import * as Speech from 'expo-speech';
import { Linking, Platform } from 'react-native';

import {
  arabicVoiceStatus,
  detectArabicVoice,
  onArabicSpeechMissing,
  openTextToSpeechSettings,
  pickArabicVoice,
  recheckArabicVoice,
  resetArabicVoiceForTests,
  speakArabic,
} from '@/core/services/speech';

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  getAvailableVoicesAsync: jest.fn(),
  VoiceQuality: { Default: 'Default', Enhanced: 'Enhanced' },
}));

const voices = Speech.getAvailableVoicesAsync as jest.Mock;
const speak = Speech.speak as jest.Mock;

const voice = (identifier: string, language: string): Speech.Voice =>
  ({ identifier, name: identifier, language, quality: Speech.VoiceQuality.Default }) as Speech.Voice;

// Android (Google TTS) lists every voice, also the ones whose data is not downloaded yet.
const GOOGLE_VOICES = [
  voice('en-us-x-iog-local', 'en-US'),
  voice('ar-xa-x-arc-network', 'ar'),
  voice('ar-language', 'ar'),
  voice('ar-xa-x-arz-local', 'ar'),
];

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('Arabic speech', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetArabicVoiceForTests();
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('prefers an installed/offline Arabic voice and ignores other languages', () => {
    expect(pickArabicVoice(GOOGLE_VOICES)?.identifier).toBe('ar-xa-x-arz-local');
    expect(pickArabicVoice([voice('ar-xa-x-arc-network', 'ar')])?.identifier).toBe('ar-xa-x-arc-network');
    expect(pickArabicVoice([voice('com.apple.voice.compact.ar-001.Maged', 'ar-001')])?.identifier).toBe(
      'com.apple.voice.compact.ar-001.Maged',
    );
    expect(pickArabicVoice([voice('en-us-x-iog-local', 'en-US')])).toBeNull();
  });

  it('speaks with the chosen Arabic voice explicitly (no silent fallback to the default language)', async () => {
    voices.mockResolvedValue(GOOGLE_VOICES);
    expect(speakArabic('ب')).toBe(true);
    await flush();
    expect(arabicVoiceStatus()).toBe('available');
    expect(speak).toHaveBeenCalledWith('ب', expect.objectContaining({ language: 'ar', voice: 'ar-xa-x-arz-local' }));
    expect(Speech.stop).toHaveBeenCalled();
  });

  it('detects a device without Arabic voice once and reports every attempt to the hint', async () => {
    voices.mockResolvedValue([voice('en-us-x-iog-local', 'en-US')]);
    const missing = jest.fn();
    onArabicSpeechMissing(missing);

    await expect(detectArabicVoice()).resolves.toBe('missing');
    expect(speakArabic('ب')).toBe(false);
    expect(speakArabic('ت')).toBe(false);
    expect(speak).not.toHaveBeenCalled();
    expect(missing).toHaveBeenCalledTimes(2);
    expect(voices).toHaveBeenCalledTimes(1);
  });

  it('treats a failing voice query as missing', async () => {
    voices.mockRejectedValue(new Error('no engine'));
    await expect(detectArabicVoice()).resolves.toBe('missing');
  });

  it('shows the hint when an utterance fails (e.g. voice not downloaded and offline)', async () => {
    voices.mockResolvedValue(GOOGLE_VOICES);
    const missing = jest.fn();
    onArabicSpeechMissing(missing);
    await detectArabicVoice();
    speakArabic('ب');
    const options = speak.mock.calls[0][1] as Speech.SpeechOptions;
    options.onError?.(new Error('synthesis failed'));
    expect(missing).toHaveBeenCalledTimes(1);
    // The next tap tries again (it may work once the device is online).
    expect(speakArabic('ب')).toBe(true);
    expect(speak).toHaveBeenCalledTimes(2);
  });

  it('re-checks after the learner installed a voice', async () => {
    voices.mockResolvedValueOnce([]);
    await expect(detectArabicVoice()).resolves.toBe('missing');
    voices.mockResolvedValueOnce(GOOGLE_VOICES);
    await expect(recheckArabicVoice()).resolves.toBe('available');
    expect(speakArabic('ب')).toBe(true);
  });

  it('opens the Android text-to-speech settings', async () => {
    const os = Object.getOwnPropertyDescriptor(Platform, 'OS');
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
    try {
      const sendIntent = jest.spyOn(Linking, 'sendIntent').mockResolvedValue(undefined);
      await expect(openTextToSpeechSettings()).resolves.toBe(true);
      expect(sendIntent).toHaveBeenCalledWith('com.android.settings.TTS_SETTINGS');
    } finally {
      if (os) Object.defineProperty(Platform, 'OS', os);
    }
  });
});
