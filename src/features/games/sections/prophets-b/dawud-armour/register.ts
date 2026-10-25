import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { ARMOUR, DAWUD_FACTS, type DawudConfig, JALUT_EPISODE, PRAISE_EPISODE } from './content';
import { DawudArmourGame } from './DawudArmourGame';
import { dawudArmourI18n } from './i18n';

export const dawudArmourGame: GameDef<DawudConfig> = {
  id: 'dawud-armour',
  topicId: 'prophets',
  i18n: dawudArmourI18n,
  coverArt: 'prophet.dawud-armour',
  hintArt: 'prophet.dawud-ring',
  component: DawudArmourGame,
  levels: [
    // Three events of Dawud's life, each with its lesson: Jalut, the iron made soft, the mountains, the birds and the Zabur.
    { level: 1, config: { mode: 'episode', episode: JALUT_EPISODE }, facts: [DAWUD_FACTS.jalut, DAWUD_FACTS.lessonPatience] },
    { level: 2, config: ARMOUR, facts: [DAWUD_FACTS.iron, DAWUD_FACTS.links, DAWUD_FACTS.lessonWork] },
    { level: 3, config: { mode: 'episode', episode: PRAISE_EPISODE }, facts: [DAWUD_FACTS.mountains, DAWUD_FACTS.zabur, DAWUD_FACTS.lessonFair] },
  ],
  teaches: { questionKeys: ['stories:dawud-few', 'stories:dawud-iron', 'stories:dawud-praise', 'stories:dawud-zabur'] },
  order: 118,
};

/** Every art name the game draws. */
export const DAWUD_ART: string[] = ['prophet.dawud-ring', 'prophet.dawud-armour', 'prophet.dawud-chain', ...episodeArt(JALUT_EPISODE), ...episodeArt(PRAISE_EPISODE)];

export function registerDawudArmourGame(): void {
  registerGame(dawudArmourGame);
}
