import { registerGame } from '@/core/games';

import { seerahGame } from '../shared/define';
import { blockFact, blockText } from '../shared/facts';
import { ayahFact, ayahMeaning } from '../shared/quran';
import { elephantI18n } from './i18n';

/*
 * The Year of the Elephant (episode 01, event "elephant"). Surah al-Fil is narrated, never "played": the learner
 * sets the scene (L1, the captions are the meanings of the ayahs from the generated Quran data), orders the ayahs
 * (L2) and sorts what the Quran says from what the Seerah reports add (L3 – the content labels these as fact /
 * interpretation, Ibn Hisham).
 */

const FACTS = {
  ctx: blockFact('elephant-army', 'e01.ctx1', { art: 'seerah.elephant-scene', reviewKey: 'seerah:e01-q1' }),
  surah: ayahFact('surah-al-fil', 105, 1, 2, 'seerah.elephant'),
  event: blockFact('turned-back', 'ev.elephant.0', { art: 'seerah.kaaba' }),
  birds: ayahFact('birds-in-flocks', 105, 3, 5, 'animal.birds'),
  year: blockFact('year-570', 'e01.main1', { art: 'seerah.makkah-valley' }),
  abrahah: blockFact('abrahah', 'ev.elephant.1', { art: 'seerah.elephant' }),
};

const A = (n: number) => ({ text: ayahMeaning(105, n) });

export const elephantGame = seerahGame({
  id: 'year-of-the-elephant',
  i18n: elephantI18n,
  coverArt: 'seerah.elephant-scene',
  levels: [
    {
      config: {
        mode: 'build',
        prompt: 'play.build',
        scene: 'seerah.makkah-valley-empty',
        ordered: true,
        ghosts: true,
        parts: [
          { id: 'kaaba', label: { key: 'part.kaaba' }, art: 'seerah.kaaba', slot: { x: 0.38, y: 0.56, w: 0.24, h: 0.3 }, caption: { text: blockText('e01.ctx1') } },
          { id: 'elephant', label: { key: 'part.elephant' }, art: 'seerah.elephant', slot: { x: 0.02, y: 0.58, w: 0.3, h: 0.3 }, caption: A(1) },
          { id: 'birds', label: { key: 'part.birds' }, art: 'animal.birds', slot: { x: 0.34, y: 0.04, w: 0.34, h: 0.2 }, caption: A(3) },
          { id: 'stones', label: { key: 'part.stones' }, art: 'seerah.clay-stones', slot: { x: 0.08, y: 0.84, w: 0.2, h: 0.14 }, caption: A(4) },
          { id: 'straw', label: { key: 'part.straw' }, art: 'seerah.straw', slot: { x: 0.7, y: 0.82, w: 0.24, h: 0.15 }, caption: A(5) },
        ],
        reveal: { title: { key: 'reveal.title' }, caption: { key: 'reveal.caption' } },
        factMap: { kaaba: 'elephant-army', elephant: 'elephant-army', birds: 'turned-back', stones: 'turned-back', straw: 'turned-back' },
      },
      facts: [FACTS.ctx, FACTS.event],
    },
    {
      config: {
        mode: 'sequence',
        prompt: 'play.order',
        hints: false,
        items: [1, 2, 3, 4, 5].map((n) => ({ id: `ayah-${n}`, label: A(n), sub: { raw: `105:${n}` } })),
        factMap: { 'ayah-1': 'birds-in-flocks', 'ayah-2': 'birds-in-flocks', 'ayah-3': 'birds-in-flocks', 'ayah-4': 'birds-in-flocks', 'ayah-5': 'birds-in-flocks' },
      },
      facts: [FACTS.birds, FACTS.year],
    },
    {
      config: {
        mode: 'sort',
        prompt: 'play.sort',
        hints: false,
        bins: [
          { id: 'quran', label: { key: 'bin.quran' }, art: 'object.quran-stand' },
          { id: 'seerah', label: { key: 'bin.seerah' }, art: 'object.scroll' },
        ],
        items: [
          { id: 'companions', label: { key: 'item.companions' }, bin: 'quran' },
          { id: 'birds', label: { key: 'item.birds' }, bin: 'quran' },
          { id: 'stones', label: { key: 'item.stones' }, bin: 'quran' },
          { id: 'straw', label: { key: 'item.straw' }, bin: 'quran' },
          { id: 'abrahah', label: { key: 'item.abrahah' }, bin: 'seerah' },
          { id: 'yemen', label: { key: 'item.yemen' }, bin: 'seerah' },
          { id: 'birth', label: { key: 'item.birth' }, bin: 'seerah' },
        ],
        factMap: { companions: 'surah-al-fil', birds: 'surah-al-fil', stones: 'surah-al-fil', straw: 'surah-al-fil', abrahah: 'abrahah', yemen: 'abrahah', birth: 'abrahah' },
      },
      facts: [FACTS.abrahah, FACTS.surah],
    },
  ],
  questionKeys: ['seerah:e01-q1'],
  order: 1,
});

export function registerYearOfTheElephantGame(): void {
  registerGame(elephantGame);
}
