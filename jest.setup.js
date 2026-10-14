/* global jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Gesture handler + Reanimated (games): official jest setups.
require('react-native-gesture-handler/jestSetup');
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// expo-audio touches its native module at import time (absent under Jest). Core UI (Button → useFeedback → sound) and
// games import it, so every test that registers the features needs this. Tests may still override it per file.
jest.mock('expo-audio', () => {
  const player = () => ({
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
    replace: jest.fn(),
    remove: jest.fn(),
    release: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    volume: 1,
    playing: false,
  });
  return { createAudioPlayer: jest.fn(player), setAudioModeAsync: jest.fn(() => Promise.resolve()) };
});
