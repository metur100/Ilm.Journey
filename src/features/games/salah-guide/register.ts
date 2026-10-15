import { registerGame, type GameDef, type GameFact } from '@/core/games';
import salahBasics from '@/features/learn/content/salah/salah-basics.json';

import { RAKAHS, SKY_FACTS, type PrayerId } from '../prayer-sky/content';
import { salahGuideI18n } from './i18n';
import type { SalahGuideConfig } from './logic';
import { SalahGuideGame } from './SalahGuideGame';

const movementText = salahBasics.lesson[0].body;
const movementSources = salahBasics.sources;
const movementsFact = (id: string): GameFact => ({ id, text: movementText, sources: movementSources, art: 'pose.bowing' });
const rakahsFact = (id: string): GameFact => ({ ...SKY_FACTS.rakahs, id });

const LEVELS: { level: 1 | 2 | 3; prayers: PrayerId[]; movementFactId: string; facts: GameFact[] }[] = [
  { level: 1, prayers: ['fajr'], movementFactId: 'movements-fajr', facts: [movementsFact('movements-fajr'), SKY_FACTS.fajrTwo] },
  { level: 2, prayers: ['dhuhr', 'asr'], movementFactId: 'movements-midday', facts: [movementsFact('movements-midday'), rakahsFact('counts-midday')] },
  { level: 3, prayers: ['maghrib', 'isha'], movementFactId: 'movements-evening', facts: [movementsFact('movements-evening'), rakahsFact('counts-evening')] },
];

export const SALAH_GUIDE_ID = 'salah-guide';

export const salahGuideGame: GameDef<SalahGuideConfig> = {
  id: SALAH_GUIDE_ID,
  challengeCount: Object.values(RAKAHS).reduce((total, count) => total + count, 0),
  topicId: 'salah',
  i18n: salahGuideI18n,
  coverArt: 'object.prayer-mat',
  hintArt: 'pose.standing',
  component: SalahGuideGame,
  levels: LEVELS.map(({ level, prayers, movementFactId, facts }) => ({ level, config: { prayers, movementFactId }, facts })),
  teaches: { questionKeys: ['quest:salah-five-tf', 'quest:salah-order', 'quest:salah-rakahs-match', 'learn:salah-basics-1'] },
  order: 5,
};

export function registerSalahGuideGame(): void {
  registerGame(salahGuideGame);
}