import { type ComponentType, createElement } from 'react';

import { type GameApi, type GameDef, registerGame } from '@/core/games';

import { WORD_FACTS } from './facts';
import { wordBuilderI18n } from './i18n';
import type { WordBuilderConfig } from './logic';
import { WORDS } from './words';

export const WORD_BUILDER_ID = 'word-builder';

/**
 * The component is required on first render, so registering the game (also in tests that call `registerFeatures()`)
 * keeps UI modules (sound / expo-audio, gesture handler, Reanimated) out of the import graph.
 */
const LazyWordBuilderGame: ComponentType<GameApi<WordBuilderConfig>> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { WordBuilderGame } = require('./WordBuilderGame') as typeof import('./WordBuilderGame');
  return createElement(WordBuilderGame, props);
};

/** Art names used by the game (tested with `hasArt`). */
export const WORD_BUILDER_ART = [...new Set([...WORDS.map((w) => w.art), 'object.pen', 'object.inkwell', 'ui.sparkle'])];

export const wordBuilderGame: GameDef<WordBuilderConfig> = {
  id: WORD_BUILDER_ID,
  topicId: 'arabic',
  i18n: wordBuilderI18n,
  coverArt: 'object.book',
  hintArt: 'object.pen',
  component: LazyWordBuilderGame,
  levels: [
    {
      level: 1,
      config: {
        mode: 'build',
        words: 4,
        minLetters: 3,
        maxLetters: 3,
        anchors: ['nur'],
        ghosts: true,
        factRules: [
          { factId: WORD_FACTS.joining.id, rule: 'manyMistakes' },
          { factId: WORD_FACTS.nur.id, rule: 'wordMistakes', word: 'nur' },
        ],
      },
      facts: [WORD_FACTS.joining, WORD_FACTS.nur],
    },
    {
      level: 2,
      config: {
        mode: 'build',
        words: 3,
        minLetters: 4,
        maxLetters: 5,
        anchors: ['kitab', 'masjid'],
        ghosts: false,
        factRules: [
          { factId: WORD_FACTS.kitab.id, rule: 'wordMistakes', word: 'kitab' },
          { factId: WORD_FACTS.masjid.id, rule: 'wordMistakes', word: 'masjid' },
        ],
      },
      facts: [WORD_FACTS.kitab, WORD_FACTS.masjid],
    },
    {
      level: 3,
      config: { mode: 'missing', words: 5, minLetters: 3, maxLetters: 5, anchors: ['kitab'], ghosts: false, options: 4, factRules: [{ factId: WORD_FACTS.dots.id, rule: 'dotsConfusion' }] },
      facts: [WORD_FACTS.dots],
    },
  ],
  teaches: { questionKeys: ['quest:arabic-rtl', 'quest:arabic-masjid-word', 'quest:arabic-dots-ba'] },
  order: 20,
};

export function registerWordBuilderGame(): void {
  registerGame(wordBuilderGame);
}
