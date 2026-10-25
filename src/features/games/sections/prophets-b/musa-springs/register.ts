import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { RIVER_EPISODE, SEA_EPISODE } from './content';
import { MUSA_FACTS } from './facts';
import { musaSpringsI18n } from './i18n';
import { springPairs, SPRINGS } from './logic';
import { type MusaConfig, MusaSpringsGame } from './MusaSpringsGame';

export const musaSpringsGame: GameDef<MusaConfig> = {
  id: 'musa-springs',
  topicId: 'prophets',
  i18n: musaSpringsI18n,
  coverArt: 'prophet.musa-springs',
  hintArt: 'prophet.musa-spring-1',
  component: MusaSpringsGame,
  levels: [
    // Three events of Musa's life, each with its lesson: the baby on the river, the parted sea, the twelve springs.
    { level: 1, config: { mode: 'episode', episode: RIVER_EPISODE }, facts: [MUSA_FACTS.river, MUSA_FACTS.lessonPromise] },
    { level: 2, config: { mode: 'episode', episode: SEA_EPISODE }, facts: [MUSA_FACTS.withMe, MUSA_FACTS.lessonHope] },
    { level: 3, config: SPRINGS, facts: [MUSA_FACTS.springs, MUSA_FACTS.provision, MUSA_FACTS.lessonThanks] },
  ],
  teaches: { questionKeys: ['stories:musa-next', 'stories:musa-sea', 'stories:musa-memory'] },
  order: 115,
};

/** Every art name the game draws. */
export const MUSA_ART: string[] = [...springPairs(SPRINGS.tribes).flatMap((p) => [p.left.art!, p.right.art!]), ...episodeArt(RIVER_EPISODE), ...episodeArt(SEA_EPISODE)];

export function registerMusaSpringsGame(): void {
  registerGame(musaSpringsGame);
}
