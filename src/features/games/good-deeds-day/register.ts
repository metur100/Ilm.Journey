import { type GameDef, type GameFact, registerGame } from '@/core/games';

import { L } from '../sections/akhlaq/shared/facts';
import { DILEMMAS, EVERYDAY, WHOLE_DAY } from './content';
import { type DeedsConfig, GoodDeedsDayGame } from './DayGame';
import { deedsI18n } from './i18n';

/*
 * A Day of Good Deeds (v3 rework in the kit look, id kept). L1: an everyday day, moment by moment, hints.
 * L2: harder moments (honesty, a toy taken, a stray cat, saying sorry), no hints. L3 (twist): the whole day at once –
 * every good deed back to its moment. Moments and feedback are the Learn content's scenario questions; the facts are
 * the Learn lessons (fact ids and review keys kept from v2).
 */

export const DEEDS_FACTS = {
  smile: { ...L.smileCharity(), id: 'smile-charity', reviewKey: 'quest:akhlaq-smile' },
  amanah: { ...L.amanah(), reviewKey: 'quest:akhlaq-amanah-mc' },
  shukr: { ...L.shukr(), reviewKey: 'quest:akhlaq-shukr-scenario' },
  sidq: { ...L.sidq(), reviewKey: 'quest:akhlaq-vase' },
  rahmah: { ...L.rahmah(), reviewKey: 'quest:akhlaq-animal' },
  forgiveness: { ...L.forgiveness(), reviewKey: 'quest:akhlaq-forgive-scenario' },
  helping: L.helping(),
  parents: L.parents(),
  character: L.character(),
} satisfies Record<string, GameFact>;

export const DEEDS_GAME_ID = 'good-deeds-day';

export const deedsGame: GameDef<DeedsConfig> = {
  id: DEEDS_GAME_ID,
  topicId: 'akhlaq',
  i18n: deedsI18n,
  coverArt: 'garden.flower-tulip',
  hintArt: 'garden.sprout',
  component: GoodDeedsDayGame,
  levels: [
    {
      level: 1,
      config: { mode: 'moments', moments: EVERYDAY, hints: true, facts: { present: 'shukr', wallet: 'amanah', 'new-student': 'smile-charity', table: 'shukr' } },
      facts: [DEEDS_FACTS.shukr, DEEDS_FACTS.amanah, DEEDS_FACTS.smile],
    },
    {
      level: 2,
      config: { mode: 'moments', moments: DILEMMAS, hints: false, facts: { cup: 'sidq', toy: 'forgiveness', cat: 'rahmah', sorry: 'forgiveness' } },
      facts: [DEEDS_FACTS.sidq, DEEDS_FACTS.rahmah, DEEDS_FACTS.forgiveness],
    },
    {
      level: 3,
      config: { mode: 'whole-day', moments: WHOLE_DAY, hints: false, facts: { neighbour: 'helping', wallet: 'helping', cat: 'great-character', table: 'parents' } },
      facts: [DEEDS_FACTS.helping, DEEDS_FACTS.parents, DEEDS_FACTS.character],
    },
  ],
  teaches: { questionKeys: ['quest:akhlaq-smile', 'quest:akhlaq-amanah-mc', 'quest:akhlaq-shukr-scenario', 'quest:akhlaq-vase', 'quest:akhlaq-animal', 'quest:akhlaq-forgive-scenario'] },
  order: 1,
};

export function registerGoodDeedsDayGame(): void {
  registerGame(deedsGame);
}
