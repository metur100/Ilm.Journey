import { type GameDef, type GameFact, registerGame } from '@/core/games';
import type { KitItem } from '@/core/games/kit';
import { QURAN_SOURCE } from '@/features/quran';

import { nsText, quoteFact } from '../shared/facts';
import { lazyComponent } from '../shared/game';
import { ayahTiles, ayah, juzAmma, wordItems } from '../shared/quran';
import { ayahBuilderI18n } from './i18n';

/*
 * Ayah Builder (WordTiles, right-to-left; rework of the v2 game – same id). One ayah after another.
 * L1: Al-Ikhlas with the growing preview, the translation and hints. L2: Al-Kawthar with extra words that do not
 * belong. L3: Al-Falaq from memory – only the meaning is shown, no preview line, extra words, no hints.
 */

export interface AyahRoundDef {
  surah: number;
  ayah: number;
  target: KitItem[];
  distractors: KitItem[];
}

export interface AyahBuilderConfig {
  rounds: AyahRoundDef[];
  hints: boolean;
  /** Show the built text above the line. */
  preview: boolean;
  mode: 'guided' | 'extra' | 'memory';
}

/** Words of another ayah that never look like a word of the target (verified data text). */
export function distractorsFor(target: KitItem[], from: [number, number], count: number): KitItem[] {
  const own = new Set(target.map((t) => t.arabic));
  return ayahTiles(ayah(from[0], from[1]).arabic)
    .filter((w) => !own.has(w))
    .slice(0, count)
    .map((w, i) => ({ id: `x${from[0]}-${from[1]}-${i}`, arabic: w, quran: true }));
}

function round(s: number, a: number, extra?: [number, number], count = 0): AyahRoundDef {
  const target = wordItems(s, a);
  return { surah: s, ayah: a, target, distractors: extra ? distractorsFor(target, extra, count) : [] };
}

const JUZ = juzAmma();
const FIRST = JUZ[0];
const LAST = JUZ[JUZ.length - 1];

export const AYAH_FACTS = {
  // Quest lesson `quran-ikhlas`.
  ikhlas: {
    id: 'ikhlas-third',
    text: {
      en: 'Surah Al-Ikhlas describes Allah: He is One, everyone depends on Him, He has no children and no parents, and nothing is like Him. The Prophet ﷺ said it is equal to a third of the Quran.',
      de: 'Sure Al-Ichlas beschreibt Allah: Er ist Einer, alle sind auf Ihn angewiesen, Er hat weder Kinder noch Eltern, und nichts ist Ihm gleich. Der Prophet ﷺ sagte, sie gleiche einem Drittel des Korans.',
      bs: "Sura El-Ihlas opisuje Allaha: On je Jedan, svi ovise o Njemu, nema djece ni roditelja i ništa Mu nije ravno. Poslanik ﷺ je rekao da je ona ravna trećini Kur'ana.",
    },
    sources: [{ sourceName: 'Sahih al-Bukhari', sourceReference: '5013' }],
    art: 'quran.one-star',
  },
  kawthar: quoteFact({ id: 'kawthar-gift', surah: 108, from: 1, to: 3, art: 'object.prayer-mat' }),
  // Composed from the data (`juz` field).
  juzAmma: {
    id: 'juz-amma',
    text: nsText(ayahBuilderI18n, 'fact.juzAmma', { count: JUZ.length, first: FIRST.nameTransliterated, from: FIRST.number, last: LAST.nameTransliterated, to: LAST.number }),
    sources: [
      { sourceName: 'Quran', sourceReference: `${FIRST.number}–${LAST.number}` },
      { sourceName: QURAN_SOURCE.text, sourceReference: '' },
    ],
    art: 'object.book',
  },
  // Quest lesson `quran-falaq-nas`.
  falaqNas: {
    id: 'falaq-nas-before-sleep',
    text: {
      en: 'Al-Falaq and An-Nas are the last two surahs of the Quran. In them we seek refuge with Allah from every harm. The Prophet ﷺ used to recite them, together with Al-Ikhlas, before going to sleep.',
      de: 'Al-Falaq und An-Nas sind die letzten beiden Suren des Korans. In ihnen suchen wir bei Allah Zuflucht vor allem Übel. Der Prophet ﷺ pflegte sie zusammen mit Al-Ichlas vor dem Schlafen zu rezitieren.',
      bs: "El-Felek i En-Nas su posljednje dvije sure Kur'ana. U njima tražimo utočište kod Allaha od svakog zla. Poslanik ﷺ ih je, zajedno s El-Ihlasom, učio prije spavanja.",
    },
    sources: [{ sourceName: 'Sahih al-Bukhari', sourceReference: '5017' }],
    art: 'garden.moon',
    reviewKey: 'learn:quran-etiquette-4',
  },
} satisfies Record<string, GameFact>;

export const ayahBuilderGame: GameDef<AyahBuilderConfig> = {
  id: 'ayah-builder',
  topicId: 'quran',
  i18n: ayahBuilderI18n,
  coverArt: 'quran.mushaf-rahle',
  hintArt: 'kit.tiles',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyComponent(() => (require('./AyahBuilderGame') as typeof import('./AyahBuilderGame')).AyahBuilderGame),
  levels: [
    { level: 1, config: { mode: 'guided', hints: true, preview: true, rounds: [1, 2, 3, 4].map((a) => round(112, a)) }, facts: [AYAH_FACTS.ikhlas] },
    {
      level: 2,
      config: { mode: 'extra', hints: false, preview: true, rounds: [round(108, 1, [103, 2], 2), round(108, 2, [112, 3], 2), round(108, 3, [103, 1], 1)] },
      facts: [AYAH_FACTS.kawthar, AYAH_FACTS.juzAmma],
    },
    {
      level: 3,
      config: { mode: 'memory', hints: false, preview: false, rounds: [round(113, 1, [114, 1], 2), round(113, 2, [114, 4], 2), round(113, 3, [114, 2], 1), round(113, 4, [114, 5], 2), round(113, 5, [114, 3], 1)] },
      facts: [AYAH_FACTS.falaqNas],
    },
  ],
  teaches: { questionKeys: ['learn:quran-etiquette-4'] },
  order: 10,
};

export function registerAyahBuilderGame(): void {
  registerGame(ayahBuilderGame);
}
