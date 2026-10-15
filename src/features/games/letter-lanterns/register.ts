import { type ComponentType, createElement } from 'react';

import { type GameApi, type GameDef, registerGame } from '@/core/games';

import { LANTERN_FACTS } from './facts';
import { letterLanternsI18n } from './i18n';
import type { LetterLanternsConfig } from './logic';

export const LETTER_LANTERNS_ID = 'letter-lanterns';

/**
 * The component is required on first render, so registering the game (also in tests that call `registerFeatures()`)
 * keeps UI modules (sound / expo-audio, gesture handler, Reanimated) out of the import graph.
 */
const LazyLetterLanternsGame: ComponentType<GameApi<LetterLanternsConfig>> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { LetterLanternsGame } = require('./LetterLanternsGame') as typeof import('./LetterLanternsGame');
  return createElement(LetterLanternsGame, props);
};

/** Art names used by the game (tested with `hasArt`). */
export const LETTER_LANTERNS_ART = ['object.lantern-ramadan', 'garden.stars', 'garden.moon', 'ui.sparkle', 'object.scroll', 'object.pen', 'object.inkwell'] as const;

export const letterLanternsGame: GameDef<LetterLanternsConfig> = {
  id: LETTER_LANTERNS_ID,
  challengeCount: 24,
  topicId: 'arabic',
  i18n: letterLanternsI18n,
  coverArt: 'object.lantern-ramadan',
  hintArt: 'object.lantern-ramadan',
  component: LazyLetterLanternsGame,
  levels: [
    {
      level: 1,
      config: { mode: 'isolated', targets: 8, lanterns: 4, riseSeconds: 11, factRules: [{ factId: LANTERN_FACTS.dots.id, rule: 'dotsConfusion' }] },
      facts: [LANTERN_FACTS.dots, LANTERN_FACTS.alphabet],
    },
    {
      level: 2,
      config: { mode: 'forms', targets: 8, lanterns: 4, riseSeconds: 12, factRules: [{ factId: LANTERN_FACTS.joining.id, rule: 'formMistakes' }] },
      facts: [LANTERN_FACTS.joining],
    },
    {
      level: 3,
      config: { mode: 'harakat', targets: 8, lanterns: 4, riseSeconds: 12, factRules: [{ factId: LANTERN_FACTS.harakat.id, rule: 'vowelConfusion' }] },
      facts: [LANTERN_FACTS.harakat],
    },
  ],
  teaches: { questionKeys: ['quest:arabic-dots-ba', 'quest:arabic-28', 'quest:arabic-rtl', 'quest:arabic-fatha'] },
  order: 10,
};

export function registerLetterLanternsGame(): void {
  registerGame(letterLanternsGame);
}
