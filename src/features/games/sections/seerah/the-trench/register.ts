import { registerGame } from '@/core/games';

import { seerahGame } from '../shared/define';
import { blockFact, blockText } from '../shared/facts';
import type { SText } from '../shared/SeerahGame';
import { trenchI18n } from './i18n';

/*
 * The Trench (episode 08 context, event "trench": Quran 33:9–11, Ibn Hisham). The learner digs the trench across the
 * plain (BuildScene, the scene grows section by section) – only what the content says: the Muslims dug a trench to
 * defend the city, and after weeks of siege the confederates withdrew. L3 matches the Madinan events with their years
 * (events.json date labels; the year of the trench, 5 AH, is marked "disputed" in the content).
 */

const FACTS = {
  trench: blockFact('trench-dug', 'ev.trench.0', { art: 'seerah.trench-dug' }),
  madinah: blockFact('madinah-oasis-town', 'pl.madinah.0', { art: 'seerah.madinah-palms' }),
  years: blockFact('after-years-of-war', 'e08.ctx0', { art: 'seerah.hudaybiyyah-camp', reviewKey: 'seerah:e08-q1' }),
  uhud: blockFact('uhud-north', 'pl.uhud.0', { art: 'place.mount-uhud' }),
  hudaybiyyah: blockFact('treaty-ten-years', 'ev.hudaybiyyah.0', { art: 'seerah.treaty-scroll' }),
  badr: blockFact('victory-when-few', 'ev.badr.1', { art: 'seerah.badr-plain' }),
};

function sections(n: number, first: SText, last: SText) {
  const w = 0.84 / n;
  return Array.from({ length: n }, (_, i) => ({
    id: `section-${i + 1}`,
    label: { key: 'section' },
    sub: { raw: String(i + 1) },
    art: 'seerah.trench-section',
    slot: { x: 0.08 + i * w, y: 0.76, w, h: 0.1 },
    caption: i === 0 ? first : i === n - 1 ? last : undefined,
  }));
}

const L1 = sections(5, { text: blockText('ev.trench.0') }, { key: 'reveal.caption' });
const L2 = sections(7, { text: blockText('pl.madinah.0') }, { text: blockText('e08.ctx0') });
const EVENTS: [string, string][] = [
  ['badr', '2'],
  ['uhud', '3'],
  ['trench', '5'],
  ['hudaybiyyah', '6'],
  ['conquest', '8'],
];
const reveal = { title: { key: 'reveal.title' }, caption: { key: 'reveal.caption' } };

export const trenchGame = seerahGame({
  id: 'the-trench',
  i18n: trenchI18n,
  coverArt: 'seerah.trench-dug',
  hintArt: 'seerah.trench-section',
  levels: [
    {
      config: { mode: 'build', prompt: 'play.l1', scene: 'seerah.trench-plain', ordered: true, ghosts: true, parts: L1, reveal, factMap: Object.fromEntries(L1.map((p) => [p.id, 'trench-dug'])) },
      facts: [FACTS.trench, FACTS.madinah],
    },
    {
      config: { mode: 'build', prompt: 'play.l2', scene: 'seerah.trench-plain', ghosts: false, hints: false, parts: L2, reveal, factMap: Object.fromEntries(L2.map((p) => [p.id, 'after-years-of-war'])) },
      facts: [FACTS.years, FACTS.uhud],
    },
    {
      config: {
        mode: 'memory',
        prompt: 'play.l3',
        columns: 4,
        pairs: EVENTS.map(([id, y]) => ({ id, a: { id: `${id}-a`, label: { key: `event.${id}` } }, b: { id: `${id}-b`, label: { key: `year.${y}` } } })),
        factMap: { badr: 'victory-when-few', uhud: 'victory-when-few', trench: 'treaty-ten-years', hudaybiyyah: 'treaty-ten-years', conquest: 'treaty-ten-years' },
      },
      facts: [FACTS.badr, FACTS.hudaybiyyah],
    },
  ],
  questionKeys: ['seerah:e08-q1'],
  order: 8,
});

export function registerTheTrenchGame(): void {
  registerGame(trenchGame);
}
