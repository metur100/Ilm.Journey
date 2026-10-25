import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { ANSWER_EPISODE, CALL_EPISODE } from './content';
import { SHUAYB_FACTS } from './facts';
import { shuaybScalesI18n } from './i18n';
import { SCALES } from './logic';
import { type ShuaybConfig, ShuaybScalesGame } from './ShuaybScalesGame';

export const shuaybScalesGame: GameDef<ShuaybConfig> = {
  id: 'shuayb-scales',
  topicId: 'prophets',
  i18n: shuaybScalesI18n,
  coverArt: 'prophet.shuayb-scales',
  hintArt: 'prophet.shuayb-weight',
  component: ShuaybScalesGame,
  levels: [
    // Three events of Shuayb's life, each with its lesson: the call in Madyan, the fair scales, mocked – and saved.
    { level: 1, config: { mode: 'episode', episode: CALL_EPISODE }, facts: [SHUAYB_FACTS.madyan, SHUAYB_FACTS.lessonOne] },
    { level: 2, config: SCALES, facts: [SHUAYB_FACTS.full, SHUAYB_FACTS.even, SHUAYB_FACTS.lessonHonest] },
    { level: 3, config: { mode: 'episode', episode: ANSWER_EPISODE }, facts: [SHUAYB_FACTS.reform, SHUAYB_FACTS.saved, SHUAYB_FACTS.lessonRely] },
  ],
  teaches: { questionKeys: ['stories:shuayb-fair', 'stories:shuayb-map', 'stories:shuayb-reform', 'stories:shuayb-lesson'] },
  order: 114,
};

export const SHUAYB_ART = ['prophet.shuayb-scales', 'prophet.shuayb-weight', 'prophet.shuayb-measure', 'object.grain-sack', ...episodeArt(CALL_EPISODE), ...episodeArt(ANSWER_EPISODE)];

export function registerShuaybScalesGame(): void {
  registerGame(shuaybScalesGame);
}
