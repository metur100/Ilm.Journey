import { projectHijaz } from '@/core/art';
import { registerGame } from '@/core/games';

import { seerahGame } from '../shared/define';
import { blockFact, blockText } from '../shared/facts';
import type { SFace, SText } from '../shared/SeerahGame';
import { journeysI18n } from './i18n';

/*
 * Journeys of the Seerah (episodes 04, 08, 09): trace the routes of the Seerah content (routes.json: route-taif,
 * route-hudaybiyyah, route-conquest – approximate lines, coordinates copied) on `scene.map-hijaz`. The captions at
 * the stops are Seerah blocks; no battle is played – the conquest route ends with the safety given in Makkah.
 */

const MAP = 'scene.map-hijaz';
const at = (lat: number, lon: number) => {
  const p = projectHijaz(lon, lat);
  return { x: p.x / 300, y: p.y / 400 };
};
type Stop = SFace & { at: { x: number; y: number }; caption?: SText };
const stop = (id: string, key: string, lat: number, lon: number, caption?: SText, art?: string): Stop => ({ id, label: { key }, at: at(lat, lon), caption, art });

const FACTS = {
  taif: blockFact('taif-mercy', 'ev.taif.0', { art: 'seerah.taif-gardens', reviewKey: 'seerah:e04-q2' }),
  sorrow: blockFact('year-of-sorrow', 'ev.year-of-sorrow.0', { art: 'story.lamp' }),
  umrah: blockFact('journey-for-umrah', 'e08.ctx0', { art: 'seerah.hudaybiyyah-camp', reviewKey: 'seerah:e08-q1' }),
  stopped: blockFact('stopped-at-hudaybiyyah', 'e08.main0', { art: 'seerah.pledge-tree' }),
  truce: blockFact('truce-broken', 'e09.ctx0', { art: 'seerah.caravan-trail', reviewKey: 'seerah:e09-q1' }),
  safety: blockFact('city-taken-in-safety', 'ev.conquest.0', { art: 'seerah.makkah-doors' }),
};

// routes.json route-taif: Makkah (21.4225, 39.8262) → (21.36, 40.1) → Taʾif (21.2703, 40.4158), and back.
const TAIF: Stop[] = [
  stop('makkah', 'stop.makkah', 21.4225, 39.8262, { text: blockText('ev.year-of-sorrow.0') }),
  stop('mountains', 'stop.mountains', 21.36, 40.1),
  stop('taif', 'stop.taif', 21.2703, 40.4158, { text: blockText('ev.taif.0') }, 'seerah.taif-gardens'),
  stop('mountains-back', 'stop.mountains', 21.4, 40.06),
  stop('makkah-back', 'stop.makkah-back', 21.45, 39.86, { key: 'caption.back' }),
];
// route-hudaybiyyah: Madinah → (23.4, 39.25) → (22.3, 39.3) → al-Hudaybiyyah (21.44, 39.615)
const HUDAYBIYYAH: Stop[] = [
  stop('madinah', 'stop.madinah', 24.4672, 39.6112, { text: blockText('e08.ctx0') }),
  stop('road-1', 'stop.road', 23.4, 39.25, { key: 'caption.road' }),
  stop('road-2', 'stop.road', 22.3, 39.3),
  stop('hudaybiyyah', 'stop.hudaybiyyah', 21.44, 39.615, { text: blockText('ev.hudaybiyyah.0') }, 'seerah.pledge-tree'),
];
// route-conquest: Madinah → (23.2, 39.45) → (22.0, 39.6) → Makkah
const CONQUEST: Stop[] = [
  stop('madinah', 'stop.madinah', 24.4672, 39.6112, { text: blockText('e09.ctx0') }),
  stop('road-1', 'stop.road', 23.2, 39.45),
  stop('road-2', 'stop.road', 22.0, 39.6),
  stop('makkah', 'stop.makkah', 21.4225, 39.8262, { text: blockText('ev.conquest.0') }, 'seerah.kaaba'),
];

const all = (stops: Stop[], fact: string) => Object.fromEntries(stops.map((s) => [s.id, fact]));

export const journeysGame = seerahGame({
  id: 'journeys-map',
  i18n: journeysI18n,
  coverArt: MAP,
  hintArt: 'animal.camel',
  levels: [
    { config: { mode: 'path', prompt: 'play.l1', map: MAP, stops: TAIF, showRoute: true, tolerance: 0.1, factMap: all(TAIF, 'taif-mercy') }, facts: [FACTS.taif, FACTS.sorrow] },
    { config: { mode: 'path', prompt: 'play.l2', map: MAP, stops: HUDAYBIYYAH, showRoute: true, hints: false, factMap: all(HUDAYBIYYAH, 'journey-for-umrah') }, facts: [FACTS.umrah, FACTS.stopped] },
    { config: { mode: 'path', prompt: 'play.l3', map: MAP, stops: CONQUEST, showRoute: false, hints: false, tolerance: 0.07, factMap: all(CONQUEST, 'truce-broken') }, facts: [FACTS.truce, FACTS.safety] },
  ],
  questionKeys: ['seerah:e04-q2', 'seerah:e08-q1', 'seerah:e09-q1'],
  order: 4,
});

export function registerJourneysMapGame(): void {
  registerGame(journeysGame);
}
