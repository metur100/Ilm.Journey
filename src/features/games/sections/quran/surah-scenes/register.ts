import { type GameDef, registerGame } from '@/core/games';
import type { BuildPart } from '@/core/games/kit';
import type { LocalizedText } from '@/core/models';

import { nsText, quoteFact } from '../shared/facts';
import { lazyComponent } from '../shared/game';
import { ayahMeaning, ayahRef } from '../shared/quran';
import { type ScenesKey, surahScenesI18n } from './i18n';

/*
 * Scenes of the Surahs (BuildScene). The scene grows piece by piece; each piece's caption is the translation of the
 * ayah it comes from (data). The events are narrated, not played: no army, no stones, no people – only the place,
 * the animals and the birds the ayahs mention.
 * L1 Al-Fil: in the order of the surah, with silhouettes. L2 Quraysh: any order, with silhouettes.
 * L3 Al-Ghashiyah 88:17–20: no silhouettes – place each sign of creation where it belongs.
 */

export interface ScenesConfig {
  scene: string;
  parts: BuildPart[];
  ordered: boolean;
  ghosts: boolean;
  hints: boolean;
  prompt: ScenesKey;
  reveal: { title: LocalizedText; caption: LocalizedText };
}

const L = (key: ScenesKey) => nsText(surahScenesI18n, key);
const cap = (s: number, a: number): LocalizedText => {
  const m = ayahMeaning(s, a);
  return { en: `${ayahRef(s, a)} “${m.en}”`, de: `${ayahRef(s, a)} „${m.de}“`, bs: `${ayahRef(s, a)} „${m.bs}“` };
};

const part = (id: string, label: ScenesKey, art: string, slot: BuildPart['slot'], caption: LocalizedText): BuildPart => ({ id, label: L(label), art, slot, caption });

const FACTS = {
  fil: quoteFact({ id: 'fil-scene', surah: 105, from: 1, to: 5, art: 'quran.puzzle-fil' }),
  quraysh: quoteFact({ id: 'quraysh-scene', surah: 106, from: 1, to: 4, art: 'quran.caravan' }),
  ghashiyah: quoteFact({ id: 'ghashiyah-signs', surah: 88, from: 17, to: 20, art: 'quran.sky-dome' }),
};

export const surahScenesGame: GameDef<ScenesConfig> = {
  id: 'surah-scenes',
  topicId: 'quran',
  i18n: surahScenesI18n,
  coverArt: 'quran.puzzle-fil',
  hintArt: 'kit.blocks',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyComponent(() => (require('./SurahScenesGame') as typeof import('./SurahScenesGame')).SurahScenesGame),
  levels: [
    {
      level: 1,
      config: {
        scene: 'quran.valley-makkah',
        ordered: true,
        ghosts: true,
        hints: true,
        prompt: 'play.promptFil',
        parts: [
          part('kaaba', 'part.kaaba', 'place.kaaba', { x: 0.36, y: 0.5, w: 0.28, h: 0.32 }, L('cap.kaaba')),
          part('elephant', 'part.elephant', 'animal.elephant', { x: 0.04, y: 0.56, w: 0.28, h: 0.3 }, cap(105, 1)),
          part('birds-1', 'part.birds', 'animal.birds', { x: 0.08, y: 0.06, w: 0.36, h: 0.2 }, cap(105, 3)),
          part('birds-2', 'part.birds', 'animal.birds', { x: 0.54, y: 0.14, w: 0.34, h: 0.2 }, cap(105, 3)),
        ],
        reveal: { title: L('reveal.fil'), caption: ayahMeaning(105, 1) },
      },
      facts: [FACTS.fil],
    },
    {
      level: 2,
      config: {
        scene: 'quran.caravan-road',
        ordered: false,
        ghosts: true,
        hints: false,
        prompt: 'play.promptQuraysh',
        parts: [
          part('caravan', 'part.caravan', 'quran.caravan', { x: 0.06, y: 0.56, w: 0.44, h: 0.3 }, cap(106, 1)),
          part('winter', 'part.winter', 'quran.winter', { x: 0.04, y: 0.06, w: 0.22, h: 0.24 }, cap(106, 2)),
          part('summer', 'part.summer', 'quran.summer', { x: 0.74, y: 0.04, w: 0.22, h: 0.3 }, cap(106, 2)),
          part('house', 'part.house', 'place.kaaba', { x: 0.6, y: 0.5, w: 0.26, h: 0.3 }, cap(106, 3)),
          part('food', 'part.food', 'quran.food-safety', { x: 0.36, y: 0.24, w: 0.26, h: 0.22 }, cap(106, 4)),
        ],
        reveal: { title: L('reveal.quraysh'), caption: ayahMeaning(106, 3) },
      },
      facts: [FACTS.quraysh],
    },
    {
      level: 3,
      config: {
        scene: 'quran.open-land',
        ordered: false,
        ghosts: false,
        hints: false,
        prompt: 'play.promptGhashiyah',
        parts: [
          part('camels', 'part.camels', 'animal.camel', { x: 0.62, y: 0.52, w: 0.3, h: 0.28 }, cap(88, 17)),
          part('sky', 'part.sky', 'quran.sky-dome', { x: 0.06, y: 0.02, w: 0.88, h: 0.32 }, cap(88, 18)),
          part('mountains', 'part.mountains', 'quran.mountains', { x: 0.06, y: 0.4, w: 0.44, h: 0.36 }, cap(88, 19)),
          part('earth', 'part.earth', 'quran.earth-spread', { x: 0, y: 0.8, w: 1, h: 0.2 }, cap(88, 20)),
        ],
        reveal: { title: L('reveal.ghashiyah'), caption: ayahMeaning(88, 17) },
      },
      facts: [FACTS.ghashiyah],
    },
  ],
  order: 100,
};

export function registerSurahScenesGame(): void {
  registerGame(surahScenesGame);
}
