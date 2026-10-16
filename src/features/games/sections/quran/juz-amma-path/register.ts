import { type GameDef, registerGame } from '@/core/games';
import type { KitPoint, PathStop } from '@/core/games/kit';
import { QURAN_SOURCE } from '@/features/quran';

import { nsText, surahFactText, surahSources } from '../shared/facts';
import { lazyComponent } from '../shared/game';
import { juzAmma, surahMeaning, surahName } from '../shared/quran';
import { juzPathI18n } from './i18n';

/*
 * Juz ʿAmma Path (PathTrace on a night sky). Each surah is a star; the learner traces them in mushaf order.
 * L1: the last six surahs (109–114) with numbers and the dashed guide. L2: ten surahs (105–114), no guide.
 * L3 twist: backwards from An-Nas (the usual way to memorise), stars scattered, names only, no guide.
 */

export interface JuzPathConfig {
  stops: PathStop[];
  showRoute: boolean;
  hints: boolean;
  backwards: boolean;
}

/** A winding constellation from the bottom of the sky to the top. */
function zigzag(n: number): KitPoint[] {
  const xs = [0.22, 0.5, 0.78, 0.5];
  return Array.from({ length: n }, (_, i) => ({ x: xs[i % xs.length] + (i % 2 ? 0.04 : -0.03), y: 0.88 - (i * 0.78) / Math.max(1, n - 1) }));
}

/** Scattered stars (not a simple zigzag) for the memory level. */
const SCATTER: KitPoint[] = [
  { x: 0.5, y: 0.88 },
  { x: 0.18, y: 0.74 },
  { x: 0.78, y: 0.7 },
  { x: 0.42, y: 0.6 },
  { x: 0.84, y: 0.46 },
  { x: 0.2, y: 0.44 },
  { x: 0.56, y: 0.34 },
  { x: 0.26, y: 0.2 },
  { x: 0.78, y: 0.14 },
];

function stops(numbers: number[], at: KitPoint[], withNumber: boolean): PathStop[] {
  return numbers.map((n, i) => {
    const meaning = surahMeaning(n);
    return {
      id: `s${n}`,
      label: surahName(n),
      sub: withNumber ? String(n) : undefined,
      at: at[i],
      caption: { en: `${n}. ${surahName(n)} – ${meaning.en}`, de: `${n}. ${surahName(n)} – ${meaning.de}`, bs: `${n}. ${surahName(n)} – ${meaning.bs}` },
    };
  });
}

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const JUZ = juzAmma();
const FIRST = JUZ[0];
const LAST = JUZ[JUZ.length - 1];

const FACTS = {
  nas: { id: 'nas-last', text: surahFactText(114), sources: surahSources(114), art: 'object.lantern' },
  kafirun: { id: 'kafirun-109', text: surahFactText(109), sources: surahSources(109), art: 'object.book' },
  nasr: { id: 'nasr-madani', text: surahFactText(110), sources: surahSources(110), art: 'place.madinah-city' },
  fil: { id: 'fil-105', text: surahFactText(105), sources: surahSources(105), art: 'quran.puzzle-fil' },
  juz: {
    id: 'juz-amma-surahs',
    text: nsText(juzPathI18n, 'fact.juzAmma', { count: JUZ.length, first: FIRST.nameTransliterated, from: FIRST.number, last: LAST.nameTransliterated, to: LAST.number }),
    sources: [
      { sourceName: 'Quran', sourceReference: `${FIRST.number}–${LAST.number}` },
      { sourceName: QURAN_SOURCE.text, sourceReference: '' },
    ],
    art: 'quran.juz-sky',
  },
};

export const juzPathGame: GameDef<JuzPathConfig> = {
  id: 'juz-amma-path',
  topicId: 'quran',
  i18n: juzPathI18n,
  coverArt: 'quran.juz-sky',
  hintArt: 'kit.route',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyComponent(() => (require('./JuzPathGame') as typeof import('./JuzPathGame')).JuzPathGame),
  levels: [
    { level: 1, config: { stops: stops(range(109, 114), zigzag(6), true), showRoute: true, hints: true, backwards: false }, facts: [FACTS.kafirun, FACTS.nas] },
    { level: 2, config: { stops: stops(range(105, 114), zigzag(10), true), showRoute: false, hints: false, backwards: false }, facts: [FACTS.fil, FACTS.nasr] },
    { level: 3, config: { stops: stops(range(106, 114).reverse(), SCATTER, false), showRoute: false, hints: false, backwards: true }, facts: [FACTS.juz] },
  ],
  order: 80,
};

export function registerJuzPathGame(): void {
  registerGame(juzPathGame);
}
