import { TOWN_ROUTE } from '@/core/art/pieces/sections/akhlaq';
import { type GameApi, type GameDef, registerGame } from '@/core/games';
import { GameBoard, kitResult, PathTrace } from '@/core/games/kit';

import { F } from '../shared/facts';
import { salamI18n } from './i18n';

/*
 * Salam Street – PathTrace along the road of a little town (akhlaq.village-map). Every stop is a salam (Muslim 54;
 * Bukhari 12 – to those you know and those you do not know; 4:86 – answer with a better greeting).
 * L1: four stops with the dashed guide. L2: six stops with the guide. L3: the whole way to the masjid without guide.
 */

const STOP_IDS = ['home', 'neighbour', 'shop', 'bakery', 'school', 'park', 'library', 'masjid'] as const;
const STOP_ART: Record<string, string> = { home: 'place.house', masjid: 'garden.masjid-small', library: 'akhlaq.library', school: 'akhlaq.school' };

export interface SalamConfig {
  prompt: string;
  stops: number;
  showRoute: boolean;
  hints: boolean;
  fact: string;
}

const FACTS = { spread: F.spreadSalam(), all: F.salamToAll(), better: F.returnGreeting() };

function SalamStreetGame(api: GameApi<SalamConfig>) {
  const { stops, showRoute, hints, prompt, fact } = api.config;
  const ids = STOP_IDS.slice(0, stops);
  return (
    <GameBoard api={api}>
      <PathTrace
        map="akhlaq.village-map"
        stops={ids.map((id, i) => ({
          id,
          at: { x: TOWN_ROUTE[i][0] / 400, y: TOWN_ROUTE[i][1] / 300 },
          label: api.t(`stop.${id}`),
          art: STOP_ART[id],
          caption: i > 0 ? api.t(`cap.${id}`) : undefined,
        }))}
        showRoute={showRoute}
        hints={hints}
        tolerance={0.07}
        prompt={api.t(prompt)}
        onDone={({ mistakes }) => api.onComplete(kitResult({ moves: stops - 1, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }))}
      />
    </GameBoard>
  );
}

export const salamStreetGame: GameDef<SalamConfig> = {
  id: 'salam-street',
  topicId: 'akhlaq',
  i18n: salamI18n,
  coverArt: 'akhlaq.village-map',
  hintArt: 'akhlaq.salam-bubble',
  component: SalamStreetGame,
  levels: [
    { level: 1, config: { prompt: 'play.l1', stops: 4, showRoute: true, hints: true, fact: FACTS.spread.id }, facts: [FACTS.spread] },
    { level: 2, config: { prompt: 'play.l2', stops: 6, showRoute: true, hints: false, fact: FACTS.all.id }, facts: [FACTS.all] },
    { level: 3, config: { prompt: 'play.l3', stops: 8, showRoute: false, hints: false, fact: FACTS.better.id }, facts: [FACTS.better] },
  ],
  order: 40,
};

export function registerSalamStreetGame(): void {
  registerGame(salamStreetGame);
}
