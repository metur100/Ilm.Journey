import { registerGame, type GameDef, type GameFact } from '@/core/games';

import { YUSUF_FACTS } from '../yusuf-storehouse/facts';
import type { YusufPathConfig } from './logic';
import { YusufStoryPathGame } from './YusufStoryPathGame';
import { yusufStoryI18n } from './i18n';

const storyFact = (id: string, fact: GameFact): GameFact => ({ ...fact, id });

export const yusufStoryPathGame: GameDef<YusufPathConfig> = {
  id: 'yusuf-story-path',
  topicId: 'prophets',
  i18n: yusufStoryI18n,
  coverArt: 'garden.stars',
  hintArt: 'object.grain-sack',
  component: YusufStoryPathGame,
  levels: [
    { level: 1, config: { events: ['dream', 'brothers', 'well', 'caravan'], missedFactId: 'yusuf-dream-trail' }, facts: [storyFact('yusuf-dream-trail', YUSUF_FACTS.dream)] },
    { level: 2, config: { events: ['honesty', 'prison'], missedFactId: 'yusuf-honesty-trail' }, facts: [storyFact('yusuf-honesty-trail', YUSUF_FACTS.honest)] },
    { level: 3, config: { events: ['king-dream', 'good-years', 'hard-years', 'forgiveness'], missedFactId: 'yusuf-plan-trail' }, facts: [storyFact('yusuf-plan-trail', YUSUF_FACTS.plan), storyFact('yusuf-relief-trail', YUSUF_FACTS.relief)] },
  ],
  teaches: { questionKeys: ['stories:yusuf-next', 'stories:yusuf-map', 'stories:yusuf-dream', 'stories:yusuf-revenge', 'stories:yusuf-decision', 'stories:yusuf-lesson'] },
  order: 20,
};

export function registerYusufStoryPathGame(): void {
  registerGame(yusufStoryPathGame);
}