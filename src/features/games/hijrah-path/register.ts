import { type GameDef, type GameFact, registerGame } from '@/core/games';

import { ARRIVAL, CAVE, DEPARTURE, GUIDE, ORDER_EXPLANATION, QUBA, ROUTE_APPROXIMATE, type SeerahBlock, sourceRefs, THAWR_SOUTH } from './content';
import { type HijrahConfig, HijrahPathGame } from './HijrahPathGame';
import { hijrahI18n } from './i18n';
import { ORDER_FACT_ID } from './logic';

/*
 * Hijrah Path (Seerah, episode 05). Every fact is a Seerah block copied unchanged with its sources; checks reuse the
 * Seerah questions of episode 05 (e05-q1, e05-q2) and review keys point to existing Seerah questions.
 */

const fromBlock = (block: SeerahBlock) => ({ text: block.text, sources: sourceRefs(block.sourceIds) });

export const HIJRAH_FACTS = {
  departure: {
    id: 'secret-departure',
    ...fromBlock(DEPARTURE),
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
  },
  cave: {
    id: 'cave-of-thawr',
    ...fromBlock(CAVE),
    art: 'place.cave-thawr',
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
  },
  thawrSouth: { id: 'thawr-south', ...fromBlock(THAWR_SOUTH), art: 'place.cave-thawr', reviewKey: 'seerah:e05-q1' },
  guide: { id: 'guide-and-news', ...fromBlock(GUIDE), art: 'animal.camel', reviewKey: 'seerah:e05-q4' },
  route: { id: 'approximate-route', ...fromBlock(ROUTE_APPROXIMATE), art: 'scene.map-hijaz' },
  quba: { id: 'arrival-quba', ...fromBlock(QUBA), art: 'place.masjid-nabawi-early' },
  order: { id: ORDER_FACT_ID, ...fromBlock(ORDER_EXPLANATION), art: 'place.madinah-city', reviewKey: 'seerah:e05-q3' },
  madinah: { id: 'yathrib-madinah', ...fromBlock(ARRIVAL), art: 'place.madinah-city' },
} satisfies Record<string, GameFact>;

export const HIJRAH_GAME_ID = 'hijrah-path';

export const hijrahGame: GameDef<HijrahConfig> = {
  id: HIJRAH_GAME_ID,
  challengeCount: 20,
  topicId: 'seerah',
  i18n: hijrahI18n,
  coverArt: 'scene.map-hijaz',
  hintArt: 'animal.camel',
  component: HijrahPathGame,
  levels: [
    { level: 1, config: { showRoute: true, tolerance: 16, ordering: false, fullCards: true }, facts: [HIJRAH_FACTS.departure, HIJRAH_FACTS.cave] },
    { level: 2, config: { showRoute: false, tolerance: 20, ordering: false, fullCards: true }, facts: [HIJRAH_FACTS.thawrSouth, HIJRAH_FACTS.guide, HIJRAH_FACTS.route] },
    { level: 3, config: { showRoute: false, tolerance: 20, ordering: true, fullCards: false }, facts: [HIJRAH_FACTS.quba, HIJRAH_FACTS.order, HIJRAH_FACTS.madinah] },
  ],
  teaches: { questionKeys: ['seerah:e05-q1', 'seerah:e05-q2', 'seerah:e05-q3', 'seerah:e05-q4'] },
  order: 10,
};

export function registerHijrahPathGame(): void {
  registerGame(hijrahGame);
}
