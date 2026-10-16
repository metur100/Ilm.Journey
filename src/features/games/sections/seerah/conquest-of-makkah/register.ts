import { DOOR_SPOTS } from '@/core/art/pieces/sections/seerahScenes';
import { registerGame } from '@/core/games';

import { seerahGame } from '../shared/define';
import { blockFact, blockText } from '../shared/facts';
import { ayahArabicWords, ayahFact } from '../shared/quran';
import type { SFace } from '../shared/SeerahGame';
import { conquestI18n } from './i18n';

/*
 * Makkah: Mercy and Safety (episode 09, event "conquest"). Reverence: no battle. L1 finds the doors of safety
 * (Sahih Muslim 1780: whoever entered Abu Sufyan's house, laid down their weapons or closed their door was safe);
 * L2 orders the day (episode 09 blocks); L3 builds al-Nasr 110:1 from the generated Quran data.
 */

const FACTS = {
  safety: blockFact('safety-announced', 'e09.main0', { art: 'seerah.makkah-doors', reviewKey: 'seerah:e09-q2' }),
  pardon: blockFact('general-pardon', 'e09.main2', { art: 'seerah.makkah-valley' }),
  truce: blockFact('truce-broken', 'e09.ctx0', { art: 'seerah.caravan-trail', reviewKey: 'seerah:e09-q1' }),
  idols: blockFact('truth-has-come', 'e09.main1', { art: 'seerah.kaaba', reviewKey: 'seerah:e09-q4' }),
  nasr: ayahFact('help-of-allah', 110, 1, 3, 'seerah.kaaba'),
  humility: blockFact('glorify-and-seek-forgiveness', 'e09.main4', { art: 'story.lamp' }),
};

const box = ([x, y, w, h]: [number, number, number, number]) => ({ x: (x - w / 2 - 5) / 400, y: (y - h / 2 - 7) / 240, w: (w + 10) / 400, h: (h + 12) / 240 });
const SPOTS = DOOR_SPOTS.map((d, i) =>
  i === 1
    ? { id: 'abu-sufyan', label: { key: 'spot.abu-sufyan' }, at: box(d), caption: { text: blockText('e09.main0') } }
    : { id: `door-${i + 1}`, label: { key: 'spot.door' }, at: box(d), caption: { key: 'caption.door' } },
);
const STEPS = ['broken', 'march', 'abu-sufyan', 'safety', 'enter', 'idols'];
const NASR: SFace[] = ayahArabicWords(110, 1).map((arabic, i) => ({ id: `w${i}`, arabic, quran: true }));

export const conquestGame = seerahGame({
  id: 'conquest-of-makkah',
  i18n: conquestI18n,
  coverArt: 'seerah.makkah-doors',
  hintArt: 'seerah.kaaba',
  levels: [
    {
      config: { mode: 'tap', prompt: 'play.l1', scene: 'seerah.makkah-doors-open', spots: SPOTS, factMap: Object.fromEntries(SPOTS.map((s) => [s.id, 'safety-announced'])) },
      facts: [FACTS.safety, FACTS.pardon],
    },
    {
      config: {
        mode: 'sequence',
        prompt: 'play.l2',
        items: STEPS.map((s) => ({ id: s, label: { key: `step.${s}` } })),
        factMap: { broken: 'truce-broken', march: 'truce-broken', 'abu-sufyan': 'truce-broken', safety: 'truth-has-come', enter: 'truth-has-come', idols: 'truth-has-come' },
      },
      facts: [FACTS.truce, FACTS.idols],
    },
    {
      config: { mode: 'words', prompt: 'play.l3', quran: true, hints: false, target: NASR, factMap: Object.fromEntries(NASR.map((w) => [w.id, 'help-of-allah'])) },
      facts: [FACTS.nasr, FACTS.humility],
    },
  ],
  questionKeys: ['seerah:e09-q1', 'seerah:e09-q2', 'seerah:e09-q4'],
  order: 10,
});

export function registerConquestOfMakkahGame(): void {
  registerGame(conquestGame);
}
