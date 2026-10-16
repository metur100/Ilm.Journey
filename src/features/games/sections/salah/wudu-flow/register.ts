import { registerGame, type GameDef } from '@/core/games';

import { WUDU_FACTS } from './content';
import { wuduI18n } from './i18n';
import { WuduFlowGame, type WuduConfig } from './WuduFlowGame';

/*
 * Wudu Flow (abdest): L1 pour water from the ibrik onto the parts in order (guided, the head card only fills a
 * quarter), L2 sort farz vs sunnah (Hanafi), L3 repair a mixed-up sequence without hints.
 */
export const wuduFlowGame: GameDef<WuduConfig> = {
  id: 'wudu-flow',
  topicId: 'salah',
  i18n: wuduI18n,
  coverArt: 'salah.basics-wudu-area',
  hintArt: 'salah.basics-ibrik',
  component: WuduFlowGame,
  levels: [
    { level: 1, config: { mode: 'pour' }, facts: [WUDU_FACTS.quranParts, WUDU_FACTS.farz] },
    { level: 2, config: { mode: 'sort' }, facts: [WUDU_FACTS.sunnah, WUDU_FACTS.schools] },
    { level: 3, config: { mode: 'repair' }, facts: [WUDU_FACTS.commonOrder, WUDU_FACTS.feetAnkles] },
  ],
  teaches: { questionKeys: ['quest:salah-wudu-order', 'quest:salah-wudu-feet', 'quest:salah-wudu-surah', 'learn:salah-wudu-1', 'learn:salah-wudu-2', 'learn:salah-wudu-p'] },
  order: 10,
};

export function registerWuduFlowGame(): void {
  registerGame(wuduFlowGame);
}
