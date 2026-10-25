import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { CALF_EPISODE, DUA, HARUN_FACTS, type HarunGameConfig, REQUESTS, SENT_EPISODE } from './content';
import { HarunHelperGame } from './HarunHelperGame';
import { harunHelperI18n } from './i18n';

export const harunHelperGame: GameDef<HarunGameConfig> = {
  id: 'harun-helper',
  topicId: 'prophets',
  i18n: harunHelperI18n,
  coverArt: 'prophet.harun-lanterns',
  hintArt: 'prophet.harun-bloom',
  component: HarunHelperGame,
  levels: [
    // Three events of Harun's life, each with its lesson: Musa's dua for a helper, sent together to Fir'awn, the calf.
    { level: 1, config: DUA, facts: [HARUN_FACTS.dua, HARUN_FACTS.helper, HARUN_FACTS.lessonTogether] },
    { level: 2, config: { mode: 'episode', episode: SENT_EPISODE }, facts: [HARUN_FACTS.eloquent, HARUN_FACTS.gentle, HARUN_FACTS.lessonGentle] },
    { level: 3, config: { mode: 'episode', episode: CALF_EPISODE }, facts: [HARUN_FACTS.takesPlace, HARUN_FACTS.lessonFirm] },
  ],
  teaches: { questionKeys: ['stories:harun-dua', 'stories:harun-memory', 'stories:harun-eloquent', 'stories:harun-gentle'] },
  order: 116,
};

/** Every art name the game draws. */
export const HARUN_ART: string[] = [...REQUESTS.map((r) => r.art!), ...episodeArt(SENT_EPISODE), ...episodeArt(CALF_EPISODE)];

export function registerHarunHelperGame(): void {
  registerGame(harunHelperGame);
}
