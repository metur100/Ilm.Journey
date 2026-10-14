
import type React from 'react';

import { EMPTY_GAMES, useGamesStore } from '@/core/games';
import { DEMO_GAME_ID } from '@/core/games/demo/register';
import { GameShell } from '@/core/games/shell/GameShell';
import { createGarden, useGardenStore } from '@/core/garden';
import { createInitialData } from '@/core/services/engine';
import { XP } from '@/core/services/xp';
import { useAppStore } from '@/core/store/appStore';
import { registerFeatures } from '@/features';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
  useFocusEffect: () => undefined,
}));
jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

registerFeatures();

/** Minimal local typing of react-test-renderer (the package ships no types here). */
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
  act: (callback: () => Promise<unknown>) => Promise<void>;
  create: (element: React.ReactElement) => ReactTestRenderer;
};

const byLabel = (root: ReactTestInstance, label: string | RegExp) =>
  root.findAll((n) => typeof n.props.onPress === 'function' && (typeof label === 'string' ? n.props.accessibilityLabel === label : label.test(String(n.props.accessibilityLabel ?? ''))))[0];

const press = async (node: ReactTestInstance | undefined) => {
  if (!node) throw new Error('control not found');
  await act(async () => node.props.onPress());
};

const texts = (root: ReactTestInstance) =>
  root
    .findAll((n) => typeof n.props.children === 'string')
    .map((n) => n.props.children as string)
    .join(' | ');

describe('GameShell', () => {
  beforeEach(() => {
    useAppStore.setState({ ...createInitialData('en'), hydrated: true, celebrations: [], settings: { ...createInitialData('en').settings, sound: false, haptics: false, reducedMotion: true } });
    useGamesStore.setState({ ...EMPTY_GAMES });
    useGardenStore.setState({ ...createGarden(), seeds: 0, water: 0 });
  });

  it('runs intro → how to play → levels → play → result and rewards once', async () => {
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(<GameShell gameId={DEMO_GAME_ID} />);
    });
    const root = tree.root;
    expect(texts(root)).toContain('Star Path');

    await press(byLabel(root, 'Let’s play'));
    expect(texts(root)).toContain('How to play');
    await press(byLabel(root, 'Got it'));
    expect(useGamesStore.getState().games[DEMO_GAME_ID].introSeen).toBe(true);

    // Level 2 is locked until level 1 is done.
    expect(byLabel(root, /^Level 2/)).toBeUndefined();
    await press(byLabel(root, /^Level 1/));

    // Play: tap star 2 first (mistake), then 1, 2, 3.
    await press(byLabel(root, 'Star 2'));
    for (const n of [1, 2, 3]) await press(byLabel(root, `Star ${n}`));

    expect(texts(root)).toContain('You learned');
    expect(texts(root)).toContain('Quran 6:74–79');
    expect(useAppStore.getState().xpAwards[`game:${DEMO_GAME_ID}:1`]).toBe(XP.gameLevel);
    expect(useAppStore.getState().xpAwards[`game:${DEMO_GAME_ID}:1:perfect`]).toBeUndefined();
    expect(useGamesStore.getState().games[DEMO_GAME_ID].levels['1']?.stars).toBe(2);
    expect(useGardenStore.getState().seeds).toBeGreaterThan(0);

    // Replay perfectly: the perfect bonus comes once, the level XP not again.
    await press(byLabel(root, 'Play again'));
    for (const n of [1, 2, 3]) await press(byLabel(root, `Star ${n}`));
    expect(useAppStore.getState().xpAwards[`game:${DEMO_GAME_ID}:1:perfect`]).toBe(XP.gamePerfectBonus);
    expect(useGamesStore.getState().games[DEMO_GAME_ID].levels['1']).toMatchObject({ stars: 3, plays: 2 });

    // Next level opens.
    expect(byLabel(root, 'Next level')).toBeDefined();
    await act(async () => tree.unmount());
  }, 60000);

  it('opens returning players at the level select', async () => {
    useGamesStore.getState().markIntroSeen(DEMO_GAME_ID);
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(<GameShell gameId={DEMO_GAME_ID} />);
    });
    expect(texts(tree.root)).toContain('Choose a level');
    await act(async () => tree.unmount());
  });

  it('shows a message for unknown games', async () => {
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(<GameShell gameId="nope" />);
    });
    expect(texts(tree.root)).toContain('This game is not available.');
    await act(async () => tree.unmount());
  });
});
