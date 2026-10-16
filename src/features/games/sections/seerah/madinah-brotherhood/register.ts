import { registerGame } from '@/core/games';

import { seerahGame } from '../shared/define';
import { blockFact, blockText } from '../shared/facts';
import { brotherhoodI18n } from './i18n';

/*
 * Brothers in Madinah (episode 06, events "brotherhood", "charter"). Groups and names only, as the Seerah content
 * gives them: people.json (Ansar = Aws and Khazraj; ʿAbdullah ibn Jubayr "from the Ansar"; Abu Bakr, companion of
 * the Hijrah), event "brotherhood" (Saʿd ibn al-Rabiʿ and ʿAbd al-Rahman ibn ʿAwf – Ibn Kathir), episode 07 context
 * (the emigrants had lost their homes and property). L3 builds the community in the order of episode 06.
 */

const FACTS = {
  pairs: blockFact('pairs-of-brothers', 'ev.brotherhood.0', { art: 'seerah.two-houses', reviewKey: 'seerah:e06-q5' }),
  oasis: blockFact('a-mixed-city', 'e06.ctx0', { art: 'seerah.madinah-palms' }),
  market: blockFact('show-me-the-market', 'ev.brotherhood.1', { art: 'place.market' }),
  preference: blockFact('preferring-others', 'e06.main1', { art: 'seerah.two-houses', reviewKey: 'seerah:e06-q6' }),
  mosque: blockFact('mosque-first', 'e06.main0', { art: 'seerah.masjid-finished', reviewKey: 'seerah:e06-q1' }),
  charter: blockFact('written-agreement', 'ev.charter.0', { art: 'seerah.treaty-scroll' }),
};

const SORT: [string, 'muhajirun' | 'ansar'][] = [
  ['abu-bakr', 'muhajirun'],
  ['abd-al-rahman', 'muhajirun'],
  ['left-makkah', 'muhajirun'],
  ['lost', 'muhajirun'],
  ['sad', 'ansar'],
  ['ibn-jubayr', 'ansar'],
  ['aws-khazraj', 'ansar'],
  ['shared', 'ansar'],
];
const CONNECT = ['muhajirun', 'ansar', 'sad', 'abd-al-rahman', 'q59'];

export const brotherhoodGame = seerahGame({
  id: 'madinah-brotherhood',
  i18n: brotherhoodI18n,
  coverArt: 'seerah.two-houses',
  hintArt: 'seerah.madinah-palms',
  levels: [
    {
      config: {
        mode: 'sort',
        prompt: 'play.l1',
        bins: [
          { id: 'muhajirun', label: { key: 'bin.muhajirun' }, art: 'animal.camel' },
          { id: 'ansar', label: { key: 'bin.ansar' }, art: 'garden.palm' },
        ],
        items: SORT.map(([id, bin]) => ({ id, label: { key: `card.${id}` }, bin })),
        factMap: Object.fromEntries(SORT.map(([id, bin]) => [id, bin === 'ansar' ? 'pairs-of-brothers' : 'a-mixed-city'])),
      },
      facts: [FACTS.pairs, FACTS.oasis],
    },
    {
      config: {
        mode: 'connect',
        prompt: 'play.l2',
        hints: false,
        pairs: CONNECT.map((id) => ({ id, left: { id: `l-${id}`, label: { key: `left.${id}` } }, right: { id: `r-${id}`, label: { key: `right.${id}` } } })),
        factMap: { muhajirun: 'preferring-others', ansar: 'preferring-others', q59: 'preferring-others', sad: 'show-me-the-market', 'abd-al-rahman': 'show-me-the-market' },
      },
      facts: [FACTS.market, FACTS.preference],
    },
    {
      config: {
        mode: 'build',
        prompt: 'play.l3',
        scene: 'seerah.madinah-palms',
        ordered: true,
        ghosts: false,
        hints: false,
        parts: [
          { id: 'masjid', label: { key: 'part.masjid' }, art: 'seerah.masjid-finished', slot: { x: 0.3, y: 0.38, w: 0.4, h: 0.4 }, caption: { text: blockText('e06.main0') } },
          { id: 'brotherhood', label: { key: 'part.brotherhood' }, art: 'seerah.two-houses', slot: { x: 0.04, y: 0.6, w: 0.28, h: 0.3 }, caption: { text: blockText('e06.main1') } },
          { id: 'agreement', label: { key: 'part.agreement' }, art: 'seerah.letter-sealed', slot: { x: 0.72, y: 0.62, w: 0.2, h: 0.22 }, caption: { text: blockText('e06.main2') } },
          { id: 'qibla', label: { key: 'part.qibla' }, art: 'object.qibla-arrow', slot: { x: 0.44, y: 0.08, w: 0.12, h: 0.2 }, caption: { text: blockText('e06.main4') } },
        ],
        reveal: { title: { key: 'reveal.title' }, caption: { key: 'reveal.caption' } },
        factMap: { masjid: 'mosque-first', brotherhood: 'mosque-first', agreement: 'written-agreement', qibla: 'written-agreement' },
      },
      facts: [FACTS.mosque, FACTS.charter],
    },
  ],
  questionKeys: ['seerah:e06-q1', 'seerah:e06-q5', 'seerah:e06-q6'],
  order: 6,
});

export function registerMadinahBrotherhoodGame(): void {
  registerGame(brotherhoodGame);
}
