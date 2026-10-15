import type React from 'react';

import { hasArt } from '@/core/art';
import { type GameApi, type GameResultInput, getGame, validateGame } from '@/core/games';
import { translateNs } from '@/core/i18n';
import story from '@/features/stories/content/prophets/yusuf.json';

import { YUSUF_EVENTS, YUSUF_PATH_ART } from '../content';
import { yusufStoryI18n } from '../i18n';
import { nextEventChoices, storyPathResult, type YusufPathConfig } from '../logic';
import { registerYusufStoryPathGame, yusufStoryPathGame } from '../register';
import { YusufStoryPathGame } from '../YusufStoryPathGame';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerYusufStoryPathGame();

interface Node {
  props: Record<string, any>;
  findAll: (predicate: (node: Node) => boolean) => Node[];
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => Promise<unknown> | void) => Promise<void>;
  create: (element: React.ReactElement) => { root: Node; unmount: () => void };
};

const localize = (text: { en: string } | undefined) => text?.en ?? '';
const translate = (key: string, params?: Record<string, string | number>) => translateNs(yusufStoryI18n, 'en', key as never, params);
const press = async (root: Node, label: string) => {
  const button = root.findAll((node) => typeof node.props.onPress === 'function' && node.props.accessibilityLabel === label)[0];
  if (!button) throw new Error(`control not found: ${label}`);
  await act(() => button.props.onPress());
};

function api(config: YusufPathConfig, onComplete: (result: GameResultInput) => void): GameApi<YusufPathConfig> {
  return {
    gameId: yusufStoryPathGame.id,
    level: 1,
    config,
    facts: yusufStoryPathGame.levels.find((level) => level.config === config)!.facts,
    onComplete,
    onExit: jest.fn(),
    playSound: jest.fn(),
    haptic: jest.fn(),
    reducedMotion: true,
    challengeMode: false,
    language: 'en',
    t: translate,
    l: localize,
  };
}

describe('Yusuf Story Trail', () => {
  it('uses ten distinct story events', () => {
    expect(YUSUF_EVENTS).toHaveLength(10);
    expect(new Set(YUSUF_EVENTS.map((event) => event.id)).size).toBe(10);
    expect(() => validateGame(getGame(yusufStoryPathGame.id)!)).not.toThrow();
  });

  it('keeps the dream, well and storehouse timeline grounded in the story sources', () => {
    expect(YUSUF_EVENTS.find((event) => event.id === 'dream')?.text).toEqual(story.intro);
    expect(YUSUF_EVENTS.find((event) => event.id === 'brothers')?.text).toEqual(story.scenes[0].text);
    expect(YUSUF_EVENTS.find((event) => event.id === 'king-dream')?.sources).toEqual([{ sourceName: 'Quran', sourceReference: '12:43–49' }]);
    for (const event of YUSUF_EVENTS) expect(event.sources.length).toBeGreaterThan(0);
  });

  it('uses existing object/place art only', () => {
    for (const art of YUSUF_PATH_ART) expect(hasArt(art)).toBe(true);
  });

  it('offers exactly one correct next-event card at every story stop', () => {
    for (const level of yusufStoryPathGame.levels) {
      for (let step = 0; step < level.config.events.length; step++) {
        const choices = nextEventChoices(level.config.events, step);
        expect(choices).toHaveLength(3);
        expect(choices.filter((choice) => choice.correct).map((choice) => choice.event.id)).toEqual([level.config.events[step]]);
      }
    }
  });

  it.each(yusufStoryPathGame.levels)('plays every story stop in level $level and reports a clean result', async (level) => {
    const onComplete = jest.fn();
    let tree!: { root: Node; unmount: () => void };
    await act(async () => { tree = create(<YusufStoryPathGame {...api(level.config, onComplete)} />); });
    for (const eventId of level.config.events) {
      const event = YUSUF_EVENTS.find((item) => item.id === eventId)!;
      await press(tree.root, localize(event.title));
    }
    expect(onComplete).toHaveBeenCalledWith(storyPathResult(level.config, 0));
    await act(() => tree.unmount());
  });
});