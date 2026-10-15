import type React from 'react';

import { type GameApi, type GameResultInput, getGame, validateGame } from '@/core/games';
import { translateNs } from '@/core/i18n';
import salahBasics from '@/features/learn/content/salah/salah-basics.json';

import { SalahGuideGame } from '../SalahGuideGame';
import { salahGuideI18n } from '../i18n';
import { PRAYER_IDS, RAKAHS } from '../../prayer-sky/content';
import { SALAH_GUIDE_ID, salahGuideGame, registerSalahGuideGame } from '../register';
import { poseChoices, RAKAH_MOVEMENTS, rakahsInGuide, salahGuideResult, type SalahGuideConfig } from '../logic';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerSalahGuideGame();

interface Node {
  props: Record<string, any>;
  findAll: (predicate: (node: Node) => boolean) => Node[];
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => Promise<unknown> | void) => Promise<void>;
  create: (element: React.ReactElement) => { root: Node; unmount: () => void };
};

const translate = (key: string, params?: Record<string, string | number>) => translateNs(salahGuideI18n, 'en', key as never, params);
const press = async (root: Node, label: string) => {
  const button = root.findAll((node) => typeof node.props.onPress === 'function' && node.props.accessibilityLabel === label)[0];
  if (!button) throw new Error(`control not found: ${label}`);
  await act(() => button.props.onPress());
};
const texts = (root: Node) => root.findAll((node) => typeof node.props.children === 'string').map((node) => node.props.children as string).join(' | ');

function api(config: SalahGuideConfig, onComplete: (result: GameResultInput) => void): GameApi<SalahGuideConfig> {
  return {
    gameId: SALAH_GUIDE_ID,
    level: 1,
    config,
    facts: salahGuideGame.levels[0].facts,
    onComplete,
    onExit: jest.fn(),
    playSound: jest.fn(),
    haptic: jest.fn(),
    reducedMotion: true,
    challengeMode: false,
    language: 'en',
    t: translate,
    l: (text) => text?.en ?? '',
  };
}

describe('Salah Guide', () => {
  it('covers all five prayers and exactly 17 fard rak‘ahs', () => {
    expect(PRAYER_IDS).toEqual(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']);
    expect(rakahsInGuide(PRAYER_IDS)).toBe(17);
    expect(salahGuideGame.challengeCount).toBe(17);
  });

  it('offers one correct next-posture choice for every movement and final sitting', () => {
    for (const [stepIndex, expected] of [...RAKAH_MOVEMENTS, 'final-sitting' as const].entries()) {
      const choices = poseChoices(expected, stepIndex);
      expect(choices).toHaveLength(3);
      expect(choices.filter((choice) => choice.correct).map((choice) => choice.pose)).toEqual([expected]);
      expect(new Set(choices.map((choice) => choice.pose)).size).toBe(3);
    }
  });

  it('uses sourced Salah movement content and registers a complete game', () => {
    expect(salahGuideGame.levels[0].facts[0].text).toEqual(salahBasics.lesson[0].body);
    expect(salahGuideGame.levels[0].facts[0].sources).toEqual(salahBasics.sources);
    expect(() => validateGame(getGame(SALAH_GUIDE_ID)!)).not.toThrow();
    for (const language of ['en', 'de', 'bs'] as const) {
      for (const key of ['title', 'description', 'howTo', 'pose.standing', 'pose.final-sitting']) {
        expect(translateNs(salahGuideI18n, language, key as never)).not.toBe(key);
      }
    }
  });

  it('walks through both Fajr rak‘ahs, final sitting, and reports the clean result', async () => {
    const onComplete = jest.fn();
    const config: SalahGuideConfig = { prayers: [...PRAYER_IDS], movementFactId: 'movements-all-prayers' };
    let tree!: { root: Node; unmount: () => void };
    await act(async () => { tree = create(<SalahGuideGame {...api(config, onComplete)} />); });

    for (const prayer of PRAYER_IDS) {
      await press(tree.root, translate('pose.takbir'));
      for (let rakah = 0; rakah < RAKAHS[prayer]; rakah++) {
        for (const pose of RAKAH_MOVEMENTS) await press(tree.root, translate(`pose.${pose}`));
      }
      await press(tree.root, translate('pose.final-sitting'));
      await press(tree.root, translate('pose.taslim'));
      if (prayer !== PRAYER_IDS[PRAYER_IDS.length - 1]) await press(tree.root, translate('play.nextPrayer'));
    }
    expect(texts(tree.root)).toContain('Isha complete · 4 fard rak‘ahs');
    await press(tree.root, translate('play.finish'));
    expect(onComplete).toHaveBeenCalledWith(salahGuideResult(config, 0));
    await act(() => tree.unmount());
  });
});