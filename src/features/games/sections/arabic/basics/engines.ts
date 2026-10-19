/*
 * Lazy engine loaders of the Arabic basics games. Keeping the UI modules out of the registration import graph (like
 * the existing games of this folder) means a test that only registers the games does not load react-native-svg,
 * reanimated and the game kit.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
export const loadConnectGame = () => (require('../shared/engineGames') as typeof import('../shared/engineGames')).ConnectGame;
export const loadMemoryGame = () => (require('../shared/engineGames') as typeof import('../shared/engineGames')).MemoryGame;
export const loadSequenceGame = () => (require('../shared/engineGames') as typeof import('../shared/engineGames')).SequenceGame;
/* eslint-enable @typescript-eslint/no-require-imports */
