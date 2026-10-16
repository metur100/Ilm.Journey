import { registerGame } from '@/core/games';

import { seerahGame } from '../shared/define';
import { blockFact } from '../shared/facts';
import { SEERAH_PEOPLE } from '../shared/seerahContent';
import type { SFace } from '../shared/SeerahGame';
import { peopleI18n } from './i18n';

/*
 * People of the Seerah: names, roles and relationships exactly as in the Seerah content (people.json). Cards show
 * text only – the Prophet ﷺ, his family and companions are never depicted.
 */

const person = (id: string) => {
  const p = SEERAH_PEOPLE.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown person ${id}`);
  return p;
};
const name = (id: string): SFace => ({ id: `n-${id}`, label: { text: person(id).name } });
const role = (id: string): SFace => ({ id: `r-${id}`, label: { text: person(id).role } });
const rel = (id: string): SFace => ({ id: `r-${id}`, label: { text: person(id).relationship } });

const FACTS = {
  first: blockFact('first-believers', 'e03.main0', { art: 'story.lamp', reviewKey: 'seerah:e03-q4' }),
  bilal: blockFact('bilal-freed', 'e04.main0', { art: 'object.key', reviewKey: 'seerah:e04-q6' }),
  childhood: blockFact('orphan-raised', 'e01.main2', { art: 'seerah.caravan-trail', reviewKey: 'seerah:e01-q4' }),
  waraqah: blockFact('waraqah', 'e02.main2', { art: 'object.book' }),
  najashi: blockFact('just-king', 'ev.abyssinia.0', { art: 'object.boat', reviewKey: 'seerah:e04-q1' }),
  suhayl: blockFact('suhayl-negotiates', 'e08.main1', { art: 'seerah.treaty-scroll' }),
  musab: blockFact('first-teacher', 'e05.ctx0', { art: 'seerah.madinah-palms' }),
};

const L1 = ['khadijah', 'abu-bakr', 'bilal', 'abu-talib'];
const L2 = ['aminah', 'abd-al-muttalib', 'halimah', 'waraqah', 'jafar'];
const L3 = ['musab', 'suhayl', 'najashi', 'abdullah-ibn-jubayr', 'sumayyah', 'hamzah'];
const map = (ids: string[], f: (id: string) => string) => Object.fromEntries(ids.map((id) => [id, f(id)]));

export const peopleGame = seerahGame({
  id: 'people-of-the-seerah',
  i18n: peopleI18n,
  coverArt: 'object.scroll',
  hintArt: 'object.book',
  levels: [
    {
      config: { mode: 'connect', prompt: 'play.l1', leftShare: 0.4, pairs: L1.map((id) => ({ id, left: name(id), right: role(id) })), factMap: map(L1, (id) => (id === 'bilal' ? 'bilal-freed' : 'first-believers')) },
      facts: [FACTS.first, FACTS.bilal],
    },
    {
      config: { mode: 'memory', prompt: 'play.l2', peekMs: 3500, pairs: L2.map((id) => ({ id, a: name(id), b: rel(id) })), factMap: map(L2, (id) => (id === 'waraqah' ? 'waraqah' : 'orphan-raised')) },
      facts: [FACTS.childhood, FACTS.waraqah],
    },
    {
      config: {
        mode: 'memory',
        prompt: 'play.l3',
        hints: false,
        columns: 3,
        pairs: L3.map((id) => ({ id, a: name(id), b: role(id) })),
        factMap: map(L3, (id) => (id === 'najashi' ? 'just-king' : id === 'suhayl' ? 'suhayl-negotiates' : 'first-teacher')),
      },
      facts: [FACTS.najashi, FACTS.suhayl, FACTS.musab],
    },
  ],
  questionKeys: ['seerah:e01-q4', 'seerah:e03-q4', 'seerah:e04-q1'],
  order: 13,
});

export function registerPeopleOfTheSeerahGame(): void {
  registerGame(peopleGame);
}
