import { registerGame, type GameDef } from '@/core/games';

import { SKY_FACTS } from './content';
import { prayerSkyI18n } from './i18n';
import type { SkyConfig } from './logic';
import { PrayerSkyGame } from './PrayerSkyGame';

/*
 * Prayer Sky (Salah game 2, docs/GAMES.md): L1 drag the sun to the moment of each of the five prayers (the sky
 * changes live), L2 stack the obligatory rak'ahs of each prayer, L3 put the day in order and match each prayer to its
 * sky. Facts and their sources are copied from the Salah content (see ./content.ts).
 */
export const prayerSkyGame: GameDef<SkyConfig> = {
  id: 'prayer-sky',
  topicId: 'salah',
  i18n: prayerSkyI18n,
  coverArt: 'object.sundial',
  hintArt: 'sky.morning',
  component: PrayerSkyGame,
  levels: [
    { level: 1, config: { mode: 'sun' }, facts: [SKY_FACTS.fixedTimes, SKY_FACTS.maghrib, SKY_FACTS.timesDiffer] },
    { level: 2, config: { mode: 'rakahs' }, facts: [SKY_FACTS.rakahs, SKY_FACTS.fajrTwo] },
    { level: 3, config: { mode: 'day' }, facts: [SKY_FACTS.dayOrder, SKY_FACTS.timetables] },
  ],
  teaches: {
    questionKeys: ['quest:salah-five-tf', 'quest:salah-order', 'quest:salah-rakahs-match', 'quest:salah-dhuhr-four', 'quest:salah-maghrib-time', 'learn:salah-times-1', 'learn:salah-times-2'],
  },
  order: 20,
};

export function registerPrayerSkyGame(): void {
  registerGame(prayerSkyGame);
}
