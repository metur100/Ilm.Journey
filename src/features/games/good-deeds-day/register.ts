import { type GameDef, type GameFact, registerGame } from '@/core/games';

import {
  AMANAH,
  AMANAH_SOURCES,
  FORGIVENESS,
  FORGIVENESS_SOURCES,
  IFTAR,
  IFTAR_FACT_SOURCES,
  Q_DIZZY,
  RAHMAH,
  RAHMAH_SOURCES,
  SHUKR,
  SHUKR_SOURCES,
  SIDQ,
  SIDQ_SOURCES,
  SMILE,
  SMILE_SOURCES,
  STAY_SAFE,
  SUHOOR,
  SUHOOR_FACT_SOURCES,
} from './content';
import { type DeedsConfig, GoodDeedsDayGame } from './GoodDeedsDayGame';
import { deedsI18n } from './i18n';

/* Akhlaq scenes and facts are copied from Learn content, with their original sources and review questions. */

export const DEEDS_FACTS = {
  smile: { id: 'smile-charity', text: SMILE, sources: SMILE_SOURCES, art: 'object.coin-jar', reviewKey: 'quest:akhlaq-smile' },
  amanah: { id: 'amanah', text: AMANAH, sources: AMANAH_SOURCES, art: 'object.book', reviewKey: 'quest:akhlaq-amanah-mc' },
  shukr: { id: 'shukr', text: SHUKR, sources: SHUKR_SOURCES, art: 'object.gift', reviewKey: 'quest:akhlaq-shukr-scenario' },
  sidq: { id: 'sidq', text: SIDQ, sources: SIDQ_SOURCES, art: 'object.cup', reviewKey: 'quest:akhlaq-vase' },
  rahmah: { id: 'rahmah', text: RAHMAH, sources: RAHMAH_SOURCES, art: 'animal.cat', reviewKey: 'quest:akhlaq-animal' },
  forgiveness: { id: 'forgiveness', text: FORGIVENESS, sources: FORGIVENESS_SOURCES, art: 'ui.heart', reviewKey: 'quest:akhlaq-forgive-scenario' },
  suhoor: { id: 'suhoor', text: SUHOOR, sources: SUHOOR_FACT_SOURCES, art: 'food.dates', reviewKey: 'quest:ramadan-suhoor-blessing' },
  iftar: { id: 'iftar-dates', text: IFTAR, sources: IFTAR_FACT_SOURCES, art: 'food.water', reviewKey: 'quest:ramadan-iftar-dates' },
  safe: { id: 'fast-safely', text: STAY_SAFE, sources: Q_DIZZY.sources, art: 'object.lantern-ramadan', reviewKey: 'quest:ramadan-dizzy' },
} satisfies Record<string, GameFact>;

export const DEEDS_GAME_ID = 'good-deeds-day';

export const deedsGame: GameDef<DeedsConfig> = {
  id: DEEDS_GAME_ID,
  topicId: 'akhlaq',
  i18n: deedsI18n,
  coverArt: 'object.coin-jar',
  hintArt: 'garden.sprout',
  component: GoodDeedsDayGame,
  levels: [
    { level: 1, config: { day: 'everyday' }, facts: [DEEDS_FACTS.smile, DEEDS_FACTS.amanah, DEEDS_FACTS.shukr] },
    { level: 2, config: { day: 'dilemmas' }, facts: [DEEDS_FACTS.sidq, DEEDS_FACTS.rahmah, DEEDS_FACTS.forgiveness] },
  ],
  teaches: { questionKeys: Object.values(DEEDS_FACTS).map((f) => f.reviewKey) },
  order: 10,
};

export function registerGoodDeedsDayGame(): void {
  registerGame(deedsGame);
}
