import type { GameDef, GameFact } from '@/core/games';
import type { Namespace } from '@/core/i18n';

import { type SeerahLevelConfig, SeerahGame } from './SeerahGame';

export interface SeerahGameSpec {
  id: string;
  i18n: Namespace<string>;
  coverArt: string;
  hintArt?: string;
  levels: [SeerahLevelLevel, SeerahLevelLevel, SeerahLevelLevel];
  questionKeys?: string[];
  order: number;
}

export interface SeerahLevelLevel {
  config: SeerahLevelConfig;
  facts: GameFact[];
}

/** A Seerah section game: the shared data-driven component with three levels. */
export function seerahGame(spec: SeerahGameSpec): GameDef<SeerahLevelConfig> {
  return {
    id: spec.id,
    topicId: 'seerah',
    i18n: spec.i18n,
    coverArt: spec.coverArt,
    hintArt: spec.hintArt,
    component: SeerahGame,
    levels: spec.levels.map((l, i) => ({ level: (i + 1) as 1 | 2 | 3, config: l.config, facts: l.facts })),
    teaches: spec.questionKeys ? { questionKeys: spec.questionKeys } : undefined,
    order: spec.order,
  };
}
