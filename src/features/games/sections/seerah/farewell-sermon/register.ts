import { registerGame } from '@/core/games';

import { seerahGame } from '../shared/define';
import { blockFact } from '../shared/facts';
import type { SFace } from '../shared/SeerahGame';
import { farewellI18n } from './i18n';

/*
 * The Farewell Sermon (episode 10, event "farewell"). The messages are exactly those of the Seerah content
 * (episode 10, main event 0 – Sahih Muslim 1218; main event 1 – Sahih al-Bukhari 45, Quran 5:3).
 */

const FACTS = {
  sermon: blockFact('sermon-at-arafat', 'e10.main0', { art: 'seerah.arafat-plain' }),
  arafat: blockFact('plain-of-arafat', 'pl.arafat.0', { art: 'seerah.arafat-plain', reviewKey: 'seerah:e10-q1' }),
  hajj: blockFact('the-only-hajj', 'ev.farewell.0', { art: 'seerah.kaaba' }),
  gathered: blockFact('people-gathered', 'e10.ctx0', { art: 'seerah.caravan-trail' }),
  perfected: blockFact('religion-perfected', 'e10.main1', { art: 'object.book', reviewKey: 'seerah:e10-q2' }),
};

const TOPIC_ART: Record<string, string> = {
  life: 'object.coins',
  women: 'garden.flower-rose',
  book: 'object.book',
  feuds: 'object.scales',
  witness: 'object.scroll',
  arafah: 'seerah.arafat-plain',
};
const topic = (id: string): SFace => ({ id: `t-${id}`, label: { key: `topic.${id}` }, art: TOPIC_ART[id] });
const msg = (id: string): SFace => ({ id: `m-${id}`, label: { key: `msg.${id}` } });
const pairs = (ids: string[]) => ids.map((id) => ({ id, left: topic(id), right: msg(id) }));
const map = (ids: string[], fact: string) => Object.fromEntries(ids.map((id) => [id, fact]));

const L1 = ['life', 'women', 'book'];
const L2 = ['feuds', 'witness', 'arafah'];
const HAJJ = ['ihram', 'arafat', 'muzdalifah', 'mina', 'tawaf'];

export const farewellGame = seerahGame({
  id: 'farewell-sermon',
  i18n: farewellI18n,
  coverArt: 'seerah.arafat-plain',
  hintArt: 'object.scroll',
  levels: [
    { config: { mode: 'connect', prompt: 'play.l1', leftShare: 0.45, pairs: pairs(L1), factMap: map(L1, 'sermon-at-arafat') }, facts: [FACTS.sermon, FACTS.arafat] },
    { config: { mode: 'connect', prompt: 'play.l2', hints: false, leftShare: 0.5, pairs: pairs(L2), factMap: map(L2, 'the-only-hajj') }, facts: [FACTS.hajj, FACTS.gathered] },
    {
      config: {
        mode: 'sequence',
        prompt: 'play.l3',
        hints: false,
        items: HAJJ.map((id) => ({ id, label: { key: `hajjstep.${id}` } })),
        factMap: Object.fromEntries(HAJJ.map((id) => [id, 'religion-perfected'])),
      },
      facts: [FACTS.perfected],
    },
  ],
  questionKeys: ['seerah:e10-q1', 'seerah:e10-q2'],
  order: 12,
});

export function registerFarewellSermonGame(): void {
  registerGame(farewellGame);
}
