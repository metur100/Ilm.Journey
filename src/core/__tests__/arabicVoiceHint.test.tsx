import type React from 'react';
import { Linking, Platform } from 'react-native';

import { ArabicVoiceHint } from '@/core/components/audio/ArabicVoiceHint';
import { resetArabicVoiceForTests, speakArabic } from '@/core/services/speech';
import { createInitialData } from '@/core/services/engine';
import { useAppStore } from '@/core/store/appStore';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
  VoiceQuality: { Default: 'Default', Enhanced: 'Enhanced' },
}));

interface ReactTestInstance {
  props: Record<string, any>;
  findAll: (predicate: (node: ReactTestInstance) => boolean) => ReactTestInstance[];
}
interface ReactTestRenderer {
  root: ReactTestInstance;
  unmount: () => void;
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => Promise<unknown> | void) => Promise<void>;
  create: (element: React.ReactElement) => ReactTestRenderer;
};

const texts = (root: ReactTestInstance) =>
  root
    .findAll((n) => typeof n.props.children === 'string')
    .map((n) => n.props.children as string)
    .join(' | ');

describe('ArabicVoiceHint', () => {
  const os = Object.getOwnPropertyDescriptor(Platform, 'OS');

  beforeEach(() => {
    resetArabicVoiceForTests('missing');
    useAppStore.setState({ ...createInitialData('en'), hydrated: true });
    Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });
  });

  afterEach(() => {
    if (os) Object.defineProperty(Platform, 'OS', os);
    jest.restoreAllMocks();
  });

  it('stays hidden until Arabic speech fails, then offers the TTS settings', async () => {
    const sendIntent = jest.spyOn(Linking, 'sendIntent').mockResolvedValue(undefined);
    let renderer!: ReactTestRenderer;
    await act(async () => {
      renderer = create(<ArabicVoiceHint />);
    });
    expect(texts(renderer.root)).toBe('');

    await act(async () => {
      expect(speakArabic('ب')).toBe(false);
    });
    expect(texts(renderer.root)).toContain('No Arabic voice on this device');

    const open = renderer.root.findAll((n) => typeof n.props.onPress === 'function' && n.props.accessibilityLabel === 'Open voice settings')[0];
    expect(open).toBeDefined();
    await act(async () => open!.props.onPress());
    expect(sendIntent).toHaveBeenCalledWith('com.android.settings.TTS_SETTINGS');
    expect(texts(renderer.root)).toBe('');
    await act(async () => renderer.unmount());
  });
});
