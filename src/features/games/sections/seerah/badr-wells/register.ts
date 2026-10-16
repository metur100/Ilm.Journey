import { registerGame } from '@/core/games';

import { seerahGame } from '../shared/define';
import { blockFact, blockText } from '../shared/facts';
import { badrI18n } from './i18n';

/*
 * The Wells of Badr (episode 07). Reverence: no fighting is played. L1 sets up the plain (wells on the caravan route,
 * the camp, the caravan) with Seerah blocks as captions; L2 orders the events of Badr (episode 07 blocks: Muslim 1763,
 * Ibn Hisham, Quran 8:9, 8:41); L3 tells Badr and Uhud apart (events "badr" / "uhud", question e07-q5).
 */

const FACTS = {
  wells: blockFact('wells-on-the-route', 'pl.badr.0', { art: 'seerah.badr-plain' }),
  few: blockFact('few-against-many', 'e07.main0', { art: 'seerah.well', reviewKey: 'seerah:e07-q2' }),
  dua: blockFact('dua-facing-qiblah', 'e07.main2', { art: 'object.prayer-mat' }),
  caravan: blockFact('caravan-from-syria', 'e07.ctx0', { art: 'animal.camel' }),
  uhud: blockFact('archers-at-uhud', 'ev.uhud.0', { art: 'place.mount-uhud', reviewKey: 'seerah:e07-q5' }),
  criterion: blockFact('day-of-the-criterion', 'ev.badr.1', { art: 'seerah.badr-plain', reviewKey: 'seerah:e07-q1' }),
};

const STEPS = ['caravan', 'escape', 'wells', 'consult', 'dua', 'criterion'];

export const badrGame = seerahGame({
  id: 'badr-wells',
  i18n: badrI18n,
  coverArt: 'seerah.badr-plain',
  hintArt: 'seerah.well',
  levels: [
    {
      config: {
        mode: 'build',
        prompt: 'play.build',
        scene: 'seerah.badr-plain-empty',
        ghosts: true,
        parts: [
          { id: 'well-1', label: { key: 'part.well-1' }, art: 'seerah.well', slot: { x: 0.18, y: 0.66, w: 0.16, h: 0.16 }, caption: { text: blockText('pl.badr.0') } },
          { id: 'well-2', label: { key: 'part.well-2' }, art: 'seerah.well', slot: { x: 0.56, y: 0.6, w: 0.12, h: 0.12 } },
          { id: 'well-3', label: { key: 'part.well-3' }, art: 'seerah.well', slot: { x: 0.74, y: 0.74, w: 0.16, h: 0.16 }, caption: { text: blockText('e07.main0') } },
          { id: 'camp', label: { key: 'part.camp' }, art: 'seerah.camp-tents', slot: { x: 0.3, y: 0.46, w: 0.3, h: 0.18 }, caption: { text: blockText('e07.main1') } },
          { id: 'caravan', label: { key: 'part.caravan' }, art: 'animal.camel', slot: { x: 0.02, y: 0.42, w: 0.14, h: 0.2 }, caption: { text: blockText('e07.ctx0') } },
        ],
        reveal: { title: { key: 'reveal.title' }, caption: { key: 'reveal.caption' } },
        factMap: { 'well-1': 'wells-on-the-route', 'well-2': 'wells-on-the-route', 'well-3': 'few-against-many', camp: 'few-against-many', caravan: 'wells-on-the-route' },
      },
      facts: [FACTS.wells, FACTS.few],
    },
    {
      config: {
        mode: 'sequence',
        prompt: 'play.order',
        items: STEPS.map((s) => ({ id: s, label: { key: `step.${s}` } })),
        factMap: { caravan: 'caravan-from-syria', escape: 'caravan-from-syria', wells: 'caravan-from-syria', consult: 'dua-facing-qiblah', dua: 'dua-facing-qiblah', criterion: 'dua-facing-qiblah' },
      },
      facts: [FACTS.caravan, FACTS.dua],
    },
    {
      config: {
        mode: 'sort',
        prompt: 'play.sort',
        hints: false,
        bins: [
          { id: 'badr', label: { key: 'bin.badr' }, art: 'seerah.well' },
          { id: 'uhud', label: { key: 'bin.uhud' }, art: 'place.mount-uhud' },
        ],
        items: [
          { id: 'numbers', label: { key: 'card.numbers' }, bin: 'badr' },
          { id: 'criterion', label: { key: 'card.criterion' }, bin: 'badr' },
          { id: 'dua', label: { key: 'card.dua' }, bin: 'badr' },
          { id: 'ramadan', label: { key: 'card.ramadan' }, bin: 'badr' },
          { id: 'archers', label: { key: 'card.archers' }, bin: 'uhud' },
          { id: 'left', label: { key: 'card.left' }, bin: 'uhud' },
          { id: 'hamzah', label: { key: 'card.hamzah' }, bin: 'uhud' },
          { id: 'shawwal', label: { key: 'card.shawwal' }, bin: 'uhud' },
        ],
        factMap: { numbers: 'day-of-the-criterion', criterion: 'day-of-the-criterion', dua: 'day-of-the-criterion', ramadan: 'day-of-the-criterion', archers: 'archers-at-uhud', left: 'archers-at-uhud', hamzah: 'archers-at-uhud', shawwal: 'archers-at-uhud' },
      },
      facts: [FACTS.criterion, FACTS.uhud],
    },
  ],
  questionKeys: ['seerah:e07-q1', 'seerah:e07-q2', 'seerah:e07-q5'],
  order: 7,
});

export function registerBadrWellsGame(): void {
  registerGame(badrGame);
}
