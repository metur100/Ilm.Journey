import { type GameDef, registerGame } from '@/core/games';
import type { CatchItem } from '@/core/games/kit';

import { nsText, quoteFact } from '../shared/facts';
import { lazyComponent } from '../shared/game';
import { type DeedKey, goodDeedsI18n } from './i18n';

/*
 * Good Deeds of Juz ʿAmma (CatchGame, calm, no lives). Every card is a deed named in a surah, with its reference:
 * good deeds go into the basket, the deeds the surahs warn about drift past. The facts quote the ayahs.
 * L1: three lanes, few cards; L2: more deeds and more look-alikes; L3: four lanes at normal speed.
 */

export interface GoodDeedsConfig {
  items: CatchItem[];
  goal: number;
  lanes: 3 | 4;
  speed: 'calm' | 'normal';
  hints: boolean;
  /** Item id → fact id. */
  factOf: Record<string, string>;
}

const DEEDS: Record<string, { art: string; ref: string; good: boolean }> = {
  feed: { art: 'food.bread', ref: '90:14', good: true },
  orphan: { art: 'object.gift', ref: '93:9', good: true },
  give: { art: 'object.coins', ref: '92:5', good: true },
  patience: { art: 'object.hourglass', ref: '103:3', good: true },
  truth: { art: 'object.scroll', ref: '103:3', good: true },
  pray: { art: 'object.prayer-mat', ref: '108:2', good: true },
  favour: { art: 'quran.one-star', ref: '93:11', good: true },
  forgive: { art: 'object.prayer-beads', ref: '110:3', good: true },
  mock: { art: 'body.mouth', ref: '104:1', good: false },
  hoard: { art: 'object.coin-jar', ref: '104:2', good: false },
  repel: { art: 'garden.fence', ref: '107:2', good: false },
  scold: { art: 'object.envelope', ref: '93:10', good: false },
  showoff: { art: 'object.lamp', ref: '107:6', good: false },
  withhold: { art: 'object.key', ref: '107:7', good: false },
};

const deed = (id: string): CatchItem => ({ id, label: nsText(goodDeedsI18n, `deed.${id}` as DeedKey), art: DEEDS[id].art, sub: DEEDS[id].ref, good: DEEDS[id].good });

const FACTS = {
  zalzalah: quoteFact({ id: 'atom-of-good', surah: 99, from: 7, to: 8, art: 'object.scales' }),
  duha: quoteFact({ id: 'orphan-and-asker', surah: 93, from: 9, to: 11, art: 'object.gift' }),
  balad: quoteFact({ id: 'steep-pass', surah: 90, from: 13, to: 16, art: 'food.bread' }),
  humazah: quoteFact({ id: 'mocker-and-hoarder', surah: 104, from: 1, to: 3, art: 'object.coin-jar' }),
};

export const goodDeedsGame: GameDef<GoodDeedsConfig> = {
  id: 'good-deeds-catch',
  topicId: 'quran',
  i18n: goodDeedsI18n,
  coverArt: 'quran.good-deeds',
  hintArt: 'kit.catch',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyComponent(() => (require('./GoodDeedsGame') as typeof import('./GoodDeedsGame')).GoodDeedsGame),
  levels: [
    {
      level: 1,
      config: { lanes: 3, speed: 'calm', hints: true, goal: 4, items: ['feed', 'patience', 'pray', 'truth', 'mock', 'hoard'].map(deed), factOf: { mock: FACTS.zalzalah.id, hoard: FACTS.zalzalah.id } },
      facts: [FACTS.zalzalah],
    },
    {
      level: 2,
      config: { lanes: 3, speed: 'calm', hints: false, goal: 5, items: ['orphan', 'favour', 'give', 'feed', 'forgive', 'repel', 'scold', 'showoff'].map(deed), factOf: { repel: FACTS.duha.id, scold: FACTS.duha.id, showoff: FACTS.duha.id } },
      facts: [FACTS.duha],
    },
    {
      level: 3,
      config: {
        lanes: 4,
        speed: 'normal',
        hints: false,
        goal: 7,
        items: ['feed', 'orphan', 'give', 'patience', 'truth', 'pray', 'forgive', 'mock', 'hoard', 'repel', 'withhold', 'showoff'].map(deed),
        factOf: { mock: FACTS.humazah.id, hoard: FACTS.humazah.id, repel: FACTS.balad.id, withhold: FACTS.balad.id, showoff: FACTS.balad.id },
      },
      facts: [FACTS.balad, FACTS.humazah],
    },
  ],
  order: 130,
};

export function registerGoodDeedsGame(): void {
  registerGame(goodDeedsGame);
}
