import type React from 'react';

import { createInitialData } from '@/core/services/engine';
import { useAppStore } from '@/core/store/appStore';
import { registerArkOfNuhGame } from '@/features/games/ark-of-nuh/register';
import { registerYusufStorehouseGame } from '@/features/games/yusuf-storehouse/register';
import StoryScreen from '@/features/stories/screens/StoryScreen';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
const mockParams = { id: 'nuh' };
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args), back: jest.fn(), replace: jest.fn(), canGoBack: () => true },
  useLocalSearchParams: () => mockParams,
  useFocusEffect: () => undefined,
}));
// Reanimated 4 needs the worklets runtime – use its official mock in tests.
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

// Only these games (not registerFeatures()): other games' modules must not affect these tests.
registerArkOfNuhGame();
registerYusufStorehouseGame();

interface ReactTestInstance {
  props: Record<string, any>;
  findAll: (predicate: (node: ReactTestInstance) => boolean) => ReactTestInstance[];
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => Promise<unknown> | void) => Promise<void>;
  create: (element: React.ReactElement) => { root: ReactTestInstance; unmount: () => void };
};

/** The story overview links to the story's mini-game (Nuh → Ark of Nuh, Yusuf → Yusuf's Storehouse). */
describe('story → game link', () => {
  beforeEach(() => {
    useAppStore.setState({ ...createInitialData('en'), hydrated: true, celebrations: [] });
    mockPush.mockClear();
  });

  it.each([
    ['nuh', 'ark-of-nuh'],
    ['yusuf', 'yusuf-storehouse'],
  ])('%s opens %s', async (story, game) => {
    mockParams.id = story;
    let tree!: { root: ReactTestInstance; unmount: () => void };
    await act(async () => {
      tree = create(<StoryScreen />);
    });
    const button = tree.root.findAll((n) => typeof n.props.onPress === 'function' && n.props.accessibilityLabel === 'Play the game')[0];
    expect(button).toBeDefined();
    await act(async () => button.props.onPress());
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/game/[id]', params: { id: game } });
    await act(async () => tree.unmount());
  });

  it('shows no game link for a story without a game', async () => {
    mockParams.id = 'adam';
    let tree!: { root: ReactTestInstance; unmount: () => void };
    await act(async () => {
      tree = create(<StoryScreen />);
    });
    expect(tree.root.findAll((n) => n.props.accessibilityLabel === 'Play the game')).toHaveLength(0);
    await act(async () => tree.unmount());
  });
});
