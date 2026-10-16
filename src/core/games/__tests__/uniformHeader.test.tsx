import type React from 'react';

import { EMPTY_GAMES, listGames, useGamesStore } from '@/core/games';
import { GameShell } from '@/core/games/shell/GameShell';
import { translateNs } from '@/core/i18n';
import { createInitialData } from '@/core/services/engine';
import { useAppStore } from '@/core/store/appStore';
import { registerFeatures } from '@/features';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
  useFocusEffect: () => undefined,
  useLocalSearchParams: () => ({}),
}));
jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

registerFeatures();

interface Node {
  props: Record<string, any>;
  findAll: (predicate: (node: Node) => boolean) => Node[];
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => Promise<unknown>) => Promise<void>;
  create: (element: React.ReactElement) => { root: Node; unmount: () => void };
};

/**
 * GAMES-V3 §1 / §5.3: the GameShell draws the only title bar. Renders level 1 of every registered game inside the
 * shell and checks that the game's title appears exactly once (in the shell header).
 */
describe('one header for all games', () => {
  const games = listGames({ includeDev: true });

  beforeEach(() => {
    useAppStore.setState({ ...createInitialData('en'), hydrated: true, celebrations: [], settings: { ...createInitialData('en').settings, sound: false, haptics: false, reducedMotion: true } });
    useGamesStore.setState({ ...EMPTY_GAMES });
  });

  it('has registered games', () => expect(games.length).toBeGreaterThan(0));

  it.each(games.map((g) => [g.id]))('%s shows its title only in the shell header', async (id) => {
    const def = games.find((g) => g.id === id)!;
    const title = translateNs(def.i18n, 'en', 'title');
    useGamesStore.getState().markIntroSeen(id);
    let tree!: { root: Node; unmount: () => void };
    await act(async () => {
      tree = create(<GameShell gameId={id} />);
    });
    const level1 = tree.root.findAll((n) => typeof n.props.onPress === 'function' && /^Level 1/.test(String(n.props.accessibilityLabel ?? '')))[0];
    expect(level1).toBeDefined();
    await act(async () => level1.props.onPress());
    expect(tree.root.findAll((n) => n.props.testID === 'game-header').length).toBeGreaterThan(0);
    const occurrences = tree.root.findAll((n) => typeof n.props.children === 'string' && n.props.children.trim() === title.trim() && typeof n.type === 'string').length;
    expect({ id, occurrences }).toEqual({ id, occurrences: 1 });
    await act(async () => tree.unmount());
  });
});
