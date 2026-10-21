import { registerGame } from '@/core/games';

import { seerahGame } from '../shared/define';
import { blockFact } from '../shared/facts';
import { SEERAH_EVENTS } from '../shared/seerahContent';
import type { SFace } from '../shared/SeerahGame';
import { timelineI18n } from './i18n';

/*
 * Seerah Timeline: event titles and years from the Seerah timeline (events.json – the years are the date labels of
 * the content; approximate dates stay marked "c." / "um" / "oko").
 */

const event = (id: string, mark: string, art?: string): SFace & { mark: string } => {
  const e = SEERAH_EVENTS.find((x) => x.id === id);
  if (!e) throw new Error(`Unknown event ${id}`);
  return { id, label: { text: e.title }, art, mark };
};
const marks = (keys: string[]) => keys.map((k) => ({ id: k, label: { key: k } }));
const all = (events: { id: string }[], fact: string) => Object.fromEntries(events.map((e) => [e.id, fact]));

const FACTS = {
  birth: blockFact('born-in-makkah', 'ev.birth.0', { art: 'seerah.makkah-valley' }),
  hijrah: blockFact('the-hijrah', 'ev.hijrah.0', { art: 'seerah.thawr-cave', reviewKey: 'seerah:e10-q3' }),
  badr: blockFact('day-of-criterion', 'ev.badr.1', { art: 'seerah.badr-plain', reviewKey: 'seerah:e07-q3' }),
  fath: blockFact('clear-victory', 'ev.hudaybiyyah.1', { art: 'seerah.pledge-tree' }),
  quiet: blockFact('quiet-call', 'ev.first-muslims.0', { art: 'story.lamp' }),
  public: blockFact('public-call', 'ev.public-call.0', { art: 'seerah.safa-hill', reviewKey: 'seerah:e03-q2' }),
};

const L1 = [event('birth', 'ce.570', 'seerah.elephant'), event('first-revelation', 'ce.610', 'seerah.hira-mountain'), event('hijrah', 'ce.622', 'seerah.thawr-cave')];
const L2 = [
  event('mosque', 'ah.1', 'seerah.masjid-finished'),
  event('badr', 'ah.2', 'seerah.well'),
  event('uhud', 'ah.3', 'place.mount-uhud'),
  event('trench', 'ah.5', 'seerah.trench-section'),
  event('hudaybiyyah', 'ah.6', 'seerah.pledge-tree'),
];
const L3 = [event('public-call', 'ce.613'), event('abyssinia', 'ce.615'), event('taif', 'ce.619'), event('aqabah', 'ce.621')];

export const timelineGame = seerahGame({
  id: 'seerah-timeline',
  i18n: timelineI18n,
  coverArt: 'seerah.timeline-road',
  levels: [
    { config: { mode: 'timeline', prompt: 'play.l1', marks: marks(['ce.570', 'ce.610', 'ce.622']), events: L1, factMap: all(L1, 'the-hijrah') }, facts: [FACTS.birth, FACTS.hijrah] },
    { config: { mode: 'timeline', prompt: 'play.l2', hints: false, marks: marks(['ah.1', 'ah.2', 'ah.3', 'ah.5', 'ah.6']), events: L2, factMap: all(L2, 'day-of-criterion') }, facts: [FACTS.badr, FACTS.fath] },
    { config: { mode: 'timeline', prompt: 'play.l3', hints: false, marks: marks(['ce.613', 'ce.615', 'ce.619', 'ce.621']), events: L3, factMap: all(L3, 'public-call') }, facts: [FACTS.quiet, FACTS.public] },
  ],
  questionKeys: ['seerah:e10-q3', 'seerah:e07-q3', 'seerah:e03-q2'],
  order: 3,
});

export function registerSeerahTimelineGame(): void {
  registerGame(timelineGame);
}
