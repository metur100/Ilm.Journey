import { registerGame, type GameDef } from '@/core/games';

import { SKY_FACTS } from './content';
import { prayerSkyI18n } from './i18n';
import { PrayerSkyGame, type SkyConfig } from './PrayerSkyGame';

/*
 * Prayer Sky (the five prayer times): L1 drag the sun to the moment of each prayer in order while the sky changes and
 * the phase is described, L2 the prayers mixed up without descriptions, L3 memory – each prayer and its sky.
 * Facts and their sources are copied from the Salah content (see ./content.ts).
 */
export const prayerSkyGame: GameDef<SkyConfig> = {
  id: 'prayer-sky',
  topicId: 'salah',
  i18n: prayerSkyI18n,
  coverArt: 'object.sundial',
  hintArt: 'sky.morning',
  component: PrayerSkyGame,
  levels: [
    { level: 1, config: { mode: 'sun' }, facts: [SKY_FACTS.fixedTimes, SKY_FACTS.maghrib] },
    { level: 2, config: { mode: 'mixed' }, facts: [SKY_FACTS.timesDiffer, SKY_FACTS.timetables] },
    { level: 3, config: { mode: 'memory' }, facts: [SKY_FACTS.dayOrder, SKY_FACTS.fajrTwo] },
  ],
  teaches: { questionKeys: ['quest:salah-five-tf', 'quest:salah-order', 'quest:salah-maghrib-time', 'learn:salah-times-1', 'learn:salah-times-2'] },
  order: 20,
};

export function registerPrayerSkyGame(): void {
  registerGame(prayerSkyGame);
}
