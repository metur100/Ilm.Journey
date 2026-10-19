import { type GameDef, registerGame } from '@/core/games';

import { surahFactText, surahSources } from '../shared/facts';
import { lazyComponent } from '../shared/game';
import { surahJourneyI18n } from './i18n';

/*
 * Surah Journey: the first fifteen surahs of the Bosnian ilmihal, learned one complete surah at a time:
 * Al-Fatiha, then An-Nas backwards through Al-Qari'ah. Every round is the whole surah, all ayahs in order.
 * Three levels of five surahs each.
 */

export interface SurahJourneyConfig {
  surahs: number[];
  hints: boolean;
}

/** Al-Fatiha + the fourteen surahs learned after it in the ilmihal (114 down to 101). */
export const FIRST_FIFTEEN = [1, 114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101] as const;

const LEVELS = [FIRST_FIFTEEN.slice(0, 5), FIRST_FIFTEEN.slice(5, 10), FIRST_FIFTEEN.slice(10, 15)];

const fact = (n: number) => ({ id: `surah-${n}`, text: surahFactText(n), sources: surahSources(n), art: 'object.quran-stand' });

export const surahJourneyGame: GameDef<SurahJourneyConfig> = {
  id: 'surah-journey',
  topicId: 'quran',
  i18n: surahJourneyI18n,
  coverArt: 'quran.juz-sky',
  hintArt: 'kit.steps',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyComponent(() => (require('./SurahJourneyGame') as typeof import('./SurahJourneyGame')).SurahJourneyGame),
  levels: LEVELS.map((surahs, i) => ({
    level: (i + 1) as 1 | 2 | 3,
    config: { surahs: [...surahs], hints: i === 0 },
    facts: [fact(surahs[0]), fact(surahs[surahs.length - 1])],
  })),
  order: 5,
};

export function registerSurahJourneyGame(): void {
  registerGame(surahJourneyGame);
}
