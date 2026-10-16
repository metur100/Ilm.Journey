import { registerGame } from '@/core/games';

import { seerahGame } from '../shared/define';
import { blockFact } from '../shared/facts';
import { ayahArabicWords, ayahFact } from '../shared/quran';
import type { SFace } from '../shared/SeerahGame';
import { hiraI18n } from './i18n';

/*
 * Cave Hira (episode 02, event "first-revelation"). The learner builds the first revealed ayahs of Surah al-ʿAlaq from
 * word tiles (Arabic from the generated Quran data, Quran font, right to left). The meanings and the account of the
 * first revelation (Sahih al-Bukhari 3) are the facts of the result screen.
 */

const words = (ayah: number, prefix = `a${ayah}`): SFace[] => ayahArabicWords(96, ayah).map((arabic, i) => ({ id: `${prefix}-${i}`, arabic, quran: true }));

const FACTS = {
  first: ayahFact('read-in-the-name', 96, 1, 2, 'seerah.hira-mountain'),
  cave: blockFact('angel-in-the-cave', 'e02.main0', { art: 'seerah.hira-mountain', reviewKey: 'seerah:e02-q1' }),
  pen: ayahFact('taught-by-the-pen', 96, 3, 4, 'object.pen'),
  solitude: blockFact('solitude-in-hira', 'e02.ctx0', { art: 'seerah.hira-mountain' }),
  knew: ayahFact('what-he-knew-not', 96, 5, 5, 'object.book'),
  khadijah: blockFact('khadijah-reassured', 'e02.main1', { art: 'story.lamp', reviewKey: 'seerah:e02-q2' }),
};

const map = (faces: SFace[], fact: string) => Object.fromEntries(faces.map((f) => [f.id, fact]));
const L1 = words(1);
const L2 = [...words(3), ...words(4)];
const L3 = words(5);

export const hiraGame = seerahGame({
  id: 'cave-hira',
  i18n: hiraI18n,
  coverArt: 'seerah.hira-mountain',
  hintArt: 'object.pen',
  levels: [
    { config: { mode: 'words', prompt: 'play.l1', quran: true, target: L1, factMap: map(L1, 'read-in-the-name') }, facts: [FACTS.first, FACTS.cave] },
    { config: { mode: 'words', prompt: 'play.l2', quran: true, hints: false, target: L2, factMap: map(L2, 'taught-by-the-pen') }, facts: [FACTS.pen, FACTS.solitude] },
    {
      config: { mode: 'words', prompt: 'play.l3', quran: true, hints: false, target: L3, distractors: words(3, 'x3'), factMap: { ...map(L3, 'what-he-knew-not'), ...map(words(3, 'x3'), 'what-he-knew-not') } },
      facts: [FACTS.knew, FACTS.khadijah],
    },
  ],
  questionKeys: ['seerah:e02-q1', 'seerah:e02-q2'],
  order: 2,
});

export function registerCaveHiraGame(): void {
  registerGame(hiraGame);
}
