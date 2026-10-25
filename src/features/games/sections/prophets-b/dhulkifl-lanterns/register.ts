import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { DHULKIFL_FACTS, type DhulkiflConfig, LAMPS, NAMED_EPISODE, TOLD_EPISODE } from './content';
import { DhulkiflLampsGame } from './DhulkiflLampsGame';
import { dhulkiflLampsI18n } from './i18n';

export const dhulkiflLampsGame: GameDef<DhulkiflConfig> = {
  id: 'dhulkifl-lanterns',
  topicId: 'prophets',
  i18n: dhulkiflLampsI18n,
  coverArt: 'prophet.dhulkifl-lamp',
  hintArt: 'prophet.dhulkifl-lamp-unlit',
  component: DhulkiflLampsGame,
  levels: [
    // Only what the Quran says, one facet per level, each with its lesson: patient, named with the best, little told.
    { level: 1, config: LAMPS, facts: [DHULKIFL_FACTS.patient, DHULKIFL_FACTS.withPatient, DHULKIFL_FACTS.lessonPatience] },
    { level: 2, config: { mode: 'episode', episode: NAMED_EPISODE }, facts: [DHULKIFL_FACTS.righteous, DHULKIFL_FACTS.best, DHULKIFL_FACTS.lessonGood] },
    { level: 3, config: { mode: 'episode', episode: TOLD_EPISODE }, facts: [DHULKIFL_FACTS.littleTold, DHULKIFL_FACTS.lessonTruth] },
  ],
  teaches: { questionKeys: ['stories:dhulkifl-patient', 'stories:dhulkifl-mercy', 'stories:dhulkifl-best', 'stories:dhulkifl-little'] },
  order: 117,
};

/** Every art name the game draws. */
export const DHULKIFL_ART: string[] = ['prophet.dhulkifl-lamp', 'prophet.dhulkifl-lamp-lit', 'prophet.dhulkifl-lamp-unlit', ...episodeArt(NAMED_EPISODE), ...episodeArt(TOLD_EPISODE)];

export function registerDhulkiflLampsGame(): void {
  registerGame(dhulkiflLampsGame);
}
