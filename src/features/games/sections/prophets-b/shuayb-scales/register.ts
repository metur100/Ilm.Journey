import { type GameDef, registerGame } from '@/core/games';

import { SHUAYB_FACTS } from './facts';
import { shuaybScalesI18n } from './i18n';
import { LEVEL_1, LEVEL_2, LEVEL_3, type ScaleConfig } from './logic';
import { ShuaybScalesGame } from './ShuaybScalesGame';

export const shuaybScalesGame: GameDef<ScaleConfig> = {
  id: 'shuayb-scales',
  topicId: 'prophets',
  i18n: shuaybScalesI18n,
  coverArt: 'prophet.shuayb-scales',
  hintArt: 'prophet.shuayb-weight',
  component: ShuaybScalesGame,
  levels: [
    { level: 1, config: LEVEL_1, facts: [SHUAYB_FACTS.full] },
    { level: 2, config: LEVEL_2, facts: [SHUAYB_FACTS.even, SHUAYB_FACTS.madyan] },
    { level: 3, config: LEVEL_3, facts: [SHUAYB_FACTS.reform] },
  ],
  teaches: { questionKeys: ['stories:shuayb-fair', 'stories:shuayb-map', 'stories:shuayb-reform'] },
  order: 114,
};

export const SHUAYB_ART = ['prophet.shuayb-scales', 'prophet.shuayb-weight', 'prophet.shuayb-measure', 'prophet.shuayb-market', 'object.grain-sack'];

export function registerShuaybScalesGame(): void {
  registerGame(shuaybScalesGame);
}
