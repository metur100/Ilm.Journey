import { registerGame, type GameDef } from '@/core/games';

import { AdhanGame, type AdhanConfig } from './AdhanGame';
import { ADHAN_FACTS } from './content';
import { adhanI18n } from './i18n';

/** Ezan & ikamet: the phrases on a path up the minaret, the ezan of Sabah, ezan vs ikamet (Hanafi). */
export const adhanGame: GameDef<AdhanConfig> = {
  id: 'adhan-iqamah',
  topicId: 'salah',
  i18n: adhanI18n,
  coverArt: 'salah.basics-ezan-scene',
  hintArt: 'salah.basics-minaret',
  component: AdhanGame,
  levels: [
    { level: 1, config: { mode: 'path' }, facts: [ADHAN_FACTS.call, ADHAN_FACTS.words] },
    { level: 2, config: { mode: 'sabah' }, facts: [ADHAN_FACTS.sabah, ADHAN_FACTS.answer] },
    { level: 3, config: { mode: 'which' }, facts: [ADHAN_FACTS.iqamah] },
  ],
  teaches: { questionKeys: ['quest:arabic-adhan'] },
  order: 25,
};

export function registerAdhanGame(): void {
  registerGame(adhanGame);
}
