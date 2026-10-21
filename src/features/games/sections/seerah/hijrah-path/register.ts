import { projectHijaz } from '@/core/art';
import { registerGame } from '@/core/games';

import { seerahGame } from '../shared/define';
import { blockFact, blockText } from '../shared/facts';
import type { SFace, SText } from '../shared/SeerahGame';
import { hijrahI18n } from './i18n';

/*
 * Hijrah Path (episode 05) – v3 rework of the v2 game with the same id (progress is kept). The learner traces the
 * Hijrah on `scene.map-hijaz` with the kit's PathTrace (routes.json "route-hijrah": a southward start to the Cave of
 * Thawr, then an unusual route towards the coast – an approximation). The v2 pop-up cards are gone: each stop shows
 * its Seerah block inline. Level 3 orders the stages (Seerah question e05-q3). Fact ids and checks are kept from v2.
 */

const MAP = 'scene.map-hijaz';
const at = (lat: number, lon: number) => {
  const p = projectHijaz(lon, lat);
  return { x: p.x / 300, y: p.y / 400 };
};
type Stop = SFace & { at: { x: number; y: number }; caption?: SText };
const stop = (id: string, lat: number, lon: number, caption?: SText, art?: string): Stop => ({ id, label: { key: `stop.${id}` }, at: at(lat, lon), caption, art });

// route-hijrah points; the cave (21.3775) and Quba (24.4393) lie very close to Makkah / Madinah and are drawn a little
// apart (said in the caption "caption.coast").
const ROUTE: Stop[] = [
  stop('makkah', 21.4225, 39.8262, { text: blockText('e05.main0') }, 'seerah.makkah-valley'),
  stop('thawr', 21.26, 39.9, { text: blockText('e05.main1') }, 'seerah.thawr-cave'),
  stop('road', 21.75, 39.3, { text: blockText('e05.main2') }, 'animal.camel'),
  stop('coast', 22.5, 39.1, { key: 'caption.coast' }),
  stop('north', 23.3, 38.95, { text: blockText('e05.main4') }),
  stop('quba', 24.3, 39.5, { text: blockText('ev.quba.0') }),
  stop('madinah', 24.4672, 39.6112, { text: blockText('e05.main3') }, 'seerah.madinah-palms'),
];

const FACTS = {
  departure: blockFact('secret-departure', 'e05.main0', {
    art: 'place.makkah-city',
    check: {
      type: 'trueFalse',
      // Seerah question e05-q2.
      statement: {
        en: 'The Hijrah was carefully planned: camels were prepared and a guide was hired.',
        de: 'Die Hidschra war sorgfältig geplant: Kamele wurden vorbereitet und ein Führer angeheuert.',
        bs: 'Hidžra je bila pažljivo planirana: pripremljene su deve i unajmljen vodič.',
      },
      correct: true,
    },
  }),
  cave: blockFact('cave-of-thawr', 'e05.main1', {
    art: 'seerah.thawr-cave',
    check: {
      type: 'choice',
      // Seerah question e05-q1.
      prompt: {
        en: 'Where did the Prophet ﷺ and Abu Bakr hide for three nights?',
        de: 'Wo versteckten sich der Prophet ﷺ und Abu Bakr drei Nächte lang?',
        bs: 'Gdje su se Poslanik ﷺ i Ebu Bekr skrivali tri noći?',
      },
      options: [
        { en: 'The Cave of Thawr', de: 'In der Höhle Thaur', bs: 'U pećini Sevr' },
        { en: 'The Cave of Hiraʾ', de: 'In der Höhle Hira', bs: 'U pećini Hira' },
        { en: 'In Quba', de: 'In Quba', bs: 'U Kubi' },
      ],
      correctIndex: 0,
    },
  }),
  thawrSouth: blockFact('thawr-south', 'pl.thawr.0', { art: 'seerah.thawr-cave', reviewKey: 'seerah:e05-q1' }),
  guide: blockFact('guide-and-news', 'e05.main2', { art: 'animal.camel', reviewKey: 'seerah:e05-q4' }),
  route: blockFact('approximate-route', 'e05.main4', { art: 'seerah.caravan-trail' }),
  quba: blockFact('arrival-quba', 'ev.quba.0', { art: 'seerah.madinah-palms' }),
  order: blockFact('hijrah-order', 'e05.ctx0', { art: 'place.madinah-city', reviewKey: 'seerah:e05-q3' }),
  madinah: blockFact('yathrib-madinah', 'e05.main3', { art: 'place.madinah-city' }),
};

const MAP_FACTS: Record<string, string> = { makkah: 'secret-departure', thawr: 'cave-of-thawr', road: 'guide-and-news', coast: 'approximate-route', north: 'approximate-route', quba: 'arrival-quba', madinah: 'arrival-quba' };
const STEPS = ['aqabah', 'depart', 'cave', 'guide', 'quba', 'madinah'];

export const hijrahGame = seerahGame({
  id: 'hijrah-path',
  i18n: hijrahI18n,
  coverArt: 'seerah.thawr-cave',
  hintArt: 'animal.camel',
  levels: [
    {
      config: { mode: 'path', prompt: 'play.l1', map: MAP, stops: ROUTE, showRoute: true, tolerance: 0.1, factMap: { ...MAP_FACTS, makkah: 'secret-departure', thawr: 'cave-of-thawr' } },
      facts: [FACTS.departure, FACTS.cave],
    },
    {
      config: {
        mode: 'connect',
        prompt: 'play.l2',
        hints: false,
        pairs: [
          { id: 'abu-bakr', left: { id: 'l-abu-bakr', label: { key: 'left.abu-bakr' } }, right: { id: 'r-abu-bakr', label: { key: 'right.abu-bakr' } } },
          { id: 'thawr', left: { id: 'l-thawr', label: { key: 'left.thawr' } }, right: { id: 'r-thawr', label: { key: 'right.thawr' } } },
          { id: 'guide', left: { id: 'l-guide', label: { key: 'left.guide' } }, right: { id: 'r-guide', label: { key: 'right.guide' } } },
          { id: 'quba', left: { id: 'l-quba', label: { key: 'left.quba' } }, right: { id: 'r-quba', label: { key: 'right.quba' } } },
          { id: 'ansar', left: { id: 'l-ansar', label: { key: 'left.ansar' } }, right: { id: 'r-ansar', label: { key: 'right.ansar' } } },
        ],
        factMap: { 'abu-bakr': 'cave-of-thawr', thawr: 'cave-of-thawr', guide: 'guide-and-news', quba: 'arrival-quba', ansar: 'arrival-quba' },
      },
      facts: [FACTS.guide, FACTS.thawrSouth, FACTS.route],
    },
    {
      config: {
        mode: 'sequence',
        prompt: 'play.l3',
        hints: false,
        items: STEPS.map((s) => ({ id: s, label: { key: `step.${s}` } })),
        factMap: { aqabah: 'hijrah-order', depart: 'hijrah-order', cave: 'hijrah-order', guide: 'hijrah-order', quba: 'arrival-quba', madinah: 'yathrib-madinah' },
      },
      facts: [FACTS.quba, FACTS.order, FACTS.madinah],
    },
  ],
  questionKeys: ['seerah:e05-q1', 'seerah:e05-q2', 'seerah:e05-q3', 'seerah:e05-q4'],
  order: 5,
});

export function registerHijrahPathGame(): void {
  registerGame(hijrahGame);
}
