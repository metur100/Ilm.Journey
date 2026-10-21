import { registerGame } from '@/core/games';

import { seerahGame } from '../shared/define';
import { blockFact } from '../shared/facts';
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
        mode: 'sequence',
        prompt: 'play.order',
        items: STEPS.map((s) => ({ id: s, label: { key: `step.${s}` } })),
        factMap: { caravan: 'caravan-from-syria', escape: 'caravan-from-syria', wells: 'few-against-many', consult: 'dua-facing-qiblah', dua: 'dua-facing-qiblah', criterion: 'day-of-the-criterion' },
      },
      facts: [FACTS.caravan, FACTS.dua],
    },
    {
      config: {
        mode: 'connect',
        prompt: 'play.lesson',
        hints: false,
        pairs: [
          { id: 'few', left: { id: 'l-few', label: { key: 'lesson.few' } }, right: { id: 'r-few', label: { key: 'meaning.few' } } },
          { id: 'water', left: { id: 'l-water', label: { key: 'lesson.water' } }, right: { id: 'r-water', label: { key: 'meaning.water' } } },
          { id: 'dua', left: { id: 'l-dua', label: { key: 'lesson.dua' } }, right: { id: 'r-dua', label: { key: 'meaning.dua' } } },
          { id: 'distinction', left: { id: 'l-distinction', label: { key: 'lesson.distinction' } }, right: { id: 'r-distinction', label: { key: 'meaning.distinction' } } },
        ],
        factMap: { few: 'few-against-many', water: 'wells-on-the-route', dua: 'dua-facing-qiblah', distinction: 'day-of-the-criterion' },
      },
      facts: [FACTS.few, FACTS.wells],
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
