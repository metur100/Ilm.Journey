import { type GameDef, registerGame } from '@/core/games';
import type { KitBox, SceneSpot } from '@/core/games/kit';
import type { LocalizedText } from '@/core/models';

import { nsText, quoteFact } from '../shared/facts';
import { lazyComponent } from '../shared/game';
import { ayahMeaning, ayahRef } from '../shared/quran';
import { type SignsKey, signsI18n } from './i18n';

/*
 * Signs Allah Swears By (TapScene). The oaths at the start of several surahs, found in illustrated scenes; each found
 * sign shows the translation of its ayah (data). L1: Ash-Shams 91:1–6 in the order of the ayahs, with hints.
 * L2: At-Tin 95:1–3 in any order, with a distractor. L3 twist: oaths of three surahs (92, 93, 86) one after another,
 * with distractors and no hints. Each level teaches other ayahs – L3 uses the sky scene again, but for the oaths of
 * other surahs (its spot ids name the surah).
 */

export interface SignsConfig {
  scene: string;
  spots: SceneSpot[];
  ordered: boolean;
  hints: boolean;
  prompt: SignsKey;
  /** Spot id → fact id. */
  factOf: Record<string, string>;
}

const cap = (s: number, a: number): LocalizedText => {
  const m = ayahMeaning(s, a);
  return { en: `${ayahRef(s, a)} “${m.en}”`, de: `${ayahRef(s, a)} „${m.de}“`, bs: `${ayahRef(s, a)} „${m.bs}“` };
};

const spot = (id: string, key: SignsKey, at: KitBox, ref?: [number, number]): SceneSpot => ({
  id,
  label: nsText(signsI18n, key),
  at,
  target: !!ref,
  caption: ref ? cap(ref[0], ref[1]) : undefined,
});

const FACTS = {
  shams: quoteFact({ id: 'shams-oaths', surah: 91, from: 1, to: 6, art: 'quran.signs-sky' }),
  tin: quoteFact({ id: 'tin-oaths', surah: 95, from: 1, to: 4, art: 'quran.puzzle-tin' }),
  duha: quoteFact({ id: 'duha-oaths', surah: 93, from: 1, to: 3, art: 'quran.puzzle-duha' }),
  tariq: quoteFact({ id: 'tariq-star', surah: 86, from: 1, to: 3, art: 'quran.juz-sky' }),
};

export const signsGame: GameDef<SignsConfig> = {
  id: 'signs-in-the-sky',
  topicId: 'quran',
  i18n: signsI18n,
  coverArt: 'quran.signs-sky',
  hintArt: 'kit.magnifier',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyComponent(() => (require('./SignsGame') as typeof import('./SignsGame')).SignsGame),
  levels: [
    {
      level: 1,
      config: {
        scene: 'quran.signs-sky',
        ordered: true,
        hints: true,
        prompt: 'play.promptShams',
        spots: [
          spot('sun', 'spot.sun', { x: 0.1, y: 0.1, w: 0.18, h: 0.25 }, [91, 1]),
          spot('moon', 'spot.moon', { x: 0.75, y: 0.15, w: 0.15, h: 0.22 }, [91, 2]),
          spot('day', 'spot.day', { x: 0.03, y: 0.42, w: 0.3, h: 0.24 }, [91, 3]),
          spot('night', 'spot.night', { x: 0.6, y: 0.42, w: 0.32, h: 0.22 }, [91, 4]),
          spot('sky', 'spot.sky', { x: 0.36, y: 0.02, w: 0.28, h: 0.2 }, [91, 5]),
          spot('earth', 'spot.earth', { x: 0.25, y: 0.76, w: 0.5, h: 0.22 }, [91, 6]),
        ],
        factOf: {},
      },
      facts: [FACTS.shams],
    },
    {
      level: 2,
      config: {
        scene: 'quran.puzzle-tin',
        ordered: false,
        hints: false,
        prompt: 'play.promptTin',
        spots: [
          spot('fig', 'spot.fig', { x: 0.04, y: 0.56, w: 0.38, h: 0.4 }, [95, 1]),
          spot('olive', 'spot.olive', { x: 0.54, y: 0.54, w: 0.4, h: 0.4 }, [95, 1]),
          spot('sinai', 'spot.sinai', { x: 0.5, y: 0.25, w: 0.45, h: 0.27 }, [95, 2]),
          spot('city', 'spot.city', { x: 0.02, y: 0.36, w: 0.4, h: 0.18 }, [95, 3]),
          spot('sun', 'spot.sun', { x: 0.74, y: 0.06, w: 0.18, h: 0.18 }),
        ],
        factOf: {},
      },
      facts: [FACTS.tin],
    },
    {
      level: 3,
      config: {
        scene: 'quran.signs-sky',
        ordered: true,
        hints: false,
        prompt: 'play.promptMixed',
        spots: [
          spot('lail-night', 'spot.night', { x: 0.6, y: 0.42, w: 0.32, h: 0.22 }, [92, 1]),
          spot('lail-day', 'spot.day', { x: 0.03, y: 0.42, w: 0.3, h: 0.24 }, [92, 2]),
          spot('brightness', 'spot.brightness', { x: 0.1, y: 0.1, w: 0.18, h: 0.25 }, [93, 1]),
          spot('tariq-sky', 'spot.sky', { x: 0.36, y: 0.02, w: 0.28, h: 0.2 }, [86, 1]),
          spot('star', 'spot.star', { x: 0.62, y: 0.04, w: 0.12, h: 0.14 }, [86, 3]),
          spot('not-moon', 'spot.moon', { x: 0.75, y: 0.15, w: 0.15, h: 0.22 }),
          spot('not-earth', 'spot.earth', { x: 0.25, y: 0.76, w: 0.5, h: 0.22 }),
        ],
        factOf: { 'lail-night': 'duha-oaths', 'lail-day': 'duha-oaths', brightness: 'duha-oaths', 'tariq-sky': 'tariq-star', star: 'tariq-star', 'not-moon': 'duha-oaths', 'not-earth': 'duha-oaths' },
      },
      facts: [FACTS.duha, FACTS.tariq],
    },
  ],
  order: 110,
};

export function registerSignsGame(): void {
  registerGame(signsGame);
}
