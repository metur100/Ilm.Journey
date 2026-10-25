import { type GameDef, registerGame } from '@/core/games';

import { episodeArt, type EpisodeConfig } from '../../prophets-story/episode';
import { FORGIVE_EPISODE, PATH_FACTS, PRISON_EPISODE, WELL_EPISODE } from './content';
import { yusufStoryI18n } from './i18n';
import { YusufStoryPathGame } from './YusufStoryPathGame';

export const yusufStoryPathGame: GameDef<EpisodeConfig> = {
  id: 'yusuf-story-path',
  topicId: 'prophets',
  i18n: yusufStoryI18n,
  coverArt: 'prophet.yusuf-dream',
  hintArt: 'prophet.yusuf-well',
  component: YusufStoryPathGame,
  levels: [
    // Three events of Yusuf's story, each with its lesson: the dream and the well, honest in prison, forgiveness.
    { level: 1, config: { mode: 'episode', episode: WELL_EPISODE }, facts: [PATH_FACTS.dream, PATH_FACTS.lessonEnvy] },
    { level: 2, config: { mode: 'episode', episode: PRISON_EPISODE }, facts: [PATH_FACTS.honest, PATH_FACTS.lessonPure] },
    { level: 3, config: { mode: 'episode', episode: FORGIVE_EPISODE }, facts: [PATH_FACTS.forgive, PATH_FACTS.lessonForgive] },
  ],
  teaches: { questionKeys: ['stories:yusuf-next', 'stories:yusuf-map', 'stories:yusuf-stars', 'stories:yusuf-revenge'] },
  order: 112,
};

/** Every art name the game draws. */
export const YUSUF_PATH_ART: string[] = [...episodeArt(WELL_EPISODE), ...episodeArt(PRISON_EPISODE), ...episodeArt(FORGIVE_EPISODE)];

export function registerYusufStoryPathGame(): void {
  registerGame(yusufStoryPathGame);
}
