import { type GameDef, registerGame } from '@/core/games';
import type { TimelineEvent, TimelineMark } from '@/core/games/kit';

import { surahFactText, surahSources } from '../shared/facts';
import { lazyComponent } from '../shared/game';
import { surah, surahMeaning, surahName } from '../shared/quran';

import { surahOrderI18n } from './i18n';

/*
 * Surah Ruler (TimelineSlider). The ruler's ticks are surah numbers of the mushaf (L1: 110–114, L2: 105–114) or,
 * in the L3 twist, numbers of ayahs (3–9). Every value comes from the generated data.
 */

export interface SurahOrderConfig {
  marks: TimelineMark[];
  events: TimelineEvent[];
  mode: 'order' | 'count';
  hints: boolean;
  /** Event id → fact id. */
  factOf: Record<string, string>;
}

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const marks = (values: number[]): TimelineMark[] => values.map((v) => ({ id: `m${v}`, label: String(v) }));
const event = (n: number, mark: number): TimelineEvent => ({ id: `s${n}`, label: surahName(n), sub: surahMeaning(n), mark: `m${mark}` });

const fact = (id: string, n: number, art: string) => ({ id, text: surahFactText(n), sources: surahSources(n), art });
const FACTS = {
  falaq: fact('falaq-113', 113, 'quran.puzzle-duha'),
  ikhlas: fact('ikhlas-112', 112, 'quran.one-star'),
  quraysh: fact('quraysh-106', 106, 'quran.caravan'),
  kawthar: fact('kawthar-108', 108, 'object.prayer-mat'),
  maun: fact('maun-107', 107, 'food.bread'),
};

const COUNT_SURAHS = [108, 112, 105, 114, 107, 99, 104];

export const surahOrderGame: GameDef<SurahOrderConfig> = {
  id: 'surah-order',
  topicId: 'quran',
  i18n: surahOrderI18n,
  coverArt: 'quran.mushaf-ribbons',
  hintArt: 'kit.timeline',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyComponent(() => (require('./SurahOrderGame') as typeof import('./SurahOrderGame')).SurahOrderGame),
  levels: [
    {
      level: 1,
      config: { mode: 'order', hints: true, marks: marks(range(110, 114)), events: [113, 110, 112, 114, 111].map((n) => event(n, n)), factOf: { s113: FACTS.falaq.id, s112: FACTS.ikhlas.id } },
      facts: [FACTS.falaq, FACTS.ikhlas],
    },
    {
      level: 2,
      config: { mode: 'order', hints: false, marks: marks(range(105, 114)), events: [106, 109, 105, 108, 107, 114].map((n) => event(n, n)), factOf: { s106: FACTS.quraysh.id } },
      facts: [FACTS.quraysh],
    },
    {
      level: 3,
      config: {
        mode: 'count',
        hints: false,
        marks: marks(range(3, 9)),
        events: COUNT_SURAHS.map((n) => event(n, surah(n).ayahCount)),
        factOf: { s108: FACTS.kawthar.id, s107: FACTS.maun.id },
      },
      facts: [FACTS.kawthar, FACTS.maun],
    },
  ],
  order: 120,
};

export function registerSurahOrderGame(): void {
  registerGame(surahOrderGame);
}
