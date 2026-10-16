import { registerGame, type GameDef } from '@/core/games';

import { MASJID_FACTS } from './content';
import { masjidI18n } from './i18n';
import { MasjidGame, type MasjidConfig } from './MasjidGame';

/** Manners of the masjid (adab u džamiji): moment ↔ manner, good or not, a whole visit in order. */
export const masjidGame: GameDef<MasjidConfig> = {
  id: 'masjid-manners',
  topicId: 'salah',
  i18n: masjidI18n,
  coverArt: 'salah.basics-masjid-door',
  hintArt: 'salah.basics-shoe-rack',
  component: MasjidGame,
  levels: [
    { level: 1, config: { mode: 'connect' }, facts: [MASJID_FACTS.place, MASJID_FACTS.dua] },
    { level: 2, config: { mode: 'sort' }, facts: [MASJID_FACTS.manners, MASJID_FACTS.passing, MASJID_FACTS.onion] },
    { level: 3, config: { mode: 'visit' }, facts: [MASJID_FACTS.tahiyyah, MASJID_FACTS.rows] },
  ],
  teaches: { questionKeys: ['quest:salah-masjid-scenario', 'quest:salah-tahiyyah'] },
  order: 60,
};

export function registerMasjidGame(): void {
  registerGame(masjidGame);
}
