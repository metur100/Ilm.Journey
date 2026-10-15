import { registerGame, type GameDef } from '@/core/games';

import { WUDU_FACTS } from './content';
import { wuduI18n } from './i18n';
import type { WuduConfig } from './logic';
import { WuduFlowGame } from './WuduFlowGame';

/*
 * Wudu Flow (Salah game 1, docs/GAMES.md): L1 water to the four parts named in Quran 5:6 (guided), L2 the whole common
 * order unguided + sorting the steps into "named in 5:6" / "from the Sunnah", L3 repair a mixed-up sequence.
 * Facts and their sources are copied from the Salah content (see ./content.ts).
 */
export const wuduFlowGame: GameDef<WuduConfig> = {
  id: 'wudu-flow',
  topicId: 'salah',
  i18n: wuduI18n,
  coverArt: 'body.water-on-hands',
  hintArt: 'ui.water-drop',
  component: WuduFlowGame,
  levels: [
    { level: 1, config: { mode: 'guided' }, facts: [WUDU_FACTS.quranParts, WUDU_FACTS.beforeSalah] },
    { level: 2, config: { mode: 'full' }, facts: [WUDU_FACTS.commonOrder, WUDU_FACTS.quranSunnah] },
    { level: 3, config: { mode: 'repair' }, facts: [WUDU_FACTS.schoolsDiffer, WUDU_FACTS.feetAnkles] },
  ],
  teaches: { questionKeys: ['quest:salah-wudu-order', 'quest:salah-wudu-feet', 'quest:salah-wudu-surah', 'learn:salah-wudu-1', 'learn:salah-wudu-2', 'learn:salah-wudu-p'] },
  order: 10,
};

export function registerWuduFlowGame(): void {
  registerGame(wuduFlowGame);
}
